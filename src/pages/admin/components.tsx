import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export function PageHead({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
      <div>
        <h2 className="text-[18px] font-extrabold text-foreground display">{title}</h2>
        <p className="text-[12.5px] text-foreground-muted mt-0.5">{subtitle}</p>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export type StatTone = "primary" | "success" | "info" | "warning" | "destructive" | "neutral";

const TONES: Record<StatTone, { card: string; chip: string; value: string }> = {
  primary: {
    card: "border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card",
    chip: "text-primary bg-primary/15",
    value: "text-primary",
  },
  success: {
    card: "border-success/25 bg-gradient-to-br from-success/10 via-card to-card",
    chip: "text-success bg-success/15",
    value: "text-success",
  },
  info: {
    card: "border-info/25 bg-gradient-to-br from-info/10 via-card to-card",
    chip: "text-info bg-info/15",
    value: "text-info",
  },
  warning: {
    card: "border-warning/30 bg-gradient-to-br from-warning/10 via-card to-card",
    chip: "text-warning bg-warning/15",
    value: "text-warning",
  },
  destructive: {
    card: "border-destructive/25 bg-gradient-to-br from-destructive/10 via-card to-card",
    chip: "text-destructive bg-destructive/15",
    value: "text-destructive",
  },
  neutral: {
    card: "border-border bg-card",
    chip: "text-foreground-secondary bg-secondary",
    value: "text-foreground",
  },
};

export function StatCard({
  label, value, sub, icon: Icon, tone = "neutral", loading,
}: {
  label: string;
  value: string;
  sub?: ReactNode;
  icon: LucideIcon;
  tone?: StatTone;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="h-4 w-20 rounded bg-secondary animate-pulse mb-5" />
        <div className="h-7 w-24 rounded bg-secondary animate-pulse" />
        <div className="h-3 w-28 rounded bg-secondary animate-pulse mt-2.5" />
      </div>
    );
  }
  const t = TONES[tone];
  return (
    <div className={`rounded-2xl border p-5 ${t.card}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] text-foreground-secondary font-semibold">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${t.chip}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className={`text-2xl font-extrabold display ${t.value}`}>{value}</div>
      {sub && <div className="mt-1.5 text-[11px] font-medium text-foreground-secondary">{sub}</div>}
    </div>
  );
}

export function Card({ title, subtitle, actions, children, className = "" }: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card ${className}`}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 p-5 pb-0">
          <div>
            {title && <h3 className="text-[14px] font-bold text-foreground">{title}</h3>}
            {subtitle && <p className="text-[12px] text-foreground-muted mt-0.5">{subtitle}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, note }: { icon: LucideIcon; title: string; note: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-11 h-11 rounded-2xl bg-secondary flex items-center justify-center mb-3">
        <Icon size={20} className="text-foreground-muted" />
      </div>
      <p className="text-[13px] font-semibold text-foreground">{title}</p>
      <p className="text-[12px] text-foreground-muted mt-1 max-w-sm leading-relaxed">{note}</p>
    </div>
  );
}

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-5 -mb-5">
      <table className="w-full text-left">{children}</table>
    </div>
  );
}

export function Th({ children, first = false }: { children: ReactNode; first?: boolean }) {
  return (
    <th className={`${first ? "pl-5" : "pl-4"} pr-4 py-2.5 font-semibold text-[11px] uppercase tracking-wide text-foreground-muted border-y border-border whitespace-nowrap`}>
      {children}
    </th>
  );
}

export function Td({ children, first = false, className = "" }: { children: ReactNode; first?: boolean; className?: string }) {
  return <td className={`${first ? "pl-5" : "pl-4"} pr-4 py-3 text-[12.5px] ${className}`}>{children}</td>;
}

export function RowsSkeleton({ cols, rows = 5 }: { cols: number; rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-border/60">
          <td colSpan={cols} className="px-5 py-3">
            <div className="h-6 rounded bg-secondary animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function FilterTabs<T extends string>({
  tabs, active, onChange,
}: {
  tabs: { key: T; label: string; count?: number }[];
  active: T;
  onChange: (k: T) => void;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
            active === t.key ? "bg-foreground text-background" : "bg-secondary text-foreground-secondary hover:text-foreground"
          }`}
        >
          {t.label}
          {t.count !== undefined && <span className="ml-1 opacity-60">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
