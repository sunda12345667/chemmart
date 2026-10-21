-- Keep confidential procurement/inventory details out of direct browser table
-- reads while preserving the existing product schema and data. The view is a
-- controlled public projection; its owner runs the query and explicit filters
-- below preserve the existing public visibility rules.
create or replace view public.product_catalog
with (security_barrier = true)
as
select
  p.id,
  p.name,
  p.slug,
  p.category_id,
  p.short_description,
  p.technical_description,
  p.applications,
  p.grade,
  p.purity,
  p.country_of_origin,
  p.packaging_sizes,
  p.minimum_order_qty,
  p.price_mode,
  p.price,
  p.price_min,
  p.price_max,
  p.stock_status,
  p.images,
  p.available_colors,
  p.tags,
  p.is_featured,
  p.is_active,
  p.seo_title,
  p.seo_description,
  case when public.current_role() in ('admin', 'super_admin') then p.supplier_name else null end as supplier_name,
  case when public.current_role() in ('admin', 'super_admin') then p.cost_price else null end as cost_price,
  case when public.current_role() in ('admin', 'super_admin') then p.warehouse_location else null end as warehouse_location,
  p.machine_type,
  p.production_capacity,
  p.sds_url,
  p.tds_url,
  p.created_date,
  p.sku,
  p.brand,
  p.stock_quantity,
  p.low_stock_threshold,
  p.allow_backorders,
  p.product_type,
  p.specifications,
  p.deleted_at,
  p.updated_at
from public.products p
where (p.is_active = true and p.deleted_at is null) or public.is_admin();

-- Do not expose the base table's all-column SELECT grant to either browser
-- role. Admin product management writes remain protected by table RLS.
revoke all on public.products from public, anon, authenticated;
grant select (id) on public.products to authenticated;
grant insert (name, slug, category_id, short_description, technical_description,
  applications, grade, purity, country_of_origin, packaging_sizes,
  minimum_order_qty, price_mode, price, price_min, price_max, stock_status,
  images, available_colors, tags, is_featured, is_active, seo_title,
  seo_description, supplier_name, cost_price, warehouse_location, machine_type,
  production_capacity, sds_url, tds_url, sku, brand, stock_quantity,
  low_stock_threshold, allow_backorders, product_type, specifications,
  deleted_at) on public.products to authenticated;
grant update (name, slug, category_id, short_description, technical_description,
  applications, grade, purity, country_of_origin, packaging_sizes,
  minimum_order_qty, price_mode, price, price_min, price_max, stock_status,
  images, available_colors, tags, is_featured, is_active, seo_title,
  seo_description, supplier_name, cost_price, warehouse_location, machine_type,
  production_capacity, sds_url, tds_url, sku, brand, stock_quantity,
  low_stock_threshold, allow_backorders, product_type, specifications,
  deleted_at) on public.products to authenticated;
grant delete on public.products to authenticated;
grant select on public.product_catalog to anon, authenticated;

-- Existing product APIs do not depend on returned row payloads for writes;
-- view reads are handled by the app's entity adapter.
