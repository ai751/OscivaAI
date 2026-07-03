import Topbar from "@/components/layout/Topbar";
import { useEffect, useState } from "react";
import { User, Bell, CreditCard, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth, getInitials } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PLAN_LIMITS, PlanId, normalizePlan } from "@/lib/plans";

// Feature bullets shown per plan on the billing card.
const PLAN_FEATURES: Record<PlanId, string[]> = {
  free: [
    "1 AI agent",
    "50 messages/month on our GPT-4o Mini",
    "1 MB of documents",
    "Basic analytics (7 days)",
    '"Powered by Osciva" on the widget',
  ],
  starter: [
    "2 AI agents",
    "Unlimited messages (your API key)",
    "5 MB of documents + 7 web pages",
    "Full analytics · branding removed",
    "Appearance customization",
  ],
  growth: [
    "5 AI agents",
    "Unlimited messages (your API key)",
    "10 MB of documents + 15 web pages",
    "All AI models, premium included",
    "Custom rate limits · priority support",
  ],
};

export default function SettingsPage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, browser: true, weekly: false });
  const [monthMsgs, setMonthMsgs] = useState<number | null>(null);

  const planId = normalizePlan(profile?.plan);
  const limits = PLAN_LIMITS[planId];
  const plan = limits.label;

  useEffect(() => {
    if (profile) setName(profile.name || "");
  }, [profile]);

  // Free tier: show this month's platform-key message usage.
  useEffect(() => {
    if (!user || planId !== "free") return;
    const month = new Date().toISOString().slice(0, 7);
    supabase
      .from("monthly_usage")
      .select("msgs")
      .eq("user_id", user.id)
      .eq("month", month)
      .maybeSingle()
      .then(({ data }) => setMonthMsgs(data?.msgs ?? 0));
  }, [user, planId]);

  const email = user?.email || "";

  const saveProfile = async () => {
    if (!user) return;
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim() })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refreshProfile();
    toast.success("Profile saved!");
  };

  const handleDelete = async () => {
    await signOut();
    navigate("/auth", { replace: true });
    toast.info("Signed out. Contact support to permanently delete your account.");
  };

  const tabs = [
    { label: "Profile", icon: User },
    { label: "Notifications", icon: Bell },
    { label: "Plan & Billing", icon: CreditCard },
    { label: "Danger Zone", icon: AlertTriangle },
  ];

  return (
    <>
      <Topbar title="Settings" subtitle="Manage your account" />
      <div className="p-6 animate-fade-up">
        <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-5 max-w-lg overflow-x-auto">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setTab(i)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 text-[11px] font-semibold rounded-lg transition-all whitespace-nowrap ${
                tab === i ? "bg-card text-foreground shadow-sm" : "text-foreground-muted hover:text-foreground"
              }`}
            >
              <t.icon size={12} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="max-w-lg">
          {tab === 0 && (
            <div className="glass-card p-5 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center text-xl font-bold text-primary">
                  {getInitials(name || profile?.name, email)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{name || "—"}</div>
                  <div className="text-xs text-foreground-muted">{email || "—"}</div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium mt-1 inline-block">{plan} Plan</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Full Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Email</label>
                <input value={email} disabled className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground-muted cursor-not-allowed" />
              </div>
              <button onClick={saveProfile} disabled={saving} className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-[#e05f40] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          )}

          {tab === 1 && (
            <div className="glass-card p-5 space-y-3">
              {[
                { key: "email" as const, label: "Email notifications", desc: "Get notified about agent activity" },
                { key: "browser" as const, label: "Browser notifications", desc: "Real-time alerts in your browser" },
                { key: "weekly" as const, label: "Weekly digest", desc: "Summary of agent performance" },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <div className="text-xs font-semibold text-foreground">{n.label}</div>
                    <div className="text-[10px] text-foreground-muted">{n.desc}</div>
                  </div>
                  <button
                    onClick={() => setNotifications((prev) => ({ ...prev, [n.key]: !prev[n.key] }))}
                    className={`w-10 h-5 rounded-full transition-all relative ${notifications[n.key] ? "bg-primary" : "bg-border"}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${notifications[n.key] ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 2 && (
            <div className="space-y-4">
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] text-foreground-muted uppercase tracking-wider font-semibold">Current Plan</span>
                    <h3 className="text-lg font-bold text-foreground">{plan} Plan</h3>
                    <span className="text-2xl font-bold text-primary">
                      {limits.price}
                      <span className="text-xs text-foreground-muted font-normal">/month</span>
                    </span>
                  </div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">Active</span>
                </div>

                {planId === "free" && monthMsgs !== null && (
                  <div className="mb-4 p-3 rounded-lg bg-secondary/60">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-foreground-secondary font-medium">Messages this month</span>
                      <span className="font-semibold text-foreground">{Math.min(monthMsgs, 50)} / 50</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, (monthMsgs / 50) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-foreground-muted mt-1.5">
                      Free replies run on our GPT-4o Mini. Upgrade for unlimited messages with your own API key.
                    </p>
                  </div>
                )}

                <ul className="space-y-2 mb-4">
                  {PLAN_FEATURES[planId].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-foreground-secondary">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" /> {f}
                    </li>
                  ))}
                </ul>
                {planId !== "growth" && (
                  <button
                    onClick={() => window.open("mailto:support@osciva.io?subject=Upgrade my Osciva AI plan", "_blank")}
                    className="w-full py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-[#e05f40] transition-colors"
                  >
                    Upgrade plan
                  </button>
                )}
                <p className="text-[10px] text-foreground-muted text-center mt-2">
                  Upgrades are activated by our team within a few hours — email support@osciva.io.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(PLAN_LIMITS) as PlanId[])
                  .filter((p) => p !== planId)
                  .map((p) => (
                    <div key={p} className={`glass-card p-4 ${p === "growth" ? "border-primary/30" : ""}`}>
                      <div className="text-xs font-semibold text-foreground mb-1">{PLAN_LIMITS[p].label}</div>
                      <div className="text-lg font-bold text-foreground">
                        {PLAN_LIMITS[p].price}
                        <span className="text-[10px] text-foreground-muted font-normal">/mo</span>
                      </div>
                      <p className="text-[10px] text-foreground-muted mt-1">
                        {PLAN_LIMITS[p].agents} agent{PLAN_LIMITS[p].agents > 1 ? "s" : ""} ·{" "}
                        {PLAN_LIMITS[p].monthlyMsgs ? `${PLAN_LIMITS[p].monthlyMsgs} msgs/mo` : "unlimited msgs"}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {tab === 3 && (
            <div className="glass-card p-5 border-destructive/20">
              <h3 className="text-sm font-semibold text-destructive mb-2">Delete Account</h3>
              <p className="text-xs text-foreground-muted mb-4">This action is irreversible. Contact support to permanently delete your account and all associated data.</p>
              <button
                onClick={handleDelete}
                className="px-4 py-2.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold hover:bg-destructive/20 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
