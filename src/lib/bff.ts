import { headers } from "next/headers";

import { getAppEnv } from "@/lib/env";
import type { IdentityMe } from "@/types/auth";

type BffMeResponse =
  | { status: "authenticated"; payload: IdentityMe }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

export async function getBffMe(): Promise<BffMeResponse> {
  const env = getAppEnv();
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") ?? "";

  const response = await fetch(`${env.APP_BASE_URL}/api/bff/me`, {
    method: "GET",
    headers: {
      cookie: cookieHeader,
      accept: "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 401) {
    return { status: "unauthenticated" };
  }

  if (!response.ok) {
    return {
      status: "error",
      message: `BFF /api/bff/me failed with status ${response.status}`,
    };
  }

  const payload: unknown = await response.json();

  return {
    status: "authenticated",
    payload: payload as IdentityMe,
  };
}
