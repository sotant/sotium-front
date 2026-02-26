type OidcIssuerMetadata = {
  authorization_endpoint?: string;
};

type OidcIssuer = {
  metadata: OidcIssuerMetadata;
};

type OidcClientConfig = {
  issuer: OidcIssuer;
  clientId: string;
};

type OpenIdClientModule = {
  Issuer: {
    discover: (issuerUrl: string) => Promise<OidcIssuer>;
  };
};

let cachedIssuer: OidcIssuer | null = null;
let cachedIssuerUrl: string | null = null;

async function discoverWithOpenIdClient(issuerUrl: string): Promise<OidcIssuer> {
  // Load openid-client lazily so local builds do not fail hard if dependency
  // installation is temporarily broken; production should still install it.
  const dynamicImport = new Function(
    "moduleName",
    'return import(moduleName) as Promise<unknown>;',
  ) as (moduleName: string) => Promise<unknown>;

  const importedModule = (await dynamicImport("openid-client")) as OpenIdClientModule;
  return importedModule.Issuer.discover(issuerUrl);
}

async function discoverWithWellKnownFallback(issuerUrl: string): Promise<OidcIssuer> {
  // Keep login bootstrap operational even when openid-client is unavailable by
  // falling back to standard OIDC discovery via well-known metadata.
  const discoveryUrl = new URL(".well-known/openid-configuration", `${issuerUrl.replace(/\/$/, "")}/`);
  const response = await fetch(discoveryUrl.toString(), {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("OIDC discovery request failed.");
  }

  const metadata = (await response.json()) as OidcIssuerMetadata;
  return { metadata };
}

export async function getOidcClient(): Promise<OidcClientConfig> {
  const issuerUrl = process.env.KEYCLOAK_ISSUER;
  const clientId = process.env.KEYCLOAK_CLIENT_ID;

  // Validate critical OIDC values at the BFF boundary so the route fails fast
  // with a controlled error instead of producing inconsistent redirect behavior.
  if (!issuerUrl || !clientId) {
    throw new Error("Missing required env vars for Keycloak OIDC configuration.");
  }

  if (!cachedIssuer || cachedIssuerUrl !== issuerUrl) {
    // Prefer openid-client discovery for standards compliance and future token
    // validation support, but keep a defensive fallback for developer tooling.
    cachedIssuer = await discoverWithOpenIdClient(issuerUrl).catch(async () => {
      return discoverWithWellKnownFallback(issuerUrl);
    });
    cachedIssuerUrl = issuerUrl;
  }

  return {
    issuer: cachedIssuer,
    clientId,
  };
}
