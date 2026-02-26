import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingSection } from "@/components/landing/LandingSection";

const sections = [
  {
    id: "hero",
    title: "Build your operations in one place",
    description:
      "Sotium centralizes your workflows, team collaboration, and delivery visibility so your organization can move faster with confidence.",
  },
  {
    id: "features",
    title: "Features designed for growing SaaS teams",
    description:
      "Track work in real time, automate repetitive tasks, and provide clear ownership across product, engineering, and customer operations.",
  },
  {
    id: "documentation",
    title: "Documentation that stays close to delivery",
    description:
      "Keep technical notes, onboarding guides, and product decisions connected to every release with a clean and structured knowledge space.",
  },
  {
    id: "pricing",
    title: "Simple pricing for every stage",
    description:
      "Start with essential collaboration capabilities and scale your plan as your team and customer base grow over time.",
  },
] as const;

export default function Home() {
  return (
    <div className="bg-slate-50 text-slate-900">
      <LandingNavbar />

      <main>
        {sections.map((section) => (
          <LandingSection
            key={section.id}
            id={section.id}
            title={section.title}
            description={section.description}
          />
        ))}
      </main>
    </div>
  );
}
