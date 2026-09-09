# Backend setup

The frontend is fully wired to a Supabase backend — you just need to create the
project and plug in the keys. Everything below is a one-time setup.

**Status:** steps 1–3 are done — the project exists, `.env.local` has the
keys, and `supabase/schema.sql` has been run (one doctor, "Dr. Haritha", is
seeded and bookings have been verified end-to-end against the live
database). Still to do: **step 4** (create your own staff login) and,
optionally, **step 5** (email confirmations).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → sign up (free) → **New project**.
2. Once it's created, go to **Settings → API** and copy:
   - **Project URL**
   - **anon public** key

## 2. Connect the frontend to it

1. Copy `.env.example` to `.env.local`.
2. Paste your Project URL and anon key into it.
3. Restart `npm run dev`.

Without this step the site still works, but booking will show "Booking isn't
connected to the server yet" instead of saving, and `/admin` won't load data.

## 3. Create the database

1. In the Supabase dashboard, open **SQL Editor → New query**.
2. Paste the entire contents of `supabase/schema.sql` and click **Run**.

This creates the `doctors`, `services`, and `appointments` tables, sets up
row-level security (patients can only create bookings, never read other
patients' data; only signed-in staff can view/manage appointments), and seeds
the one doctor/service currently on the site.

If you add more doctors or services to `src/data/doctors.ts` /
`src/data/booking.ts` later, add matching rows to the `insert into doctors` /
`insert into services` statements at the bottom of `schema.sql` and re-run
just those inserts.

## 4. Create a staff login for the admin dashboard

1. In the Supabase dashboard: **Authentication → Users → Add user**.
2. Set an email + password for whoever should manage appointments.
3. They can now sign in at `/admin/login` and view/update bookings at `/admin`.

There's no self-serve sign-up — staff accounts are only created by you, in the
dashboard, on purpose (this is a private admin tool, not a public account
system).

## 5. (Optional) Turn on email confirmations

Booking works fully without this — it's just the "send a confirmation email"
step. Skip it if you don't need that yet.

1. Create a free account at [resend.com](https://resend.com) and grab an API key
   (**API Keys** in their dashboard).
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) if you don't
   have it, then from this project folder:
   ```
   supabase login
   supabase link --project-ref your-project-ref   (find this in your project's Settings → General)
   supabase functions deploy send-confirmation
   supabase secrets set RESEND_API_KEY=re_your_key_here
   ```
3. By default, emails send from `onboarding@resend.dev` (works immediately,
   but looks like a test address). To send from your own domain, verify a
   domain in Resend, then also run:
   ```
   supabase secrets set CONFIRMATION_FROM_EMAIL="BRD Hospital <appointments@yourdomain.com>"
   ```

If this step is skipped or fails, bookings still save normally — the email is
best-effort and never blocks a booking.

## Troubleshooting

**"new row violates row-level security policy" when the policy clearly
exists.** This bit us during setup: if application code does
`.insert(...).select()` (asking Supabase to hand back the row it just
created), Postgres also requires that row to satisfy the table's **SELECT**
policy, not just the INSERT policy — even though the insert itself is
completely valid. Since only staff can read `appointments`, that combination
always fails for a public booking. Fix: don't chain `.select()` after
inserting into `appointments` (already done in `src/lib/api/appointments.ts`
— noted here in case a similar pattern gets added later).

**A policy change in the SQL Editor doesn't seem to take effect.**
PostgREST (the API layer in front of Postgres) caches the schema and
usually reloads within a few seconds of a DDL change, but occasionally
doesn't. Force it:
```
node --env-file=.env.local scripts/reload-schema-cache.mjs
```
This needs `SUPABASE_DB_PASSWORD` in `.env.local` (Project Settings →
Database → Database password) and connects via the **connection pooler**
(Project Settings → Database → Connection pooling) rather than the direct
`db.<ref>.supabase.co` host — that host is IPv6-only, which many home/office
networks can't route to, so direct connections there may hang or fail with
`ENOTFOUND` even though the credentials are correct.

## What's already built

- **Booking**: the appointment wizard on the site writes real rows to the
  `appointments` table, and checks already-booked slots for the selected date
  live (so two patients can't double-book the same slot).
- **Admin dashboard** (`/admin`, behind `/admin/login`): lists every
  appointment, filterable by status, with a dropdown to mark each one
  pending/confirmed/cancelled/completed.
- **Email confirmations**: sent via a Supabase Edge Function + Resend, once
  you complete step 5 above.
