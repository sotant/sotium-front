import { NextResponse } from "next/server";

import { setOidcTransientCookies } from "@/app/lib/auth/oidcCookies";
import { buildAuthorizationUrl, createAuthorizationRequest } from "@/app/lib/auth/oidcAuthorization";
import { getOidcClient } from "@/app/lib/auth/oidcClient";

const KEYCLOAK_REGISTRATION_PATH = "protocol/openid-connect/registrations" as const;

function ensureTrailingSlashInPath(url: URL): URL {
  const normalizedUrl = new URL(url.toString());

  if (!normalizedUrl.pathname.endsWith("/")) {
    normalizedUrl.pathname = `${normalizedUrl.pathname}/`;
  }

  return normalizedUrl;
}

function resolveRegistrationEndpoint(issuer: URL): string {
  return new URL(KEYCLOAK_REGISTRATION_PATH, ensureTrailingSlashInPath(issuer)).toString();
}

function resolveRegistrationRedirectUri(request: Request): string | null {
  const explicitRegistrationUri = process.env.KEYCLOAK_REGISTRATION_REDIRECT_URI;

  if (explicitRegistrationUri) {
    return explicitRegistrationUri;
  }

  const loginRedirectUri = process.env.KEYCLOAK_REDIRECT_URI;

  if (loginRedirectUri) {
    const parsedLoginRedirectUri = new URL(loginRedirectUri);
    parsedLoginRedirectUri.pathname = "/api/auth/registrations/callback";
    return parsedLoginRedirectUri.toString();
  }

  return new URL("/api/auth/registrations/callback", request.url).toString();
}

export async function GET(request: Request): Promise<Response> {
  const issuerUrl = process.env.KEYCLOAK_ISSUER;
  const redirectUri = resolveRegistrationRedirectUri(request);
  const configuredClientId = process.env.KEYCLOAK_CLIENT_ID;

  if (!issuerUrl || !configuredClientId || !redirectUri) {
    return new Response("Missing required env vars for Keycloak OIDC configuration.", {
      status: 500,
    });
  }

  const { issuer, clientId } = await getOidcClient();

  if (!issuer.issuer) {
    return new Response("OIDC discovery missing issuer.", {
      status: 500,
    });
  }

  const { state, verifier, challenge } = createAuthorizationRequest();

  await setOidcTransientCookies({ state, verifier });

  const registrationUrl = buildAuthorizationUrl({
    endpoint: resolveRegistrationEndpoint(new URL(issuer.issuer)),
    clientId,
    redirectUri,
    state,
    challenge,
  });

  return NextResponse.redirect(registrationUrl, { status: 302 });
}
