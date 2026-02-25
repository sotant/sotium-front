import Link from "next/link";
import { redirect } from "next/navigation";

import { getBffMe } from "@/lib/bff";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const me = await getBffMe();

  if (!me) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 px-6 py-12">
      <h1 className="text-3xl font-semibold">/me</h1>
      <p className="text-sm text-zinc-600">Data from BFF endpoint /api/bff/me.</p>
      <pre className="overflow-x-auto rounded border border-zinc-200 bg-zinc-50 p-4 text-sm">{JSON.stringify(me, null, 2)}</pre>
      <div className="flex gap-3">
        <a href="/api/auth/logout" className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Logout
        </a>
        <Link href="/" className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium">
          Back home
        </Link>
      </div>
    </main>
  );
}
