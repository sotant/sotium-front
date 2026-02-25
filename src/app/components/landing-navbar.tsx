type NavItem = {
  href: `#${string}`;
  label: string;
};

const navItems: readonly NavItem[] = [
  { href: "#home", label: "Inicio" },
  { href: "#features", label: "Características" },
  { href: "#pricing", label: "Precio" },
  { href: "#faq", label: "FAQ" },
] as const;

export function LandingNavbar() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <a href="#home" className="text-lg font-semibold tracking-tight text-slate-900">
          SOTIUM ACADEMY
        </a>

        <nav aria-label="Primary" className="order-3 flex w-full items-center justify-center gap-4 md:order-2 md:w-auto">
          {navItems.map((item) => (
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
          className="order-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700 md:order-3"
        >
          ACCESO
        </a>
      </div>
    </header>
  );
}
