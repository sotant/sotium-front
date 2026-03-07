import { normalizeUsers } from "@/entities/user/model/user.schema";
import type { User } from "@/entities/user/model/user";
import { fetchJson } from "@/shared/api/fetch-json";

export async function getUsers(params: {
  baseUrl: string;
  cookieHeader: string;
}): Promise<User[]> {
  return fetchJson(
    `${params.baseUrl}/api/bff/users`,
    {
      cache: "no-store",
      headers: {
        cookie: params.cookieHeader,
      },
    },
    normalizeUsers,
  );
}
