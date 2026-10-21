-- AMTECH GLOBAL SOLUTION SERVICES — initial schema
-- Replaces base44's hosted entities (Product, Category, Lead, BlogPost) and
-- auth role model with plain Postgres tables + Row Level Security.
--
-- Run this once in the Supabase SQL Editor (Project → SQL Editor → New query),
-- or apply via `supabase db push` if you use the Supabase CLI locally.

-- ─────────────────────────────────────────────────────────────────────────
-- profiles (role bootstrap — Supabase auth.users has no custom role column)
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles_update_admin"
  on public.profiles for update
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper used by every policy below
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- categories
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  sort_order integer not null default 0,
  created_date timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_public_read" on public.categories
  for select using (is_active = true or public.is_admin());
create policy "categories_admin_write" on public.categories
  for insert with check (public.is_admin());
create policy "categories_admin_update" on public.categories
  for update using (public.is_admin());
create policy "categories_admin_delete" on public.categories
  for delete using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- products
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id text,
  short_description text,
  technical_description text,
  applications text,
  grade text,
  purity text,
  country_of_origin text,
  packaging_sizes text[] default '{}',
  minimum_order_qty integer,
  price_mode text default 'quote',
  price numeric,
  price_min numeric,
  price_max numeric,
  stock_status text default 'in_stock',
  images text[] default '{}',
  available_colors text[] default '{}',
  tags text[] default '{}',
  is_featured boolean not null default false,
  is_active boolean not null default true,
  seo_title text,
  seo_description text,
  supplier_name text,
  cost_price numeric,
  warehouse_location text,
  machine_type text,
  production_capacity text,
  sds_url text,
  tds_url text,
  created_date timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products_public_read" on public.products
  for select using (is_active = true or public.is_admin());
create policy "products_admin_write" on public.products
  for insert with check (public.is_admin());
create policy "products_admin_update" on public.products
  for update using (public.is_admin());
create policy "products_admin_delete" on public.products
  for delete using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- leads (also doubles as "orders" when type = 'whatsapp_checkout')
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  reference_id text,
  customer_name text,
  customer_phone text,
  customer_email text,
  company_name text,
  delivery_state text,
  delivery_city text,
  notes text,
  items jsonb default '[]',
  estimated_total numeric,
  status text not null default 'new',
  whatsapp_message text,
  internal_notes text,
  activity_log jsonb default '[]',
  created_date timestamptz not null default now()
);

alter table public.leads enable row level security;

create policy "leads_public_insert" on public.leads
  for insert with check (true);
create policy "leads_admin_read" on public.leads
  for select using (public.is_admin());
create policy "leads_admin_update" on public.leads
  for update using (public.is_admin());
create policy "leads_admin_delete" on public.leads
  for delete using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- blog_posts
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  category text,
  is_published boolean not null default false,
  view_count integer not null default 0,
  seo_title text,
  seo_description text,
  created_date timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

create policy "blog_posts_public_read" on public.blog_posts
  for select using (is_published = true or public.is_admin());
create policy "blog_posts_admin_write" on public.blog_posts
  for insert with check (public.is_admin());
create policy "blog_posts_admin_update" on public.blog_posts
  for update using (public.is_admin());
create policy "blog_posts_admin_delete" on public.blog_posts
  for delete using (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- storage: product-images bucket (products, categories, blog covers)
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_public_read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product_images_admin_insert" on storage.objects
  for insert with check (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_update" on storage.objects
  for update using (bucket_id = 'product-images' and public.is_admin());
create policy "product_images_admin_delete" on storage.objects
  for delete using (bucket_id = 'product-images' and public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────
-- Bootstrap: after you register your first account through the site's
-- /register page, run this once (with your email) to make it an admin:
--
--   update public.profiles set role = 'admin' where email = 'you@example.com';
-- ─────────────────────────────────────────────────────────────────────────
