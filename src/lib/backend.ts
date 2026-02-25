import { config } from "@/lib/env";

export type IdentityMeResponse = Readonly<{
  sub: string;
  email: string;
  authorities: readonly string[];
  academyId: string | null;
}>;

export async function fetchIdentityMe(accessToken: string): Promise<IdentityMeResponse> {
  const response = await fetch(`${config.BACKEND_BASE_URL}/api/identity/me`, {
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

  return (await response.json()) as IdentityMeResponse;
}
