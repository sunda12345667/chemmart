-- Additive hardening for known public submission and storage paths.
-- Apply after 0003_security_hardening.sql only after reviewing the live policy
-- inventory. This migration does not alter or delete business records.

-- Public submissions must not be able to forge staff workflow fields, attach
-- requests to another customer's account, or submit unbounded payloads.
create or replace function public.sanitize_public_submission()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_table_name = 'leads' then
    if new.type not in ('whatsapp_checkout', 'bulk_quote', 'technical_inquiry', 'machine_sourcing', 'product_inquiry') then
      raise exception 'Unsupported lead type';
    end if;
    if length(coalesce(new.customer_name, '')) > 200
      or length(coalesce(new.customer_phone, '')) > 40
      or length(coalesce(new.customer_email, '')) > 320
      or length(coalesce(new.notes, '')) > 10000
      or coalesce(pg_column_size(new.items), 0) > 65536
      or jsonb_typeof(new.items) is distinct from 'array'
      or case when jsonb_typeof(new.items) = 'array' then jsonb_array_length(new.items) > 50 else false end then
      raise exception 'Submission exceeds allowed limits';
    end if;
    new.status := 'new';
    new.internal_notes := null;
    new.activity_log := '[]'::jsonb;
    new.created_date := now();
  elsif tg_table_name = 'service_requests' then
    if length(coalesce(new.customer_name, '')) > 200
      or length(coalesce(new.customer_phone, '')) > 40
      or length(coalesce(new.customer_email, '')) > 320
      or length(coalesce(new.details, '')) > 10000
      or cardinality(coalesce(new.attachment_urls, '{}'::text[])) > 5 then
      raise exception 'Submission exceeds allowed limits';
    end if;
    new.status := 'new';
    new.assigned_to := null;
    new.internal_notes := null;
    new.updated_at := now();
    new.created_at := now();
  end if;
  return new;
end;
$$;

-- Install sanitizers after the existing schema is present. Public API requests
-- use the server-only service key; direct browser inserts are removed below.
drop trigger if exists sanitize_public_leads on public.leads;
create trigger sanitize_public_leads
  before insert on public.leads
  for each row execute function public.sanitize_public_submission();

drop trigger if exists sanitize_public_service_requests on public.service_requests;
create trigger sanitize_public_service_requests
  before insert on public.service_requests
  for each row execute function public.sanitize_public_submission();

-- Enforce object size/type limits at the bucket boundary as well as in policies.
-- MIME metadata is still client-provided; use a trusted upload service to inspect
-- file bytes if content-sniffing is required.
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'product-images';

-- Public forms now submit through the Vercel serverless endpoint, which applies
-- IP-based rate limits before using the server-only Supabase service key.
-- Removing these policies prevents clients from bypassing that rate limiter.
drop policy if exists "leads_public_insert" on public.leads;
drop policy if exists "service requests public submit" on public.service_requests;
drop policy if exists "leads browser insert blocked" on public.leads;
create policy "leads browser insert blocked"
  on public.leads as restrictive for insert to anon, authenticated
  with check (false);
drop policy if exists "service requests browser insert blocked" on public.service_requests;
create policy "service requests browser insert blocked"
  on public.service_requests as restrictive for insert to anon, authenticated
  with check (false);

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.public_submission_limits (
  ip_hash text not null,
  form_type text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 0,
  primary key (ip_hash, form_type)
);
revoke all on private.public_submission_limits from public, anon, authenticated;

create or replace function public.check_public_submission_rate_limit(
  p_ip_hash text,
  p_form_type text
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, private
as $$
declare
  allowed boolean;
begin
  if p_ip_hash is null or length(p_ip_hash) <> 64
    or p_form_type not in ('lead', 'service_request') then
    return false;
  end if;

  delete from private.public_submission_limits
  where window_started_at < now() - interval '1 day';

  insert into private.public_submission_limits as limits
    (ip_hash, form_type, window_started_at, request_count)
  values (p_ip_hash, p_form_type, now(), 1)
  on conflict (ip_hash, form_type) do update
    set window_started_at = case
          when limits.window_started_at <= now() - interval '15 minutes' then now()
          else limits.window_started_at end,
        request_count = case
          when limits.window_started_at <= now() - interval '15 minutes' then 1
          else limits.request_count + 1 end
  returning request_count <= 5 into allowed;

  return allowed;
end;
$$;
revoke all on function public.check_public_submission_rate_limit(text, text) from public, anon, authenticated;
grant execute on function public.check_public_submission_rate_limit(text, text) to service_role;

-- Defensive policy refresh for the known migration-defined policies. Storage
-- policies validate path extension and declared MIME and require admin status.
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
