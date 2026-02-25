import { createHash, randomBytes } from "node:crypto";

import { config } from "@/lib/env";

const TOKEN_REFRESH_SKEW_SECONDS = 30;

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
};

export type SessionTokens = Readonly<{
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresAt: number;
}>;

function realmPath(path: string): string {
  return `${config.KEYCLOAK_BASE_URL}/realms/${config.KEYCLOAK_REALM}/protocol/openid-connect/${path}`;
}

export function createCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

export function createState(): string {
  return randomBytes(16).toString("base64url");
}

export function createNonce(): string {
  return randomBytes(16).toString("base64url");
}

export function createCodeChallenge(codeVerifier: string): string {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

function buildRedirectUri(): string {
  return `${config.APP_BASE_URL}/api/auth/callback`;
}

function mapTokenResponse(tokens: TokenResponse): SessionTokens {
  if (!tokens.access_token || !tokens.refresh_token || !tokens.id_token || typeof tokens.expires_in !== "number") {
    throw new Error("Invalid token response");
  }

  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    idToken: tokens.id_token,
    expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
  };
}

async function postTokenEndpoint(body: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch(realmPath("token"), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Token endpoint error (${response.status}): ${message}`);
  }

  return (await response.json()) as TokenResponse;
}

export function getAuthorizationUrl(params: Readonly<{ codeChallenge: string; state: string; nonce: string }>): string {
  const url = new URL(realmPath("auth"));

  url.searchParams.set("client_id", config.KEYCLOAK_CLIENT_ID);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", buildRedirectUri());
  url.searchParams.set("scope", "openid profile email");
  url.searchParams.set("code_challenge", params.codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("state", params.state);
  url.searchParams.set("nonce", params.nonce);

  return url.toString();
}

export async function exchangeAuthorizationCode(params: Readonly<{ code: string; codeVerifier: string }>): Promise<SessionTokens> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: params.code,
    client_id: config.KEYCLOAK_CLIENT_ID,
    client_secret: config.KEYCLOAK_CLIENT_SECRET,
    redirect_uri: buildRedirectUri(),
    code_verifier: params.codeVerifier,
  });

  const tokenResponse = await postTokenEndpoint(body);
  return mapTokenResponse(tokenResponse);
}

export async function refreshAccessToken(params: Readonly<{ refreshToken: string }>): Promise<SessionTokens> {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: params.refreshToken,
    client_id: config.KEYCLOAK_CLIENT_ID,
    client_secret: config.KEYCLOAK_CLIENT_SECRET,
  });

  const tokenResponse = await postTokenEndpoint(body);

  if (!tokenResponse.refresh_token) {
    tokenResponse.refresh_token = params.refreshToken;
  }

  return mapTokenResponse(tokenResponse);
}

export function needsRefresh(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  return expiresAt - TOKEN_REFRESH_SKEW_SECONDS <= now;
}

export function getLogoutUrl(idTokenHint: string): string {
  const url = new URL(realmPath("logout"));

  url.searchParams.set("id_token_hint", idTokenHint);
  url.searchParams.set("post_logout_redirect_uri", `${config.APP_BASE_URL}/`);
  url.searchParams.set("client_id", config.KEYCLOAK_CLIENT_ID);

  return url.toString();
}
