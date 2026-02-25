import { NextRequest, NextResponse } from "next/server";

type CallbackResponse = {
  message: string;
};

export async function GET(request: NextRequest): Promise<NextResponse<CallbackResponse>> {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      {
        message: "Missing authorization data from identity provider.",
      },
      { status: 400 },
    );
  }

  // Future Keycloak integration point:
  // 1. Validate the `state` value against a server-side session store.
  // 2. Exchange the `code` for tokens through the BFF only.
  // 3. Store session data securely in HTTP-only cookies.
  // 4. Never expose access or refresh tokens to the browser runtime.

  return NextResponse.json(
    {
      message: "Authorization callback received. Token exchange is pending implementation.",
    },
    { status: 501 },
  );
}
