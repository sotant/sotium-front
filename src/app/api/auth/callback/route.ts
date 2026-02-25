import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeAuthorizationCode } from "@/app/lib/bff/oidc";
import { clearAuthFlowCookie, clearSession, readAuthFlowCookie, writeSession } from "@/app/lib/bff/session";
import { getEnvConfig } from "@/app/lib/bff/env";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const env = getEnvConfig();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieStore = await cookies();
  const flow = readAuthFlowCookie(cookieStore);

  if (!code || !state || !flow || flow.state !== state) {
    console.error("OIDC callback validation failed: missing or invalid state/code.");
    const failed = NextResponse.redirect(`${env.appBaseUrl}/?error=auth_failed`, 302);
    clearAuthFlowCookie(failed);
    clearSession(failed);
    return failed;
  }

  try {
    const session = await exchangeAuthorizationCode({
      code,
      codeVerifier: flow.codeVerifier,
    });

    const success = NextResponse.redirect(`${env.appBaseUrl}/me`, 302);
    clearAuthFlowCookie(success);
    writeSession(success, session);
    return success;
  } catch (error) {
    console.error("OIDC callback token exchange failed.", error);
    const failed = NextResponse.redirect(`${env.appBaseUrl}/?error=auth_failed`, 302);
    clearAuthFlowCookie(failed);
    clearSession(failed);
    return failed;
  }
}
