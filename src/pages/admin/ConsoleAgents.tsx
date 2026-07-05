import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Flag, Search, Power, PowerOff, Pencil } from "lucide-react";
import { toast } from "sonner";
import { adminRpc, AdminAgent, planBadgeClass } from "./adminRpc";
import { Card, EmptyState, FilterTabs, PageHead, RowsSkeleton, StatCard, TableWrap, Td, Th } from "./components";

type AgentTab = "all" | "active" | "idle" | "disabled";

const IDLE_DAYS = 30;

export default function ConsoleAgents() {
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<AgentTab>("all");
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [rateEdit, setRateEdit] = useState<{ id: string; value: string } | null>(null);

  useEffect(() => {
    const q = params.get("q");
    if (q !== null) setSearch(q);
  }, [params]);

  const agentsQuery = useQuery({
    queryKey: ["ac-agents"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_list_agents");
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminAgent[];
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await adminRpc("admin_set_agent_active", { p_agent_id: id, p_active: active });
      if (error) throw new Error(error.message);
    },
    onMutate: async ({ id, active }) => {
      await queryClient.cancelQueries({ queryKey: ["ac-agents"] });
      const prev = queryClient.getQueryData<AdminAgent[]>(["ac-agents"]);
      queryClient.setQueryData<AdminAgent[]>(["ac-agents"], (old) =>
        old?.map((a) => (a.id === id ? { ...a, active } : a)),
      );
      return { prev };
    },
    onError: (err, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["ac-agents"], ctx.prev);
      toast.error(`Update failed: ${err.message}`);
    },
    onSuccess: (_d, { active }) => {
      toast.success(active ? "Agent enabled" : "Agent disabled — it will stop responding immediately");
      queryClient.invalidateQueries({ queryKey: ["ac-agents"] });
      queryClient.invalidateQueries({ queryKey: ["ac-stats"] });
    },
  });

  const setRateLimit = useMutation({
    mutationFn: async ({ id, perHour }: { id: string; perHour: number }) => {
      const { error } = await adminRpc("admin_set_agent_rate_limit", { p_agent_id: id, p_per_hour: perHour });
      if (error) throw new Error(error.message);
    },
    onError: (err) => toast.error(`Rate limit update failed: ${err.message}`),
    onSuccess: (_d, { perHour }) => {
      toast.success(`Rate limit set to ${perHour}/hour`);
      queryClient.invalidateQueries({ queryKey: ["ac-agents"] });
    },
  });

  const saveRate = () => {
    if (!rateEdit) return;
    const n = parseInt(rateEdit.value, 10);
    if (!Number.isFinite(n) || n < 1 || n > 10000) {
      toast.error("Rate limit must be between 1 and 10000");
      return;
    }
    setRateLimit.mutate({ id: rateEdit.id, perHour: n });
    setRateEdit(null);
  };

  const agents = agentsQuery.data ?? [];
  const weekAgo = Date.now() - 7 * 86400000;
  const createdThisWeek = agents.filter((a) => new Date(a.created_at).getTime() >= weekAgo).length;
  const disabled = agents.filter((a) => !a.active).length;

  const isIdle = (a: AdminAgent) =>
    a.active && a.message_count === 0 && new Date(a.created_at).getTime() < Date.now() - IDLE_DAYS * 86400000;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return agents.filter((a) => {
      if (tab === "active" && !a.active) return false;
      if (tab === "disabled" && a.active) return false;
      if (tab === "idle" && !isIdle(a)) return false;
      if (q && !a.name.toLowerCase().includes(q) && !a.owner_email.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [agents, tab, search]);

  return (
    <div className="space-y-5">
      <PageHead title="Agents oversight" subtitle="Moderation & platform-wide agent directory" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard loading={agentsQuery.isLoading} label="Total agents" value={agents.length.toLocaleString()} icon={Bot} tone="primary" />
        <StatCard loading={agentsQuery.isLoading} label="Created this week" value={String(createdThisWeek)} icon={Bot} tone="success" />
        <StatCard loading={agentsQuery.isLoading} label="Flagged for review" value="0" sub="Content moderation not enabled" icon={Flag} tone="warning" />
        <StatCard loading={agentsQuery.isLoading} label="Disabled" value={String(disabled)} icon={PowerOff} tone="destructive" />
      </div>

      <Card title="⚑ Moderation queue" subtitle="Flagged by automated content policy scan">
        <EmptyState
          icon={Flag}
          title="No flagged agents"
          note="Automated content moderation isn't enabled yet. When a policy scan is added to the chat pipeline, flagged agents appear here for review."
        />
      </Card>

      <Card title="All agents" subtitle="Platform-wide directory">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <FilterTabs
            tabs={[
              { key: "all" as AgentTab, label: "All", count: agents.length },
              { key: "active" as AgentTab, label: "Active", count: agents.filter((a) => a.active).length },
              { key: "idle" as AgentTab, label: `Idle ${IDLE_DAYS}d+`, count: agents.filter(isIdle).length },
              { key: "disabled" as AgentTab, label: "Disabled", count: disabled },
            ]}
            active={tab}
            onChange={(k) => setTab(k as AgentTab)}
          />
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by agent or owner…"
              className="w-full sm:w-64 pl-9 pr-3 py-2 rounded-xl border border-border bg-background text-[13px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <TableWrap>
          <thead>
            <tr>
              <Th first>Agent</Th>
              <Th>Owner</Th>
              <Th>Model</Th>
              <Th>Msgs</Th>
              <Th>Convs</Th>
              <Th>Rate/hr</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {agentsQuery.isLoading ? (
              <RowsSkeleton cols={8} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-[13px] text-foreground-muted">
                  {agents.length === 0 ? "No agents on the platform yet." : "No agents match the current filter."}
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="border-b border-border/60 last:border-0 hover:bg-secondary/40 transition-colors">
                  <Td first>
                    <div className="flex items-center gap-2.5">
                      {a.logo_url ? (
                        <img src={a.logo_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-[12px] font-bold text-primary shrink-0">
                          {a.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="text-[13px] font-semibold text-foreground truncate max-w-[180px]">{a.name}</span>
                    </div>
                  </Td>
                  <Td>
                    <p className="text-foreground-secondary truncate max-w-[180px]">{a.owner_email}</p>
                    <span className={`inline-block mt-0.5 text-[10.5px] font-semibold px-2 py-0.5 rounded-full capitalize ${planBadgeClass[a.owner_plan] ?? planBadgeClass.free}`}>
                      {a.owner_plan}
                    </span>
                  </Td>
                  <Td className="text-foreground-secondary whitespace-nowrap">{a.model}</Td>
                  <Td className="text-foreground-secondary tabular-nums">{a.message_count.toLocaleString()}</Td>
                  <Td className="text-foreground-secondary tabular-nums">{a.conversation_count.toLocaleString()}</Td>
                  <Td>
                    {rateEdit?.id === a.id ? (
                      <input
                        autoFocus
                        type="number"
                        min={1}
                        max={10000}
                        value={rateEdit.value}
                        onChange={(e) => setRateEdit({ id: a.id, value: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveRate();
                          if (e.key === "Escape") setRateEdit(null);
                        }}
                        onBlur={saveRate}
                        className="w-20 px-2 py-1 rounded-lg border border-primary/50 bg-background text-[12px] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    ) : (
                      <button
                        onClick={() => setRateEdit({ id: a.id, value: String(a.rate_limit_per_hour ?? 20) })}
                        title="Click to change this agent's widget rate limit"
                        className="group inline-flex items-center gap-1.5 text-[12.5px] text-foreground-secondary tabular-nums hover:text-primary transition-colors"
                      >
                        {a.rate_limit_per_hour ?? 20}
                        <Pencil size={11} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}
                  </Td>
                  <Td>
                    {a.active ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-destructive">
                        <span className="w-1.5 h-1.5 rounded-full bg-destructive" /> Disabled
                      </span>
                    )}
                  </Td>
                  <Td>
                    <button
                      disabled={toggleActive.isPending}
                      onClick={() => toggleActive.mutate({ id: a.id, active: !a.active })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11.5px] font-semibold transition-colors disabled:opacity-50 ${
                        a.active
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          : "bg-success/10 text-success hover:bg-success/20"
                      }`}
                    >
                      {a.active ? <PowerOff size={12} /> : <Power size={12} />}
                      {a.active ? "Disable" : "Enable"}
                    </button>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </TableWrap>
      </Card>
    </div>
  );
}
