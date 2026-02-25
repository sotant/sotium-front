import { NextResponse } from "next/server";
import { buildLogoutUrl } from "@/app/lib/bff/oidc";
import { clearSession, readSession } from "@/app/lib/bff/session";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const session = await readSession();
  const redirectUrl = buildLogoutUrl(session?.idToken);

  // We clear local BFF session first, then browser continues with Keycloak RP logout.
  const response = NextResponse.redirect(redirectUrl, 302);
  clearSession(response);

  return response;
}
