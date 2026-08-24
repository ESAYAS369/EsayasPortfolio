create extension if not exists "uuid-ossp";

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  price text not null,
  beds integer not null default 0,
  baths integer not null default 0,
  sqft text not null default '',
  image text not null default '',
  description text not null default '',
  type text,
  amenities text[] default '{}',
  gallery text[] default '{}',
  video_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  date text,
  notes text,
  property_id text,
  created_at timestamptz default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null default '',
  content text not null default '',
  rating integer not null default 0,
  image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  uid text unique not null,
  email text not null,
  role text not null default 'client',
  created_at timestamptz default now()
);

-- Editable site content (about section, site settings) stored as JSON per key.
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Media library: every file uploaded from the admin page.
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  path text unique not null,
  url text not null,
  kind text not null check (kind in ('image', 'video')),
  size_bytes bigint not null default 0,
  created_at timestamptz default now()
);

alter table public.properties enable row level security;
alter table public.inquiries enable row level security;
alter table public.testimonials enable row level security;
alter table public.users enable row level security;
alter table public.site_content enable row level security;
alter table public.media enable row level security;

drop policy if exists "Allow public read access on site_content" on public.site_content;
create policy "Allow public read access on site_content"
on public.site_content
for select
using (true);

-- Postgres has no "create policy if not exists", so drop-then-create
-- to keep this script safe to re-run.
drop policy if exists "Allow public read access on properties" on public.properties;
create policy "Allow public read access on properties"
on public.properties
for select
using (true);

drop policy if exists "Allow public insert on inquiries" on public.inquiries;
create policy "Allow public insert on inquiries"
on public.inquiries
for insert
with check (true);

drop policy if exists "Allow public read access on testimonials" on public.testimonials;
create policy "Allow public read access on testimonials"
on public.testimonials
for select
using (true);

-- The users table is only accessed by the backend via the service role
-- (which bypasses RLS). No client-side policy is granted on purpose:
-- letting any authenticated user read/write rows here would allow
-- privilege escalation via the role column.
drop policy if exists "Allow authenticated access to users" on public.users;
