import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { adminRpc } from "./adminRpc";
import { Card, PageHead, TableWrap, Td, Th } from "./components";

const EDITABLE_LIMITS: { key: string; label: string }[] = [
  { key: "agent_limit_free", label: "Agent limit — Free plan" },
  { key: "agent_limit_starter", label: "Agent limit — Starter plan" },
  { key: "agent_limit_growth", label: "Agent limit — Growth plan" },
];

const STATIC_LIMITS: [string, string][] = [
  ["Free plan message quota", "50 / mo (platform key, monthly reset — enforced in the chat function)"],
  ["Default widget rate limit", "20 req/hour per visitor (editable per agent in Agents oversight)"],
  ["Document size — Free / Starter / Growth", "1 MB / 5 MB / 10 MB"],
  ["Website indexing — Free / Starter / Growth", "0 / 7 / 15 pages"],
  ["Trial period", "None — free tier is free forever"],
];

interface StatusCheck {
  name: string;
  ok: boolean;
  detail: string;
}

async function runStatusChecks(): Promise<StatusCheck[]> {
  const checks: StatusCheck[] = [];

  // Database: any RLS-safe query proves Postgres + PostgREST are up.
  try {
    const t0 = performance.now();
    const { error } = await supabase.from("profiles").select("id", { head: true, count: "exact" }).limit(1);
    const ms = Math.round(performance.now() - t0);
    checks.push({ name: "Database (Postgres + API)", ok: !error, detail: error ? error.message : `Responding in ${ms}ms` });
  } catch (e) {
    checks.push({ name: "Database (Postgres + API)", ok: false, detail: String(e) });
  }

  // Auth service.
  try {
    const { error } = await supabase.auth.getSession();
    checks.push({ name: "Auth service", ok: !error, detail: error ? error.message : "Session service reachable" });
  } catch (e) {
    checks.push({ name: "Auth service", ok: false, detail: String(e) });
  }

  // Chat edge function: any HTTP response (even 400 without agent_id) = deployed & reachable.
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
    const t0 = performance.now();
    const res = await fetch(url, { method: "GET" });
    const ms = Math.round(performance.now() - t0);
    checks.push({
      name: "Chat edge function (widget delivery)",
      ok: res.status < 500,
      detail: res.status < 500 ? `Deployed · responding in ${ms}ms` : `HTTP ${res.status}`,
    });
  } catch (e) {
    checks.push({ name: "Chat edge function (widget delivery)", ok: false, detail: String(e) });
  }

  return checks;
}

