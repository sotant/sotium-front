import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LandingNavbar } from "./components/landing-navbar";
import { hasSessionCookie } from "@/app/lib/bff/session";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const cookieStore = await cookies();
  const authenticated = hasSessionCookie(cookieStore);

  // If user already has a valid BFF session cookie, we take them directly to the protected area.
  if (authenticated) {
    redirect("/dashboard");
  }

  const query = await searchParams;
  const errorMessage =
    query.error === "auth_failed"
      ? "Authentication failed. Please try again."
      : query.error === "session_expired"
        ? "Your session expired. Please login again."
        : null;

  return (
    <>
      <LandingNavbar isAuthenticated={false} />
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-24 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        {errorMessage ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{errorMessage}</section>
        ) : null}

        <section id="home" className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-sky-700">SaaS for academies</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Manage your academy with a secure and scalable platform
          </h1>
          <p className="mt-6 max-w-2xl text-base text-slate-600 sm:text-lg">
            Centralize enrollments, courses, payments and communication in one modern product built for operational teams.
          </p>
        </section>

        <section id="features" className="space-y-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Características</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Student management</h3>
              <p className="mt-2 text-sm text-slate-600">Keep profiles, attendance and progress in one operational view.</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Payments workflow</h3>
              <p className="mt-2 text-sm text-slate-600">Track recurring fees and due dates with simple controls.</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-semibold text-slate-900">Operational analytics</h3>
              <p className="mt-2 text-sm text-slate-600">Use clear indicators to monitor occupancy and retention.</p>
            </article>
          </div>
        </section>

        <section id="pricing" className="space-y-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Precio</h2>
          <p className="mx-auto max-w-2xl text-slate-600">One base plan for launch, with room to scale as your academy grows.</p>
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-slate-500">Base plan</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              49€<span className="text-base font-medium text-slate-500"> / month</span>
            </p>
            <p className="mt-4 text-sm text-slate-600">Includes academic management, reports and standard support.</p>
          </div>
        </section>

        <section id="faq" className="space-y-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">FAQ</h2>
          <div className="space-y-4 text-left">
            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-slate-900">Do I need to install anything?</h3>
              <p className="mt-2 text-sm text-slate-600">No. Everything runs in the cloud and your team only needs a browser.</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-slate-900">Can I migrate existing data?</h3>
              <p className="mt-2 text-sm text-slate-600">Yes. The onboarding flow includes guided import support.</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-slate-900">Is authentication secure?</h3>
              <p className="mt-2 text-sm text-slate-600">Yes. Tokens are handled only in the BFF and never exposed to browser JavaScript.</p>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
