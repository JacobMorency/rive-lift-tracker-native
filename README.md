# Rive

**Template-driven lift tracking** built with **Expo Router** and **Supabase** — create workouts, schedule them, run sessions, and review progress with stats + PRs.

[MANUAL ENTRY REQUIRED: Add App Store / Play Store / TestFlight link] • [MANUAL ENTRY REQUIRED: Add demo video link] • [MANUAL ENTRY REQUIRED: Add screenshots folder path]

---

## Overview

Rive is a mobile-first workout tracker focused on a workflow most lifters actually use:

- build **workout templates**
- optionally **schedule** those templates (recurring or one-off)
- start a **session** from a template, then track **sets** and progress
- review **history + PRs** to stay consistent and progressive

This repository contains:

- **`rive/`**: the Expo + React Native app (iOS / Android / Web)
- **`migrations/`**: SQL scripts used for Supabase Postgres (RLS + muscle group data migration)

## Features

### Confirmed in this codebase

- **Workout templates** stored per user (`workouts`, `workout_exercises`)
- **Start sessions** from any template (`workout_sessions`)
- **Session execution UI** with per-exercise tracking and set logging (`session_exercises`, `exercise_sets`)
- **Scheduling** for templates with recurrence rules (`workout_schedules`)
- **Stats dashboard** with an overview view and PRs tab (driven by completed sessions)
- **Supabase Auth (email/password)** with persisted sessions (AsyncStorage)
- **Profile completion** backed by a `users` table
- **Muscle group system** using `muscle_groups` + `exercise_muscle_groups`

### Inferred-but-likely (clearly labeled)

- **Web build** via Expo’s web target (`expo start --web`, `app.json` sets web output to `static`)
- **Dev client workflow** (EAS development profile + `expo-dev-client`)

## Screenshots / Demo

- [MANUAL ENTRY REQUIRED: Add “Dashboard / Templates” screenshot]
- [MANUAL ENTRY REQUIRED: Add “Session detail / set tracking” GIF]
- [MANUAL ENTRY REQUIRED: Add “Stats / PRs” screenshot]
- [MANUAL ENTRY REQUIRED: Add production URL or store listing]

## Tech Stack

- **App**: Expo SDK 54, React Native 0.81, React 19, TypeScript
- **Routing / navigation**: Expo Router (file-based routing), React Navigation
- **Backend**: Supabase (Auth + Postgres via `@supabase/supabase-js`)
- **Styling**: NativeWind + TailwindCSS (`global.css`)
- **Build & release**: EAS Build profiles (`development`, `preview`, `production`)
- **Tooling**: ESLint (Expo config)

## Architecture / How it works

Rive is a “thin backend” architecture: the app talks directly to Supabase. Authorization is enforced by **Row Level Security (RLS)** policies.

```text
┌─────────────────────────┐
│  Expo app (rive/app/*)  │
│  - Expo Router screens  │
│  - NativeWind UI        │
└───────────┬─────────────┘
            │  supabase-js (Auth + queries)
            ▼
┌─────────────────────────┐
│       Supabase          │
│  Auth + PostgREST API   │
└───────────┬─────────────┘
            │  RLS policies
            ▼
┌─────────────────────────┐
│   Postgres (tables)     │
│ workouts, sessions, ... │
└─────────────────────────┘
```

### Key flows (from the code)

- **Auth bootstrap**: `AuthProvider` checks for a persisted session, listens to auth state, and fetches a row from `users` for display/personalization.
- **Templates**: templates are loaded from `workouts` with a join through `workout_exercises` → `exercise_library`, then enriched with muscle-group metadata.
- **Sessions**: starting a session inserts a row into `workout_sessions` and routes to `/session/[id]`, which loads session + template exercises and tracks progress/sets.
- **Scheduling**: recurrence logic lives in `rive/app/lib/scheduleUtils.ts` and stores schedules in `workout_schedules`.
- **Stats/PRs**: `rive/app/lib/statsUtils.ts` aggregates completed sessions and computes volume trends + PR summaries.

## Project structure (curated)

