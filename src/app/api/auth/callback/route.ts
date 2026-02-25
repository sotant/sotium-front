import { NextRequest, NextResponse } from "next/server";

import { exchangeAuthorizationCode } from "@/lib/oidc";
import { clearOidcTransient, writeSession, readOidcTransient } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    console.error("OIDC callback missing code/state");
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }

  const transient = await readOidcTransient();

  if (!transient || transient.state !== state) {
    console.error("OIDC callback state validation failed");
    await clearOidcTransient();
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }

  try {
    const tokens = await exchangeAuthorizationCode({
      code,
      codeVerifier: transient.codeVerifier,
    });

    await writeSession(tokens);
    await clearOidcTransient();

    return NextResponse.redirect(new URL("/me", request.url));
  } catch (error) {
    console.error("OIDC callback token exchange failed", error);
    await clearOidcTransient();
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
  }
}
