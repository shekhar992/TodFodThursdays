-- ── Migration 010: announcements pinned column + RLS hardening ───────────────

-- 1. Add pinned column
alter table public.announcements
  add column if not exists pinned boolean not null default false;

-- 2. Drop the overly-permissive write policy (any authenticated user could write)
drop policy if exists "announcements_write" on public.announcements;

-- 3. Replace with admin-only write policies
--    Admins have role = 'admin' in the profiles table.
create policy "announcements_insert_admin" on public.announcements
  for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "announcements_update_admin" on public.announcements
  for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "announcements_delete_admin" on public.announcements
  for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
