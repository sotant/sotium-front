import { getAppEnv } from "@/lib/env";
import type { IdentityMe } from "@/types/auth";

function isIdentityMe(value: unknown): value is IdentityMe {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<IdentityMe>;

  return (
    typeof candidate.sub === "string" &&
    typeof candidate.email === "string" &&
    Array.isArray(candidate.authorities) &&
    candidate.authorities.every((authority) => typeof authority === "string") &&
    (candidate.academyId === null || typeof candidate.academyId === "string")
  );
}

export async function fetchIdentityMe(accessToken: string): Promise<IdentityMe> {
  const env = getAppEnv();

  // The Bearer token is attached by the BFF so browser code never handles it.
  const response = await fetch(`${env.BACKEND_BASE_URL}/api/identity/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Backend /api/identity/me failed with status ${response.status}`);
  }

  const payload: unknown = await response.json();

  if (!isIdentityMe(payload)) {
    throw new Error("Backend /api/identity/me returned an unexpected payload.");
  }

  return payload;
}
