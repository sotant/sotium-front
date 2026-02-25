import { Navbar } from "./components/navbar";

export default function HomePage() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <Navbar />

      <main className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pb-20 pt-40 sm:px-6 lg:px-8">
        <section
          id="inicio"
          className="flex min-h-[70vh] w-full flex-col items-center justify-center gap-6 text-center"
        >
          <p className="rounded-full border border-slate-300 bg-white px-4 py-1 text-sm font-medium text-slate-700">
            SaaS para gestión de academias
          </p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Gestiona cursos, estudiantes y operaciones de tu academia en un solo lugar
          </h1>
          <p className="max-w-2xl text-base text-slate-600 sm:text-lg">
            Placeholder copy para presentar una propuesta clara, escalable y moderna enfocada en
            academias de cualquier tamaño.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#precio"
              className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
            >
              Ver precios
            </a>
            <a
              href="#caracteristicas"
              className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              Explorar características
            </a>
          </div>
        </section>

        <section id="caracteristicas" className="w-full scroll-mt-28 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Características</h2>
            <p className="mt-4 text-slate-600">
              Bloques funcionales para matrícula, asistencia, facturación y seguimiento académico.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Panel operativo centralizado",
              "Automatización de tareas recurrentes",
              "Reportes académicos en tiempo real",
              "Gestión de pagos y vencimientos",
              "Control de docentes y horarios",
              "Comunicación unificada con alumnos",
            ].map((feature) => (
              <article key={feature} className="rounded-2xl border border-slate-200 bg-white p-5 text-left">
                <h3 className="text-base font-semibold">{feature}</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Texto de ejemplo para describir el valor de esta capacidad dentro de la
                  plataforma.
                </p>
              </article>
            ))}
          </div>
        </section>

        <section id="precio" className="w-full scroll-mt-28 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">Precio</h2>
            <p className="mt-4 text-slate-600">
              Plan único de referencia para mostrar la sección comercial de la landing.
            </p>
          </div>
          <article className="mx-auto mt-10 max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-medium text-slate-500">Plan Pro</p>
            <p className="mt-4 text-5xl font-bold tracking-tight">$99</p>
            <p className="mt-2 text-sm text-slate-500">por sede / mes</p>
            <ul className="mt-8 space-y-3 text-left text-sm text-slate-600">
              <li>• Hasta 5 usuarios administrativos</li>
              <li>• Gestión de estudiantes ilimitados</li>
              <li>• Soporte estándar por correo</li>
              <li>• Reportes y paneles básicos</li>
            </ul>
            <a
              href="/api/auth/login"
              className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
            >
              Empezar ahora
            </a>
          </article>
        </section>

        <section id="faq" className="w-full scroll-mt-28 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight">FAQ</h2>
            <p className="mt-4 text-slate-600">
              Respuestas breves para preguntas frecuentes de una implementación inicial.
            </p>
          </div>
          <div className="mx-auto mt-10 flex w-full max-w-3xl flex-col gap-4">
            {[
              {
                question: "¿Se integra con sistemas externos?",
                answer:
                  "Sí. La arquitectura usa un BFF para conectar de forma segura con servicios externos en futuras iteraciones.",
              },
              {
                question: "¿Cómo funciona el acceso de usuarios?",
                answer:
                  "El acceso se delega a un proveedor de identidad externo mediante el endpoint de autenticación del BFF.",
              },
              {
                question: "¿Qué tan rápido se puede escalar?",
                answer:
                  "La base está pensada para crecer por módulos, con separación clara entre UI, dominio y APIs internas.",
              },
            ].map((item) => (
              <article key={item.question} className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-base font-semibold">{item.question}</h3>
                <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
