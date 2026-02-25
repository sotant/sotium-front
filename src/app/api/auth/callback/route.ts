export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");

  if (!code || !state) {
    return Response.json(
      { error: "Invalid authorization response." },
      { status: 400 },
    );
  }

  // TODO: Exchange authorization code for tokens against Keycloak token endpoint.
  // TODO: Validate `state` against the value persisted before redirecting to Keycloak.
  // TODO: Create a secure server-side session and store tokens in HttpOnly cookies only.
  // TODO: Route future protected requests through BFF to integrate with Spring Boot APIs.

  return Response.json(
    { message: "Authorization callback received. Token exchange pending integration." },
    { status: 501 },
  );
}
