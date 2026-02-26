import { cookies } from "next/headers";

export const OIDC_STATE_COOKIE = "oidc_state" as const;
export const OIDC_VERIFIER_COOKIE = "oidc_code_verifier" as const;

const OIDC_COOKIE_MAX_AGE_SECONDS = 300;

export async function setOidcTransientCookies(params: {
  state: string;
  verifier: string;
}): Promise<void> {
  const cookieStore = await cookies();

  // Persist short-lived state and PKCE verifier in httpOnly cookies so browser
  // JavaScript cannot read them before callback validation and code exchange.
  cookieStore.set(OIDC_STATE_COOKIE, params.state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: OIDC_COOKIE_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });

  cookieStore.set(OIDC_VERIFIER_COOKIE, params.verifier, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: OIDC_COOKIE_MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearOidcTransientCookies(): Promise<void> {
  const cookieStore = await cookies();

  // Clear transient cookies after they are consumed to reduce replay window
  // and avoid reusing stale authorization request values.
  cookieStore.set(OIDC_STATE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });

  cookieStore.set(OIDC_VERIFIER_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
}