```text
.
├─ rive/                      # Expo app root
│  ├─ app/                    # Expo Router screens + UI
│  │  ├─ (tabs)/              # Dashboard, Sessions, Stats, Profile
│  │  ├─ session/[id].tsx     # Session execution flow
│  │  ├─ components/          # Templates, scheduling, session UI, stats UI
│  │  ├─ context/             # Auth provider
│  │  └─ lib/                 # supabase client, stats, scheduling, muscle groups
│  ├─ eas.json                # EAS build profiles
│  └─ app.json                # Expo config
└─ migrations/                # SQL migrations for Supabase (RLS + muscle group data)
```

## Getting started

### Prerequisites

- **Node.js** (current LTS recommended) + **npm**
- **iOS**: Xcode (for simulator/device builds)
- **Android**: Android Studio + emulator
- **Supabase project** (URL + anon key)

### Install

```bash
cd rive
npm install
```

### Configure environment

Create `rive/.env` with:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

Then run:

```bash
npm start
```

### Run on iOS / Android / Web

```bash
cd rive

npm run ios
npm run android
npm run web
```

### Lint

```bash
cd rive
npm run lint
```

### Build / release (EAS)

Rive includes EAS profiles under `rive/eas.json`.

```bash
cd rive
npx eas build --profile development
npx eas build --profile preview
npx eas build --profile production
```

[MANUAL ENTRY REQUIRED: Add release process notes (store submission, credentials, etc.)]

## Environment variables

| Variable | Required | Used for | Where |
|---|---:|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL | `rive/app/lib/supabaseClient.ts` |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key | `rive/app/lib/supabaseClient.ts` |
| `EXPO_PUBLIC_APP_URL` | ⚠️ Optional | Email redirect URL for sign-up (fallback exists) | `rive/app/login.tsx` |

### Security note (important)

- **Do not commit secrets**. Supabase **anon keys are meant for client use**, but you should still treat them as environment configuration and keep them out of git where possible.
- If you ever accidentally commit credentials, **rotate keys** in Supabase and update your local `.env`.
- Recommended pattern: add a tracked `rive/.env.example` (no real values) and keep `rive/.env` untracked.

### EAS / Expo config note

This repo also references `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `rive/app.json` under `expo.extra`. If you use EAS, you may prefer configuring these via **EAS environment variables / secrets** rather than relying on local `.env` files.

[MANUAL ENTRY REQUIRED: Confirm your preferred env management approach (local `.env` vs EAS secrets) and update this section accordingly.]

## Database & migrations (Supabase)

The `migrations/` folder contains SQL scripts focused on **muscle groups** and **Row Level Security** (RLS) policies.

See [`migrations/README.md`](migrations/README.md) for execution order and notes.

[MANUAL ENTRY REQUIRED: Add a schema overview (tables + relationships) if you want the database to be reproducible from code alone.]

## Key engineering highlights

- **RLS-aware data model**: policies and migrations for shared reference data (muscle groups)
- **Client-first Supabase architecture**: direct PostgREST access from the app with persisted auth sessions
- **File-based routing** with Expo Router, keeping navigation and screens easy to discover
- **Stats built from raw training data**: set-level data enables volume, trends, and PR summaries
- **EAS build profiles** for development/preview/production workflows

## Future improvements

- **Add CI** (lint + typecheck + build) and introduce a test baseline for critical utils
- **Schema-as-code**: bring table DDL, triggers, and policies fully into migrations for reproducible environments
- **Auth UX**: implement password reset (currently “coming soon”) and optional OAuth providers
- **Offline-first**: queue session writes locally and sync when online (where product goals allow)

## Contributing

Contributions are welcome.

- **Dev**: `cd rive && npm install && npm start`
- **Lint**: `cd rive && npm run lint`

[MANUAL ENTRY REQUIRED: Add contribution guidelines (branching, PR template, code style expectations) if you plan to accept external PRs.]

## Contact / Author

[MANUAL ENTRY REQUIRED: Add your name, LinkedIn, portfolio, and preferred contact email]