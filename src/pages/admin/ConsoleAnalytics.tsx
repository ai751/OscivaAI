import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe2 } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { adminRpc, CohortRow, Funnel, SeriesPoint } from "./adminRpc";
import { Card, EmptyState, PageHead, TableWrap, Th, Td } from "./components";

export default function ConsoleAnalytics() {
  const series = useQuery({
    queryKey: ["ac-series-56"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_get_series", { p_days: 56 });
      if (error) throw new Error(error.message);
      return (data ?? []) as SeriesPoint[];
    },
  });
  const funnel = useQuery({
    queryKey: ["ac-funnel"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_get_funnel");
      if (error) throw new Error(error.message);
      return data as Funnel;
    },
  });
  const cohorts = useQuery({
    queryKey: ["ac-cohorts"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_get_cohorts");
      if (error) throw new Error(error.message);
      return (data ?? []) as CohortRow[];
    },
  });

  // Roll 56 daily points into 8 weekly buckets.
  const weekly = useMemo(() => {
    const pts = series.data ?? [];
    const out: { week: string; signups: number; conversations: number }[] = [];
    for (let i = 0; i < pts.length; i += 7) {
      const chunk = pts.slice(i, i + 7);
      if (!chunk.length) continue;
      const start = new Date(chunk[0].day);
      out.push({
        week: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        signups: chunk.reduce((s, p) => s + p.signups, 0),
        conversations: chunk.reduce((s, p) => s + p.conversations, 0),
      });
    }
    return out;
  }, [series.data]);

  const f = funnel.data;
  const funnelRows = f
    ? [
        { label: "Signed up", value: f.signed_up, pct: 100 },
        { label: "Created first agent", value: f.created_agent, pct: f.signed_up ? Math.round((f.created_agent / f.signed_up) * 100) : 0 },
        { label: "Had first conversation", value: f.had_conversation, pct: f.signed_up ? Math.round((f.had_conversation / f.signed_up) * 100) : 0 },
        { label: "Converted to paid", value: f.converted_paid, pct: f.signed_up ? Math.round((f.converted_paid / f.signed_up) * 100) : 0 },
      ]
    : [];

  const heat = (pct: number) =>
    pct >= 60 ? "bg-success/20 text-success" : pct >= 30 ? "bg-warning/15 text-warning" : pct > 0 ? "bg-secondary text-foreground-secondary" : "bg-secondary/50 text-foreground-muted";

  return (
    <div className="space-y-5">
      <PageHead title="Analytics" subtitle="Growth, conversion & retention" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Signups vs conversations" subtitle="Last 8 weeks" className="lg:col-span-2">
          <div className="h-56">
            {series.isLoading ? (
              <div className="h-full rounded-xl bg-secondary animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--secondary))" }}
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="signups" name="Signups" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="conversations" name="Conversations" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card title="Conversion funnel" subtitle="All-time · from signup to paid">
          {funnel.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-secondary animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3.5">
              {funnelRows.map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-[12.5px] mb-1">
                    <span className="text-foreground-secondary">{row.label}</span>
                    <span className="font-semibold text-foreground tabular-nums">
                      {row.value.toLocaleString()}
                      <span className="text-foreground-muted font-medium ml-1.5">{row.pct}%</span>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Top countries" subtitle="By active account">
          <EmptyState
            icon={Globe2}
            title="No geo data yet"
            note="Country tracking needs IP geolocation in the auth or chat flow. Once enabled, active accounts by country appear here."
          />
        </Card>

        <Card title="Retention cohorts" subtitle="% of accounts with chat activity, by month after signup" className="lg:col-span-2">
          <TableWrap>
            <thead>
              <tr>
                <Th first>Cohort</Th>
                <Th>Accounts</Th>
                <Th>M1</Th>
                <Th>M2</Th>
                <Th>M3</Th>
                <Th>M4</Th>
              </tr>
            </thead>
            <tbody>
              {cohorts.isLoading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-3">
                    <div className="h-16 rounded bg-secondary animate-pulse" />
                  </td>
                </tr>
              ) : (cohorts.data ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[12.5px] text-foreground-muted">
                    No signups in the last 4 months.
                  </td>
                </tr>
              ) : (
                (cohorts.data ?? []).map((c) => (
                  <tr key={c.cohort} className="border-b border-border/60 last:border-0">
                    <Td first className="font-semibold text-foreground whitespace-nowrap">{c.cohort}</Td>
                    <Td className="text-foreground-secondary tabular-nums">{c.users}</Td>
                    {[c.m1, c.m2, c.m3, c.m4].map((v, i) => (
                      <Td key={i}>
                        <span className={`inline-block min-w-[44px] text-center px-2 py-1 rounded-lg text-[11.5px] font-semibold tabular-nums ${heat(v)}`}>
                          {v}%
                        </span>
                      </Td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </TableWrap>
          <p className="text-[11px] text-foreground-muted mt-4">
            M1 is the signup month itself; M2–M4 are the following months. "Active" = at least one agent conversation.
          </p>
        </Card>
      </div>
    </div>
  );
}
