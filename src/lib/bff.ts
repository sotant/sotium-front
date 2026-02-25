import { cookies } from "next/headers";

import { config } from "@/lib/env";

import type { IdentityMeResponse } from "@/lib/backend";

export async function getBffMe(): Promise<IdentityMeResponse | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const response = await fetch(`${config.APP_BASE_URL}/api/bff/me`, {
    method: "GET",
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as IdentityMeResponse;
}
