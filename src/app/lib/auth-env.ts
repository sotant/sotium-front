const requiredAuthEnvKeys = [
  "KEYCLOAK_BASE_URL",
  "KEYCLOAK_REALM",
  "KEYCLOAK_CLIENT_ID",
] as const;

type AuthEnvKey = (typeof requiredAuthEnvKeys)[number];

type AuthEnvConfig = {
  keycloakBaseUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
};

type AuthEnvResult =
  | {
      ok: true;
      config: AuthEnvConfig;
    }
  | {
      ok: false;
      missingKeys: ReadonlyArray<AuthEnvKey>;
    };

function readEnv(key: AuthEnvKey): string | undefined {
  const value = process.env[key]?.trim();
  return value ? value : undefined;
}

export function getAuthEnvConfig(): AuthEnvResult {
  const values = requiredAuthEnvKeys.reduce<Record<AuthEnvKey, string | undefined>>(
    (accumulator, key) => {
      accumulator[key] = readEnv(key);
      return accumulator;
    },
    {
      KEYCLOAK_BASE_URL: undefined,
      KEYCLOAK_REALM: undefined,
      KEYCLOAK_CLIENT_ID: undefined,
    },
  );

  const missingKeys = requiredAuthEnvKeys.filter((key) => !values[key]);

  if (missingKeys.length > 0) {
    return {
      ok: false,
      missingKeys,
    };
  }

  return {
    ok: true,
    config: {
      keycloakBaseUrl: values.KEYCLOAK_BASE_URL!,
      keycloakRealm: values.KEYCLOAK_REALM!,
      keycloakClientId: values.KEYCLOAK_CLIENT_ID!,
    },
  };
}
