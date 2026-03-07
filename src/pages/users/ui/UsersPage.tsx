import type { User } from "@/entities/user/model/user";
import { DashboardNavbar } from "@/widgets/navigation/dashboard-navbar/ui/DashboardNavbar";

type UsersPageProps = {
  users: User[];
};

export function UsersPage({ users }: UsersPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNavbar />

      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
          <p className="mt-2 text-sm text-slate-600">Users linked to the configured academy.</p>

          <ul className="mt-6 divide-y divide-slate-200">
            {users.map((user) => (
              <li key={user.id} className="py-4">
                <p className="text-sm font-semibold text-slate-900">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-slate-600">{user.email}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
