import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { OIDC_STATE_COOKIE, OIDC_VERIFIER_COOKIE, clearOidcTransientCookies } from "@/app/lib/auth/oidcCookies";
import { getOidcClient } from "@/app/lib/auth/oidcClient";
import { setBffSession, type BffSession } from "@/app/lib/auth/session";

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const iss = requestUrl.searchParams.get("iss");

  // Never trust callback query parameters blindly because they originate from
  // the browser. Missing values indicate an invalid OIDC response.
  if (!code || !state) {
    return new Response("Missing code or state parameter.", { status: 400 });
  }

  const redirectUri = process.env.KEYCLOAK_REDIRECT_URI;

  if (!redirectUri) {
    return new Response("Missing required env vars for Keycloak OIDC configuration.", {
      status: 500,
    });
  }

  const cookieStore = await cookies();
  const storedState = cookieStore.get(OIDC_STATE_COOKIE)?.value;
  const codeVerifier = cookieStore.get(OIDC_VERIFIER_COOKIE)?.value;

  if (!storedState || !codeVerifier) {
    return new Response("Missing OIDC transient cookies.", { status: 400 });
  }

  // The state check mitigates CSRF/login mix-up attacks by binding this
  // callback to the exact authorization request initiated by our BFF.
  if (state !== storedState) {
    return new Response("Invalid state parameter.", { status: 400 });
  }

  const { issuer, clientId, clientSecret } = await getOidcClient();

  // This application uses confidential client communication only, so token
  // exchange always authenticates with client_secret_basic at the BFF layer.
  const client = new issuer.Client({
    client_id: clientId,
    client_secret: clientSecret,
    token_endpoint_auth_method: "client_secret_basic",
  });

  // PKCE proves possession of the original verifier generated during login.
  // client.callback validates protocol details (state, issuer metadata usage,
  // token response fields) and performs a safer code exchange than manual HTTP.
  const callbackParams: { code: string; state: string; iss?: string } = { code, state };

  // Some providers (including Keycloak realms with mix-up protections) append
  // `iss` to the authorization response. Forwarding it to openid-client allows
  // issuer-origin validation and prevents RP mix-up attacks.
  if (iss) {
    callbackParams.iss = iss;
  }

  const tokenSet = await client.callback(
    redirectUri,
    callbackParams,
    // openid-client expects state validation in the checks object; omitting it
    // triggers checks.state errors and skips the library's built-in CSRF checks.
    { state: storedState, code_verifier: codeVerifier },
  );

  if (!tokenSet.access_token || !tokenSet.expires_in) {
    return new Response("OIDC token response is missing required fields.", { status: 500 });
  }

  const session: BffSession = {
    accessToken: tokenSet.access_token,
    refreshToken: tokenSet.refresh_token,
    idToken: tokenSet.id_token,
    expiresAt: Date.now() + tokenSet.expires_in * 1000,
  };

  // Store tokens only in an httpOnly BFF session cookie so they never become
  // accessible to client-side JavaScript or leaked through frontend APIs.
  await setBffSession(session);

  // Transient state/verifier cookies are single-use values and must be removed
  // after callback processing to reduce replay opportunities.
  await clearOidcTransientCookies();

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
