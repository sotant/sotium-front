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

        {/* Submit logout as a native browser POST to avoid action/fetch redirect
            chains that can make cross-origin cookie clearing less reliable. */}
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
