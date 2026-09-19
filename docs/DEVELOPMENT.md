# Orpheus — Development Document

**Product:** Orpheus  
**Form:** Monolith Next.js application  
**Hosting:** Vercel  
**Backend platform:** Supabase (Auth, Postgres, Storage, Realtime)  
**Status:** Phase 0 / Milestone M0 in progress  
**Canonical backlog IDs:** `ORP-n`

This file is the working agreement for what we build, in what order, and what “done” means. The interactive view of the same plan lives beside chat as the Orpheus development-plan canvas. Implementation code must follow the architecture and milestone contracts here; if code and this document diverge, update this document in the same change.

---

## 1. Product brief

Orpheus turns a sound file into a readable music sheet.

A musician drops a recording (`*.mp3`, `*.aac` / `*.acc`, `*.ogg`, `*.flac`, `*.alac`, `*.wav`, `*.aiff`). Orpheus listens for pitch, onset, duration, tempo, and key, writes an internal score, and exports notation a human can take to a stand: **PDF**, **Markdown** (lead sheet + ABC), **MusicXML**, and later **MIDI**.

The mythic namesake could move stone with a lyre. The product promise is narrower and more useful: **what the ear holds, the staff remembers.**

### 1.1 Problem

Transcribing a recording into notation is slow, specialist work. Desktop tools are heavy. Phone apps are toy-like. Generic “AI music” products optimize for generation, not for a page a player can read.

### 1.2 Solution

A single web application:

1. Authenticate.
2. Upload an audio file to private storage.
3. Run a transcription job with visible progress.
4. Preview a staff in the browser.
5. Tweak key, time, tempo, and title.
6. Export PDF / Markdown / MusicXML / MIDI.

### 1.3 MVP (Milestone M4)

A signed-in user uploads a **monophonic** clip (one clear melody, ≤ 3 minutes, ≤ 25 MB), waits for analysis, sees a staff that roughly matches the melody, and downloads **PDF** and **Markdown**. Polyphonic music, click-edit on the staff, and hosted GPU models are **M5**, not MVP.

### 1.4 Non-goals (through M4)

- Full DAW or multi-track mixer
- Stem separation as a product feature
- Real-time microphone-to-score (research spike only)
- Generating new music from a prompt
- Automatic lyric alignment
- Desktop installers or a separate Python service as a required runtime
- Public marketplace of scores

### 1.5 Naming note

The request listed `*.acc`. The audio codec is **AAC**. Orpheus accepts `.aac`, `.m4a` (AAC or ALAC container), and treats `.acc` as an alias so mislabeled files are not rejected without a clear message. ALAC may arrive as `.alac`, `.caf`, or `.m4a`.

---

## 2. Personas and jobs-to-be-done

| ID | Persona | Job | Success looks like |
| --- | --- | --- | --- |
| P-STU | Student | Learn a melody from a recording | A one-page PDF they can mark up tonight |
| P-WRT | Writer / songwriter | Capture a hummed or guitar idea | A lead-sheet Markdown + MusicXML into their notation app |
| P-TCH | Teacher | Produce a simple excerpt for a lesson | Clean treble-clef sheet, correct key, printable |
| P-HOB | Hobby transcriber | Batch personal recordings | Library of jobs with retry and export history |

Primary path for v1 is **P-WRT** and **P-STU**. Teachers and batch workflows ride the same objects.

---

## 3. Experience principles

1. **The score is the product.** The studio should feel like a stand-light and a page, not a chatbot.
2. **Progress is visible.** Transcription is slow. Status is a first-class UI, not a spinner.
3. **Honest uncertainty.** Low-confidence notes are marked. We do not pretend polyphonic piano is solved in M2.
4. **Export is not an afterthought.** If it will not print, it is not ready.
5. **Private by default.** Audio and sheets are owner-only until a user creates a link.
6. **One deployable.** All product code ships as this Next.js app on Vercel.

---

## 4. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Vercel (Next.js monolith)               │
│  App Router pages · Server Actions · Middleware · Routes    │
└────────────┬─────────────────────────────┬──────────────────┘
             │                             │
             ▼                             ▼
   ┌──────────────────┐          ┌─────────────────────┐
   │ Browser studio   │          │ Supabase            │
   │ decode / analyze │          │ Auth                │
   │ OSMD preview     │          │ Postgres + RLS      │
   │ client exports   │          │ Storage (audio, out)│
   └──────────────────┘          │ Realtime (job bus)  │
                                 └─────────────────────┘
