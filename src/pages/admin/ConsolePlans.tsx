import { useQuery } from "@tanstack/react-query";
import { ArrowRight, History } from "lucide-react";
import { adminRpc, AdminStats, PlanChange, inr, planBadgeClass } from "./adminRpc";
import { Card, EmptyState, PageHead, TableWrap, Td, Th } from "./components";

const TIERS = [
  {
    key: "free",
    name: "Free",
    price: "₹0",
    cadence: "forever · monthly reset",
    limits: [
      ["Agents", "{agent_limit_free}"],
      ["Messages/mo", "50 (platform key)"],
      ["Documents", "1 MB"],
      ["Website indexing", "—"],
    ],
  },
  {
    key: "starter",
    name: "Starter",
    price: inr(999),
    cadence: "per month",
    limits: [
      ["Agents", "{agent_limit_starter}"],
      ["Messages/mo", "Unlimited (BYOK)"],
      ["Documents", "5 MB"],
      ["Website indexing", "7 pages"],
    ],
  },
  {
    key: "growth",
    name: "Growth",
    price: inr(2499),
    cadence: "per month",
    popular: true,
    limits: [
      ["Agents", "{agent_limit_growth}"],
      ["Messages/mo", "Unlimited (BYOK)"],
      ["Documents", "10 MB"],
      ["Website indexing", "15 pages"],
    ],
  },
];

export default function ConsolePlans() {
  const stats = useQuery({
    queryKey: ["ac-stats"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_get_stats");
      if (error) throw new Error(error.message);
      return data as AdminStats;
    },
  });
  const settings = useQuery({
    queryKey: ["ac-settings"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_get_settings");
      if (error) throw new Error(error.message);
      return (data ?? {}) as Record<string, string>;
    },
  });
  const changes = useQuery({
    queryKey: ["ac-plan-changes"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_list_plan_changes", { p_limit: 20 });
      if (error) throw new Error(error.message);
      return (data ?? []) as PlanChange[];
    },
  });

  const s = stats.data;
  const orgCount: Record<string, number | undefined> = {
    free: s?.plan_free,
    starter: s?.plan_starter,
    growth: s?.plan_growth,
  };

  return (
    <div className="space-y-5">
      <PageHead
        title="Plans & Subscriptions"
        subtitle="Pricing tiers and plan changes · limits are enforced server-side"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((t) => (
          <div key={t.key} className={`relative rounded-2xl border bg-card p-5 ${t.popular ? "border-primary" : "border-border"}`}>
            {t.popular && (
              <span className="absolute -top-2.5 left-5 text-[10px] font-bold uppercase tracking-wide bg-primary text-white px-2.5 py-0.5 rounded-full">
                Most popular
              </span>
            )}
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-[14px] font-bold text-foreground">{t.name}</h3>
              <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${planBadgeClass[t.key]}`}>
                {stats.isLoading ? "…" : `${orgCount[t.key] ?? 0} accounts`}
              </span>
            </div>
            <div className="mb-4">
              <span className="text-2xl font-extrabold text-foreground display">{t.price}</span>
              <span className="text-[11.5px] text-foreground-muted ml-1.5">{t.cadence}</span>
            </div>
            <div className="space-y-2">
              {t.limits.map(([k, v]) => {
                const resolved = v.startsWith("{")
                  ? settings.data?.[v.slice(1, -1)] ?? "…"
                  : v;
                return (
                  <div key={k} className="flex items-center justify-between text-[12.5px]">
                    <span className="text-foreground-muted">{k}</span>
                    <span className="font-medium text-foreground">{resolved}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 pt-3 border-t border-border text-[11px] text-foreground-muted leading-relaxed">
              Agent limits are editable in Platform settings and enforce instantly. Other limits live in the chat
              function and need a deploy to change.
            </p>
          </div>
        ))}
      </div>

      <Card title="Recent plan changes" subtitle="Upgrades, downgrades & manual changes — logged automatically">
        {changes.isLoading ? (
          <div className="h-32 rounded-xl bg-secondary animate-pulse" />
        ) : (changes.data ?? []).length === 0 ? (
          <EmptyState
            icon={History}
            title="No plan changes logged yet"
            note="Every plan change from the Users table (or SQL) is recorded here from now on, with who changed it and when."
          />
        ) : (
          <TableWrap>
            <thead>
              <tr>
                <Th first>Account</Th>
                <Th>Change</Th>
                <Th>By</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {(changes.data ?? []).map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0">
                  <Td first>
                    <p className="font-semibold text-foreground truncate max-w-[220px]">{c.name || c.email.split("@")[0]}</p>
                    <p className="text-[11px] text-foreground-muted truncate max-w-[220px]">{c.email}</p>
                  </Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${planBadgeClass[c.old_plan ?? "free"] ?? planBadgeClass.free}`}>
                        {c.old_plan ?? "—"}
                      </span>
                      <ArrowRight size={12} className="text-foreground-muted" />
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${planBadgeClass[c.new_plan] ?? planBadgeClass.free}`}>
                        {c.new_plan}
                      </span>
                    </span>
                  </Td>
                  <Td className="text-foreground-secondary truncate max-w-[180px]">{c.changed_by_email ?? "system"}</Td>
                  <Td className="text-foreground-muted whitespace-nowrap">
                    {new Date(c.changed_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
}
