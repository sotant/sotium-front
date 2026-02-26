import { headers } from "next/headers";

export async function getBaseUrl(): Promise<string> {
  const headerStore = await headers();

  // Server Components require an absolute URL when calling internal route
  // handlers because there is no browser origin context available on the server.
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const host = headerStore.get("host");

  if (!host) {
    throw new Error("Missing host header.");
  }

  const protocol = forwardedProto ?? "http";
  return `${protocol}://${host}`;
}
