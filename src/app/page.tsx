import Link from "next/link";
import { SiteFooter } from "@/components/brand/site-footer";
import { SiteHeader } from "@/components/brand/site-header";
import {
  inputFormats,
  outputFormats,
  pipelineStages,
} from "@/lib/product/roadmap";

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main>
        <section className="px-6 pb-20 pt-16 md:px-10 md:pt-24">
          <div className="staff-mark" aria-hidden="true" />
          <p className="mt-6 text-xs uppercase tracking-[0.28em] text-gold-bright">Audio in · sheet out</p>
          <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[1.05] tracking-tight text-paper md:text-7xl">
            What the ear holds, the staff remembers.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-paper/75">
            Orpheus reads a sound file and writes notation. Drop mp3, aac, m4a, ogg, flac, alac, wav,
            or aiff. Take home a PDF, Markdown, MusicXML, or MIDI.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/studio" className="bg-gold px-5 py-3 text-sm text-ink hover:bg-gold-bright">
              Open the studio
            </Link>
            <Link
              href="/roadmap"
              className="border border-white/20 px-5 py-3 text-sm text-paper hover:border-gold"
            >
              Read the development plan
            </Link>
          </div>
        </section>

        <section className="grid gap-px border-y border-white/10 bg-white/5 md:grid-cols-4">
          {pipelineStages.map((stage, index) => (
            <article key={stage.id} className="bg-ink px-6 py-8 md:px-8">
              <p className="font-mono text-xs text-gold">0{index + 1}</p>
              <h2 className="mt-3 font-serif text-2xl">{stage.name}</h2>
              <p className="mt-2 text-sm leading-6 text-paper/65">{stage.copy}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-10 px-6 py-16 md:grid-cols-2 md:px-10">
          <div>
            <h2 className="font-serif text-3xl">Recordings Orpheus will hear</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {inputFormats.map((format) => (
                <span key={format.ext} className="border border-white/15 px-3 py-1 font-mono text-sm">
                  .{format.ext}
                </span>
              ))}
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-paper/60">
              `.acc` is accepted as an AAC alias. `.m4a` may be AAC or ALAC; the decoder sniffs the
              codec, not only the extension.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-3xl">Sheets it will write</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {outputFormats.map((format) => (
                <span key={format.ext} className="border border-gold/40 px-3 py-1 font-mono text-sm text-gold-bright">
                  .{format.ext}
                </span>
              ))}
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-paper/60">
              Score IR is the editable source. MusicXML is interchange. PDF and Markdown are what you
              take to a stand. MIDI is for a DAW.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