```

### 4.1 Why this split

Automatic music transcription is slower than a typical Vercel serverless timeout (10s hobby, 60s Pro). A naive “upload → API route → model → PDF” will fail in production. v1 therefore:

| Concern | Owner |
| --- | --- |
| Auth, tenancy, signed URLs, metadata, job state | Next.js + Supabase |
| Decode, pitch, onset, tempo, key, quantization | Browser (Web Audio + WASM / TF.js) |
| Preview and PDF/Markdown print | Browser |
| Durable files and history | Supabase Storage + Postgres |
| Optional hosted model | Phase 5 only (Replicate or similar), behind a flag |

The application remains a **monolith**: one repo, one Vercel project, no required sidecar. The browser is a compute tier, not a second service.

### 4.2 Canonical artifacts

| Artifact | Role | Store |
| --- | --- | --- |
| Original audio | Source of truth for the recording | `audio` bucket |
| Job row | Status, errors, durations | `transcriptions` |
| Score IR JSON | Product source of truth for notation | `score_revisions.ir` |
| MusicXML | Interchange with MuseScore, Dorico, OSMD | `score_revisions.musicxml` + export |
| PDF / MD / MIDI | Derived products | `exports` bucket + `exports` table |

Never treat a PDF as editable source. Edits write a new `score_revisions` row.

### 4.3 Job state machine

```
uploaded → queued → analyzing → transcribing → notating → ready
                 ↘           ↘             ↘           ↘ failed
failed → queued   (retry, max 3)
ready → notating  (user edit / re-export IR)
any non-terminal → canceled
```

Illegal transitions throw. UI only offers actions valid for the current state.

---

## 5. Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js App Router, TypeScript | This repo |
| UI | Tailwind CSS v4, React 19 | Brand tokens in `globals.css` |
| Hosting | Vercel | Preview deploys per branch |
| Auth / DB / files | Supabase | RLS on every user table |
| Validation | zod | Score IR, env, upload metadata |
| Sheet render (P3) | OpenSheetMusicDisplay or equivalent | MusicXML in, SVG out |
| Playback (P3) | Tone.js | Cursor follows note events |
| Pitch (P2) | Basic Pitch (TF.js / WASM) or equivalent | Monophonic first |
| Tests | Node test runner + Playwright later | Golden audio in `fixtures/` |

Python, LilyPond, and ffmpeg-as-a-server-binary are **out** of the Vercel runtime. Decode uses Web Audio / WASM.

---

## 6. Data model

See `supabase/migrations/0001_init.sql` for the executable schema. Logical model:

**profiles** — 1:1 with `auth.users`. Display name only.

**transcriptions** — one row per uploaded recording.

- `status` — state machine enum
- `source_filename`, `source_format`, `byte_size`, `duration_ms`, `sample_rate`, `channels`
- `storage_path` — original audio
- `error_code`, `error_message`
- `attempt_count`

**score_revisions** — immutable snapshots.

- `ir jsonb` — Score IR v1
- `musicxml text`
- `key_signature`, `time_signature`, `tempo_bpm`
- `engine` + `engine_version`

**exports** — derived files.

- `format` in `pdf | md | musicxml | midi`
- `storage_path`, `byte_size`

**usage_events** — later metering (P6). Do not invent billing in M0–M4.

Row Level Security: a user selects / inserts / updates / deletes only rows where `owner_id = auth.uid()`. Storage paths are prefixed `/{user_id}/`.

---

## 7. Score Intermediate Representation (v1)

Defined in `src/lib/score/ir.ts`. Invariant: if it is not in the IR, exporters must not invent it.

```
ScoreIR
  version: 1
  meta: title, composer?, key, time, tempoBpm, pickupBeats?
  parts[]
    id, name, clef, instrument?
    measures[]
      number
      notes[]
        pitch { step, alter, octave } | null  // null = rest
        duration { divisions, type, dots? }
        onsetBeats
        voice
        confidence?  // 0..1
        tied?
        lyric?
```

Quantization default: 16th-note grid, 4/4, divisions = 4. Pickup bars are allowed. Multiple parts exist in the schema from day one; the M2 engine only writes part `melody`.

---

## 8. Transcription pipeline

```
file → validate → store → decode → resample
    → tempo → key → onsets → f0
    → segment notes → quantize → Score IR
    → MusicXML → viewer → exporters
