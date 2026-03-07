export async function callJavaBackend(path: string, params: {
  accessToken: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
}): Promise<Response> {
  const backendBaseUrl = process.env.BACKEND_BASE_URL;

  if (!backendBaseUrl) {
    throw new Error("BACKEND_BASE_URL is not configured.");
  }

  const headers = new Headers({
    Authorization: `Bearer ${params.accessToken}`,
  });

  if (params.body !== undefined) {
    headers.set("content-type", "application/json");
  }

  return fetch(`${backendBaseUrl}${path}`, {
    method: params.method ?? "GET",
    headers,
    body: params.body !== undefined ? JSON.stringify(params.body) : undefined,
    cache: "no-store",
  });
}
