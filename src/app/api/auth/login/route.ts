import { NextResponse } from "next/server";
import { buildAuthorizationUrl } from "@/app/lib/bff/oidc";
import { createCodeChallenge, randomUrlSafe } from "@/app/lib/bff/crypto";
import { writeAuthFlowCookie } from "@/app/lib/bff/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const appOrigin = new URL(request.url).origin;

  // PKCE + state + nonce protects us against code interception and CSRF attacks.
  const codeVerifier = randomUrlSafe(64);
  const codeChallenge = createCodeChallenge(codeVerifier);
  const state = randomUrlSafe(32);
  const nonce = randomUrlSafe(32);

  const authorizationUrl = buildAuthorizationUrl({
    state,
    nonce,
    codeChallenge,
    redirectUri: `${appOrigin}/api/auth/callback`,
  });
  const response = NextResponse.redirect(authorizationUrl, 302);

  writeAuthFlowCookie(response, {
    state,
    nonce,
    codeVerifier,
  });

  return response;
}
