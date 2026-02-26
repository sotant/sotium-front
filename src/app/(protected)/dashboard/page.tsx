import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardNavbar } from "@/app/components/dashboard/DashboardNavbar";
import { getInternalBaseUrl } from "@/app/lib/http/baseUrl";
import type { IdentityMeDto } from "@/app/types/identity";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Keep the dashboard as SSR so authentication and user data fetching happen
  // on the server, avoiding client-side token handling and race conditions.
  const baseUrl = getInternalBaseUrl();

  // The UI calls only internal BFF endpoints. External backend calls remain
  // encapsulated in route handlers where bearer tokens are managed securely.
  const requestHeaders = await headers();

  // Forward the original cookie header only to a trusted internal origin.
  // The base URL comes from server config (or local loopback in dev), avoiding
  // Host-header derived origins that could leak session cookies.
  const response = await fetch(`${baseUrl}/api/bff/me`, {
    cache: "no-store",
    headers: {
      cookie: requestHeaders.get("cookie") ?? "",
    },
  });

  if (response.status === 401) {
    redirect("/");
  }

  if (!response.ok) {
    throw new Error("Failed to load dashboard identity data.");
  }

  const identity = (await response.json()) as IdentityMeDto;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNavbar />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Authenticated identity from BFF endpoint.</p>

          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subject</dt>
              <dd className="mt-1 text-sm text-slate-900">{identity.sub}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</dt>
              <dd className="mt-1 text-sm text-slate-900">{identity.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Academy ID</dt>
              <dd className="mt-1 text-sm text-slate-900">{identity.academyId ?? "N/A"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Authorities</dt>
              <dd className="mt-1 text-sm text-slate-900">{identity.authorities.join(", ")}</dd>
            </div>
          </dl>
        </section>
      </main>
    </div>
  );
}
