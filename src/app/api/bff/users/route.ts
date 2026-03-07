import { getBffSession } from "@/app/lib/auth/session";
import { getAcademyUsers } from "@/bff/services/users.service";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const session = await getBffSession();

  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await getAcademyUsers({ accessToken: session.accessToken });

    if (result.status !== 200 || !result.data) {
      return Response.json({ error: result.status === 401 ? "unauthorized" : "bad_gateway" }, { status: result.status });
    }

    return Response.json(result.data, { status: 200 });
  } catch {
    return Response.json({ error: "bad_gateway" }, { status: 502 });
  }
}
