# AMTECH Global Solution Services

Website and admin dashboard for AMTECH GLOBAL SOLUTION SERVICES — engineering,
equipment and contracting solutions covering water treatment, borehole
drilling, plumbing and fitting, equipment supply, building supervision,
NAFDAC consultancy and general contracting.

**Stack:** React + Vite, Tailwind CSS, [Supabase](https://supabase.com)
(Postgres database, auth, and file storage).

## Local development

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and set your Supabase project's URL and
   anon/publishable key. The application is pinned to the AMTECH project
   `https://cxgxwfsssrbuvwfrrsne.supabase.co` and rejects a different project URL:

   ```
   VITE_SUPABASE_URL=https://cxgxwfsssrbuvwfrrsne.supabase.co
   VITE_SUPABASE_ANON_KEY=your_publishable_key
   SUPABASE_URL=https://cxgxwfsssrbuvwfrrsne.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
   ```

3. Apply the database schema: run `supabase/migrations/0001_init.sql` in
   your project's Supabase SQL Editor (or via `supabase db push` if you use
   the Supabase CLI).
4. Run the app: `npm run dev`

## Admin access

Admin access is enforced by PostgreSQL RLS as well as the frontend route guards.
The bootstrap account configured in migration `0002_admin_operations.sql` is
`amtechglobalsolution2010@gmail.com`. Confirm that account exists and is
controlled by the intended administrator before executing that migration.
Never promote users through browser-side SQL or an ordinary admin account.
Admin routes live under `/admin`.

## Production release checklist

1. Create/use a non-production Supabase project for preview. Review the live schema
   and policies first; take a backup before applying SQL. Apply migrations in order:
   `0001_init.sql` through `0006_company_settings_confidentiality.sql`. Do not run
   these migrations against production until the owner explicitly approves them.
   Migrations `0004`–`0006` include new server-side form submission, rate limiting,
   restricted product projections, and settings access changes and require review.
2. Confirm the intended super-admin account exists before applying migration `0002`;
   verify the role afterward in Supabase. Never expose a service-role key in frontend
   code, a `VITE_*` variable, or logs.
3. Set these Vercel environment variables for both Preview and Production:
   `VITE_SUPABASE_URL=https://cxgxwfsssrbuvwfrrsne.supabase.co` and
   `VITE_SUPABASE_ANON_KEY` (browser publishable key). For
   `/api/public-submissions`, also set server-only
   `SUPABASE_URL=https://cxgxwfsssrbuvwfrrsne.supabase.co` and
   `SUPABASE_SERVICE_ROLE_KEY`. Never use a `VITE_` prefix for the service-role
   key. The API and browser client reject a URL for any other Supabase project.
4. Configure Supabase Auth Site URL and redirect allowlist for the preview domain,
   `/reset-password`, and OAuth callback if Google sign-in is enabled. Enable MFA
   for the super-admin account.
5. Deploy a Vercel Preview only after those environment variables and the reviewed
   staging migrations are in place. Test direct route refresh, sign-in/reset,
   anonymous form rate limiting, product uploads, and admin workflows in preview.
   Promote to Production only after explicit approval and a separate production
   migration/backup review. WhoGoHost DNS changes are a separate manual step.
