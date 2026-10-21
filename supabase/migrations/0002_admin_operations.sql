-- Operational admin features. Apply after 0001_init.sql.
-- This migration extends the existing storefront tables; it does not replace them.

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone text,
  add column if not exists is_disabled boolean not null default false;

-- Existing `admin` values remain valid. New values allow least-privilege access.
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('user', 'staff', 'admin', 'super_admin'));

create or replace function public.current_role()
returns text language sql security definer set search_path = public stable as $$
  select role from public.profiles where id = auth.uid() and is_disabled = false
$$;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce(public.current_role() in ('admin', 'super_admin'), false)
$$;

create or replace function public.is_staff()
returns boolean language sql security definer set search_path = public stable as $$
  select coalesce(public.current_role() in ('staff', 'admin', 'super_admin'), false)
$$;

-- Replace the original policy, which queried profiles from within a profiles
-- policy and therefore caused PostgreSQL RLS recursion on sign-in.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

alter table public.products
  add column if not exists sku text,
  add column if not exists brand text,
  add column if not exists stock_quantity integer not null default 0,
  add column if not exists low_stock_threshold integer not null default 5,
  add column if not exists allow_backorders boolean not null default false,
  add column if not exists product_type text not null default 'physical',
  add column if not exists specifications jsonb not null default '[]'::jsonb,
  add column if not exists deleted_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();
create unique index if not exists products_sku_unique on public.products(sku) where sku is not null;
alter table public.products drop constraint if exists products_product_type_check;
alter table public.products add constraint products_product_type_check check (product_type in ('physical','service','quote_only'));

-- Do not reveal deleted products through public reads.
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products for select
  using ((is_active = true and deleted_at is null) or public.is_admin());

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  category text, description text, image_url text, is_active boolean not null default true,
  deleted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.services enable row level security;
drop policy if exists "services public read" on public.services;
create policy "services public read" on public.services for select using ((is_active and deleted_at is null) or public.is_admin());
drop policy if exists "services staff write" on public.services;
create policy "services staff write" on public.services for all using (public.is_staff()) with check (public.is_staff());

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), order_number text not null unique,
  customer_id uuid references public.profiles(id), customer_name text, customer_email text, customer_phone text,
  delivery_address text, items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0, discount numeric not null default 0, delivery_fee numeric not null default 0,
  tax numeric not null default 0, total numeric not null default 0,
  payment_status text not null default 'pending', order_status text not null default 'pending',
  admin_notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
drop policy if exists "orders customer own or staff" on public.orders;
create policy "orders customer own or staff" on public.orders for select using (customer_id = auth.uid() or public.is_staff());
drop policy if exists "orders customer create" on public.orders;
create policy "orders customer create" on public.orders for insert with check (customer_id = auth.uid() or customer_id is null);
drop policy if exists "orders staff update" on public.orders;
create policy "orders staff update" on public.orders for update using (public.is_staff()) with check (public.is_staff());

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(), request_number text not null unique,
  customer_id uuid references public.profiles(id), customer_name text, customer_email text, customer_phone text,
  service_id uuid references public.services(id), service_name text, location text, details text,
  attachment_urls text[] not null default '{}', status text not null default 'new', assigned_to uuid references public.profiles(id),
  internal_notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.service_requests enable row level security;
drop policy if exists "service requests customer or staff" on public.service_requests;
create policy "service requests customer or staff" on public.service_requests for select using (customer_id = auth.uid() or public.is_staff());
drop policy if exists "service requests public submit" on public.service_requests;
create policy "service requests public submit" on public.service_requests for insert with check (true);
drop policy if exists "service requests staff update" on public.service_requests;
create policy "service requests staff update" on public.service_requests for update using (public.is_staff()) with check (public.is_staff());

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(), quote_number text not null unique,
  customer_name text, customer_email text, customer_phone text, items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0, discount numeric not null default 0, delivery_fee numeric not null default 0,
  total numeric not null default 0, notes text, valid_until date, status text not null default 'draft', created_at timestamptz not null default now()
);
alter table public.quotes enable row level security;
drop policy if exists "quotes staff only" on public.quotes;
create policy "quotes staff only" on public.quotes for all using (public.is_staff()) with check (public.is_staff());

create table if not exists public.company_settings (
  id boolean primary key default true check (id), company_name text not null default 'AMTECH GLOBAL SOLUTION SERVICES',
  logo_url text, email text, phone text, whatsapp text, address text, business_hours text,
  currency text not null default 'NGN', tax_rate numeric not null default 0, delivery_settings jsonb not null default '{}'::jsonb,
  social_links jsonb not null default '{}'::jsonb, content jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);
alter table public.company_settings enable row level security;
drop policy if exists "settings public read" on public.company_settings;
create policy "settings public read" on public.company_settings for select using (true);
drop policy if exists "settings super admin write" on public.company_settings;
create policy "settings super admin write" on public.company_settings for all using (public.current_role() = 'super_admin') with check (public.current_role() = 'super_admin');
insert into public.company_settings (id) values (true) on conflict (id) do nothing;

create table if not exists public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid references public.profiles(id), action text not null,
  entity_type text not null, entity_id text, before_data jsonb, after_data jsonb, created_at timestamptz not null default now()
);
alter table public.audit_logs enable row level security;
drop policy if exists "audit super admin read" on public.audit_logs;
create policy "audit super admin read" on public.audit_logs for select using (public.current_role() = 'super_admin');
drop policy if exists "audit staff insert" on public.audit_logs;
create policy "audit staff insert" on public.audit_logs for insert with check (public.is_staff() and actor_id = auth.uid());

create or replace function public.audit_product_change() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and public.is_staff() then
    insert into public.audit_logs(actor_id, action, entity_type, entity_id, before_data, after_data)
    values (auth.uid(), lower(tg_op), 'product', coalesce(new.id, old.id)::text,
      case when tg_op = 'INSERT' then null else to_jsonb(old) end,
      case when tg_op = 'DELETE' then null else to_jsonb(new) end);
  end if;
  return coalesce(new, old);
end; $$;
drop trigger if exists audit_products on public.products;
create trigger audit_products after insert or update or delete on public.products for each row execute function public.audit_product_change();

-- Ensure an inventory update gives customers the correct availability immediately.
create or replace function public.sync_stock_status() returns trigger language plpgsql as $$
begin
  if new.product_type = 'quote_only' then return new; end if;
  new.stock_status := case when new.stock_quantity <= 0 then 'out_of_stock'
    when new.stock_quantity <= new.low_stock_threshold then 'low_stock' else 'in_stock' end;
  new.updated_at := now(); return new;
end; $$;
drop trigger if exists sync_product_stock_status on public.products;
create trigger sync_product_stock_status before insert or update of stock_quantity, low_stock_threshold, product_type on public.products for each row execute function public.sync_stock_status();

-- Initial production administrator. Change/remove this statement before applying
-- the migration if the deployment owner needs a different bootstrap account.
update public.profiles
set role = 'super_admin', is_disabled = false
where email = 'amtechglobalsolution2010@gmail.com';
