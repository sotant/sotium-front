import { buildKeycloakAuthorizationUrl, getKeycloakConfig } from "@/app/lib/auth/keycloak";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const keycloakConfig = getKeycloakConfig();

  if (!keycloakConfig) {
    return Response.json(
      { error: "Authentication configuration is missing." },
      { status: 500 },
    );
  }

  const callbackUrl = new URL("/api/auth/callback", request.url).toString();
  // TODO: Persist state (and optionally nonce/PKCE data) in an HttpOnly cookie/session store.
  const state = crypto.randomUUID();

  const authorizationUrl = buildKeycloakAuthorizationUrl(keycloakConfig, callbackUrl, state);

  return Response.redirect(authorizationUrl, 302);
}
