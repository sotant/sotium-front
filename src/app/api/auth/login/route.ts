import { NextResponse } from "next/server";

import { createCodeChallenge, createCodeVerifier, createNonce, createState, getAuthorizationUrl } from "@/lib/oidc";
import { writeOidcTransient } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const codeVerifier = createCodeVerifier();
  const state = createState();
  const nonce = createNonce();
  const codeChallenge = createCodeChallenge(codeVerifier);

  await writeOidcTransient({
    codeVerifier,
    state,
    nonce,
  });

  return NextResponse.redirect(getAuthorizationUrl({ codeChallenge, state, nonce }));
}
