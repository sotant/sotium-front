import { NextRequest, NextResponse } from "next/server";

import { fetchIdentityMe } from "@/lib/backend";
import { needsRefresh, refreshAccessToken } from "@/lib/oidc";
import { clearSession, readSession, writeSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await readSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let activeSession = session;

  if (needsRefresh(session.expiresAt)) {
    try {
      const refreshed = await refreshAccessToken({ refreshToken: session.refreshToken });
      await writeSession(refreshed);
      activeSession = refreshed;
    } catch (error) {
      console.error("Session refresh failed", error);
      await clearSession();
      return NextResponse.redirect(new URL("/?error=session_expired", request.url));
    }
  }

  try {
    const me = await fetchIdentityMe(activeSession.accessToken);
    return NextResponse.json(me, { status: 200 });
  } catch (error) {
    console.error("BFF /api/bff/me failed", error);
    return NextResponse.json({ error: "Upstream failure" }, { status: 502 });
  }
}
