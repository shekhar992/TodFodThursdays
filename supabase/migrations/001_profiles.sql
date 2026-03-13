-- ─── Profiles table ───────────────────────────────────────────────────────────
-- One row per auth.users entry. Stores role, team assignment, and spin state.

create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  display_name   text not null default '',
  role           text not null default 'player' check (role in ('admin', 'player')),
  team_id        uuid references public.teams (id) on delete set null,
  is_captain     boolean not null default false,
  has_spun       boolean not null default false,
  created_at     timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Users can read their own profile
create policy "profiles: own read"
  on public.profiles for select
  using (auth.uid() = id);

-- Users can update their own profile (display_name only — role/team_id locked to admins)
create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins (role = 'admin') can read all profiles
-- Uses a SECURITY DEFINER function to avoid infinite RLS recursion
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles: admin read all"
  on public.profiles for select
  using (public.is_admin());

-- Admins can update any profile (for team assignment, captain, role changes)
create policy "profiles: admin update all"
  on public.profiles for update
  using (public.is_admin());

-- ─── Auto-create profile on signup ────────────────────────────────────────────
-- Triggered whenever a new row is inserted into auth.users.
-- Reads display_name from user_metadata (set during signup).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'player')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Helper: weighted team selection ──────────────────────────────────────────
-- Returns the team_id that currently has the fewest members.
-- Used server-side if you call this via RPC instead of doing it in the client.

create or replace function public.pick_team_weighted()
returns uuid
language sql
security definer
as $$
  select t.id
  from public.teams t
  left join public.profiles p on p.team_id = t.id
  group by t.id
  order by count(p.id) asc, random()
  limit 1;
$$;

-- ─── Grant table access to authenticated users ────────────────────────────────
grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
