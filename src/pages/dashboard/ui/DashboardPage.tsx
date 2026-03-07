import { IdentitySummary } from "@/features/identity/viewer/ui/IdentitySummary";
import type { Identity } from "@/entities/identity/model/identity";
import { getRegistrationFeedback } from "@/pages/dashboard/model/getRegistrationFeedback";
import { RegistrationFeedback } from "@/widgets/dashboard/registration-feedback/ui/RegistrationFeedback";
import { DashboardNavbar } from "@/widgets/navigation/dashboard-navbar/ui/DashboardNavbar";

type DashboardPageProps = {
  searchParams: {
    registrationStatus?: string;
    registrationAction?: string;
    academyId?: string;
  };
  identity: Identity;
};

export function DashboardPage({ searchParams, identity }: DashboardPageProps) {
  const registrationFeedback = getRegistrationFeedback(searchParams);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNavbar />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        {registrationFeedback ? <RegistrationFeedback feedback={registrationFeedback} /> : null}

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">Authenticated identity from BFF endpoint.</p>
          <IdentitySummary identity={identity} />
        </section>
      </main>
    </div>
  );
}
