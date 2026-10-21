-- Security hardening. Apply after 0001_init.sql and 0002_admin_operations.sql.
-- This migration changes policies only; it does not delete business data.

-- Only a super administrator may change profiles or assign roles. This prevents
-- an ordinary admin from promoting itself or another account.
drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_super_admin"
  on public.profiles for update
  using (public.current_role() = 'super_admin')
  with check (public.current_role() = 'super_admin');

-- Operational staff can read active/inactive services, but publishing or
-- deleting them is reserved for admins.
drop policy if exists "services public read" on public.services;
create policy "services public or staff read" on public.services
  for select using ((is_active and deleted_at is null) or public.is_staff());
drop policy if exists "services staff write" on public.services;
create policy "services admin write" on public.services
  for all using (public.is_admin()) with check (public.is_admin());

-- Browser clients must not create client-priced orders. The current storefront
-- continues to submit enquiries to leads; create real paid orders only from a
-- trusted server/Edge Function after validating catalog prices and payment.
drop policy if exists "orders customer own or staff" on public.orders;
create policy "orders customer own or admin" on public.orders
  for select using (customer_id = auth.uid() or public.is_admin());
drop policy if exists "orders customer create" on public.orders;
create policy "orders admin create" on public.orders
  for insert with check (public.is_admin());
drop policy if exists "orders staff update" on public.orders;
create policy "orders admin update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- Quotes can affect commercial amounts and are therefore admin-only.
drop policy if exists "quotes staff only" on public.quotes;
create policy "quotes admin only" on public.quotes
  for all using (public.is_admin()) with check (public.is_admin());

-- Audit entries are written by SECURITY DEFINER database triggers. Do not allow
-- browsers to forge audit history directly.
drop policy if exists "audit staff insert" on public.audit_logs;

-- Enforce image restrictions at the storage boundary in addition to client-side
-- validation. Existing public-read behavior is preserved for storefront images.
drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects
  for insert with check (
    bucket_id = 'product-images'
    and public.is_admin()
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
    and lower(coalesce(metadata->>'mimetype', '')) in ('image/jpeg', 'image/png', 'image/webp')
    and coalesce((metadata->>'size')::bigint, 0) <= 5242880
  );

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin())
  with check (
    bucket_id = 'product-images'
    and public.is_admin()
    and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png', 'webp')
    and lower(coalesce(metadata->>'mimetype', '')) in ('image/jpeg', 'image/png', 'image/webp')
    and coalesce((metadata->>'size')::bigint, 0) <= 5242880
  );

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());
