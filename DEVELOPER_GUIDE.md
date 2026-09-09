# BRD Hospital — Developer Guide

This is the single doc a new developer needs to get the whole project — marketing
site, booking flow, admin dashboard, and backend — running locally, plus where
everything lives. For the detailed one-time Supabase setup (creating the
project, running the schema, staff logins, email), see **[BACKEND_SETUP.md](./BACKEND_SETUP.md)**;
this guide covers day-to-day dev.

## 1. What this project is

A marketing + booking site for BRD Hospital (a gynecology practice), plus a
private admin dashboard for staff to manage appointments and payments.

- **Frontend**: React 19 + TypeScript + Vite, styled with Tailwind CSS v4,
  animated with Framer Motion, icons from lucide-react.
- **Backend**: Supabase (Postgres + Auth + Edge Functions) — no separate
  Node/Express server. The frontend talks to Supabase directly via
  `@supabase/supabase-js`.
- **Routing**: react-router-dom, all client-side (single-page app).
- **i18n**: a custom lightweight translation context (not i18next).
- **Hosting**: Netlify (see `netlify.toml`).

## 2. Prerequisites

- Node.js 20+ and npm (check with `node -v` / `npm -v`).
- A Supabase account — free tier is enough. Only needed if you want booking,
  the admin dashboard, or email confirmations to actually work; the site
  renders and is fully clickable without it (see §5).

## 3. Install & run the frontend

```bash
npm install
npm run dev
```

Opens at **http://localhost:5173**. Hot-reloads on save.

Other scripts:

| Command | What it does |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Type-check (`tsc -b`) then production-build to `dist/` |
| `npm run preview` | Serve the built `dist/` locally, to sanity-check a production build |
| `npm run lint` | Run oxlint |

There are no unit/e2e tests configured yet (Playwright is installed as a
devDependency but there's no test suite — it was used ad hoc for one-off image
processing scripts, not for testing).

## 4. Project structure

```
src/
  pages/
    MarketingSite.tsx        # the public homepage — assembles all the sections below
    admin/                   # everything behind /admin
      AdminLogin.tsx
      AdminLayout.tsx        # shared shell (nav) for the tabs below
      OverviewTab.tsx
      AppointmentsTab.tsx
      PaymentsTab.tsx
      SettingsTab.tsx
  components/
    sections/                # one file per homepage section (Hero, PregnancyJourney, BabyEmotions, …)
    booking/                 # the multi-step "Book an Appointment" modal
    admin/                   # ProtectedRoute etc.
    ui/                      # small shared primitives (Button, Container, Reveal, Img, …)
  context/
    BookingContext.tsx       # controls the booking modal's open/closed state
    LanguageContext.tsx      # current language + t()/tList() translation helpers
    AdminDataContext.tsx     # loads appointments once, shares across admin tabs
  data/                      # static content: doctors.ts, booking.ts, journey.ts, images.ts, …
  i18n/translations.ts       # every UI string, per language
  lib/
    supabase.ts              # Supabase client + isSupabaseConfigured flag
    auth.ts                  # useSession() hook for admin login state
    sound.ts                 # site-wide "only one sound plays at a time" audio player
    csvExport.ts             # admin "Download Excel" (CSV) helper
    api/
      appointments.ts        # createAppointment, getBookedSlots, listAppointments, updateAppointmentStatus
      notifications.ts       # notifyNewBooking (fires at booking time) + sendConfirmationEmail (fires once staff confirm status + payment)
supabase/
  schema.sql                 # full DB schema + row-level security + seed data — run this once, see BACKEND_SETUP.md
  functions/
    notify-new-booking/         # emails staff the moment a patient books
    send-confirmation/          # emails the patient once staff confirm status + payment
scripts/
  apply-schema.mjs           # applies schema.sql directly via psql (alternative to pasting into the SQL Editor)
  reload-schema-cache.mjs    # forces PostgREST to pick up a schema change (see BACKEND_SETUP.md troubleshooting)
```

Images and sound files live in `src/assets/` and are referenced through
`src/data/images.ts` (a `photos` object mapping a short key to either a local
imported file or an Unsplash photo ID — see the comment at the top of that
file for how the two are told apart).

## 5. Environment variables (Supabase)

