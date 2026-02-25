import { NextResponse } from "next/server";

import { fetchIdentityMe } from "@/lib/backend";
import { getAppEnv } from "@/lib/env";
import { refreshTokens } from "@/lib/oidc";
import { clearSession, readSession, storeSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isExpired(expiresAt: number): boolean {
  const nowInSeconds = Math.floor(Date.now() / 1000);

  // We refresh one minute early to avoid edge expiration races.
  return expiresAt <= nowInSeconds + 60;
}

export async function GET(): Promise<NextResponse> {
  const env = getAppEnv();
  const currentSession = await readSession();

  if (!currentSession) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let activeSession = currentSession;

  if (isExpired(currentSession.expiresAt)) {
    try {
      const refreshed = await refreshTokens(currentSession.refreshToken);

      activeSession = {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        idToken: refreshed.idToken,
        expiresAt: refreshed.expiresAt,
      };

      await storeSession(activeSession);
    } catch (error) {
      console.error("Token refresh failed. Session will be invalidated.", error);
      await clearSession();

      return NextResponse.redirect(
        new URL("/?error=session_expired", env.APP_BASE_URL),
      );
    }
  }

  try {
    const identity = await fetchIdentityMe(activeSession.accessToken);

    return NextResponse.json(identity, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("BFF failed to load /api/identity/me.", error);

    return NextResponse.json(
      { message: "Could not fetch user identity." },
      { status: 502 },
    );
  }
}
