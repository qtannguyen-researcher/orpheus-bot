import { SiteFooter } from "@/components/brand/site-footer";
import { SiteHeader } from "@/components/brand/site-header";
import { CURRENT_PHASE, epics, phases, stories } from "@/lib/product/roadmap";

export const metadata = {
  title: "Roadmap",
};

export default function RoadmapPage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-6 py-14 md:px-10">
        <p className="text-xs uppercase tracking-[0.22em] text-gold-bright">Development document</p>
        <h1 className="mt-3 font-serif text-5xl tracking-tight">Seven phases. One monolith.</h1>
        <p className="mt-4 max-w-2xl text-paper/70">
          The full backlog, acceptance criteria, and architecture live in{" "}
          <code className="font-mono text-gold-bright">docs/DEVELOPMENT.md</code>. This page is the
          in-app index of that plan. Current build focus: {CURRENT_PHASE}.
        </p>

        <section className="mt-12">
          <h2 className="font-serif text-2xl">Milestones</h2>
          <div className="mt-4 overflow-x-auto border border-white/10">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead className="bg-white/5 text-paper/60">
                <tr>
                  <th className="px-4 py-3 font-normal">Phase</th>
                  <th className="px-4 py-3 font-normal">Name</th>
                  <th className="px-4 py-3 font-normal">Weeks</th>
                  <th className="px-4 py-3 font-normal">Exit</th>
                </tr>
              </thead>
              <tbody>
                {phases.map((phase) => (
                  <tr
                    key={phase.id}
                    className={`border-t border-white/10 ${phase.id === CURRENT_PHASE ? "bg-gold/10" : ""}`}
                  >
                    <td className="px-4 py-3 font-mono">
                      {phase.id} · {phase.milestone}
                    </td>
                    <td className="px-4 py-3">{phase.name}</td>
                    <td className="px-4 py-3">{phase.weeks}</td>
                    <td className="px-4 py-3 text-paper/70">{phase.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl">Epics</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {epics.map((epic) => (
              <li key={epic.id} className="border border-white/10 px-4 py-4">
                <p className="font-mono text-xs text-gold">
                  {epic.id} · {epic.phase} · {epic.points} pts
                </p>
                <h3 className="mt-1 font-serif text-xl">{epic.name}</h3>
                <p className="mt-1 text-sm text-paper/65">{epic.owns}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl">Phase 0 stories</h2>
          <ol className="mt-4 space-y-2 text-sm">
            {stories.map((story) => (
              <li key={story.id} className="flex gap-3 border-b border-white/10 py-2">
                <span className="w-20 font-mono text-gold">{story.id}</span>
                <span className="flex-1">{story.title}</span>
                <span className="text-paper/50">{story.status.replace("_", " ")}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
