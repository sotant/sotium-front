import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

import { config } from "@/lib/env";

export const SESSION_COOKIE_NAME = "sotium_session";
export const OIDC_TRANSIENT_COOKIE_NAME = "sotium_oidc";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
const OIDC_COOKIE_MAX_AGE_SECONDS = 60 * 10;
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

type BaseSession = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
};

export type SessionPayload = Readonly<BaseSession>;

type OidcTransientPayload = Readonly<{
  codeVerifier: string;
  state: string;
  nonce: string;
}>;

function getEncryptionKey(): Buffer {
  return createHash("sha256").update(config.SESSION_SECRET, "utf8").digest();
}

function encodePayload(payload: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function decodePayload(value: string): string | null {
  try {
    const key = getEncryptionKey();
    const raw = Buffer.from(value, "base64url");

    if (raw.length <= IV_LENGTH + AUTH_TAG_LENGTH) {
      return null;
    }

    const iv = raw.subarray(0, IV_LENGTH);
    const tag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  const decoded = decodePayload(value);

  if (!decoded) {
    return null;
  }

  let parsed: Partial<SessionPayload>;

  try {
    parsed = JSON.parse(decoded) as Partial<SessionPayload>;
  } catch {
    return null;
  }

  if (
    typeof parsed.accessToken !== "string" ||
    typeof parsed.refreshToken !== "string" ||
    typeof parsed.idToken !== "string" ||
    typeof parsed.expiresAt !== "number"
  ) {
    return null;
  }

  return {
    accessToken: parsed.accessToken,
    refreshToken: parsed.refreshToken,
    idToken: parsed.idToken,
    expiresAt: parsed.expiresAt,
  };
}

export async function writeSession(payload: SessionPayload): Promise<void> {
  const cookieStore = await cookies();
  const serialized = JSON.stringify(payload);

  cookieStore.set(SESSION_COOKIE_NAME, encodePayload(serialized), sessionCookieOptions(COOKIE_MAX_AGE_SECONDS));
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function writeOidcTransient(payload: OidcTransientPayload): Promise<void> {
  const cookieStore = await cookies();
  const serialized = JSON.stringify(payload);

  cookieStore.set(OIDC_TRANSIENT_COOKIE_NAME, encodePayload(serialized), sessionCookieOptions(OIDC_COOKIE_MAX_AGE_SECONDS));
}

export async function readOidcTransient(): Promise<OidcTransientPayload | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(OIDC_TRANSIENT_COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  const decoded = decodePayload(value);

  if (!decoded) {
    return null;
  }

  let parsed: Partial<OidcTransientPayload>;

  try {
    parsed = JSON.parse(decoded) as Partial<OidcTransientPayload>;
  } catch {
    return null;
  }

  if (typeof parsed.codeVerifier !== "string" || typeof parsed.state !== "string" || typeof parsed.nonce !== "string") {
    return null;
  }

  return {
    codeVerifier: parsed.codeVerifier,
    state: parsed.state,
    nonce: parsed.nonce,
  };
}

export async function clearOidcTransient(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(OIDC_TRANSIENT_COOKIE_NAME);
}
