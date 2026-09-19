import { cMajorScale } from "@/lib/score/fixtures/c-major-scale";

function pitchLabel(note: (typeof cMajorScale.parts)[0]["measures"][0]["notes"][0]) {
  if (!note.pitch) return "rest";
  const accidental = note.pitch.alter === 1 ? "#" : note.pitch.alter === -1 ? "b" : "";
  return `${note.pitch.step}${accidental}${note.pitch.octave}`;
}

export function FixturePreview() {
  const part = cMajorScale.parts[0];

  return (
    <section className="rounded-sm border border-rule bg-paper px-5 py-4 text-ink">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-xl">{cMajorScale.meta.title}</h2>
        <p className="font-mono text-xs text-muted">
          {cMajorScale.meta.key} · {cMajorScale.meta.time} · {cMajorScale.meta.tempoBpm} bpm
        </p>
      </div>
      <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
        Score IR fixture · {part.clef} · {part.name}
      </p>
      <ol className="mt-4 grid gap-2 font-mono text-sm">
        {part.measures.map((measure) => (
          <li key={measure.number} className="flex flex-wrap items-center gap-2">
            <span className="w-14 text-muted">bar {measure.number}</span>
            {measure.notes.map((note, index) => (
              <span
                key={`${measure.number}-${index}`}
                className="rounded-sm bg-paper-deep px-2 py-1 text-ink-soft"
              >
                {pitchLabel(note)}
              </span>
            ))}
          </li>
        ))}
      </ol>
    </section>
  );
}
