import { getEnvConfig } from "./env";
import type { IdentityMeResponse } from "@/app/types/auth";

/**
 * This helper is the only place that talks to the Java backend.
 * UI/browser never calls backend URLs directly.
 */
export async function fetchIdentityMe(accessToken: string): Promise<Response> {
  const env = getEnvConfig();

  return fetch(`${env.backendBaseUrl}/api/identity/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });
}

export function isIdentityMeResponse(value: unknown): value is IdentityMeResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<IdentityMeResponse>;
  return (
    typeof candidate.sub === "string" &&
    typeof candidate.email === "string" &&
    Array.isArray(candidate.authorities) &&
    (candidate.academyId === null || typeof candidate.academyId === "string")
  );
}
