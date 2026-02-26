import { getBffSession } from "@/app/lib/auth/session";
import type { IdentityMeDto } from "@/app/types/identity";

export const dynamic = "force-dynamic";

type IdentityMeApiPayload = {
  sub?: unknown;
  email?: unknown;
  authorities?: unknown;
  academyId?: unknown;
};

function normalizeIdentityPayload(payload: unknown): IdentityMeDto | null {
  if (typeof payload !== "object" || payload === null) {
    return null;
  }

  const candidate = payload as IdentityMeApiPayload;

  if (typeof candidate.sub !== "string" || typeof candidate.email !== "string") {
    return null;
  }

  if (!Array.isArray(candidate.authorities) || !candidate.authorities.every((item) => typeof item === "string")) {
    return null;
  }

  if (candidate.academyId !== null && typeof candidate.academyId !== "string") {
    return null;
  }

  return {
    sub: candidate.sub,
    email: candidate.email,
    authorities: candidate.authorities,
    academyId: candidate.academyId,
  };
}

export async function GET(): Promise<Response> {
  const session = await getBffSession();

  // Keep defense in depth at the BFF boundary: middleware may block anonymous
  // requests, but the route must still enforce auth before contacting backend.
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const backendBaseUrl = process.env.BACKEND_BASE_URL;

  if (!backendBaseUrl) {
    return Response.json({ error: "bad_gateway" }, { status: 502 });
  }

  // The frontend never calls external services directly. The BFF injects the
  // bearer token server-side so credentials never leave trusted boundaries.
  const backendResponse = await fetch(`${backendBaseUrl}/api/identity/me`, {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
    // Disable caching for identity data to avoid serving stale or cross-user data.
    cache: "no-store",
  });

  if (backendResponse.status === 401 || backendResponse.status === 403) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  if (backendResponse.status >= 500) {
    return Response.json({ error: "bad_gateway" }, { status: 502 });
  }

  if (!backendResponse.ok) {
    return Response.json({ error: "bad_gateway" }, { status: 502 });
  }

  const payload = (await backendResponse.json()) as unknown;
  const identity = normalizeIdentityPayload(payload);

  if (!identity) {
    return Response.json({ error: "bad_gateway" }, { status: 502 });
  }

  return Response.json(identity satisfies IdentityMeDto, { status: 200 });
}
