type LandingSectionProps = {
  id: "hero" | "features" | "documentation" | "pricing";
  title: string;
  description: string;
};

export function LandingSection({ id, title, description }: LandingSectionProps) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-slate-200 bg-white px-6 py-16">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-6xl flex-col justify-center gap-4">
        <h2 className="text-3xl font-semibold text-slate-900 md:text-4xl">{title}</h2>
        <p className="max-w-3xl text-base leading-7 text-slate-600 md:text-lg">{description}</p>
      </div>
    </section>
  );
}
