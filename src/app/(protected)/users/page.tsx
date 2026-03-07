import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getUsers } from "@/entities/user/api/get-users";
import { UsersPage } from "@/pages/users/ui/UsersPage";
import { getInternalBaseUrl } from "@/shared/config/internal-base-url";

export const dynamic = "force-dynamic";

export default async function UsersRoute() {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get("cookie") ?? "";

  const users = await getUsers({
    baseUrl: getInternalBaseUrl(),
    cookieHeader,
  }).catch(() => {
    redirect("/");
  });

  return <UsersPage users={users} />;
}
