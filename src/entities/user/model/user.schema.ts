import type { User } from "@/entities/user/model/user";

function parseOptionalString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("User optional field is invalid.");
  }

  return value;
}

function parseRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`User ${fieldName} is invalid.`);
  }

  return value;
}

export function normalizeUsers(payload: unknown): User[] {
  if (!Array.isArray(payload)) {
    throw new Error("Users payload must be an array.");
  }

  return payload.map((entry) => {
    if (typeof entry !== "object" || entry === null) {
      throw new Error("User item must be an object.");
    }

    const candidate = entry as Record<string, unknown>;

    return {
      id: parseRequiredString(candidate.id, "id"),
      userId: parseRequiredString(candidate.userId, "userId"),
      firstName: parseRequiredString(candidate.firstName, "firstName"),
      lastName: parseRequiredString(candidate.lastName, "lastName"),
      phone: parseOptionalString(candidate.phone),
      avatarUrl: parseOptionalString(candidate.avatarUrl),
      bio: parseOptionalString(candidate.bio),
      createdAt: parseRequiredString(candidate.createdAt, "createdAt"),
      updatedAt: parseRequiredString(candidate.updatedAt, "updatedAt"),
      email: parseRequiredString(candidate.email, "email"),
    };
  });
}
