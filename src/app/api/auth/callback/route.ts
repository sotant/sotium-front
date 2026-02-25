import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { exchangeAuthorizationCode } from "@/app/lib/bff/oidc";
import { clearAuthFlowCookie, clearSession, readAuthFlowCookie, writeSession } from "@/app/lib/bff/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const appOrigin = requestUrl.origin;
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const cookieStore = await cookies();
  const flow = readAuthFlowCookie(cookieStore);

  if (!code || !state || !flow || flow.state !== state) {
    console.error("OIDC callback validation failed: missing or invalid state/code.");
    const failed = NextResponse.redirect(`${appOrigin}/?error=auth_failed`, 302);
    clearAuthFlowCookie(failed);
    clearSession(failed);
    return failed;
  }

  try {
    const session = await exchangeAuthorizationCode({
      code,
      codeVerifier: flow.codeVerifier,
    });

    // We redirect using the same origin that handled the callback to keep cookie host alignment.
    const success = NextResponse.redirect(`${appOrigin}/dashboard`, 302);
    clearAuthFlowCookie(success);
    writeSession(success, session);
    return success;
  } catch (error) {
    console.error("OIDC callback token exchange failed.", error);
    const failed = NextResponse.redirect(`${appOrigin}/?error=auth_failed`, 302);
    clearAuthFlowCookie(failed);
    clearSession(failed);
    return failed;
  }
}