```

| Stage | M2 quality bar |
| --- | --- |
| Validate | Reject unknown types and files over quota |
| Decode | Mono mix, fail loudly on corrupt containers |
| Tempo | ±8% vs annotated golden set |
| Key | Correct tonic/mode on 8/10 simple tonal clips |
| Notes (monophonic) | Note F1 ≥ 0.70 on the M2 golden set |
| Quantize | Stable 16th grid; no overlapping notes in one voice |

Polyphonic piano, drums, and dense mix are expected to fail honestly until M5.

---

## 9. Delivery model

Work is organized:

**Phase** → **Milestone** → **Epic** → **User story** → **Task**

A phase has one milestone. A milestone has a single demoable outcome. Stories are the unit of implementation. Tasks are the checklist inside a story. Do not start the next phase until the current milestone’s exit criteria are true on a Vercel preview.

### 9.1 Schedule (1–2 engineers)

| Phase | Milestone | Name | Weeks | Exit outcome |
| --- | --- | --- | --- | --- |
| P0 | M0 | Foundation | 1 | App live; auth; empty studio; schema applied |
| P1 | M1 | Capture | 1.5 | Upload supported audio; library row; realtime status |
| P2 | M2 | Hear | 3 | Monophonic clip → quantized note events |
| P3 | M3 | Notate | 2.5 | Interactive staff from Score IR / MusicXML |
| P4 | M4 | Publish | 2 | PDF + Markdown (+ MusicXML/MIDI); MVP complete |
| P5 | M5 | Refine | 3 | Polyphonic draft, on-staff edit, eval harness |
| P6 | M6 | Launch | 1.5 | Legal, quotas, observability, GA |

Total planned calendar: **14.5 weeks** to GA.

### 9.2 Milestone demo scripts

**M0** — Open `/`, create an account, land in `/studio`, see an empty library and the supported-format list. Schema exists in Supabase.

**M1** — Drop a 20-second WAV. Row appears as `uploaded`. Detail page shows filename, duration, and storage path. Delete removes the object.

**M2** — Drop a monophonic scale. Status walks `analyzing → transcribing → notating → ready`. Revision JSON contains notes that match the scale within the F1 bar.

**M3** — Ready job shows a staff. Play back. Change key and tempo. Refresh keeps the edit (new revision).

**M4** — Download PDF and `.md`. Open MusicXML in a notation app. Print preview is readable on letter/A4.

**M5** — Two-voice excerpt produces two voices. User corrects one pitch on the staff. Eval report is generated from fixtures.

**M6** — Production URL, privacy/terms, error tracking, rate limits, rollback documented.

---

## 10. Epic catalog

| ID | Epic | Home phase | Approx. points | Owns |
| --- | --- | --- | --- | --- |
| E1 | Platform foundation | P0 | 14 | App, Vercel, CI, tokens, env |
| E2 | Identity and tenancy | P0 | 8 | Auth, profiles, RLS, session proxy |
| E3 | Audio ingest | P1 | 13 | Formats, size, Storage, metadata |
| E4 | Job orchestration | P1–P2 | 13 | State machine, progress, retry |
| E5 | Audio analysis | P2 | 21 | Decode, tempo, key, onset, pitch |
| E6 | Score model | P3 | 13 | IR, MusicXML, revisions |
| E7 | Sheet viewer | P3 | 13 | Render, playback, cursor |
| E8 | Export and publish | P4 | 13 | PDF, MD, MusicXML, MIDI |
| E9 | Library | P1 / P4 | 8 | List, rename, delete, search |
| E10 | Quality and evaluation | P2 / P5 | 13 | Golden set, metrics, confidence |
| E11 | Observability | P6 | 5 | Logs, errors, usage |
| E12 | Launch readiness | P6 | 8 | Landing, legal, quotas, GA |

Points are relative, not hours. Use them to keep a phase from absorbing two other phases.

---

## 11. Definition of Ready and Done

### Ready (a story may start)

- Story has an `ORP-n` id, persona, and phase.
- Acceptance criteria are testable.
- No open product decision that would change the data model.
- Fixtures exist if the story touches audio or IR.

### Done (a story may close)

- Criteria checked.
- Types pass (`npm run typecheck`).
- Lint passes (`npm run lint`).
- RLS or auth implications documented if data-shaped.
- DEVELOPMENT.md updated if behavior or a milestone moved.
- Preview deploy green if the story is user-visible.

### Phase exit

- Milestone demo script can be run by someone who did not write the code.
- No `failed` jobs without an error message the user can act on.
- No secrets in git.

---

## 12. Backlog

Stories use the shape: **As a [persona], I [action], so that [outcome].**  
Tasks are implementation slices, not a second product.

---

### Phase 0 — Foundation (M0)

Goal: a branded, deployable monolith with identity and an empty studio. No transcription yet.

#### E1 Platform foundation

##### ORP-1 · Scaffold the monolith
**Story:** As a platform engineer, I can run the Next.js app locally and on Vercel so all later work has one home.  
**Acceptance:**

- App Router, TypeScript, Tailwind v4.
- `npm run dev`, `npm run lint`, `npm run typecheck` succeed.
- Package name and README describe Orpheus, not the starter template.

**Tasks:**

1. Initialize Next.js in this repository.
2. Add `typecheck` script.
3. Replace starter copy and metadata.

##### ORP-2 · Environment contract
**Story:** As an engineer, I have a documented env file so a new machine can boot against Supabase.  
**Acceptance:**

- `.env.example` lists every public and server variable.
- Missing vars produce a readable startup/action error, not a crash loop.
- No secrets committed.

**Tasks:**

1. Write `.env.example`.
2. Centralize reads in `src/lib/supabase/env.ts`.

##### ORP-5 · Brand shell
**Story:** As a visitor, I understand what Orpheus does in one screen so I decide to try the studio.  
**Acceptance:**

- `/` states the audio-in / sheet-out promise.
- Supported input and output formats are listed.
- Pipeline stages Listen / Measure / Write / Publish are visible.
- `/studio` and `/login` are reachable.

**Tasks:**

1. Design tokens (ink, paper, gold).
2. Landing, header, footer.
3. Roadmap page sourced from `src/lib/product/roadmap.ts`.

##### ORP-6 · Vercel project
**Story:** As an engineer, every push to a branch gets a preview URL.  
**Acceptance:**

- Vercel linked; required env vars marked.
- Production and preview share the same app, different Supabase projects allowed.

**Tasks:**

1. `vercel.json` if headers or regions are needed.
2. Document deploy steps in README.

##### ORP-8 · Quality gate
**Story:** As an engineer, CI-equivalent scripts fail on type and lint errors before review.  
**Acceptance:** `npm run lint` and `npm run typecheck` are the M0 gate.

**Tasks:** Wire scripts; keep the gate green on main.

##### ORP-7 · Score IR types and fixture
**Story:** As a notation engineer, I can import a typed Score IR fixture so later phases do not invent a schema under pressure.  
**Acceptance:**

- `src/lib/score/ir.ts` exports v1 types and a parser.
- A C-major scale fixture round-trips through parse.

**Tasks:**

1. Types + zod schema.
2. Fixture module.
3. Unit assertion in a small test or type-level check.

#### E2 Identity and tenancy

##### ORP-3 · Apply schema
**Story:** As a platform engineer, I can apply the initial migration so Auth users have profiles and transcription tables.  
**Acceptance:**

- Migration is idempotent in intent (versioned file).
- RLS enabled on `profiles`, `transcriptions`, `score_revisions`, `exports`.
- New auth user gets a profile row (trigger).

**Tasks:**

1. Write `supabase/migrations/0001_init.sql`.
2. Document apply steps.

##### ORP-4 · Auth session
**Story:** As a musician, I can sign in and land in the studio so my uploads will have an owner.  
**Acceptance:**

- Email/password or magic link via Supabase Auth.
- `src/proxy.ts` protects `/studio` when Supabase is configured.
- Sign out returns to `/`.
- Unauthenticated `/studio` redirects to `/login`.

**Tasks:**

1. Browser and server Supabase clients.
2. Login form.
3. `src/proxy.ts` session refresh and `/studio` redirect.

---

### Phase 1 — Capture (M1)

Goal: a trusted ingest path. Nothing is transcribed yet; the job exists.

#### E3 Audio ingest

##### ORP-10 · Dropzone
**Story:** As a songwriter, I can drop or pick a sound file so I do not hunt through menus.  
**Acceptance:** Drag-and-drop and file picker; shows filename and size before upload.

##### ORP-11 · Validation
**Story:** As a user, I get a precise rejection when the file is the wrong type or too large.  
**Acceptance:**

- Allow: `mp3`, `aac`, `acc`, `m4a`, `ogg`, `oga`, `flac`, `alac`, `wav`, `aiff`, `aif`, `caf`.
- Default cap 25 MB.
- Server repeats the check; client check is not trusted.

##### ORP-12 · Storage upload
**Story:** As a signed-in user, my file lands in a path only I can read.  
**Acceptance:** Object at `{uid}/{transcription_id}/{filename}`; RLS/storage policies deny other users.

##### ORP-14 · Media metadata
**Story:** As a user, I see duration and format on the job so I know Orpheus heard the right file.  
**Acceptance:** `duration_ms`, `channels`, `sample_rate`, `source_format` populated or a clear “unknown duration” state.

#### E4 / E9 Job + library

##### ORP-13 · Create transcription
**Story:** As a user, uploading creates a library item in `uploaded`.  
**Acceptance:** Row with `owner_id`, status, storage path; navigating away and back keeps it.

##### ORP-15 · Library list
**Story:** As a hobby transcriber, I see my recordings and their status.  
**Acceptance:** Title, format, status pill, relative time; empty state explains the next action.

##### ORP-16 · Rename and delete
**Story:** As a user, I can rename the display title or delete the job and its objects.  
**Acceptance:** Delete is confirmed; storage objects removed; revisions cascade.

##### ORP-17 · Quotas
**Story:** As the operator, a single account cannot fill the bucket.  
**Acceptance:** Configurable max bytes and max active jobs; surfaced as `ORP_QUOTA_*` env.

##### ORP-18 · Realtime status
**Story:** As a user on the detail page, I see status changes without refresh.  
**Acceptance:** Supabase Realtime subscription on that row; reconnects after a tab sleep.

---

### Phase 2 — Hear (M2)

Goal: monophonic audio becomes note events with tempo and key.

#### E5 Audio analysis

##### ORP-20 · Decode to PCM
**Story:** As the engine, I receive mono float PCM so later stages share one representation.  
**Acceptance:** Stereo mixed to mono; corrupt files → `failed` / `DECODE_ERROR`.

##### ORP-21 · Resample
**Story:** As the engine, I analyze at a fixed rate (16 kHz or 22.05 kHz).  
**Acceptance:** Rate stored on the revision; deterministic for the same file.

##### ORP-22 · Tempo
**Story:** As a student, the sheet’s metronome mark is close to the recording.  
**Acceptance:** ±8% on the M2 golden set; user can override later (ORP-45).

##### ORP-23 · Key
**Story:** As a teacher, the key signature is plausible for a tonal melody.  
**Acceptance:** Correct tonic/mode on ≥ 8/10 annotated clips; “unknown” is allowed with no signature.

##### ORP-24 · Onsets
**Story:** As the engine, I know when notes start.  
**Acceptance:** Onset F-measure reported on fixtures; missed pickups documented.

##### ORP-25 · Monophonic f0
**Story:** As a songwriter, a single sung or played line becomes a pitch contour.  
**Acceptance:** Engine documented (Basic Pitch or replacement); version stamped on the revision.

##### ORP-26 · Segmentation
**Story:** As the engine, contour + onsets become notes with duration.  
**Acceptance:** No overlapping notes in voice 1; rests fill gaps ≥ a 16th.

##### ORP-27 · Quantize
**Story:** As a reader, rhythms sit on a 16th grid in the declared meter.  
**Acceptance:** Off-grid raw onsets retained in IR debug metadata; displayed notes quantized.

#### E4 / E10

##### ORP-28 · Persist note events
**Story:** As a user, refreshing the ready job shows the same notes.  
**Acceptance:** New `score_revisions` row; IR validates against zod.

##### ORP-29 · Failure and retry
**Story:** As a user, a failed job tells me why and lets me retry.  
**Acceptance:** `error_code` + human message; retry increments `attempt_count`; stop at 3.

##### ORP-30 · Golden monophonic set
**Story:** As an engineer, I can prove M2 quality with a checked-in report.  
**Acceptance:** ≥ 10 public-domain or self-recorded clips + note F1 ≥ 0.70 mean.

---

### Phase 3 — Notate (M3)

Goal: a human reads and lightly edits a staff.

#### E6 Score model

##### ORP-40 · IR schema lock
**Story:** As a notation engineer, IR v1 is validated on every write.  
**Acceptance:** Invalid IR cannot be stored; migration path reserved as `version`.

##### ORP-41 · Measures
**Story:** As a reader, notes fall into bars that match the time signature.  
**Acceptance:** Barlines; leftover beats become a pickup or a final partial bar marked as such.

##### ORP-42 · MusicXML writer
**Story:** As a teacher, I can open the score in MuseScore.  
**Acceptance:** MusicXML 3.1 partwise; one part; key, time, tempo, notes, rests.

##### ORP-47 · Clef
**Story:** As a reader, the clef matches the range.  
**Acceptance:** Treble if median MIDI ≥ 60, else bass; user override later.

##### ORP-48 · Revisions
**Story:** As a writer, an edit does not destroy the previous IR.  
**Acceptance:** Last N (default 20) revisions kept; “reset to last engine draft” action.

#### E7 Viewer

##### ORP-43 · Sheet viewer
**Story:** As a student, I see a conventional staff in the studio.  
**Acceptance:** SVG/OSMD render from stored MusicXML; empty and failed states are distinct.

##### ORP-44 · Playback
**Story:** As a writer, I hear the transcription against a click.  
**Acceptance:** Play/stop; note highlight; tempo from IR.

##### ORP-45 · Metadata edits
**Story:** As a teacher, I can correct title, key, time, and tempo without re-uploading.  
**Acceptance:** Writes a revision; viewer updates.

##### ORP-46 · Transpose
**Story:** As a student, I can shift the melody by N semitones.  
**Acceptance:** Key signature updates; range warnings if notes leave practical staff.

##### ORP-49 · Studio states
**Story:** As a user, uploaded / working / ready / failed screens are obvious.  
**Acceptance:** Each state has copy and a next action; no blank canvas.

---

### Phase 4 — Publish (M4) — MVP

Goal: leave with files. This is the first external release cut.

#### E8 Export

##### ORP-60 · PDF
**Story:** As a student, I download a printable sheet.  
**Acceptance:** Letter and A4; title, tempo, staff; not a screenshot of the whole DAW chrome.

##### ORP-61 · Markdown
**Story:** As a writer, I get a `.md` I can paste into a notebook.  
**Acceptance:** Front matter (title, key, time, tempo) + ABC block and a simple pitch/rhythm table.

##### ORP-62 · MusicXML download
**Story:** As a teacher, I download `.musicxml` from the ready screen.

##### ORP-63 · MIDI
**Story:** As a writer, I can drop a MIDI into a DAW to hear the same notes.

##### ORP-64 · Persist exports
**Story:** As a hobby user, I can re-download without re-rendering.  
**Acceptance:** `exports` row + storage object; regenerate replaces the artifact.

##### ORP-67 · Print CSS
**Story:** As a teacher, browser print yields a clean page.  
**Acceptance:** Header chrome hidden; paper margins sane.

##### ORP-68 · Export errors
**Story:** As a user, a failed PDF says so and does not flip status back to `failed` on the transcription if the IR is still valid.

#### E9 Library

##### ORP-65 · Search and sort
**Story:** As a hobby transcriber, I can find a title and sort by date or status.

##### ORP-66 · Signed share link
**Story:** As a writer, I can mint an expiring read-only link to the PDF or viewer.  
**Acceptance:** Default 7 days; revocable; no audio download on the share page unless opted in.

**M4 exit = MVP.** Do not slip M5 polyphonic work into this cut.

---

### Phase 5 — Refine (M5)

Goal: quality and control, not new product surfaces.

##### ORP-80 · Polyphonic draft
**Story:** As a pianist, a simple two-hand excerpt yields more than one voice.  
**Acceptance:** Up to 4 voices; documented failure on dense mixes.

##### ORP-81 · Part labels
**Story:** As a teacher, I can name a part and set an instrument sound for playback.

##### ORP-82 · Click-edit
**Story:** As a writer, I can change a pitch or duration on the staff.  
**Acceptance:** Creates a revision; undo = previous revision.

##### ORP-83 · Notation cleanup
**Story:** As a reader, ties, rests, and accidentals follow common-practice defaults.

##### ORP-84 · Mid-piece meter
**Story:** As a writer, a recording that changes from 4/4 to 3/4 can be marked.

##### ORP-85 · Eval harness
**Story:** As an engineer, I run `npm run eval:transcription` and get note/offset F1 vs MusicXML ground truth.

##### ORP-86 · Confidence heatmap
**Story:** As a student, doubtful notes are visually marked.

##### ORP-87 · Region transcribe
**Story:** As a writer, I can transcribe 0:12–0:40 only.

##### ORP-88 · Chunking
**Story:** As the engine, files longer than 3 minutes are processed in overlapping windows and stitched.

##### ORP-89 · Hosted model flag
**Story:** As an operator, I can point hard jobs at Replicate (or equivalent) without rewriting the IR.  
**Acceptance:** Same revision schema; `engine` field distinguishes `client-basic-pitch` vs `hosted-*`.

---

### Phase 6 — Launch (M6)

##### ORP-100 · Production landing
**Story:** As a visitor, the public page is specific, fast, and indexable.

##### ORP-101 · Legal
**Story:** As the operator, terms and privacy state that users must have rights to the audio and that transcriptions may be imperfect.

##### ORP-102 · Observability
**Story:** As an engineer, uncaught errors and failed jobs are grouped with `transcription_id`.

##### ORP-103 · Usage events
**Story:** As an operator, I can count uploads, minutes processed, and exports per day.

##### ORP-104 · Rate limits
**Story:** As the operator, upload and transcribe endpoints reject bursts.

##### ORP-105 · Accessibility
**Story:** As a keyboard user, I can upload, start, play, and export without a mouse. Viewer has text alternatives for status.

##### ORP-106 · Load check
**Story:** As an engineer, three concurrent 3-minute clips on a preview deployment complete or fail with a message; they do not take down the app.

##### ORP-107 · GA checklist
**Story:** As the operator, I have a written rollback (revert Vercel deploy; Storage and DB stay) and a support contact path.

---

## 13. Risks and mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Vercel timeout if analysis is server-side | M2 slips | Client/WASM first; hosted model only behind flag |
| Basic Pitch quality on singing | Angry MVP users | Scope MVP to monophonic, well-recorded clips; show confidence |
| Browser memory on long FLAC | Tab crash | 3-minute / 25 MB cap until chunking (ORP-88) |
| AAC/ALAC in `.m4a` ambiguity | Wrong decoder path | Sniff codec, not only extension |
| MusicXML renderer licensing / SSR | Broken preview | Load OSMD on client only |
| Copyrighted uploads | Legal | Terms (ORP-101); private storage; no public index |
| Scope creep into a DAW | Missed M4 | Milestone contract: M4 is export of monophonic sheets |

---

## 14. Release cuts

| Cut | Milestone | Audience |
| --- | --- | --- |
| Internal dogfood | M3 | Authors of this repo |
| Closed MVP | M4 | 10–20 musicians with known monophonic material |
| Public beta | M5 | Waitlist |
| GA | M6 | Public |

Version the engine (`engine_version`) separately from the app semver. A bad model must be pin-able.

---

## 15. How to use this document

1. Pick the current phase in the canvas or in §9.
2. Implement only stories in that phase unless a blocker story from an earlier phase reopened.
3. Close a story by checking its acceptance criteria and updating status in the canvas if you use it.
4. When a milestone exits, write a short note at the top of this file (`Status:` line) and tag the git commit `m0` … `m6`.
5. Do not add a new epic without a home phase and a point budget.

---

## 16. Open decisions (resolve before the named phase)

| Decision | Needed by | Options |
| --- | --- | --- |
| Auth factor: magic link vs password vs OAuth | M0 | Start email/password + magic link; OAuth later |
| Pitch engine | M2 | Basic Pitch TF.js vs other WASM; must be browser-capable |
| Sheet renderer | M3 | OSMD vs VexFlow vs alphaTab |
| PDF strategy | M4 | svg → pdf in browser vs print-to-PDF |
| Hosted model vendor | M5 | None until M4 quality is measured |
| Billing | after M6 | Out of scope |

Default answers (in force until reversed): email/password + magic link; Basic Pitch; OSMD; browser SVG/print PDF; no vendor; no billing.
