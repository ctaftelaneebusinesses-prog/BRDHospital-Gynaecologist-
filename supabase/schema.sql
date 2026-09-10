-- BRD Hospital — backend schema
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query → paste → Run).
-- Safe to re-run: uses "if not exists" / "or replace" everywhere.

-- ─────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists doctors (
  id text primary key,
  name text not null,
  title text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists services (
  id text primary key,
  name text not null,
  duration_minutes int not null default 30,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  doctor_id text not null references doctors(id),
  service_id text not null references services(id),
  appointment_date date not null,
  appointment_time text not null, -- e.g. "09:00 AM", matches the site's slot labels
  full_name text not null,
  phone text not null,
  email text not null,
  date_of_birth date,
  reason text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no-show')),
  created_at timestamptz not null default now()
);

create index if not exists appointments_date_idx on appointments (appointment_date);
create index if not exists appointments_doctor_date_idx on appointments (doctor_id, appointment_date);

-- Prevent double-booking the same doctor at the same date+time (cancelled slots free up).
drop index if exists appointments_unique_slot;
create unique index appointments_unique_slot
  on appointments (doctor_id, appointment_date, appointment_time)
  where status <> 'cancelled';

-- ─────────────────────────────────────────────────────────────────────────
-- Row Level Security
-- ─────────────────────────────────────────────────────────────────────────

alter table doctors enable row level security;
alter table services enable row level security;
alter table appointments enable row level security;

drop policy if exists "Public can view active doctors" on doctors;
create policy "Public can view active doctors" on doctors
  for select using (is_active = true);

drop policy if exists "Public can view active services" on services;
create policy "Public can view active services" on services
  for select using (is_active = true);

-- Anyone (the website, unauthenticated) can create a booking, but cannot read,
-- update, or delete appointments — that keeps patient data private.
drop policy if exists "Anyone can book an appointment" on appointments;
create policy "Anyone can book an appointment" on appointments
  for insert with check (true);

-- Only signed-in staff (admin dashboard) can read/update appointments.
drop policy if exists "Staff can view appointments" on appointments;
create policy "Staff can view appointments" on appointments
  for select using (auth.role() = 'authenticated');

drop policy if exists "Staff can update appointments" on appointments;
create policy "Staff can update appointments" on appointments
  for update using (auth.role() = 'authenticated');

drop policy if exists "Staff can manage doctors" on doctors;
create policy "Staff can manage doctors" on doctors
  for all using (auth.role() = 'authenticated');

drop policy if exists "Staff can manage services" on services;
create policy "Staff can manage services" on services
  for all using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────────
-- Public RPC: check which time slots are already taken for a doctor/date,
-- without exposing any patient data (runs with elevated privileges, but
-- only ever returns a bare list of times).
-- ─────────────────────────────────────────────────────────────────────────

create or replace function get_booked_slots(p_doctor_id text, p_date date)
returns table (appointment_time text)
language sql
security definer
set search_path = public
as $$
  select appointment_time
  from appointments
  where doctor_id = p_doctor_id
    and appointment_date = p_date
    and status <> 'cancelled';
$$;

grant execute on function get_booked_slots(text, date) to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Seed data — mirrors src/data/doctors.ts and src/data/booking.ts.
-- Update these if you change the doctor/service list on the frontend.
-- ─────────────────────────────────────────────────────────────────────────

insert into doctors (id, name, title) values
  ('dr-haritha', 'Dr. Haritha', 'Gynecologist & Obstetrician')
on conflict (id) do update set name = excluded.name, title = excluded.title;

insert into services (id, name, duration_minutes) values
  ('gynecological-consultation', 'Gynecological Consultation', 30)
on conflict (id) do update set name = excluded.name, duration_minutes = excluded.duration_minutes;

-- ─────────────────────────────────────────────────────────────────────────
-- v2 — reason checklist, booking-fee settings, payment tracking.
-- ─────────────────────────────────────────────────────────────────────────

-- "Reason for visit" is now checkboxes (admin-managed) + free text + voice
-- dictation (which just fills the free text box) — any combination.
alter table appointments alter column reason drop not null;
alter table appointments drop constraint if exists appointments_status_check;
alter table appointments add constraint appointments_status_check
  check (status in ('pending', 'confirmed', 'cancelled', 'completed', 'no-show'));
alter table appointments add column if not exists reason_tags text[] not null default '{}';

alter table appointments add column if not exists payment_status text not null default 'pending'
  check (payment_status in ('pending', 'paid', 'failed'));
alter table appointments add column if not exists payment_amount numeric;
alter table appointments add column if not exists payment_confirmed_at timestamptz;

create table if not exists reason_options (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Per-language labels ({"en": "...", "hi": "...", "te": "...", "ta": "...", "kn": "..."}),
-- auto-populated by translateToAllLanguages() whenever an admin adds a new option, so the
-- patient-facing checklist is never English-only just because it was added after launch.
alter table reason_options add column if not exists translations jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'reason_options_label_key'
  ) then
    alter table reason_options add constraint reason_options_label_key unique (label);
  end if;
end $$;

alter table reason_options enable row level security;

drop policy if exists "Public can view active reason options" on reason_options;
create policy "Public can view active reason options" on reason_options
  for select using (is_active = true);

drop policy if exists "Staff can manage reason options" on reason_options;
create policy "Staff can manage reason options" on reason_options
  for all using (auth.role() = 'authenticated');

insert into reason_options (label, sort_order, translations) values
  ('Routine Checkup', 1, '{"en":"Routine Checkup","hi":"नियमित जाँच","te":"సాధారణ తనిఖీ","ta":"வழக்கமான சரிபார்ப்பு","kn":"ನಿಯಮಿತ ತಪಾಸಣೆ"}'),
  ('Pregnancy Consultation', 2, '{"en":"Pregnancy Consultation","hi":"गर्भावस्था परामर्श","te":"గర్భధారణ సంప్రదింపులు","ta":"கர்ப்ப ஆலோசனை","kn":"ಗರ್ಭಧಾರಣೆಯ ಸಮಾಲೋಚನೆ"}'),
  ('Menstrual Health', 3, '{"en":"Menstrual Health","hi":"मासिक धर्म स्वास्थ्य","te":"ఋతుస్రావం ఆరోగ్యం","ta":"மாதவிடாய் ஆரோக்கியம்","kn":"ಋತುಚಕ್ರದ ಆರೋಗ್ಯ"}'),
  ('Follow-up Visit', 4, '{"en":"Follow-up Visit","hi":"फ़ॉलो - अप विज़िट","te":"ఫాలో-అప్ సందర్శన","ta":"பின்தொடர்தல் வருகை","kn":"ಅನುಸರಣಾ ಭೇಟಿ"}'),
  ('Fertility Consultation', 5, '{"en":"Fertility Consultation","hi":"प्रजनन परामर्श","te":"సంతానోత్పత్తి సంప్రదింపులు","ta":"கருவுறுதல் ஆலோசனை","kn":"ಫಲವತ್ತತೆ ಸಮಾಲೋಚನೆ"}'),
  ('Other', 6, '{"en":"Other","hi":"अन्य","te":"ఇతర","ta":"மற்றவை","kn":"ಇತರೆ"}'),
  ('Irregular Periods', 7, '{"en":"Irregular Periods","hi":"अनियमित अवधि","te":"క్రమరహిత కాలాలు","ta":"ஒழுங்கற்ற காலங்கள்","kn":"ಅನಿಯಮಿತ ಋತುಚಕ್ರಗಳು"}'),
  ('PCODS', 8, '{"en":"PCODS","hi":"PCODS","te":"PCODS","ta":"PCODS","kn":"PCODS"}')
on conflict (label) do update set translations = excluded.translations;

-- Simple key/value settings the admin can edit (UPI id, booking fee, ...).
-- Values are stored as text and parsed by the app where needed (e.g. the fee
-- amount) so this table never needs a schema change to add a new setting.
create table if not exists app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table app_settings enable row level security;

-- Public can read settings (the booking flow needs the UPI id + fee amount
-- before the patient has signed in — there's no patient auth in this app).
drop policy if exists "Public can view settings" on app_settings;
create policy "Public can view settings" on app_settings
  for select using (true);

drop policy if exists "Staff can manage settings" on app_settings;
create policy "Staff can manage settings" on app_settings
  for all using (auth.role() = 'authenticated');

insert into app_settings (key, value) values
  ('upi_id', 'brdhospital@upi'),
  ('booking_fee_amount', '100'),
  ('payee_name', 'BRD Hospital')
on conflict (key) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- v3 — optional email, UPI transaction ID (manual payment verification),
-- WhatsApp number setting (for the "share your payment screenshot" step).
-- ─────────────────────────────────────────────────────────────────────────

-- Not everyone has an email address — make it optional. The app stores it
-- as null (not empty string) when the patient leaves it blank.
alter table appointments alter column email drop not null;

-- The reference/transaction ID the patient's UPI app shows after paying.
-- Staff cross-check this against their own UPI app before marking a booking
-- Confirmed + Paid — see notifyIfFullyConfirmed in AppointmentsTab.tsx.
alter table appointments add column if not exists upi_transaction_id text;

insert into app_settings (key, value) values
  ('whatsapp_number', '911234567890')
on conflict (key) do nothing;

-- ─────────────────────────────────────────────────────────────────────────
-- v4 — doctor availability overrides (block a specific slot, or a whole
-- day, on top of the fixed daily schedule in src/data/booking.ts).
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists blocked_slots (
  id uuid primary key default gen_random_uuid(),
  doctor_id text not null references doctors(id),
  blocked_date date not null,
  blocked_time text, -- null = the entire day is blocked; otherwise one of the fixed slot labels, e.g. "09:00 AM"
  reason text,
  created_at timestamptz not null default now()
);

-- A given date can only be "whole day blocked" once, and a given slot can
-- only be individually blocked once — coalesce folds null (whole day) to a
-- single sentinel value so it participates in the uniqueness check too.
create unique index if not exists blocked_slots_unique
  on blocked_slots (doctor_id, blocked_date, coalesce(blocked_time, ''));

create index if not exists blocked_slots_doctor_date_idx on blocked_slots (doctor_id, blocked_date);

alter table blocked_slots enable row level security;

-- Public can read (the booking flow needs to know what's blocked before a
-- patient has signed in), but this table never holds any patient data.
drop policy if exists "Public can view blocked slots" on blocked_slots;
create policy "Public can view blocked slots" on blocked_slots
  for select using (true);

drop policy if exists "Staff can manage blocked slots" on blocked_slots;
create policy "Staff can manage blocked slots" on blocked_slots
  for all using (auth.role() = 'authenticated');
