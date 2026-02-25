import Link from "next/link";

import { getBffMe } from "@/lib/bff";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // We ask our own BFF if the user has a valid server-side session.
  const meResult = await getBffMe();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-3xl font-semibold">Sotium BFF Authentication Demo</h1>

      {meResult.status === "authenticated" ? (
        <>
          <p className="text-zinc-600">
            Session detected for <strong>{meResult.payload.email}</strong>.
          </p>
          <Link
            href="/me"
            className="rounded-md bg-black px-4 py-2 text-white transition hover:bg-zinc-800"
          >
            Go to /me
          </Link>
        </>
      ) : (
        <>
          <p className="text-zinc-600">No active session. Start login using Keycloak.</p>
          <a
            href="/api/auth/login"
            className="rounded-md bg-black px-4 py-2 text-white transition hover:bg-zinc-800"
          >
            Login
          </a>
        </>
      )}

      {meResult.status === "error" ? (
        <p className="text-sm text-red-600">{meResult.message}</p>
      ) : null}
    </main>
  );
}
