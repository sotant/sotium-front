import { cookies } from "next/headers";

export const BFF_SESSION_COOKIE = "bff_session" as const;

type BffSession = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
};

type BffSessionCookiePayload = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
};

function getSessionMaxAgeSeconds(expiresAt: number): number {
  return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
}

export async function setBffSession(session: BffSession): Promise<void> {
  const cookieStore = await cookies();

  // Keep tokens inside a server-controlled cookie because the BFF is the only
  // trusted boundary that should communicate with identity providers/backends.
  // This prevents exposing bearer tokens directly to browser JavaScript.
  cookieStore.set(BFF_SESSION_COOKIE, JSON.stringify(session satisfies BffSessionCookiePayload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAgeSeconds(session.expiresAt),
  });
}

export async function clearBffSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(BFF_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function getBffSession(): Promise<BffSession | null> {
  const cookieStore = await cookies();
  const rawSession = cookieStore.get(BFF_SESSION_COOKIE)?.value;

  if (!rawSession) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawSession) as Partial<BffSessionCookiePayload>;

    if (typeof parsed.accessToken !== "string") {
      return null;
    }

    if (typeof parsed.expiresAt !== "number") {
      return null;
    }

    if (parsed.refreshToken !== undefined && typeof parsed.refreshToken !== "string") {
      return null;
    }

    if (parsed.idToken !== undefined && typeof parsed.idToken !== "string") {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
      idToken: parsed.idToken,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export type { BffSession };
