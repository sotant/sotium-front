import { callJavaBackend } from "@/bff/clients/java.client";
import { mapJavaUsers } from "@/bff/mappers/user.mapper";
import type { User } from "@/entities/user/model/user";

export async function getAcademyUsers(params: { accessToken: string }): Promise<{ status: number; data?: User[] }> {
  const academyId = process.env.ACADEMY_ID;

  if (!academyId) {
    return { status: 500 };
  }

  const response = await callJavaBackend(`/api/public/identity/register-user?academyId=${encodeURIComponent(academyId)}`, {
    accessToken: params.accessToken,
    method: "POST",
  });

  if (response.status === 401 || response.status === 403) {
    return { status: 401 };
  }

  if (!response.ok) {
    return { status: 502 };
  }

  const payload = (await response.json()) as unknown;

  try {
    const data = mapJavaUsers(payload);
    return { status: 200, data };
  } catch {
    return { status: 502 };
  }
}
