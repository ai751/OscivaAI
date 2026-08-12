import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, History, IndianRupee, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { adminRpc, AdminStats, PlanChange, inr, planBadgeClass } from "./adminRpc";
import { Card, EmptyState, PageHead, TableWrap, Td, Th } from "./components";
import { DEFAULT_PRICING, PRICING_KEYS, formatINR, pricingFromSettings } from "@/hooks/usePricing";

// "{price_growth_monthly}" style tokens are resolved from platform_settings at
// render time, so these cards always show what the public site is showing.
const TIERS = [
  {
    key: "free",
    name: "Free",
    priceKey: null,
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
    priceKey: PRICING_KEYS.starterMonthly,
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
    priceKey: PRICING_KEYS.growthMonthly,
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

// The four editable amounts. Yearly is the per-month price when billed annually,
// which is how the public pricing page presents it.
const PRICE_FIELDS: { key: string; plan: string; label: string; hint: string; fallback: number }[] = [
  {
    key: PRICING_KEYS.starterMonthly,
    plan: "Starter",
    label: "Monthly",
    hint: "Charged every month",
    fallback: DEFAULT_PRICING.starterMonthly,
  },
  {
    key: PRICING_KEYS.starterYearly,
    plan: "Starter",
    label: "Yearly",
    hint: "Per month, billed annually",
    fallback: DEFAULT_PRICING.starterYearly,
  },
  {
    key: PRICING_KEYS.growthMonthly,
    plan: "Growth",
    label: "Monthly",
    hint: "Charged every month",
    fallback: DEFAULT_PRICING.growthMonthly,
  },
  {
    key: PRICING_KEYS.growthYearly,
    plan: "Growth",
    label: "Yearly",
    hint: "Per month, billed annually",
    fallback: DEFAULT_PRICING.growthYearly,
  },
];

export default function ConsolePlans() {
  const queryClient = useQueryClient();
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

  // Local edits stay in draft until saved, so a half-typed number never reaches
  // the public site.
  const [draft, setDraft] = useState<Record<string, string>>({});
  useEffect(() => {
    if (settings.data) setDraft(settings.data);
  }, [settings.data]);

  const savePrice = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await adminRpc("admin_set_setting", { p_key: key, p_value: value });
      if (error) throw new Error(error.message);
    },
    onError: (err) => toast.error(`Couldn't save: ${err.message}`),
    onSuccess: (_d, { key, value }) => {
      const field = PRICE_FIELDS.find((f) => f.key === key);
      toast.success(
        `${field ? `${field.plan} ${field.label.toLowerCase()}` : key} is now ${formatINR(Number(value))} — live on the public pricing page`,
      );
      queryClient.invalidateQueries({ queryKey: ["ac-settings"] });
      queryClient.invalidateQueries({ queryKey: ["public-pricing"] });
    },
  });

  const livePricing = pricingFromSettings(settings.data);
  const savedValue = (key: string) => settings.data?.[key];
  const dirty = (key: string) => settings.data && draft[key] !== undefined && draft[key] !== savedValue(key);
  const invalid = (key: string) => {
    const v = draft[key];
    if (v === undefined || v === "") return true;
    return !/^\d+$/.test(v) || Number(v) > 1000000;
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
              <span className="text-2xl font-extrabold text-foreground display">
                {t.priceKey ? formatINR(Number(settings.data?.[t.priceKey] ?? 0)) : inr(0)}
              </span>
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

      <Card
        title="Edit pricing"
        subtitle="Saved prices go live immediately on the public pricing page, the landing page and the upgrade prompts"
      >
        {settings.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-secondary animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRICE_FIELDS.map((f) => {
                const bad = invalid(f.key);
                const changed = dirty(f.key);
                return (
                  <div key={f.key} className="p-3 rounded-xl bg-secondary/40 border border-border/60">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-[12.5px] font-semibold text-foreground">
                          {f.plan} · {f.label}
                        </p>
                        <p className="text-[11px] text-foreground-muted">{f.hint}</p>
                      </div>
                      {changed && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-primary">Unsaved</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <IndianRupee
                          size={13}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted pointer-events-none"
                        />
                        <input
                          type="number"
                          min={0}
                          max={1000000}
                          step={1}
                          value={draft[f.key] ?? ""}
                          aria-label={`${f.plan} ${f.label} price in rupees`}
                          onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && changed && !bad) savePrice.mutate({ key: f.key, value: draft[f.key] });
                          }}
                          className={`w-full pl-7 pr-2.5 py-1.5 rounded-lg border bg-background text-[13px] text-foreground tabular-nums focus:outline-none focus:ring-2 ${
                            bad ? "border-destructive focus:ring-destructive/30" : "border-border focus:ring-primary/30"
                          }`}
                        />
                      </div>
                      <button
                        disabled={!changed || bad || savePrice.isPending}
                        onClick={() => savePrice.mutate({ key: f.key, value: draft[f.key] })}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white text-[11.5px] font-semibold hover:bg-[#e05f40] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Save
                      </button>
                      {changed && (
                        <button
                          title="Discard this change"
                          onClick={() => setDraft((d) => ({ ...d, [f.key]: savedValue(f.key) ?? String(f.fallback) }))}
                          className="p-1.5 rounded-lg border border-border text-foreground-muted hover:text-foreground transition-colors"
                        >
                          <RotateCcw size={13} />
                        </button>
                      )}
                    </div>
                    <p className="mt-2 text-[11px] text-foreground-muted">
                      {bad ? (
                        <span className="text-destructive font-medium">
                          Enter a whole number between 0 and 10,00,000
                        </span>
                      ) : (
                        <>
                          Shows publicly as{" "}
                          <span className="font-semibold text-foreground">{formatINR(Number(draft[f.key] ?? 0))}</span>
                          {f.label === "Yearly" ? "/mo billed yearly" : "/month"}
                        </>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 pt-3 border-t border-border text-[11px] text-foreground-muted leading-relaxed">
              Prices are display-only — they are what customers see, not what enforces access. Plan limits (agents,
              documents, models) are enforced separately by the database and the chat function, so changing a price
              never changes what a plan can do. Existing subscribers are not re-billed; upgrades are still manual.
              Live now: Starter {formatINR(livePricing.starterMonthly)}/mo · Growth{" "}
              {formatINR(livePricing.growthMonthly)}/mo.
            </p>
          </>
        )}
      </Card>

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
