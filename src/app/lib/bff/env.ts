type EnvConfig = {
  keycloakBaseUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
  keycloakClientSecret: string;
  appBaseUrl: string;
  backendBaseUrl: string;
  sessionSecret: string;
};

function getEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getEnvConfig(): EnvConfig {
  return {
    keycloakBaseUrl: getEnv("KEYCLOAK_BASE_URL"),
    keycloakRealm: getEnv("KEYCLOAK_REALM"),
    keycloakClientId: getEnv("KEYCLOAK_CLIENT_ID"),
    keycloakClientSecret: getEnv("KEYCLOAK_CLIENT_SECRET"),
    appBaseUrl: getEnv("APP_BASE_URL"),
    backendBaseUrl: getEnv("BACKEND_BASE_URL"),
    sessionSecret: getEnv("SESSION_SECRET"),
  };
}

export function getOidcEndpoints() {
  const config = getEnvConfig();
  const realmPath = `/realms/${encodeURIComponent(config.keycloakRealm)}/protocol/openid-connect`;

  return {
    authorizationEndpoint: `${config.keycloakBaseUrl}${realmPath}/auth`,
    tokenEndpoint: `${config.keycloakBaseUrl}${realmPath}/token`,
    logoutEndpoint: `${config.keycloakBaseUrl}${realmPath}/logout`,
    callbackUrl: `${config.appBaseUrl}/api/auth/callback`,
    postLogoutRedirectUrl: `${config.appBaseUrl}/`,
    scope: "openid profile email",
  } as const;
}
