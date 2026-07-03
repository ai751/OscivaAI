// Pricing plans — single source of truth for the dashboard's gating UI.
// Server-side enforcement lives in the plans migration (agent-count trigger,
// monthly_usage RPCs) and the chat edge function (model lock, free msg cap,
// branding flag, rate-limit gating). Keep the numbers in sync with both.

export type PlanId = "free" | "starter" | "growth";

export interface PlanLimits {
  label: string;
  price: string; // display, per month
  agents: number;
  docMB: number; // total uploaded document size per agent
  webPages: number; // URL sources per agent (0 = not available)
  monthlyMsgs: number | null; // null = unlimited (owner's own key)
  models: "locked" | "budget" | "all";
  analyticsDays: number | null; // null = full history
  branding: boolean; // "Powered by Osciva" on the widget
  appearance: boolean; // widget customization editable
  security: boolean; // rate-limit configuration editable
}

export const PLAN_LIMITS: Record<PlanId, PlanLimits> = {
  free: {
    label: "Free",
    price: "₹0",
    agents: 1,
    docMB: 1,
    webPages: 0,
    monthlyMsgs: 50,
    models: "locked",
    analyticsDays: 7,
    branding: true,
    appearance: false,
    security: false,
  },
  starter: {
    label: "Starter",
    price: "₹999",
    agents: 2,
    docMB: 5,
    webPages: 7,
    monthlyMsgs: null,
    models: "budget",
    analyticsDays: null,
    branding: false,
    appearance: true,
    security: false,
  },
  growth: {
    label: "Growth",
    price: "₹2,499",
    agents: 5,
    docMB: 10,
    webPages: 15,
    monthlyMsgs: null,
    models: "all",
    analyticsDays: null,
    branding: false,
    appearance: true,
    security: true,
  },
};

// The model the free plan is locked to (runs on Osciva's platform key).
export const FREE_MODEL_ID = "gpt-4o-mini";

// Budget models available on Starter (must match the chat function's clamp).
export const STARTER_MODEL_IDS = new Set([
  "gpt-4o-mini",
  "gpt-4.1-mini",
  "gpt-4.1-nano",
  "claude-haiku",
  "claude-haiku-4-5",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-flash",
  "gemini-2.5-flash",
]);

// Legacy values like 'Free'/'Pro' normalize safely.
export function normalizePlan(plan?: string | null): PlanId {
  const p = (plan ?? "").toLowerCase();
  return p === "starter" || p === "growth" ? p : "free";
}

export function planLimits(plan?: string | null): PlanLimits {
  return PLAN_LIMITS[normalizePlan(plan)];
}

// "1.24 MB" / "—" / "12 chunks" -> bytes-ish MB number (doc sources only).
export function parseSizeMB(size: string): number {
  const m = /^([\d.]+)\s*MB$/i.exec(size.trim());
  return m ? parseFloat(m[1]) : 0;
}
