import { createHash, randomBytes } from "node:crypto";

import { getAppEnv } from "@/lib/env";

type TokenEndpointResponse = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
};

type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
};

function encodeBase64Url(value: Buffer): string {
  return value
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function buildRealmBaseUrl(): string {
  const env = getAppEnv();

  return `${env.KEYCLOAK_BASE_URL}/realms/${env.KEYCLOAK_REALM}/protocol/openid-connect`;
}

function buildTokenResponse(payload: TokenEndpointResponse): TokenResponse {
  if (
    !payload.access_token ||
    !payload.refresh_token ||
    !payload.id_token ||
    typeof payload.expires_in !== "number"
  ) {
    throw new Error("Token response did not include required fields.");
  }

  const expiresAt = Math.floor(Date.now() / 1000) + payload.expires_in;

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    idToken: payload.id_token,
    expiresAt,
  };
}

export function createAuthorizationParams() {
  const codeVerifier = encodeBase64Url(randomBytes(64));
  const codeChallenge = encodeBase64Url(
    createHash("sha256").update(codeVerifier).digest(),
  );

  return {
    codeVerifier,
    state: encodeBase64Url(randomBytes(32)),
    nonce: encodeBase64Url(randomBytes(32)),
    codeChallenge,
  };
}

export async function buildAuthorizationUrl(params: {
  state: string;
  nonce: string;
  codeChallenge: string;
}): Promise<string> {
  const env = getAppEnv();
  const authorizationUrl = new URL(`${buildRealmBaseUrl()}/auth`);

  authorizationUrl.searchParams.set("client_id", env.KEYCLOAK_CLIENT_ID);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("redirect_uri", `${env.APP_BASE_URL}/api/auth/callback`);
  authorizationUrl.searchParams.set("scope", "openid profile email");
  authorizationUrl.searchParams.set("code_challenge", params.codeChallenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");
  authorizationUrl.searchParams.set("state", params.state);
  authorizationUrl.searchParams.set("nonce", params.nonce);

  return authorizationUrl.toString();
}

export async function exchangeAuthorizationCode(input: {
  code: string;
  codeVerifier: string;
}): Promise<TokenResponse> {
  const env = getAppEnv();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: input.code,
    redirect_uri: `${env.APP_BASE_URL}/api/auth/callback`,
    client_id: env.KEYCLOAK_CLIENT_ID,
    client_secret: env.KEYCLOAK_CLIENT_SECRET,
    code_verifier: input.codeVerifier,
  });

  const response = await fetch(`${buildRealmBaseUrl()}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Authorization code exchange failed with status ${response.status}`);
  }

  const payload: unknown = await response.json();

  if (!payload || typeof payload !== "object") {
    throw new Error("Authorization code exchange returned invalid payload.");
  }

  return buildTokenResponse(payload as TokenEndpointResponse);
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  const env = getAppEnv();

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: env.KEYCLOAK_CLIENT_ID,
    client_secret: env.KEYCLOAK_CLIENT_SECRET,
  });

  const response = await fetch(`${buildRealmBaseUrl()}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Refresh token exchange failed with status ${response.status}`);
  }

  const payload: unknown = await response.json();

  if (!payload || typeof payload !== "object") {
    throw new Error("Refresh token exchange returned invalid payload.");
  }

  return buildTokenResponse(payload as TokenEndpointResponse);
}

export async function buildLogoutUrl(idToken: string): Promise<string> {
  const env = getAppEnv();
  const logoutUrl = new URL(`${buildRealmBaseUrl()}/logout`);

  logoutUrl.searchParams.set("id_token_hint", idToken);
  logoutUrl.searchParams.set("post_logout_redirect_uri", `${env.APP_BASE_URL}/`);
  logoutUrl.searchParams.set("client_id", env.KEYCLOAK_CLIENT_ID);

  return logoutUrl.toString();
}
