const requiredEnvKeys = [
  "KEYCLOAK_BASE_URL",
  "KEYCLOAK_REALM",
  "KEYCLOAK_CLIENT_ID",
  "KEYCLOAK_CLIENT_SECRET",
  "APP_BASE_URL",
  "BACKEND_BASE_URL",
  "SESSION_SECRET",
] as const;

type EnvKey = (typeof requiredEnvKeys)[number];

type EnvConfig = Record<EnvKey, string>;

const env = requiredEnvKeys.reduce<Partial<EnvConfig>>((acc, key) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }

  acc[key] = value;
  return acc;
}, {});

export const config = env as EnvConfig;
