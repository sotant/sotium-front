// This module centralizes environment variable validation so the app fails fast.
const requiredEnvVarNames = [
  "KEYCLOAK_BASE_URL",
  "KEYCLOAK_REALM",
  "KEYCLOAK_CLIENT_ID",
  "KEYCLOAK_CLIENT_SECRET",
  "APP_BASE_URL",
  "BACKEND_BASE_URL",
  "SESSION_SECRET",
] as const;

type RequiredEnvVarName = (typeof requiredEnvVarNames)[number];

type AppEnv = Record<RequiredEnvVarName, string>;

function readRequiredEnvVar(name: RequiredEnvVarName): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getAppEnv(): AppEnv {
  const envEntries = requiredEnvVarNames.map((name) => [
    name,
    readRequiredEnvVar(name),
  ]);

  return Object.fromEntries(envEntries) as AppEnv;
}
