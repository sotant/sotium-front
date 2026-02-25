import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getEnvConfig } from "@/app/lib/bff/env";
import type { IdentityMeResponse } from "@/app/types/auth";

async function getIdentityFromBff(): Promise<IdentityMeResponse> {
  const env = getEnvConfig();
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";

  // We forward only the incoming cookies so /api/bff/me can resolve the BFF session server-side.
  const response = await fetch(`${env.appBaseUrl}/api/bff/me`, {
    method: "GET",
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
    redirect: "manual",
  });

  if (response.status === 401) {
    redirect("/");
  }

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get("location");
    redirect(location ?? "/");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch /api/bff/me");
  }

  return (await response.json()) as IdentityMeResponse;
}

export default async function MePage() {
  const profile = await getIdentityFromBff();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My identity</h1>
        <a
          href="/api/auth/logout"
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
          Logout
        </a>
      </header>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Response from backend `/api/identity/me` via BFF</h2>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
{JSON.stringify(profile, null, 2)}
        </pre>
      </section>

      <Link href="/" className="text-sm font-medium text-sky-700 hover:text-sky-600">
        ← Back to home
      </Link>
    </main>
  );
}
