import { logoutAction } from "@/app/actions/auth/logout";

const dashboardMenuItems = ["Users", "Classes", "Documentation", "Calendar"] as const;

export function DashboardNavbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <nav aria-label="Dashboard sections">
          <ul className="flex items-center gap-6 text-sm font-medium text-slate-700">
            {dashboardMenuItems.map((item) => (
              <li key={item}>
                <span className="cursor-default">{item}</span>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout uses POST semantics through a server form action because it
            changes auth state and should not rely on client-side JavaScript. */}
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}
