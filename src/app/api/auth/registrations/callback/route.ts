import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { TokenSet } from "openid-client";

import { OIDC_STATE_COOKIE, OIDC_VERIFIER_COOKIE, clearOidcTransientCookies } from "@/app/lib/auth/oidcCookies";
import { deleteKeycloakUser, assignRealmRoleToUser } from "@/app/lib/auth/keycloakAdmin";
import { getOidcClient } from "@/app/lib/auth/oidcClient";
import { setBffSession, type BffSession } from "@/app/lib/auth/session";
import { executeOnboarding } from "@/bff/services/onboarding.service";

type CallbackParams = {
  code: string;
  state: string;
  iss?: string;
};

type IdTokenClaims = {
  email?: unknown;
  sub?: unknown;
};

const DEFAULT_ONBOARDING_NAME = "Dummy Academy" as const;
const DEFAULT_ONBOARDING_PHONE = "+000000000" as const;
const OWNER_ROLE_NAME = "OWNER" as const;

type RegistrationAction = "owner_assigned" | "user_deleted" | "error";

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

function getClaims(tokenSet: TokenSet): IdTokenClaims | null {
  try {
    return tokenSet.claims() as IdTokenClaims;
  } catch {
    return null;
  }
}

function getUserIdFromClaims(tokenSet: TokenSet): string | null {
  const claims = getClaims(tokenSet);

  if (!claims) {
    return null;
  }

  return typeof claims.sub === "string" && claims.sub.length > 0 ? claims.sub : null;
}

function getEmailFromClaims(tokenSet: TokenSet): string | null {
  const claims = getClaims(tokenSet);

  if (!claims) {
    return null;
  }

  return typeof claims.email === "string" && claims.email.length > 0 ? claims.email : null;
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

function createBffSessionFromTokenSet(tokenSet: TokenSet): BffSession | null {
  if (!tokenSet.access_token || !tokenSet.expires_in) {
    return null;
  }

  return {
    accessToken: tokenSet.access_token,
    refreshToken: tokenSet.refresh_token,
    idToken: tokenSet.id_token,
    expiresAt: Date.now() + tokenSet.expires_in * 1000,
  };
}

async function refreshTokenSetAfterRoleAssignment(
  client: InstanceType<(Awaited<ReturnType<typeof getOidcClient>>)["issuer"]["Client"]>,
  tokenSet: TokenSet,
): Promise<TokenSet | null> {
  if (!tokenSet.refresh_token) {
    return null;
  }

  try {
    return await client.refresh(tokenSet.refresh_token);
  } catch {
    return null;
  }
}

function buildDestinationUrl(request: Request, params: {
  status: string;
  action: RegistrationAction;
  academyId?: string | null;
}): URL {
  const destination = new URL("/dashboard", request.url);
  destination.searchParams.set("registrationStatus", params.status);
  destination.searchParams.set("registrationAction", params.action);

  if (params.academyId) {
    destination.searchParams.set("academyId", params.academyId);
  }

  return destination;
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

  let destination = buildDestinationUrl(request, {
    status: "ERROR",
    action: "error",
  });

  try {
    const email = await resolveUserEmail(client, tokenSet);
    const userId = getUserIdFromClaims(tokenSet);

    if (!email || !userId) {
      return NextResponse.redirect(destination, { status: 302 });
    }

    const onboardingResult = await executeOnboarding({
      email,
      accessToken: tokenSet.access_token,
      defaultName: DEFAULT_ONBOARDING_NAME,
      defaultPhone: DEFAULT_ONBOARDING_PHONE,
    });

    if (!onboardingResult) {
      return NextResponse.redirect(destination, { status: 302 });
    }

    if (onboardingResult.status === "COMPLETED") {
      const roleAssigned = await assignRealmRoleToUser(userId, OWNER_ROLE_NAME);

      if (!roleAssigned) {
        return NextResponse.redirect(destination, { status: 302 });
      }

      const refreshedTokenSet = await refreshTokenSetAfterRoleAssignment(client, tokenSet);
      const effectiveTokenSet = refreshedTokenSet ?? tokenSet;
      const session = createBffSessionFromTokenSet(effectiveTokenSet);

      if (!session) {
        return NextResponse.redirect(destination, { status: 302 });
      }

      await setBffSession(session);

      destination = buildDestinationUrl(request, {
        status: onboardingResult.status,
        action: "owner_assigned",
        academyId: onboardingResult.academyId,
      });

      return NextResponse.redirect(destination, { status: 302 });
    }

    const userDeleted = await deleteKeycloakUser(userId);

    if (!userDeleted) {
      return NextResponse.redirect(destination, { status: 302 });
    }

    destination = buildDestinationUrl(request, {
      status: onboardingResult.status,
      action: "user_deleted",
      academyId: onboardingResult.academyId,
    });

    return NextResponse.redirect(destination, { status: 302 });
  } finally {
    await clearOidcTransientCookies();
  }
}
