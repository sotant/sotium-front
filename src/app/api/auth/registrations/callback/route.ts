import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { TokenSet } from "openid-client";

import { OIDC_STATE_COOKIE, OIDC_VERIFIER_COOKIE, clearOidcTransientCookies } from "@/app/lib/auth/oidcCookies";
import { getOidcClient } from "@/app/lib/auth/oidcClient";
import { setBffSession, type BffSession } from "@/app/lib/auth/session";

type CallbackParams = {
  code: string;
  state: string;
  iss?: string;
};

type OnboardingPayload = {
  name: string;
  email: string;
  phone: string;
};

type IdTokenClaims = {
  email?: unknown;
};

const DEFAULT_ONBOARDING_NAME = "Dummy Academy" as const;
const DEFAULT_ONBOARDING_PHONE = "+000000000" as const;

function getRegistrationRedirectUri(request: Request): string {
  const explicitRegistrationUri = process.env.KEYCLOAK_REGISTRATION_REDIRECT_URI;

  if (explicitRegistrationUri) {
    return explicitRegistrationUri;
  }

  const loginRedirectUri = process.env.KEYCLOAK_REDIRECT_URI;

  if (loginRedirectUri) {
    const parsedLoginRedirectUri = new URL(loginRedirectUri);
    parsedLoginRedirectUri.pathname = "/api/auth/registrations/callback";
    return parsedLoginRedirectUri.toString();
  }

  return new URL("/api/auth/registrations/callback", request.url).toString();
}

function getEmailFromClaims(tokenSet: TokenSet): string | null {
  try {
    const claims = tokenSet.claims() as IdTokenClaims;

    if (typeof claims.email === "string" && claims.email.length > 0) {
      return claims.email;
    }

    return null;
  } catch {
    return null;
  }
}

async function resolveUserEmail(client: InstanceType<(Awaited<ReturnType<typeof getOidcClient>>)["issuer"]["Client"]>, tokenSet: TokenSet): Promise<string | null> {
  const idTokenEmail = getEmailFromClaims(tokenSet);

  if (idTokenEmail) {
    return idTokenEmail;
  }

  if (!tokenSet.access_token) {
    return null;
  }

  const userInfo = await client.userinfo(tokenSet.access_token).catch(() => null);

  if (typeof userInfo?.email === "string" && userInfo.email.length > 0) {
    return userInfo.email;
  }

  return null;
}

async function executeOnboarding(email: string, accessToken: string): Promise<boolean> {
  const backendBaseUrl = process.env.BACKEND_BASE_URL;

  if (!backendBaseUrl) {
    return false;
  }

  const payload: OnboardingPayload = {
    name: DEFAULT_ONBOARDING_NAME,
    email,
    phone: DEFAULT_ONBOARDING_PHONE,
  };

  const response = await fetch(`${backendBaseUrl}/api/onboarding/academies`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    return false;
  }

  const rawResponse = await response.text();

  if (rawResponse === "true") {
    return true;
  }

  if (rawResponse === "false") {
    return false;
  }

  try {
    const responsePayload = JSON.parse(rawResponse) as unknown;
    return responsePayload === true;
  } catch {
    return false;
  }
}

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const iss = requestUrl.searchParams.get("iss");

  if (!code || !state) {
    return new Response("Missing code or state parameter.", { status: 400 });
  }

  const redirectUri = getRegistrationRedirectUri(request);

  const cookieStore = await cookies();
  const storedState = cookieStore.get(OIDC_STATE_COOKIE)?.value;
  const codeVerifier = cookieStore.get(OIDC_VERIFIER_COOKIE)?.value;

  if (!storedState || !codeVerifier) {
    return new Response("Missing OIDC transient cookies.", { status: 400 });
  }

  if (state !== storedState) {
    return new Response("Invalid state parameter.", { status: 400 });
  }

  const { issuer, clientId, clientSecret } = await getOidcClient();
  const client = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    token_endpoint_auth_method: "client_secret_basic",
  });

  const callbackParams: CallbackParams = { code, state };

  if (iss) {
    callbackParams.iss = iss;
  }

  const tokenSet = await client.callback(redirectUri, callbackParams, {
    state: storedState,
    code_verifier: codeVerifier,
  });

  if (!tokenSet.access_token || !tokenSet.expires_in) {
    return new Response("OIDC token response is missing required fields.", { status: 500 });
  }

  const session: BffSession = {
    accessToken: tokenSet.access_token,
    refreshToken: tokenSet.refresh_token,
    idToken: tokenSet.id_token,
    expiresAt: Date.now() + tokenSet.expires_in * 1000,
  };

  await setBffSession(session);
  await clearOidcTransientCookies();

  const email = await resolveUserEmail(client, tokenSet);
  const onboardingResult = email ? await executeOnboarding(email, tokenSet.access_token) : false;

  const destination = new URL("/", request.url);
  destination.searchParams.set("registrationResult", String(onboardingResult));

  return NextResponse.redirect(destination, { status: 302 });
}
