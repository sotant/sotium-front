import type { Identity } from "@/entities/identity/model/identity";

type IdentitySummaryProps = {
  identity: Identity;
};

export function IdentitySummary({ identity }: IdentitySummaryProps) {
  return (
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
  );
}
