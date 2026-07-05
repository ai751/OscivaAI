import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Coins, Gauge, PieChart } from "lucide-react";
import {
  adminRpc, AdminAgent, AdminUser, FREE_MSG_QUOTA, inr, PLAN_PRICES, planBadgeClass,
} from "./adminRpc";
import { Card, PageHead, RowsSkeleton, StatCard, TableWrap, Td, Th } from "./components";

function providerOf(model: string): string {
  const m = model.toLowerCase();
  if (m.includes("gpt") || m.includes("o1") || m.includes("o3")) return "OpenAI";
  if (m.includes("claude")) return "Anthropic";
  if (m.includes("gemini")) return "Google";
  if (m.includes("llama") || m.includes("mistral") || m.includes("mixtral")) return "Open-source";
  return "Other";
}

export default function ConsoleUsage() {
  const users = useQuery({
    queryKey: ["ac-users"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_list_users");
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminUser[];
    },
  });
  const agents = useQuery({
    queryKey: ["ac-agents"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_list_agents");
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminAgent[];
    },
  });

  const quotaRisk = (users.data ?? []).filter((u) => u.plan === "free" && u.msgs_month >= FREE_MSG_QUOTA * 0.8);
  const topOrgs = useMemo(
    () => [...(users.data ?? [])].sort((a, b) => b.msgs_30d - a.msgs_30d).slice(0, 10),
    [users.data],
  );

  const providerBreakdown = useMemo(() => {
    const map = new Map<string, { agents: number; msgs: number }>();
    for (const a of agents.data ?? []) {
      const p = providerOf(a.model);
      const cur = map.get(p) ?? { agents: 0, msgs: 0 };
      cur.agents += 1;
      cur.msgs += a.message_count;
      map.set(p, cur);
    }
    const total = Math.max(1, [...map.values()].reduce((s, v) => s + v.msgs, 0));
    return [...map.entries()]
      .map(([provider, v]) => ({ provider, ...v, pct: Math.round((v.msgs / total) * 100) }))
      .sort((a, b) => b.msgs - a.msgs);
  }, [agents.data]);

  return (
    <div className="space-y-5">
      <PageHead
        title="Usage & Cost Monitoring"
        subtitle="Model spend vs revenue — this is what protects your margin"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total tokens (MTD)" value="—" sub="Enable token logging in the chat function" icon={Coins} tone="primary" />
        <StatCard label="Model cost (MTD)" value="—" sub="Derived from tokens once logged" icon={Gauge} tone="info" />
        <StatCard
          loading={users.isLoading}
          label="Free-quota messages (MTD)"
          value={(users.data ?? []).reduce((s, u) => s + u.msgs_month, 0).toLocaleString()}
          sub="On the platform key — your direct cost"
          icon={PieChart}
          tone="success"
        />
        <StatCard
          loading={users.isLoading}
          label="Accounts at quota risk"
          value={String(quotaRisk.length)}
          sub="Free plan · ≥80% of monthly quota"
          icon={AlertTriangle}
          tone="warning"
        />
      </div>

      <div className="rounded-2xl border border-border bg-primary/5 p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-[12.5px] text-foreground-secondary leading-relaxed">
          <span className="font-semibold text-foreground">Token logging isn't enabled yet.</span> Paid plans are BYOK
          (owners pay their own model bills), so your only direct model cost is the free tier's platform key. To see
          exact token counts and ₹ cost per account here, add a <code className="text-[11px] bg-secondary px-1.5 py-0.5 rounded">tokens_used</code> column
          to conversation logging in the chat function — it can't be backfilled, so the sooner the better.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Provider breakdown" subtitle="By messages handled per model provider (all-time)">
          {agents.isLoading ? (
            <div className="h-40 rounded-xl bg-secondary animate-pulse" />
          ) : providerBreakdown.length === 0 ? (
            <p className="text-[12.5px] text-foreground-muted py-6 text-center">No agents yet.</p>
          ) : (
            <div className="space-y-3.5">
              {providerBreakdown.map((row) => (
                <div key={row.provider}>
                  <div className="flex items-center justify-between text-[12.5px] mb-1">
                    <span className="text-foreground-secondary">{row.provider}</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {row.msgs.toLocaleString()} msgs
                      <span className="text-foreground-muted font-medium ml-1.5">{row.agents} agent(s)</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${row.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Top accounts by usage" subtitle="Quota consumption & revenue per account (30 days)" className="lg:col-span-2">
          <TableWrap>
            <thead>
              <tr>
                <Th first>Account</Th>
                <Th>Plan</Th>
                <Th>Quota used</Th>
                <Th>Msgs (30d)</Th>
                <Th>Est. cost</Th>
                <Th>Plan revenue</Th>
              </tr>
            </thead>
            <tbody>
              {users.isLoading ? (
                <RowsSkeleton cols={6} />
              ) : topOrgs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-[13px] text-foreground-muted">No accounts yet.</td>
                </tr>
              ) : (
                topOrgs.map((u) => {
                  const quotaPct = u.plan === "free" ? Math.min(100, Math.round((u.msgs_month / FREE_MSG_QUOTA) * 100)) : null;
                  return (
                    <tr key={u.user_id} className="border-b border-border/60 last:border-0 hover:bg-secondary/40 transition-colors">
                      <Td first>
                        <p className="font-semibold text-foreground truncate max-w-[200px]">{u.name || u.email.split("@")[0]}</p>
                        <p className="text-[11px] text-foreground-muted truncate max-w-[200px]">{u.email}</p>
                      </Td>
                      <Td>
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${planBadgeClass[u.plan] ?? planBadgeClass.free}`}>{u.plan}</span>
                      </Td>
                      <Td>
                        {quotaPct === null ? (
                          <span className="text-foreground-muted">BYOK</span>
                        ) : (
                          <div className="flex items-center gap-2 min-w-[110px]">
                            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full rounded-full ${quotaPct >= 80 ? "bg-warning" : "bg-primary"}`}
                                style={{ width: `${quotaPct}%` }}
                              />
                            </div>
                            <span className={`text-[11px] tabular-nums ${quotaPct >= 80 ? "text-warning font-semibold" : "text-foreground-muted"}`}>{quotaPct}%</span>
                          </div>
                        )}
                      </Td>
                      <Td className="text-foreground-secondary tabular-nums">{u.msgs_30d.toLocaleString()}</Td>
                      <Td className="text-foreground-muted">—</Td>
                      <Td className="text-foreground-secondary tabular-nums whitespace-nowrap">
                        {PLAN_PRICES[u.plan] ? `${inr(PLAN_PRICES[u.plan])}/mo` : "₹0"}
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </TableWrap>
        </Card>
      </div>
    </div>
  );
}
