import { normalizeIdentity } from "@/entities/identity/model/identity.schema";
import type { Identity } from "@/entities/identity/model/identity";
import { fetchJson } from "@/shared/api/fetch-json";

export async function getIdentityMe(params: {
  baseUrl: string;
  cookieHeader: string;
}): Promise<Identity> {
  return fetchJson(
    `${params.baseUrl}/api/bff/me`,
    {
      cache: "no-store",
      headers: {
        cookie: params.cookieHeader,
      },
    },
    normalizeIdentity,
  );
}
