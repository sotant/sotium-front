import { NextResponse } from "next/server";

import { getLogoutUrl } from "@/lib/oidc";
import { clearSession, readSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  const session = await readSession();
  await clearSession();

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.redirect(getLogoutUrl(session.idToken));
}
