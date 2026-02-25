import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { decryptPayload, encryptPayload } from "./crypto";
import { getEnvConfig } from "./env";
import type { AuthFlowPayload, SessionPayload } from "@/app/types/auth";

export const SESSION_COOKIE_NAME = "sotium_session";
export const FLOW_COOKIE_NAME = "sotium_auth_flow";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
const FLOW_MAX_AGE_SECONDS = 60 * 10;

type CookieReader = {
  get(name: string): { value: string } | undefined;
};

function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

function getCookieSecurityOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction(),
    path: "/",
  };
}

export function hasSessionCookie(cookieStore: CookieReader): boolean {
  return Boolean(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export function readSessionFromCookieStore(cookieStore: CookieReader): SessionPayload | null {
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    return null;
  }

  return decryptPayload<SessionPayload>(sessionCookie, getEnvConfig().sessionSecret);
}

export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return readSessionFromCookieStore(cookieStore);
}

export function writeSession(response: NextResponse, payload: SessionPayload): void {
  const encrypted = encryptPayload(payload, getEnvConfig().sessionSecret);

  response.cookies.set(SESSION_COOKIE_NAME, encrypted, {
    ...getCookieSecurityOptions(),
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSession(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getCookieSecurityOptions(),
    maxAge: 0,
  });
}

export function writeAuthFlowCookie(response: NextResponse, payload: AuthFlowPayload): void {
  const encrypted = encryptPayload(payload, getEnvConfig().sessionSecret);

  response.cookies.set(FLOW_COOKIE_NAME, encrypted, {
    ...getCookieSecurityOptions(),
    maxAge: FLOW_MAX_AGE_SECONDS,
  });
}

export function readAuthFlowCookie(cookieStore: CookieReader): AuthFlowPayload | null {
  const flowCookie = cookieStore.get(FLOW_COOKIE_NAME)?.value;

  if (!flowCookie) {
    return null;
  }

  return decryptPayload<AuthFlowPayload>(flowCookie, getEnvConfig().sessionSecret);
}

export function clearAuthFlowCookie(response: NextResponse): void {
  response.cookies.set(FLOW_COOKIE_NAME, "", {
    ...getCookieSecurityOptions(),
    maxAge: 0,
  });
}
