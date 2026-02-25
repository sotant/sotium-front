import { NextResponse } from "next/server";

import {
  buildAuthorizationUrl,
  createAuthorizationParams,
} from "@/lib/oidc";
import { storeAuthFlowState } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const authParams = createAuthorizationParams();

  // We store verifier/state/nonce in a short-lived HttpOnly cookie for callback validation.
  await storeAuthFlowState({
    codeVerifier: authParams.codeVerifier,
    state: authParams.state,
    nonce: authParams.nonce,
  });

  const authorizationUrl = await buildAuthorizationUrl({
    state: authParams.state,
    nonce: authParams.nonce,
    codeChallenge: authParams.codeChallenge,
  });

  return NextResponse.redirect(authorizationUrl);
}
