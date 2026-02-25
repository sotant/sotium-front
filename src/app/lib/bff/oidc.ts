import { getEnvConfig, getOidcEndpoints } from "./env";
import type { SessionPayload } from "@/app/types/auth";

type TokenSuccessResponse = {
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
};

function buildTokenRequestBody(params: Record<string, string>): URLSearchParams {
  const body = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    body.set(key, value);
  }

  return body;
}

function toSessionPayload(tokens: TokenSuccessResponse, fallbackRefreshToken?: string): SessionPayload {
  const accessToken = tokens.access_token;
  const idToken = tokens.id_token;
  const refreshToken = tokens.refresh_token ?? fallbackRefreshToken;
  const expiresIn = tokens.expires_in;

  if (!accessToken || !idToken || !refreshToken || !expiresIn) {
    throw new Error("Token endpoint response is incomplete.");
  }

  const expiresAt = Date.now() + expiresIn * 1000;

  return {
    accessToken,
    idToken,
    refreshToken,
    expiresAt,
  };
}

/**
 * Exchanges authorization code for OAuth tokens.
 * This is always executed server-side so secrets stay private.
 */
export async function exchangeAuthorizationCode(input: {
  code: string;
  codeVerifier: string;
}): Promise<SessionPayload> {
  const env = getEnvConfig();
  const endpoints = getOidcEndpoints();

  const response = await fetch(endpoints.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: buildTokenRequestBody({
      grant_type: "authorization_code",
      code: input.code,
      client_id: env.keycloakClientId,
      client_secret: env.keycloakClientSecret,
      redirect_uri: endpoints.callbackUrl,
      code_verifier: input.codeVerifier,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed with status ${response.status}.`);
  }

  const tokens = (await response.json()) as TokenSuccessResponse;
  return toSessionPayload(tokens);
}

/**
 * Uses refresh token to mint a new short-lived access token.
 */
export async function refreshSession(current: SessionPayload): Promise<SessionPayload> {
  const env = getEnvConfig();
  const endpoints = getOidcEndpoints();

  const response = await fetch(endpoints.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: buildTokenRequestBody({
      grant_type: "refresh_token",
      refresh_token: current.refreshToken,
      client_id: env.keycloakClientId,
      client_secret: env.keycloakClientSecret,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Refresh token grant failed with status ${response.status}.`);
  }

  const tokens = (await response.json()) as TokenSuccessResponse;
  return toSessionPayload(tokens, current.refreshToken);
}

export function buildAuthorizationUrl(input: {
  state: string;
  nonce: string;
  codeChallenge: string;
}): string {
  const env = getEnvConfig();
  const endpoints = getOidcEndpoints();

  const params = new URLSearchParams({
    client_id: env.keycloakClientId,
    response_type: "code",
    redirect_uri: endpoints.callbackUrl,
    scope: endpoints.scope,
    state: input.state,
    nonce: input.nonce,
    code_challenge: input.codeChallenge,
    code_challenge_method: "S256",
  });

  return `${endpoints.authorizationEndpoint}?${params.toString()}`;
}

export function buildLogoutUrl(idTokenHint?: string): string {
  const env = getEnvConfig();
  const endpoints = getOidcEndpoints();

  const params = new URLSearchParams({
    post_logout_redirect_uri: endpoints.postLogoutRedirectUrl,
    client_id: env.keycloakClientId,
  });

  if (idTokenHint) {
    params.set("id_token_hint", idTokenHint);
  }

  return `${endpoints.logoutEndpoint}?${params.toString()}`;
}
