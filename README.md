# Orpheus

A monolith [Next.js](https://nextjs.org) app, deployed on [Vercel](https://vercel.com), using [Supabase](https://supabase.com) for auth, Postgres, storage, and realtime.

Orpheus reads a sound file (`mp3`, `aac`, `m4a`, `ogg`, `flac`, `alac`, `wav`, `aiff`) and writes a music sheet (`pdf`, `md`, `musicxml`, `midi`).

The working agreement — phases, milestones, epics, user stories, tasks, architecture, and definition of done — is [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## Current cut

**Phase 0 / Milestone M0 — Foundation.** Brand shell, Score IR types, format validation, job state machine, Supabase schema, and auth wiring. Transcription itself starts in Phase 1–2.

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js App Router, TypeScript, Tailwind CSS v4 |
| Host | Vercel |
| Backend | Supabase Auth, Postgres + RLS, Storage, Realtime |
| Notation source | Score IR v1 (`src/lib/score/ir.ts`) |

Heavy analysis runs in the browser in v1 so Vercel function timeouts are not the product bottleneck. See DEVELOPMENT.md §4.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The studio and landing render without Supabase. Sign-in, persisted uploads, and RLS require:

1. A Supabase project.
2. Keys in `.env.local`.
3. `supabase/migrations/0001_init.sql` applied (see [supabase/README.md](supabase/README.md)).

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Deploy

1. Import this repo into Vercel (framework: Next.js).
2. Set the same public Supabase env vars on the project.
3. Point Auth redirect URLs at the Vercel production and preview hosts.
4. Apply the SQL migration to the Supabase project used by that environment.

Prefer a separate Supabase project for preview vs production.

## Repository map

```
docs/DEVELOPMENT.md          product + engineering plan
src/app                      routes: /, /studio, /login, /roadmap
src/lib/score                Score IR and fixtures
src/lib/audio                upload format rules
src/lib/jobs                 transcription state machine
src/lib/product              roadmap data used by /roadmap
src/lib/supabase             clients, session proxy, server actions
src/proxy.ts                 Next.js network boundary (auth redirect)
supabase/migrations          Postgres, RLS, storage policies
```
