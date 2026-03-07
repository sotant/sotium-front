const navItems = [
  { label: "Hero", href: "#hero" },
  { label: "Features", href: "#features" },
  { label: "Documentation", href: "#documentation" },
  { label: "Pricing", href: "#pricing" },
] as const;

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <a href="#hero" className="text-lg font-semibold text-slate-900">
          Sotium
        </a>

        <nav aria-label="Landing sections">
          <ul className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            {navItems.map((item) => (
              <li key={item.href}>
                <a className="transition-colors hover:text-slate-950" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="/api/auth/login"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            LOGIN
          </a>
          <a
            href="/api/auth/registrations"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            REGISTER
          </a>
        </div>
      </div>
    </header>
  );
}