export default function ConsoleSettings() {
  const queryClient = useQueryClient();
  const status = useQuery({
    queryKey: ["ac-status"],
    queryFn: runStatusChecks,
    refetchInterval: 60_000,
  });

  const settings = useQuery({
    queryKey: ["ac-settings"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_get_settings");
      if (error) throw new Error(error.message);
      return (data ?? {}) as Record<string, string>;
    },
  });

  const [draft, setDraft] = useState<Record<string, string>>({});
  useEffect(() => {
    if (settings.data) setDraft(settings.data);
  }, [settings.data]);

  const saveSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await adminRpc("admin_set_setting", { p_key: key, p_value: value });
      if (error) throw new Error(error.message);
    },
    onError: (err) => toast.error(`Save failed: ${err.message}`),
    onSuccess: (_d, { key, value }) => {
      toast.success(`${key.replace(/_/g, " ")} set to ${value} — enforced immediately`);
      queryClient.invalidateQueries({ queryKey: ["ac-settings"] });
    },
  });

  const dirty = (key: string) => settings.data && draft[key] !== undefined && draft[key] !== settings.data[key];

  return (
    <div className="space-y-5">
      <PageHead title="Platform settings" subtitle="Keys, limits & system status" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Model provider keys" subtitle="How model access works on Osciva">
          <TableWrap>
            <thead>
              <tr>
                <Th first>Provider</Th>
                <Th>Key</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/60">
                <Td first className="font-medium text-foreground">OpenAI (free tier)</Td>
                <Td className="text-foreground-muted font-mono text-[11px]">OSCIVA_FREE_OPENAI_KEY · edge secret</Td>
                <Td>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary text-foreground-secondary">
                    Server-side only
                  </span>
                </Td>
              </tr>
              <tr>
                <Td first className="font-medium text-foreground">All providers (paid tiers)</Td>
                <Td className="text-foreground-muted">Customers bring their own keys (BYOK)</Td>
                <Td>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-success/10 text-success">
                    Per-account
                  </span>
                </Td>
              </tr>
            </tbody>
          </TableWrap>
          <p className="text-[11px] text-foreground-muted mt-4 flex items-start gap-1.5">
            <KeyRound size={12} className="shrink-0 mt-0.5" />
            Platform keys are Supabase edge-function secrets and are never readable from the browser — manage them in
            the Supabase dashboard under Edge Functions → Secrets.
          </p>
        </Card>

        <Card title="System status" subtitle="Live checks, refreshed every minute" actions={
          <button
            onClick={() => status.refetch()}
            className="text-[11.5px] text-foreground-muted hover:text-primary transition-colors font-semibold"
          >
            Re-check now
          </button>
        }>
          {status.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {(status.data ?? []).map((c) => (
                <div key={c.name} className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/40">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${c.ok ? "bg-success" : "bg-destructive"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-semibold text-foreground">{c.name}</p>
                    <p className="text-[11px] text-foreground-muted truncate">{c.detail}</p>
                  </div>
                  <span className={`text-[11px] font-semibold ${c.ok ? "text-success" : "text-destructive"}`}>
                    {c.ok ? "Operational" : "Down"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card title="Global platform limits" subtitle="Agent limits are editable and enforced instantly by the database — no deploy needed">
        <div className="space-y-2.5 mb-5">
          {EDITABLE_LIMITS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/40">
              <span className="text-[13px] font-medium text-foreground">{label}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={draft[key] ?? ""}
                  disabled={settings.isLoading}
                  onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                  className="w-20 px-2.5 py-1.5 rounded-lg border border-border bg-background text-[13px] text-foreground text-center tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button
                  disabled={!dirty(key) || saveSetting.isPending}
                  onClick={() => saveSetting.mutate({ key, value: draft[key] })}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11.5px] font-semibold hover:bg-[#e05f40] transition-colors disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </div>
          ))}
        </div>
        <TableWrap>
          <thead>
            <tr>
              <Th first>Fixed limit</Th>
              <Th>Value</Th>
            </tr>
          </thead>
          <tbody>
            {STATIC_LIMITS.map(([k, v]) => (
              <tr key={k} className="border-b border-border/60 last:border-0">
                <Td first className="font-medium text-foreground">{k}</Td>
                <Td className="text-foreground-secondary">{v}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
        <p className="text-[11px] text-foreground-muted mt-4">
          Fixed limits live in the chat function / client code and need a deploy to change — kept read-only here so
          this page never shows a value that isn't actually enforced.
        </p>
      </Card>

      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert size={16} className="text-destructive" />
          <h3 className="text-[14px] font-bold text-foreground">Danger zone</h3>
        </div>
        <p className="text-[12.5px] text-foreground-secondary leading-relaxed mb-4">
          Platform-wide actions like maintenance mode and force-logout aren't wired up yet. They need a
          platform_settings table checked by the app shell and chat function — ask for them when you need them.
        </p>
        <div className="flex flex-wrap gap-2">
          <button disabled title="Not implemented yet" className="px-4 py-2 rounded-xl border border-border text-[12.5px] font-semibold text-foreground-muted cursor-not-allowed">
            Put platform in maintenance mode
          </button>
          <button disabled title="Not implemented yet" className="px-4 py-2 rounded-xl border border-border text-[12.5px] font-semibold text-foreground-muted cursor-not-allowed">
            Force logout all sessions
          </button>
        </div>
      </div>
    </div>
  );
}
