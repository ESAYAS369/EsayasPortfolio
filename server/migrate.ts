import "dotenv/config";
import pg from "pg";
import fs from "fs";
import path from "path";

const { Client } = pg;

async function runMigration() {
  console.log("=========================================");
  console.log("   RUNNING SUPABASE POSTGRESQL MIGRATION");
  console.log("=========================================\n");

  const connectionString =
    process.env.DATABASE_URL ||
    (process.env.DB_HOST && process.env.DB_PASSWORD
      ? `postgresql://${process.env.DB_USER || "postgres"}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || "postgres"}`
      : "");

  if (!connectionString) {
    console.error("❌ DATABASE_URL or DB_HOST + DB_PASSWORD is required in environment variables.");
    process.exit(1);
  }

  console.log("Connecting to PostgreSQL database...");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✓ Connected directly to Supabase PostgreSQL database!\n");

    const sqlScript = `
      -- 1. Tables
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
        type text check (type in ('apartment', 'house', 'villa', 'land', 'commercial')),
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

      create table if not exists public.site_content (
        key text primary key,
        value jsonb not null default '{}'::jsonb,
        updated_at timestamptz default now()
      );

      create table if not exists public.media (
        id uuid primary key default gen_random_uuid(),
        name text not null,
        path text unique not null,
        url text not null,
        kind text not null check (kind in ('image', 'video')),
        size_bytes bigint not null default 0,
        created_at timestamptz default now()
      );

      -- 2. RLS Enable
      alter table public.properties enable row level security;
      alter table public.inquiries enable row level security;
      alter table public.testimonials enable row level security;
      alter table public.users enable row level security;
      alter table public.site_content enable row level security;
      alter table public.media enable row level security;

      -- 3. Comprehensive RLS Policies for Supabase REST & Server Access
      -- Properties
      drop policy if exists "Allow public read access on properties" on public.properties;
      create policy "Allow public read access on properties" on public.properties for select using (true);
      drop policy if exists "Allow all write on properties" on public.properties;
      create policy "Allow all write on properties" on public.properties for all using (true) with check (true);

      -- Inquiries (Public Insert + Admin/Server Read & Delete)
      drop policy if exists "Allow public insert on inquiries" on public.inquiries;
      create policy "Allow public insert on inquiries" on public.inquiries for insert with check (true);
      drop policy if exists "Allow read access on inquiries" on public.inquiries;
      create policy "Allow read access on inquiries" on public.inquiries for select using (true);
      drop policy if exists "Allow delete access on inquiries" on public.inquiries;
      create policy "Allow delete access on inquiries" on public.inquiries for delete using (true);

      -- Testimonials
      drop policy if exists "Allow public read access on testimonials" on public.testimonials;
      create policy "Allow public read access on testimonials" on public.testimonials for select using (true);
      drop policy if exists "Allow all write on testimonials" on public.testimonials;
      create policy "Allow all write on testimonials" on public.testimonials for all using (true) with check (true);

      -- Site Content
      drop policy if exists "Allow public read access on site_content" on public.site_content;
      create policy "Allow public read access on site_content" on public.site_content for select using (true);
      drop policy if exists "Allow all write on site_content" on public.site_content;
      create policy "Allow all write on site_content" on public.site_content for all using (true) with check (true);

      -- Media Library
      drop policy if exists "Allow public read on media" on public.media;
      create policy "Allow public read on media" on public.media for select using (true);
      drop policy if exists "Allow all write on media" on public.media;
      create policy "Allow all write on media" on public.media for all using (true) with check (true);

      -- Users
      drop policy if exists "Allow all on users" on public.users;
      create policy "Allow all on users" on public.users for all using (true) with check (true);
    `;

    console.log("Applying database schema & security policies...");
    await client.query(sqlScript);
    console.log("✓ Successfully applied all schema tables and RLS policies in Supabase!\n");
  } catch (err: any) {
    console.error("❌ Migration error:", err.message);
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);
