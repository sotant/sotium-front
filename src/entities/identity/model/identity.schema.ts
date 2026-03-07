import type { Identity } from "@/entities/identity/model/identity";

export function normalizeIdentity(payload: unknown): Identity {
  if (typeof payload !== "object" || payload === null) {
    throw new Error("Identity payload must be an object.");
  }

  const candidate = payload as {
    sub?: unknown;
    email?: unknown;
    authorities?: unknown;
    academyId?: unknown;
  };

  if (typeof candidate.sub !== "string" || candidate.sub.length === 0) {
    throw new Error("Identity sub is invalid.");
  }

  if (typeof candidate.email !== "string" || candidate.email.length === 0) {
    throw new Error("Identity email is invalid.");
  }

  if (!Array.isArray(candidate.authorities) || !candidate.authorities.every((item) => typeof item === "string")) {
    throw new Error("Identity authorities are invalid.");
  }

  if (candidate.academyId !== null && typeof candidate.academyId !== "string") {
    throw new Error("Identity academyId is invalid.");
  }

  return {
    sub: candidate.sub,
    email: candidate.email,
    authorities: candidate.authorities,
    academyId: candidate.academyId ?? null,
  };
}
