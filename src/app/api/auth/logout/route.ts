import { NextResponse } from "next/server";

import { OIDC_STATE_COOKIE, OIDC_VERIFIER_COOKIE } from "@/app/lib/auth/oidcCookies";
import { getOidcClient } from "@/app/lib/auth/oidcClient";
import { BFF_SESSION_COOKIE, getBffSession } from "@/app/lib/auth/session";

function applyCookieClearHeaders(response: NextResponse): NextResponse {
  // Emit hard-delete Set-Cookie directives directly on the redirect response so
  // browser removes cookies instead of keeping empty-value entries visible.
  response.cookies.delete(BFF_SESSION_COOKIE);
  response.cookies.delete(OIDC_STATE_COOKIE);
  response.cookies.delete(OIDC_VERIFIER_COOKIE);

  // Add explicit expiry variants to cover environments where cookie attributes
  // (like secure/path) may differ after proxy termination.
  for (const secure of [false, true] as const) {
    response.cookies.set(BFF_SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    response.cookies.set(OIDC_STATE_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    response.cookies.set(OIDC_VERIFIER_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure,
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });
  }

  return response;
}

async function buildLogoutResponse(requestUrl: string): Promise<Response> {
  const currentSession = await getBffSession();

  // Read current session first so we can still provide id_token_hint, then rely
  // on redirect Set-Cookie headers to delete local cookies in a single response.

  const fallbackUrl = new URL("/", requestUrl);

  try {
    const { issuer } = await getOidcClient();
    const endSessionEndpoint = issuer.metadata.end_session_endpoint;

    // Some OIDC providers do not expose end_session_endpoint. In that case we
    // fallback to local redirect while still returning cookie-deletion headers.
    if (!endSessionEndpoint) {
      return applyCookieClearHeaders(NextResponse.redirect(fallbackUrl, { status: 302 }));
    }

    const configuredPostLogoutRedirectUri = process.env.KEYCLOAK_POST_LOGOUT_REDIRECT_URI;
    const postLogoutRedirectUri = configuredPostLogoutRedirectUri ?? fallbackUrl.toString();

    const logoutUrl = new URL(endSessionEndpoint);
    logoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);

    // Keycloak may require id_token_hint to identify which OP session to close.
    // When available from callback, we pass it without exposing tokens to client JS.
    if (currentSession?.idToken) {
      logoutUrl.searchParams.set("id_token_hint", currentSession.idToken);
    }

    return applyCookieClearHeaders(NextResponse.redirect(logoutUrl.toString(), { status: 302 }));
  } catch {
    return applyCookieClearHeaders(NextResponse.redirect(fallbackUrl, { status: 302 }));
  }
}

export async function POST(request: Request): Promise<Response> {
  return buildLogoutResponse(request.url);
}

export async function GET(request: Request): Promise<Response> {
  return buildLogoutResponse(request.url);
}