Copy `.env.example` → `.env.local` and fill in your Supabase project's URL +
anon key. **Full first-time setup (creating the project, running
`schema.sql`, creating a staff login, optional email) is in
[BACKEND_SETUP.md](./BACKEND_SETUP.md) — do that before continuing here if
this is a fresh Supabase project.**

Without `.env.local`:
- The site still loads and every section renders normally.
- The booking modal will accept input but show *"Booking isn't connected to
  the server yet"* instead of saving.
- `/admin` will redirect to `/admin/login`, and login will fail (no auth
  backend to check against).

This is intentional (`isSupabaseConfigured` in `src/lib/supabase.ts` gates
every call) — a missing backend never crashes the app, it just degrades
booking/admin gracefully.

`scripts/apply-schema.mjs` and `scripts/reload-schema-cache.mjs` additionally
need `SUPABASE_DB_PASSWORD` in `.env.local` (Project Settings → Database →
Database password) — only required if you use those scripts instead of the
Supabase SQL Editor.

## 6. Admin dashboard

- URL: `/admin/login`, then `/admin` (redirects to login if not signed in —
  see `ProtectedRoute.tsx`).
- Auth is plain Supabase Auth (email + password). There's **no self-serve
  sign-up** — staff accounts are created manually in the Supabase dashboard
  (**Authentication → Users → Add user**), on purpose, since this is a
  private tool.
- Tabs: **Overview**, **Appointments** (change status: pending / confirmed /
  cancelled / completed), **Payments** (manually-tracked payment status +
  CSV export), **Settings**.
- All tabs read from `AdminDataContext`, which loads appointments once via
  `listAppointments()` and shares them — a tab doesn't refetch on its own.

## 7. Internationalization (i18n)

- All user-facing strings live in `src/i18n/translations.ts`, keyed by
  section (e.g. `journey.firstTrimesterTitle`, `footer.tagline`).
- `LanguageContext` exposes `t(key)` for a single string and `tList(key)` for
  an array (e.g. a care-info checklist). Components never hardcode English —
  they call `t("some.key")`.
- To add a language: add its code to the language list in
  `LanguageContext.tsx` and add a matching translated block to
  `translations.ts`. To add new UI text: add the key to **every** language
  block in `translations.ts`, then reference it with `t()`.
- `LanguageSwitcher.tsx` is the UI control for switching; the chosen language
  is provided app-wide via `LanguageProvider` in `App.tsx`.

## 8. Deploying (Netlify)

`netlify.toml` at the repo root already sets the build command
(`npm run build`), publish directory (`dist`), and a catch-all redirect to
`index.html` (required for client-side routing — without it, refreshing
`/admin` or any non-root URL 404s).

To deploy:
1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In Netlify: **Add new site → Import an existing project**, pick the repo —
   it'll pick up `netlify.toml` automatically.
3. In **Site settings → Environment variables**, add `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` (same values as your `.env.local`) — Vite only
   embeds env vars that exist *at build time*, so this step is required for
   the deployed site's booking/admin to work, not just local dev.
4. Deploy. Every future push to the connected branch redeploys automatically.

Alternatively, once logged into the Netlify CLI (`npx netlify-cli login`),
`npx netlify-cli deploy --prod` deploys the current `dist/` folder directly
without connecting a git repo — useful for a one-off deploy, but you lose
auto-deploy-on-push.

## 9. Common gotchas

- **"Booking isn't connected to the server yet"** → `.env.local` is missing
  or has the wrong keys. Restart `npm run dev` after editing it (Vite only
  reads env files at startup).
- **Refreshing `/admin` gives a 404 on the deployed site** → the Netlify
  redirect rule in `netlify.toml` didn't get picked up; confirm it's
  committed and the site was redeployed after it was added.
- **A Supabase policy/schema change doesn't seem to apply** → see the
  troubleshooting section at the bottom of `BACKEND_SETUP.md` (PostgREST
  schema cache, and the `.insert().select()` RLS gotcha).
- **New doctor or service added to `src/data/doctors.ts` / `src/data/booking.ts`**
  → also add matching rows to the `insert into doctors` / `insert into
  services` statements in `supabase/schema.sql` and re-run them, or bookings
  for the new doctor/service will fail a foreign-key check server-side.
