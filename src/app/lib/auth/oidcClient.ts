import { Issuer } from "openid-client";

type OidcClientConfig = {
  issuer: Issuer;
  clientId: string;
};

let cachedIssuer: Issuer | null = null;
let cachedIssuerUrl: string | null = null;

export async function getOidcClient(): Promise<OidcClientConfig> {
  const issuerUrl = process.env.KEYCLOAK_ISSUER;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;

  // Validate critical OIDC values at the BFF boundary so the route fails fast
  // with a controlled error instead of producing inconsistent redirect behavior.
  if (!issuerUrl || !clientId) {
    throw new Error("Missing required env vars for Keycloak OIDC configuration.");
  }

  // Use OIDC discovery instead of hardcoded endpoints to keep the BFF aligned
  // with provider metadata and reduce configuration drift over time.
  if (!cachedIssuer || cachedIssuerUrl !== issuerUrl) {
    cachedIssuer = await Issuer.discover(issuerUrl);
    cachedIssuerUrl = issuerUrl;
  }

  return {
    issuer: cachedIssuer,
    clientId,
  };
}
