import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function MeRedirectPage() {
  // Backward compatibility route: authenticated area moved to /dashboard.
  redirect("/dashboard");
}
