-- Apply this once in Supabase SQL Editor to an existing project.
-- Public visitors may submit new leads, but cannot forge admin-managed statuses.
DROP POLICY IF EXISTS "Public can insert leads" ON public.leads;
CREATE POLICY "Public can insert leads" ON public.leads
    FOR INSERT TO anon, authenticated
    WITH CHECK (status = 'pending');
