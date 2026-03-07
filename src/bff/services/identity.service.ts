import { callJavaBackend } from "@/bff/clients/java.client";
import { mapJavaIdentity } from "@/bff/mappers/identity.mapper";
import type { Identity } from "@/entities/identity/model/identity";

export async function getIdentityMe(params: { accessToken: string }): Promise<{ status: number; data?: Identity }> {
  const response = await callJavaBackend("/api/identity/me", {
    accessToken: params.accessToken,
    method: "GET",
  });

  if (response.status === 401 || response.status === 403) {
    return { status: 401 };
  }

  if (!response.ok) {
    return { status: 502 };
  }

  const payload = (await response.json()) as unknown;

  try {
    const data = mapJavaIdentity(payload);
    return { status: 200, data };
  } catch {
    return { status: 502 };
  }
}
