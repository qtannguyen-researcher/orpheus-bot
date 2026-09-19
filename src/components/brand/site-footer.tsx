import { CURRENT_PHASE, PLANNED_WEEKS_TO_GA } from "@/lib/product/roadmap";

export function SiteFooter({ tone = "ink" }: { tone?: "ink" | "paper" }) {
  const onPaper = tone === "paper";

  return (
    <footer
      className={`mt-auto border-t px-6 py-6 text-xs md:px-10 ${
        onPaper ? "border-rule/70 bg-paper text-muted" : "border-white/10 bg-ink text-paper/50"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>Orpheus writes scores from recordings. Private by default.</p>
        <p>
          {CURRENT_PHASE} · {PLANNED_WEEKS_TO_GA} weeks planned to GA · Next.js on Vercel · Supabase
        </p>
      </div>
    </footer>
  );
}
