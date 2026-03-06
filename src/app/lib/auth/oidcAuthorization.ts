import { createHash, randomBytes } from "node:crypto";

const OIDC_SCOPE = "openid email profile" as const;

function toBase64Url(input: Buffer): string {
  return input.toString("base64url");
}

function createState(): string {
  return toBase64Url(randomBytes(32));
}

function createPkceVerifier(): string {
  return toBase64Url(randomBytes(64));
}

function createPkceChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

type BuildAuthorizationUrlParams = {
  endpoint: string;
  clientId: string;
  redirectUri: string;
  state: string;
  challenge: string;
};

export function createAuthorizationRequest(): {
  state: string;
  verifier: string;
  challenge: string;
} {
  const state = createState();
  const verifier = createPkceVerifier();

  return {
    state,
    verifier,
    challenge: createPkceChallenge(verifier),
  };
}

export function buildAuthorizationUrl(params: BuildAuthorizationUrlParams): string {
  const authorizationUrl = new URL(params.endpoint);
  authorizationUrl.searchParams.set("client_id", params.clientId);
  authorizationUrl.searchParams.set("redirect_uri", params.redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", OIDC_SCOPE);
  authorizationUrl.searchParams.set("state", params.state);
  authorizationUrl.searchParams.set("code_challenge", params.challenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  return authorizationUrl.toString();
}
