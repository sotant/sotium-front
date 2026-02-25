const navigationItems = [
  { href: "#inicio", label: "Inicio" },
  { href: "#caracteristicas", label: "Características" },
  { href: "#precio", label: "Precio" },
  { href: "#faq", label: "FAQ" },
] as const;

export function Navbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#inicio" className="text-lg font-semibold tracking-tight text-slate-900">
          Sotium Academy
        </a>

        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="/api/auth/login"
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
          ACCESO
        </a>
      </div>
      <nav aria-label="Mobile navigation" className="border-t border-slate-200/70 px-4 py-3 md:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-4">
          {navigationItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
