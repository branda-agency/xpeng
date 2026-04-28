-- Run this in your Supabase dashboard: SQL Editor → New Query → paste & run

-- 1. Create the leads table
create table public.leads (
  id         bigint generated always as identity primary key,
  name       text not null,
  email      text not null,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.leads enable row level security;

-- 3. Allow anonymous inserts only (no read/update/delete from the client)
create policy "Allow anonymous inserts"
  on public.leads
  for insert
  to anon
  with check (true);
