import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { cookies } from "next/headers";

import { getAppEnv } from "@/lib/env";
import type { AuthFlowState, SessionPayload } from "@/types/auth";

const SESSION_COOKIE_NAME = "sotium_session";
const AUTH_FLOW_COOKIE_NAME = "sotium_auth_flow";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
const AUTH_FLOW_MAX_AGE_SECONDS = 60 * 10;

function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === "production";
}

function buildEncryptionKey(): Buffer {
  const env = getAppEnv();

  // We derive a stable 32-byte key from SESSION_SECRET for AES-256-GCM.
  return createHash("sha256").update(env.SESSION_SECRET).digest();
}

function encodeBase64Url(value: Buffer): string {
  return value
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value: string): Buffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));

  return Buffer.from(`${normalized}${padding}`, "base64");
}

function encryptPayload(payload: AuthFlowState | SessionPayload): string {
  const plaintext = Buffer.from(JSON.stringify(payload), "utf-8");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", buildEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, encrypted].map(encodeBase64Url).join(".");
}

function decryptPayload<TPayload>(value: string): TPayload | null {
  try {
    const [ivPart, tagPart, encryptedPart] = value.split(".");

    if (!ivPart || !tagPart || !encryptedPart) {
      return null;
    }

    const decipher = createDecipheriv(
      "aes-256-gcm",
      buildEncryptionKey(),
      decodeBase64Url(ivPart),
    );

    decipher.setAuthTag(decodeBase64Url(tagPart));

    const decrypted = Buffer.concat([
      decipher.update(decodeBase64Url(encryptedPart)),
      decipher.final(),
    ]);

    const parsed: unknown = JSON.parse(decrypted.toString("utf-8"));

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed as TPayload;
  } catch {
    return null;
  }
}

export async function storeAuthFlowState(flowState: AuthFlowState): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(AUTH_FLOW_COOKIE_NAME, encryptPayload(flowState), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProductionEnvironment(),
    path: "/",
    maxAge: AUTH_FLOW_MAX_AGE_SECONDS,
  });
}

export async function readAuthFlowState(): Promise<AuthFlowState | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(AUTH_FLOW_COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  return decryptPayload<AuthFlowState>(value);
}

export async function clearAuthFlowState(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_FLOW_COOKIE_NAME);
}

export async function storeSession(session: SessionPayload): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, encryptPayload(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProductionEnvironment(),
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!value) {
    return null;
  }

  return decryptPayload<SessionPayload>(value);
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
