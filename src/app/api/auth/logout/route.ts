import { NextResponse } from "next/server";

import { clearOidcTransientCookies } from "@/app/lib/auth/oidcCookies";
import { getOidcClient } from "@/app/lib/auth/oidcClient";
import { clearBffSession } from "@/app/lib/auth/session";

async function buildLogoutResponse(requestUrl: string): Promise<Response> {
  // Always destroy local BFF session first so logout is effective even if the
  // upstream identity provider is unavailable.
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
      return NextResponse.redirect(fallbackUrl, { status: 302 });
    }

    const configuredPostLogoutRedirectUri = process.env.KEYCLOAK_POST_LOGOUT_REDIRECT_URI;
    const postLogoutRedirectUri = configuredPostLogoutRedirectUri ?? fallbackUrl.toString();

    const logoutUrl = new URL(endSessionEndpoint);
    logoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);

    return NextResponse.redirect(logoutUrl.toString(), { status: 302 });
  } catch {
    return NextResponse.redirect(fallbackUrl, { status: 302 });
  }
}

export async function POST(request: Request): Promise<Response> {
  return buildLogoutResponse(request.url);
}

export async function GET(request: Request): Promise<Response> {
  return buildLogoutResponse(request.url);
}
