import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getEnvConfig } from "@/app/lib/bff/env";
import type { IdentityMeResponse } from "@/app/types/auth";

export const dynamic = "force-dynamic";

async function getIdentityFromBff(): Promise<IdentityMeResponse> {
  const env = getEnvConfig();
  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? "";

  // We forward only incoming cookies so /api/bff/me can resolve BFF session on the server.
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

export default async function DashboardPage() {
  const profile = await getIdentityFromBff();

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 md:grid-cols-[240px_1fr]">
        <aside className="border-b border-slate-200 bg-white p-6 md:border-b-0 md:border-r">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">SOTIUM</h1>
          <p className="mt-2 text-sm text-slate-600">Future menu</p>

          <nav className="mt-8">
            {/* This button triggers local BFF logout and then Keycloak RP logout redirect. */}
            <a
              href="/api/auth/logout"
              className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
            >
              Logout
            </a>
          </nav>
        </aside>

        <section className="p-6 sm:p-8">
          <header>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
            <p className="mt-2 text-sm text-slate-600">
              Data below comes from backend endpoint <code>/api/identity/me</code> through BFF route <code>/api/bff/me</code>.
            </p>
          </header>

          <article className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
{JSON.stringify(profile, null, 2)}
            </pre>
          </article>
        </section>
      </div>
    </main>
  );
}
