-- Allow admins to delete player profiles from the admin panel
create policy "profiles: admin delete"
  on public.profiles for delete
  using (public.is_admin());
