-- Keep the complete operational settings row super-admin-only. The website
-- currently does not query these settings publicly, but provide a deliberately
-- limited projection for safe company contact fields if public rendering needs it.
drop policy if exists "settings public read" on public.company_settings;
drop policy if exists "settings super admin write" on public.company_settings;
create policy "settings super admin access"
  on public.company_settings for all
  using (public.current_role() = 'super_admin')
  with check (public.current_role() = 'super_admin');

revoke all on public.company_settings from public, anon, authenticated;
grant select, insert, update, delete on public.company_settings to authenticated;

create or replace view public.company_public_settings
with (security_barrier = true)
as
select company_name, logo_url, email, phone, whatsapp, address, business_hours
from public.company_settings;
revoke all on public.company_public_settings from public;
grant select on public.company_public_settings to anon, authenticated;
