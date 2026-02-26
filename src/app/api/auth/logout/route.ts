import { NextResponse } from "next/server";

import { OIDC_STATE_COOKIE, OIDC_VERIFIER_COOKIE, clearOidcTransientCookies } from "@/app/lib/auth/oidcCookies";
import { getOidcClient } from "@/app/lib/auth/oidcClient";
import { BFF_SESSION_COOKIE, clearBffSession, getBffSession } from "@/app/lib/auth/session";

function applyCookieClearHeaders(response: NextResponse): NextResponse {
  // Attach explicit deletion headers on the redirect response itself. We emit
  // both secure=false and secure=true variants to robustly clear cookies across
  // deployment setups where original flags may differ behind proxies.
  const clearVariants = [false, true] as const;

  for (const secure of clearVariants) {
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

  // Read the current session first to recover id_token_hint for provider logout,
  // then destroy local session so logout is guaranteed even if provider calls fail.
  await clearBffSession();

  // Remove transient OIDC request cookies to avoid stale state/verifier values
  // lingering after logout boundaries.
  await clearOidcTransientCookies();

  const fallbackUrl = new URL("/", requestUrl);

  try {
    const { issuer } = await getOidcClient();
    const endSessionEndpoint = issuer.metadata.end_session_endpoint;

    // Some OIDC providers do not expose end_session_endpoint. In that case we
    // fallback to a local redirect because local logout already happened.
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
