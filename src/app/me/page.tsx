import { redirect } from "next/navigation";

import { getBffMe } from "@/lib/bff";

export const dynamic = "force-dynamic";

export default async function MePage() {
  // This page is protected by asking BFF identity endpoint before rendering content.
  const meResult = await getBffMe();

  if (meResult.status !== "authenticated") {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-8">
      <h1 className="text-3xl font-semibold">/me</h1>
      <p className="text-zinc-600">
        Data below comes from backend <code>/api/identity/me</code> through the BFF.
      </p>

      <pre className="overflow-x-auto rounded-md bg-zinc-900 p-4 text-sm text-zinc-100">
        {JSON.stringify(meResult.payload, null, 2)}
      </pre>

      <a
        href="/api/auth/logout"
        className="w-fit rounded-md border border-zinc-300 px-4 py-2 text-zinc-900 transition hover:bg-zinc-100"
      >
        Logout
      </a>
    </main>
  );
}
