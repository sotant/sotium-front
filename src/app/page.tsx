import Link from "next/link";

import { getBffMe } from "@/lib/bff";

export const dynamic = "force-dynamic";

type HomePageProps = Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>;

function normalizeError(errorValue: string | string[] | undefined): string | null {
  if (!errorValue) {
    return null;
  }

  return Array.isArray(errorValue) ? errorValue[0] ?? null : errorValue;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const [me, params] = await Promise.all([getBffMe(), searchParams]);
  const error = normalizeError(params.error);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-12 text-black">
      <h1 className="text-3xl font-semibold">Sotium BFF Auth MVP</h1>

      {error ? (
        <p className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">Authentication error: {error}</p>
      ) : null}

      {me ? (
        <section className="space-y-4 rounded border border-zinc-200 p-5">
          <p className="text-sm text-zinc-600">Session detected for {me.email}.</p>
          <div className="flex gap-3">
            <Link href="/me" className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
              Go to /me
            </Link>
            <a href="/api/auth/logout" className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium">
              Logout
            </a>
          </div>
        </section>
      ) : (
        <section className="space-y-4 rounded border border-zinc-200 p-5">
          <p className="text-sm text-zinc-600">No active session.</p>
          <a href="/api/auth/login" className="inline-flex rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
            Login
          </a>
        </section>
      )}
    </main>
  );
}
