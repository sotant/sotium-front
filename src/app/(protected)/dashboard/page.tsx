import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getIdentityMe } from "@/entities/identity/api/get-identity-me";
import { DashboardPage } from "@/pages/dashboard/ui/DashboardPage";
import { getInternalBaseUrl } from "@/shared/config/internal-base-url";

export const dynamic = "force-dynamic";

type DashboardRouteProps = {
  searchParams: Promise<{
    registrationStatus?: string;
    registrationAction?: string;
    academyId?: string;
  }>;
};

export default async function DashboardRoute({ searchParams }: DashboardRouteProps) {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") ?? "";

  const identity = await getIdentityMe({
    baseUrl: getInternalBaseUrl(),
    cookieHeader,
  }).catch(() => {
    redirect("/");
  });

  return <DashboardPage searchParams={await searchParams} identity={identity} />;
}
