-- agents.logo_url was added by hand on the original project and never captured in a
-- migration, so a rebuild from empty came up missing it. That also broke the admin
-- console at runtime: get_admin_agents/list_agents_admin both select a.logo_url.
--
-- 20260622120000_agent_logos_storage.sql already refers to it as an "existing column",
-- which is why the gap went unnoticed. Idempotent, so it is safe on projects that
-- already have the column.
alter table public.agents add column if not exists logo_url text;
