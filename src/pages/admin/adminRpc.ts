import { supabase } from "@/integrations/supabase/client";

// Admin RPCs aren't in the generated Database types; call untyped and shape
// results at each call site. Authorization lives server-side in assert_admin().
export const adminRpc = (fn: string, args?: Record<string, unknown>) =>
  (supabase.rpc as unknown as (
    fn: string,
    args?: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(fn, args);

export const PLAN_PRICES: Record<string, number> = { free: 0, starter: 999, growth: 2499 };
export const PLANS = ["free", "starter", "growth"] as const;
export const FREE_MSG_QUOTA = 50;

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// ₹18,42,300 → "₹18.4L" style compact display for KPI cards
export const inrCompact = (n: number) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  return inr(n);
};

export const planBadgeClass: Record<string, string> = {
  free: "bg-secondary text-foreground-secondary",
  starter: "bg-info/10 text-info",
  growth: "bg-primary/10 text-primary",
};

export interface AdminStats {
  total_users: number;
  new_users_month: number;
  plan_free: number;
  plan_starter: number;
  plan_growth: number;
  mrr: number;
  total_agents: number;
  active_agents: number;
  messages_total: number;
  messages_month: number;
  conversations_month: number;
}

export interface AdminUser {
  user_id: string;
  email: string;
  name: string | null;
  plan: string;
  is_admin: boolean;
  created_at: string;
  plan_updated_at: string;
  agent_count: number;
  msgs_month: number;
  msgs_30d: number;
  msgs_total: number;
}

export interface AdminAgent {
  id: string;
  name: string;
  model: string;
  owner_email: string;
  owner_name: string | null;
  owner_plan: string;
  message_count: number;
  conversation_count: number;
  active: boolean;
  created_at: string;
  logo_url: string | null;
  rate_limit_per_hour: number;
  rate_limit_enabled: boolean;
}

export interface SeriesPoint {
  day: string;
  signups: number;
  messages: number;
  conversations: number;
}

export interface Funnel {
  signed_up: number;
  created_agent: number;
  had_conversation: number;
  converted_paid: number;
}

export interface CohortRow {
  cohort: string;
  users: number;
  m1: number;
  m2: number;
  m3: number;
  m4: number;
}

export interface PlanChange {
  id: string;
  email: string;
  name: string | null;
  old_plan: string | null;
  new_plan: string;
  changed_by_email: string | null;
  changed_at: string;
}

export interface Ticket {
  id: number;
  email: string | null;
  subject: string;
  body: string | null;
  priority: "urgent" | "normal" | "low";
  status: "open" | "waiting_on_us" | "waiting_on_customer" | "closed";
  created_at: string;
  updated_at: string;
}
