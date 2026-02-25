import { NextResponse } from "next/server";

import { getAppEnv } from "@/lib/env";
import { buildLogoutUrl } from "@/lib/oidc";
import { clearSession, readSession } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const env = getAppEnv();
  const session = await readSession();

  await clearSession();

  if (!session) {
    return NextResponse.redirect(new URL("/", env.APP_BASE_URL));
  }

  const keycloakLogoutUrl = await buildLogoutUrl(session.idToken);

  // Browser redirection is required so Keycloak clears its SSO cookie too.
  return NextResponse.redirect(keycloakLogoutUrl);
}
