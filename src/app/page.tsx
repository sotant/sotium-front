import { LandingNavbar } from "./components/landing-navbar";

export default function HomePage() {
  return (
    <>
      <LandingNavbar />
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-24 px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <section id="home" className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-sky-700">
            SaaS para academias
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Gestiona tu academia con una plataforma moderna, segura y escalable
          </h1>
          <p className="mt-6 max-w-2xl text-base text-slate-600 sm:text-lg">
            Centraliza matrículas, cursos, pagos y comunicación en una sola experiencia diseñada para crecer con tu equipo.
          </p>
        </section>

        <section id="features" className="space-y-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Características</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Gestión de alumnos</h3>
              <p className="mt-2 text-sm text-slate-600">
                Administra expedientes, asistencia y progresos con flujos simples para equipos académicos.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Automatización de pagos</h3>
              <p className="mt-2 text-sm text-slate-600">
                Controla cuotas y vencimientos con paneles claros para administración y dirección.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-6 text-left shadow-sm sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-semibold text-slate-900">Analítica operativa</h3>
              <p className="mt-2 text-sm text-slate-600">
                Visualiza métricas clave de matrículas, retención y ocupación para mejorar decisiones.
              </p>
            </article>
          </div>
        </section>

        <section id="pricing" className="space-y-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Precio</h2>
          <p className="mx-auto max-w-2xl text-slate-600">
            Plan único con funcionalidades core para comenzar rápido. Escala con add-ons cuando tu academia lo necesite.
          </p>
          <div className="mx-auto max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-slate-500">Plan Base</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              49€<span className="text-base font-medium text-slate-500"> / mes</span>
            </p>
            <p className="mt-4 text-sm text-slate-600">Incluye gestión académica, reportes y soporte estándar.</p>
          </div>
        </section>

        <section id="faq" className="space-y-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">FAQ</h2>
          <div className="space-y-4 text-left">
            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-slate-900">¿Necesito instalar algo?</h3>
              <p className="mt-2 text-sm text-slate-600">
                No. Todo funciona en la nube y tu equipo puede acceder desde navegador.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-slate-900">¿Puedo migrar datos desde otra herramienta?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Sí, la plataforma está preparada para procesos de importación guiados durante el onboarding.
              </p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-base font-semibold text-slate-900">¿El acceso es seguro?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Sí. El flujo de autenticación se integra mediante Keycloak a través del BFF para aislar credenciales del frontend.
              </p>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}
