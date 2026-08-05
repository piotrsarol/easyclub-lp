create table if not exists public.pilot_leads (
  id uuid primary key default gen_random_uuid(),
  club_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  club_size text,
  organization_type text not null check (organization_type in ('Klub sportowy', 'Akademia', 'Szkółka', 'Inny')),
  message text,
  consent boolean not null default false check (consent = true),
  created_at timestamptz not null default now()
);

alter table public.pilot_leads enable row level security;
