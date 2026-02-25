import { NextRequest, NextResponse } from "next/server";

import { getAppEnv } from "@/lib/env";
import { exchangeAuthorizationCode } from "@/lib/oidc";
import {
  clearAuthFlowState,
  storeSession,
  readAuthFlowState,
} from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const env = getAppEnv();
  const code = request.nextUrl.searchParams.get("code");
  const returnedState = request.nextUrl.searchParams.get("state");

  if (!code || !returnedState) {
    return NextResponse.redirect(new URL("/?error=auth_failed", env.APP_BASE_URL));
  }

  const flowState = await readAuthFlowState();

  if (!flowState || flowState.state !== returnedState) {
    // We only log contextual information and avoid writing sensitive tokens in logs.
    console.error("Invalid auth callback state.");
    await clearAuthFlowState();

    return NextResponse.redirect(new URL("/?error=auth_failed", env.APP_BASE_URL));
  }

  try {
    const tokenResponse = await exchangeAuthorizationCode({
      code,
      state: returnedState,
      nonce: flowState.nonce,
      codeVerifier: flowState.codeVerifier,
    });

    await storeSession({
      accessToken: tokenResponse.accessToken,
      refreshToken: tokenResponse.refreshToken,
      idToken: tokenResponse.idToken,
      expiresAt: tokenResponse.expiresAt,
    });

    await clearAuthFlowState();

    return NextResponse.redirect(new URL("/me", env.APP_BASE_URL));
  } catch (error) {
    console.error("Token exchange failed during auth callback.", error);
    await clearAuthFlowState();

    return NextResponse.redirect(new URL("/?error=auth_failed", env.APP_BASE_URL));
  }
}
