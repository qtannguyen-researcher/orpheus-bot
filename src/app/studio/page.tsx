import { FixturePreview } from "@/components/score/fixture-preview";
import { SiteFooter } from "@/components/brand/site-footer";
import { SiteHeader } from "@/components/brand/site-header";
import { UploadDropzone } from "@/components/studio/upload-dropzone";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const metadata = {
  title: "Studio",
};

export default function StudioPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex min-h-full flex-col bg-paper text-ink">
      <SiteHeader tone="paper" />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10 md:px-10">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Studio · M0</p>
          <h1 className="mt-2 font-serif text-4xl tracking-tight">An empty stand</h1>
          <p className="mt-3 max-w-2xl text-ink-soft">
            Foundation is in place: brand, Score IR, format rules, and the job state machine.
            Capture (M1) will persist the file. Hear (M2) will write notes.
          </p>
        </div>

        {!configured ? (
          <p className="border border-gold/50 bg-gold/10 px-4 py-3 text-sm text-ink-soft">
            Supabase is not configured in this environment. The studio shell still runs. Auth,
            storage, and RLS wait on `.env.local` and `supabase/migrations/0001_init.sql`.
          </p>
        ) : null}

        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <section>
            <h2 className="font-serif text-2xl">Library</h2>
            <div className="mt-4 rounded-sm border border-dashed border-rule px-5 py-10 text-sm text-muted">
              No transcriptions yet. After M1, each upload becomes a row with a status pill:
              uploaded, queued, analyzing, transcribing, notating, ready, or failed.
            </div>
          </section>
          <section className="flex flex-col gap-6">
            <UploadDropzone />
            <FixturePreview />
          </section>
        </div>
      </main>
      <SiteFooter tone="paper" />
    </div>
  );
}
