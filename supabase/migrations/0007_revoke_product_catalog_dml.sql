-- product_catalog is an automatically updatable, owner-privileged view.
-- Public catalogue clients need SELECT only; product writes go through the
-- administrator-authorized public.products table policies.
revoke all privileges
  on table public.product_catalog
  from anon, authenticated;

grant select
  on table public.product_catalog
  to anon, authenticated;

-- Rollback (restores the live grants observed before this migration):
-- grant all privileges on table public.product_catalog to anon, authenticated;
