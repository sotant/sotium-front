import { createHash, randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { setOidcTransientCookies } from "@/app/lib/auth/oidcCookies";
import { getOidcClient } from "@/app/lib/auth/oidcClient";

function toBase64Url(input: Buffer): string {
  return input.toString("base64url");
}

function createState(): string {
  // Generate a cryptographically secure state token to bind the authorization
  // response to this specific request and mitigate CSRF on the callback step.
  return toBase64Url(randomBytes(32));
}

function createPkceVerifier(): string {
  // Generate a high-entropy PKCE verifier that will be compared later when
  // exchanging the authorization code, protecting against code interception.
  return toBase64Url(randomBytes(64));
}

function createPkceChallenge(verifier: string): string {
  // Derive the S256 challenge from the verifier so the identity provider can
  // enforce proof-of-possession during the authorization code flow.
  return createHash("sha256").update(verifier).digest("base64url");
}

export async function GET(): Promise<Response> {
  const issuerUrl = process.env.KEYCLOAK_ISSUER;
  const redirectUri = process.env.KEYCLOAK_REDIRECT_URI;
  const configuredClientId = process.env.KEYCLOAK_CLIENT_ID;

  // Validate mandatory OIDC env vars in the BFF route to avoid starting login
  // with incomplete configuration that could leak inconsistent redirects.
  if (!issuerUrl || !configuredClientId || !redirectUri) {
    return new Response("Missing required env vars for Keycloak OIDC configuration.", {
      status: 500,
    });
  }

  const { issuer, clientId } = await getOidcClient();
  const authorizationEndpoint = issuer.metadata.authorization_endpoint;

  // Discovery must provide an authorization endpoint, otherwise the provider
  // metadata is unusable for initiating the secure authorization flow.
  if (!authorizationEndpoint) {
    return new Response("OIDC discovery missing authorization_endpoint.", {
      status: 500,
    });
  }

  const state = createState();
  const verifier = createPkceVerifier();
  const challenge = createPkceChallenge(verifier);

  await setOidcTransientCookies({ state, verifier });

  // Build the provider authorization URL on the server so the UI does not need
  // direct access to OIDC internals and sensitive request correlation values.
  const authorizationUrl = new URL(authorizationEndpoint);
  authorizationUrl.searchParams.set("client_id", clientId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid email profile");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("code_challenge", challenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(authorizationUrl.toString(), { status: 302 });
}
