import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function toBase64Url(value: Buffer): string {
  return value
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string): Buffer {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = padded.length % 4;
  const normalized = remainder === 0 ? padded : `${padded}${"=".repeat(4 - remainder)}`;

  return Buffer.from(normalized, "base64");
}

function deriveEncryptionKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

/**
 * Encrypts JSON data using AES-256-GCM.
 * This gives confidentiality and integrity for our HttpOnly cookies.
 */
export function encryptPayload(payload: object, secret: string): string {
  const iv = randomBytes(12);
  const key = deriveEncryptionKey(secret);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [toBase64Url(iv), toBase64Url(ciphertext), toBase64Url(authTag)].join(".");
}

/**
 * Decrypts and validates AES-GCM payload.
 * Returns null when cookie content is invalid or tampered.
 */
export function decryptPayload<T>(value: string, secret: string): T | null {
  const [ivRaw, ciphertextRaw, authTagRaw] = value.split(".");

  if (!ivRaw || !ciphertextRaw || !authTagRaw) {
    return null;
  }

  try {
    const iv = fromBase64Url(ivRaw);
    const ciphertext = fromBase64Url(ciphertextRaw);
    const authTag = fromBase64Url(authTagRaw);
    const key = deriveEncryptionKey(secret);

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

    return JSON.parse(plaintext.toString("utf8")) as T;
  } catch {
    return null;
  }
}

export function randomUrlSafe(size = 32): string {
  return toBase64Url(randomBytes(size));
}

export function createCodeChallenge(codeVerifier: string): string {
  return toBase64Url(createHash("sha256").update(codeVerifier).digest());
}
