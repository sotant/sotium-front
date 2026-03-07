import Link from "next/link";

const dashboardMenuItems = [
  { label: "Users", href: "/users" },
  { label: "Classes" },
  { label: "Documentation" },
  { label: "Calendar" },
] as const;

export function DashboardNavbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <nav aria-label="Dashboard sections">
          <ul className="flex items-center gap-6 text-sm font-medium text-slate-700">
            {dashboardMenuItems.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link className="hover:text-slate-900" href={item.href}>
                    {item.label}
                  </Link>
                ) : (
                  <span className="cursor-default">{item.label}</span>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <form method="post" action="/api/auth/logout">
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
