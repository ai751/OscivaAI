import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  IndianRupee, Users, Bot, MessageSquare, AlertTriangle, LifeBuoy,
  CreditCard, Flag, ArrowUpRight,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import {
  adminRpc, AdminStats, AdminUser, SeriesPoint, Ticket,
  inr, inrCompact, planBadgeClass, FREE_MSG_QUOTA,
} from "./adminRpc";
import { Card, StatCard, TableWrap, Th, Td, RowsSkeleton } from "./components";

export default function ConsoleDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const stats = useQuery({
    queryKey: ["ac-stats"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_get_stats");
      if (error) throw new Error(error.message);
      return data as AdminStats;
    },
  });
  const series = useQuery({
    queryKey: ["ac-series-30"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_get_series", { p_days: 30 });
      if (error) throw new Error(error.message);
      return (data ?? []) as SeriesPoint[];
    },
  });
  const users = useQuery({
    queryKey: ["ac-users"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_list_users");
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminUser[];
    },
  });
  const tickets = useQuery({
    queryKey: ["ac-tickets"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_list_tickets");
      if (error) throw new Error(error.message);
      return (data ?? []) as Ticket[];
    },
  });

  const s = stats.data;
  const greeting = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening";
  const firstName = (profile?.name?.trim() || user?.email?.split("@")[0] || "there").split(/[\s._-]+/)[0];

  const chartData = useMemo(
    () =>
      (series.data ?? []).map((p) => ({
        ...p,
        label: new Date(p.day).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      })),
    [series.data],
  );

  const recentSignups = (users.data ?? []).slice(0, 8);
  const nearQuota = (users.data ?? []).filter((u) => u.plan === "free" && u.msgs_month >= FREE_MSG_QUOTA * 0.8);
  const openTickets = (tickets.data ?? []).filter((t) => t.status !== "closed");
  const urgentTickets = openTickets.filter((t) => t.priority === "urgent");
  const paidPct = s && s.total_users > 0 ? Math.round(((s.plan_starter + s.plan_growth) / s.total_users) * 100) : 0;

  const alerts = [
    {
      icon: AlertTriangle,
      tint: "text-warning bg-warning/10",
      label: `${nearQuota.length} account(s) near free-message quota`,
      note: nearQuota.length ? "Upgrade candidates — reach out before they hit the cap." : "No accounts at 80%+ of quota.",
      to: "/adminosciva/users",
      active: nearQuota.length > 0,
    },
    {
      icon: LifeBuoy,
      tint: "text-info bg-info/10",
      label: `${openTickets.length} open support ticket(s)${urgentTickets.length ? ` · ${urgentTickets.length} urgent` : ""}`,
      note: openTickets.length ? "Oldest tickets are prioritized in the queue." : "Support queue is empty.",
      to: "/adminosciva/support",
      active: openTickets.length > 0,
    },
    {
      icon: Flag,
      tint: "text-destructive bg-destructive/10",
      label: "0 agents flagged for review",
      note: "Automated content moderation isn't enabled yet.",
      to: "/adminosciva/agents",
      active: false,
    },
    {
      icon: CreditCard,
      tint: "text-foreground-muted bg-secondary",
      label: "0 failed payments",
      note: "No payment gateway connected — plans are changed manually.",
      to: "/adminosciva/billing",
      active: false,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Greeting banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[#0B0E14] p-6">
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-primary/25 blur-[90px]" aria-hidden />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[20px] font-extrabold text-white display">Good {greeting}, {firstName} 👋</h2>
            <p className="text-[13px] text-white/60 mt-1">Here's what's happening across Osciva AI today.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => navigate("/adminosciva/plans")}
              className="px-4 py-2 rounded-full bg-primary text-white text-[12.5px] font-semibold hover:bg-[#e05f40] transition-colors"
            >
              Plans & pricing
            </button>
            <button
              onClick={() => navigate("/adminosciva/settings")}
              className="px-4 py-2 rounded-full bg-white/10 text-white text-[12.5px] font-semibold hover:bg-white/20 transition-colors"
            >
              System status
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          loading={stats.isLoading}
          label="MRR (book)"
          value={s ? inrCompact(s.mrr) : "—"}
          sub={s ? `${s.plan_starter} starter · ${s.plan_growth} growth` : undefined}
          icon={IndianRupee}
          tone="success"
        />
        <StatCard
          loading={stats.isLoading}
          label="Active accounts"
          value={s ? s.total_users.toLocaleString() : "—"}
          sub={s ? `+${s.new_users_month} new this month` : undefined}
          icon={Users}
          tone="primary"
        />
        <StatCard
          loading={stats.isLoading}
          label="Agents live"
          value={s ? s.active_agents.toLocaleString() : "—"}
          sub={s ? `of ${s.total_agents} created` : undefined}
          icon={Bot}
          tone="info"
        />
        <StatCard
          loading={stats.isLoading}
          label="Messages (MTD)"
          value={s ? s.messages_month.toLocaleString() : "—"}
          sub={s ? `${s.conversations_month.toLocaleString()} conversations` : undefined}
          icon={MessageSquare}
          tone="warning"
        />
      </div>

      {/* Chart + plan distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          title="Platform activity"
          subtitle="Messages & conversations · last 30 days"
          className="lg:col-span-2"
        >
          <div className="h-56">
            {series.isLoading ? (
              <div className="h-full rounded-xl bg-secondary animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gMsgs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))", border: "1px solid hsl(var(--border))",
                      borderRadius: 12, fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="messages" name="Messages" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gMsgs)" />
                  <Area type="monotone" dataKey="conversations" name="Conversations" stroke="hsl(var(--info))" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="text-[11px] text-foreground-muted mt-3">
            Revenue-vs-model-cost needs token logging — see Usage & Cost.
          </p>
        </Card>

        <Card title="Plan distribution" subtitle={s ? `${s.total_users} accounts · ${paidPct}% paid` : "—"}>
          {stats.isLoading ? (
            <div className="h-40 rounded-xl bg-secondary animate-pulse" />
          ) : s ? (
            <>
              <div className="flex h-3 rounded-full overflow-hidden bg-secondary mb-4">
                {[
                  { v: s.plan_free, c: "bg-foreground-muted/40" },
                  { v: s.plan_starter, c: "bg-info" },
                  { v: s.plan_growth, c: "bg-primary" },
                ].map(
                  (seg, i) =>
                    seg.v > 0 && (
                      <div key={i} className={seg.c} style={{ width: `${(seg.v / Math.max(1, s.total_users)) * 100}%` }} />
                    ),
                )}
              </div>
              <div className="space-y-3">
                {[
                  { label: "Free", v: s.plan_free, c: "bg-foreground-muted/40", price: "₹0" },
                  { label: "Starter", v: s.plan_starter, c: "bg-info", price: `${inr(999)}/mo` },
                  { label: "Growth", v: s.plan_growth, c: "bg-primary", price: `${inr(2499)}/mo` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-[12.5px]">
                    <span className="flex items-center gap-2 text-foreground-secondary">
                      <span className={`w-2.5 h-2.5 rounded-full ${row.c}`} />
                      {row.label} <span className="text-foreground-muted">{row.price}</span>
                    </span>
                    <span className="font-semibold text-foreground tabular-nums">{row.v}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </Card>
      </div>

      {/* Recent signups + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          title="Recent signups"
          subtitle="Newest accounts on the platform"
          className="lg:col-span-2"
          actions={
            <button
              onClick={() => navigate("/adminosciva/users")}
              className="text-[11.5px] text-foreground-muted hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              View all <ArrowUpRight size={12} />
            </button>
          }
        >
          <TableWrap>
            <thead>
              <tr>
                <Th first>Account</Th>
                <Th>Plan</Th>
                <Th>Agents</Th>
                <Th>Joined</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {users.isLoading ? (
                <RowsSkeleton cols={5} />
              ) : (
                recentSignups.map((u) => (
                  <tr key={u.user_id} className="border-b border-border/60 last:border-0 hover:bg-secondary/40 transition-colors">
                    <Td first>
                      <p className="font-semibold text-foreground truncate max-w-[220px]">{u.name || u.email.split("@")[0]}</p>
                      <p className="text-[11px] text-foreground-muted truncate max-w-[220px]">{u.email}</p>
                    </Td>
                    <Td>
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${planBadgeClass[u.plan] ?? planBadgeClass.free}`}>{u.plan}</span>
                    </Td>
                    <Td className="text-foreground-secondary tabular-nums">{u.agent_count}</Td>
                    <Td className="text-foreground-muted whitespace-nowrap">
                      {new Date(u.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </Td>
                    <Td>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-success">
                        <span className="w-1.5 h-1.5 rounded-full bg-success" /> Active
                      </span>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </TableWrap>
        </Card>

        <Card title="System alerts" subtitle="Needs your attention">
          <div className="space-y-1.5">
            {alerts.map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.to)}
                className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-colors hover:bg-secondary/60 ${a.active ? "" : "opacity-70"}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${a.tint}`}>
                  <a.icon size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-foreground leading-snug">{a.label}</p>
                  <p className="text-[11px] text-foreground-muted mt-0.5 leading-snug">{a.note}</p>
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
