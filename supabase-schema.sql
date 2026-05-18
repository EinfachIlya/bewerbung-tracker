-- Bewerbungs-Tracker: Datenbankschema für Supabase
-- Dieses SQL im Supabase SQL Editor ausführen

-- ─── Tabelle: applications ───────────────────────────────────────────────────

create table applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  position text not null,
  location text,
  job_url text,
  status text not null default 'Gemerkt'
    check (status in ('Gemerkt', 'Beworben', 'Interview', 'Angebot', 'Abgelehnt', 'Abgebrochen')),
  applied_at date,
  response_at date,
  salary_min integer,
  salary_max integer,
  excitement integer check (excitement between 1 and 5),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security aktivieren
alter table applications enable row level security;

create policy "Eigene Bewerbungen lesen"
  on applications for select using (auth.uid() = user_id);

create policy "Eigene Bewerbungen anlegen"
  on applications for insert with check (auth.uid() = user_id);

create policy "Eigene Bewerbungen bearbeiten"
  on applications for update using (auth.uid() = user_id);

create policy "Eigene Bewerbungen löschen"
  on applications for delete using (auth.uid() = user_id);


-- ─── Tabelle: activities ─────────────────────────────────────────────────────

create table activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references applications(id) on delete cascade,
  type text not null
    check (type in ('beworben', 'interview', 'angebot', 'absage', 'follow_up', 'notiz')),
  occurred_at timestamptz default now(),
  notes text
);

alter table activities enable row level security;

create policy "Eigene Aktivitäten"
  on activities for all using (auth.uid() = user_id);
