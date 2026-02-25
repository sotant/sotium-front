import { NextRequest, NextResponse } from "next/server";
import { getAuthEnvConfig } from "@/app/lib/auth-env";

const KEYCLOAK_AUTH_PATH = "/protocol/openid-connect/auth";

type LoginErrorResponse = {
  message: string;
  missingEnvironmentVariables: ReadonlyArray<string>;
  hint: string;
};

export async function GET(request: NextRequest): Promise<Response> {
  const envConfig = getAuthEnvConfig();

  if (!envConfig.ok) {
    return NextResponse.json<LoginErrorResponse>(
      {
        message: "Authentication service is not configured.",
        missingEnvironmentVariables: envConfig.missingKeys,
        hint: "Define missing keys in .env.local and restart the Next.js server.",
      },
      { status: 500 },
    );
  }

  const keycloakAuthorizationUrl = new URL(
    `/realms/${encodeURIComponent(envConfig.config.keycloakRealm)}${KEYCLOAK_AUTH_PATH}`,
    envConfig.config.keycloakBaseUrl,
  );

  const callbackUrl = new URL("/api/auth/callback", request.nextUrl.origin);

  keycloakAuthorizationUrl.searchParams.set("client_id", envConfig.config.keycloakClientId);
  keycloakAuthorizationUrl.searchParams.set("redirect_uri", callbackUrl.toString());
  keycloakAuthorizationUrl.searchParams.set("response_type", "code");
  keycloakAuthorizationUrl.searchParams.set("scope", "openid profile email");

  return Response.redirect(keycloakAuthorizationUrl, 302);
}
