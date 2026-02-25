import { NextRequest } from "next/server";

const KEYCLOAK_AUTH_PATH = "/protocol/openid-connect/auth";

function getRequiredEnv(name: "KEYCLOAK_BASE_URL" | "KEYCLOAK_REALM" | "KEYCLOAK_CLIENT_ID"): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export async function GET(request: NextRequest): Promise<Response> {
  const baseUrl = getRequiredEnv("KEYCLOAK_BASE_URL");
  const realm = getRequiredEnv("KEYCLOAK_REALM");
  const clientId = getRequiredEnv("KEYCLOAK_CLIENT_ID");

  const keycloakAuthorizationUrl = new URL(
    `/realms/${encodeURIComponent(realm)}${KEYCLOAK_AUTH_PATH}`,
    baseUrl,
  );

  const callbackUrl = new URL("/api/auth/callback", request.nextUrl.origin);

  keycloakAuthorizationUrl.searchParams.set("client_id", clientId);
  keycloakAuthorizationUrl.searchParams.set("redirect_uri", callbackUrl.toString());
  keycloakAuthorizationUrl.searchParams.set("response_type", "code");
  keycloakAuthorizationUrl.searchParams.set("scope", "openid profile email");

  return Response.redirect(keycloakAuthorizationUrl, 302);
}
