-- Pre-launch RLS hardening.
--
-- The anon key is shipped in the browser bundle by design, so every one of these
-- policies was reachable by any anonymous visitor on the internet. Each fix below
-- was checked against the actual call sites first: the embed widget
-- (public/osciva-chat.js) talks ONLY to the chat edge function, which uses the
-- service role and returns a safe subset of fields, and every page that touches
-- these tables sits behind ProtectedRoute. So none of this is load-bearing for
-- anonymous traffic.

-- 1) KNOWLEDGE BASE POISONING (critical)
-- "Anyone can insert" with CHECK (true) let any anonymous caller write rows into
-- ANY agent's knowledge base. Because the chat function retrieves chunks by
-- similarity and feeds them to the model, an attacker could put words in a
-- business's assistant's mouth for its real customers. Ingestion happens from the
-- authenticated dashboard (AgentContext.tsx) and from the ingest function (service
-- role, bypasses RLS), so scope the policy to the owner.
drop policy if exists "Anyone can insert chunks" on public.agent_chunks;
create policy "Owner inserts chunks via agent" on public.agent_chunks
  for insert to authenticated
  with check (exists (
    select 1 from public.agents a
    where a.id = agent_chunks.agent_id and a.user_id = auth.uid()
  ));

drop policy if exists "Anyone can insert sources" on public.agent_sources;
create policy "Owner inserts own sources" on public.agent_sources
  for insert to authenticated
  with check (auth.uid() = user_id);

-- 2) AGENT CONFIG DISCLOSURE (high)
-- "Public can read active agents" exposed every column of every active agent to
-- anonymous callers: `instructions` (the full system prompt, which is the
-- business's IP), `user_id`, and the security posture itself — `domains`,
-- `password_enabled`, `rate_limit_enabled`, `rate_limit_per_hour` — which is
-- reconnaissance for picking an undefended target. The widget never reads this
-- table; it gets name/colour/welcome/icon/logo/suggestions from the chat
-- function's GET handler instead. Owners keep their own access via the separate
-- "Users select own agents" policy.
drop policy if exists "Public can read active agents" on public.agents;

-- 3) ANALYTICS FORGERY (medium)
-- INSERT had CHECK (true) and UPDATE had USING (true) for anon, so anyone could
-- fabricate or overwrite ANY user's analytics rows. The dashboard writes these as
-- an authenticated user and already has owner-scoped policies; the chat function
-- writes them with the service role.
drop policy if exists "Anyone can insert stats" on public.daily_stats;
drop policy if exists "Anyone can update stats" on public.daily_stats;

-- 4) CUSTOMER LIST DISCLOSURE (medium)
-- USING (true) meant any signed-up user — and signup is free and self-serve —
-- could read every row of profiles: every customer's name, plan, and crucially
-- is_admin, which hands an attacker a target list of privileged accounts.
-- The admin console does not depend on this: it reads users through
-- admin_list_users(), a SECURITY DEFINER function gated by assert_admin().
drop policy if exists "Profiles viewable by authenticated users" on public.profiles;
create policy "Users read own profile" on public.profiles
  for select to authenticated
  using (auth.uid() = user_id);
