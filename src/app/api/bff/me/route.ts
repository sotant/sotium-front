import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { fetchIdentityMe, isIdentityMeResponse } from "@/app/lib/bff/backend";
import { getEnvConfig } from "@/app/lib/bff/env";
import { refreshSession } from "@/app/lib/bff/oidc";
import { clearSession, readSessionFromCookieStore, writeSession } from "@/app/lib/bff/session";
import type { SessionPayload } from "@/app/types/auth";

export const dynamic = "force-dynamic";

function isTokenExpired(expiresAt: number): boolean {
  // Refresh 30 seconds before expiry to avoid race conditions.
  return Date.now() >= expiresAt - 30_000;
}

function withSessionCookie(response: NextResponse, refreshedSession: SessionPayload | null): NextResponse {
  if (refreshedSession) {
    writeSession(response, refreshedSession);
  }

  return response;
}

export async function GET(): Promise<Response> {
  const env = getEnvConfig();
  const cookieStore = await cookies();
  const session = readSessionFromCookieStore(cookieStore);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let activeSession = session;
  let refreshedSession: SessionPayload | null = null;

  if (isTokenExpired(session.expiresAt)) {
    try {
      activeSession = await refreshSession(session);
      refreshedSession = activeSession;
    } catch (error) {
      console.error("Session refresh failed.", error);
      const expired = NextResponse.redirect(`${env.appBaseUrl}/?error=session_expired`, 302);
      clearSession(expired);
      return expired;
    }
  }

  const backendResponse = await fetchIdentityMe(activeSession.accessToken);

  if (!backendResponse.ok) {
    if (backendResponse.status === 401 || backendResponse.status === 403) {
      const expired = NextResponse.redirect(`${env.appBaseUrl}/?error=session_expired`, 302);
      clearSession(expired);
      return expired;
    }

    return withSessionCookie(
      NextResponse.json({ error: "Identity service unavailable." }, { status: 502 }),
      refreshedSession,
    );
  }

  const payload = (await backendResponse.json()) as unknown;

  if (!isIdentityMeResponse(payload)) {
    return withSessionCookie(
      NextResponse.json({ error: "Invalid identity response format." }, { status: 502 }),
      refreshedSession,
    );
  }

  return withSessionCookie(NextResponse.json(payload, { status: 200 }), refreshedSession);
}
