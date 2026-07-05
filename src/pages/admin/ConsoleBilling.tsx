import { useQuery } from "@tanstack/react-query";
import { CreditCard, IndianRupee, Receipt, RotateCcw, XCircle } from "lucide-react";
import { adminRpc, AdminStats, inrCompact } from "./adminRpc";
import { Card, EmptyState, PageHead, StatCard } from "./components";

function GatewayCard({ code, name, role }: { code: string; name: string; role: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-[12px] font-extrabold text-foreground-secondary">
          {code}
        </div>
        <div>
          <p className="text-[13.5px] font-bold text-foreground">{name}</p>
          <p className="text-[11px] text-foreground-muted">{role}</p>
        </div>
        <span className="ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary text-foreground-muted">
          Not connected
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center py-2">
        {["Collected (30d)", "Success rate", "Settlement"].map((k) => (
          <div key={k}>
            <p className="text-[14px] font-bold text-foreground-muted">—</p>
            <p className="text-[10px] text-foreground-muted mt-0.5">{k}</p>
          </div>
        ))}
      </div>
      <button
        disabled
        title="Payment gateway integration is not set up yet"
        className="mt-2 w-full py-2 rounded-xl bg-secondary text-foreground-muted text-[12px] font-semibold cursor-not-allowed"
      >
        Connect gateway
      </button>
    </div>
  );
}

export default function ConsoleBilling() {
  const stats = useQuery({
    queryKey: ["ac-stats"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_get_stats");
      if (error) throw new Error(error.message);
      return data as AdminStats;
    },
  });
  const s = stats.data;

  return (
    <div className="space-y-5">
      <PageHead
        title="Billing & Payments"
        subtitle="Gateways & transaction ledger · no gateway connected yet — plans are changed manually"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GatewayCard code="RP" name="Razorpay" role="Recommended primary gateway · India" />
        <GatewayCard code="PU" name="PayU Money" role="Optional secondary gateway · fallback" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          loading={stats.isLoading}
          label="Book MRR"
          value={s ? inrCompact(s.mrr) : "—"}
          sub="From manual plan assignments"
          icon={IndianRupee}
          tone="success"
        />
        <StatCard label="Collected (MTD)" value="—" sub="Needs a connected gateway" icon={Receipt} tone="info" />
        <StatCard label="Failed payments" value="—" sub="Needs a connected gateway" icon={XCircle} tone="destructive" />
        <StatCard label="Refunds (MTD)" value="—" sub="Needs a connected gateway" icon={RotateCcw} tone="warning" />
      </div>

      <Card title="Recent transactions" subtitle="Ledger across all gateways">
        <EmptyState
          icon={CreditCard}
          title="No transactions yet"
          note="Once Razorpay (or another gateway) is connected and webhooks are wired to a payments table, every charge, failure, and refund shows up here. Until then, collect payments manually and set plans from the Users page."
        />
      </Card>
    </div>
  );
}
