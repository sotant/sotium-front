"use server";

import { redirect } from "next/navigation";

export async function logoutAction(): Promise<void> {
  // Use a Server Action with a form submit to keep logout orchestration on the
  // server and avoid adding client-side handlers for a security-sensitive flow.
  redirect("/api/auth/logout");
}
