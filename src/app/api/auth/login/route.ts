import { NextResponse } from "next/server";

import { setOidcTransientCookies } from "@/app/lib/auth/oidcCookies";
import { buildAuthorizationUrl, createAuthorizationRequest } from "@/app/lib/auth/oidcAuthorization";
import { getOidcClient } from "@/app/lib/auth/oidcClient";

export async function GET(): Promise<Response> {
  const issuerUrl = process.env.KEYCLOAK_ISSUER;
  const redirectUri = process.env.KEYCLOAK_REDIRECT_URI;
  const configuredClientId = process.env.KEYCLOAK_CLIENT_ID;

  if (!issuerUrl || !configuredClientId || !redirectUri) {
    return new Response("Missing required env vars for Keycloak OIDC configuration.", {
      status: 500,
    });
  }

  const { issuer, clientId } = await getOidcClient();
  const authorizationEndpoint = issuer.metadata.authorization_endpoint;

  if (!authorizationEndpoint) {
    return new Response("OIDC discovery missing authorization_endpoint.", {
      status: 500,
    });
  }

  const { state, verifier, challenge } = createAuthorizationRequest();

  await setOidcTransientCookies({ state, verifier });

  const authorizationUrl = buildAuthorizationUrl({
    endpoint: authorizationEndpoint,
    clientId,
    redirectUri,
    state,
    challenge,
  });

  return NextResponse.redirect(authorizationUrl, { status: 302 });
}
