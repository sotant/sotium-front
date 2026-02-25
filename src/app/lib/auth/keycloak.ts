const keycloakEnvKeys = {
  baseUrl: "KEYCLOAK_BASE_URL",
  realm: "KEYCLOAK_REALM",
  clientId: "KEYCLOAK_CLIENT_ID",
} as const;

type KeycloakConfig = {
  readonly baseUrl: string;
  readonly realm: string;
  readonly clientId: string;
};

function readEnvValue(key: string): string | null {
  const value = process.env[key]?.trim();

  return value && value.length > 0 ? value : null;
}

export function getKeycloakConfig(): KeycloakConfig | null {
  const baseUrl = readEnvValue(keycloakEnvKeys.baseUrl);
  const realm = readEnvValue(keycloakEnvKeys.realm);
  const clientId = readEnvValue(keycloakEnvKeys.clientId);

  if (!baseUrl || !realm || !clientId) {
    return null;
  }

  return { baseUrl, realm, clientId };
}

export function buildKeycloakAuthorizationUrl(
  config: KeycloakConfig,
  redirectUri: string,
  state: string,
): string {
  const authorizationEndpoint = new URL(
    `/realms/${encodeURIComponent(config.realm)}/protocol/openid-connect/auth`,
    config.baseUrl,
  );

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid profile email",
    state,
  });

  authorizationEndpoint.search = params.toString();

  return authorizationEndpoint.toString();
}
