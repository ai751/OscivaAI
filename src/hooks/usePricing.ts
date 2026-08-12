// Live pricing, editable by an admin in the console.
//
// Prices live in platform_settings and are read through get_public_pricing(), a
// SECURITY DEFINER function granted to anon so the marketing pricing page works
// logged-out. The table itself stays deny-all — that function only returns the
// price_% keys.
//
// Every consumer falls back to DEFAULT_PRICING, so a failed fetch or a cold cache
// shows the correct current prices rather than blank or ₹0. That matters: this
// renders on the public pricing page, and a wrong number there is a real-world
// promise to a customer.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Pricing {
  starterMonthly: number;
  starterYearly: number;
  growthMonthly: number;
  growthYearly: number;
}

// Keep in sync with the seed in 20260812140000_editable_pricing.sql.
export const DEFAULT_PRICING: Pricing = {
  starterMonthly: 999,
  starterYearly: 799,
  growthMonthly: 2499,
  growthYearly: 1999,
};

export const PRICING_KEYS = {
  starterMonthly: "price_starter_monthly",
  starterYearly: "price_starter_yearly",
  growthMonthly: "price_growth_monthly",
  growthYearly: "price_growth_yearly",
} as const;

/** "999" -> 999, falling back when the row is missing or unparseable. */
function toAmount(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export function pricingFromSettings(settings: Record<string, string> | undefined): Pricing {
  if (!settings) return DEFAULT_PRICING;
  return {
    starterMonthly: toAmount(settings[PRICING_KEYS.starterMonthly], DEFAULT_PRICING.starterMonthly),
    starterYearly: toAmount(settings[PRICING_KEYS.starterYearly], DEFAULT_PRICING.starterYearly),
    growthMonthly: toAmount(settings[PRICING_KEYS.growthMonthly], DEFAULT_PRICING.growthMonthly),
    growthYearly: toAmount(settings[PRICING_KEYS.growthYearly], DEFAULT_PRICING.growthYearly),
  };
}

/** ₹ with Indian digit grouping: 2499 -> "₹2,499". */
export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * plan id -> monthly amount, for the console's per-account revenue columns.
 * Derived from live pricing so those figures cannot drift from what is charged.
 */
export function planPriceMap(p: Pricing): Record<string, number> {
  return { free: 0, starter: p.starterMonthly, growth: p.growthMonthly };
}

export function usePricing(): Pricing {
  const { data } = useQuery({
    queryKey: ["public-pricing"],
    queryFn: async () => {
      // Not in the generated Database types (they contain no functions), so call
      // untyped — the same convention adminRpc uses.
      const rpc = supabase.rpc as unknown as (
        fn: string,
      ) => Promise<{ data: unknown; error: { message: string } | null }>;
      const { data, error } = await rpc("get_public_pricing");
      if (error) throw new Error(error.message);
      return (data ?? {}) as Record<string, string>;
    },
    // Prices change rarely, so serve them from cache and refresh quietly.
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return pricingFromSettings(data);
}
