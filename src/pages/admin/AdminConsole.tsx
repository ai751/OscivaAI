import { FormEvent, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, BarChart3, Users, Bot, Layers, CreditCard, Gauge,
  LifeBuoy, ShieldCheck, Settings2, LogOut, Search, Eye, EyeOff, Menu, X,
} from "lucide-react";
import { useAuth, getInitials } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { adminRpc, AdminAgent, AdminUser, planBadgeClass } from "./adminRpc";

const NAV = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/adminosciva/dashboard" },
      { label: "Analytics", icon: BarChart3, path: "/adminosciva/analytics" },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Users & Orgs", icon: Users, path: "/adminosciva/users" },
      { label: "Agents oversight", icon: Bot, path: "/adminosciva/agents" },
    ],
  },
  {
    label: "Revenue",
    items: [
      { label: "Plans & Subscriptions", icon: Layers, path: "/adminosciva/plans" },
      { label: "Billing & Payments", icon: CreditCard, path: "/adminosciva/billing" },
      { label: "Usage & Cost", icon: Gauge, path: "/adminosciva/usage" },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Support queue", icon: LifeBuoy, path: "/adminosciva/support" },
      { label: "Team & Roles", icon: ShieldCheck, path: "/adminosciva/team" },
      { label: "Platform settings", icon: Settings2, path: "/adminosciva/settings" },
    ],
  },
];

function GlobalSearch() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const active = q.trim().length >= 2;

  const users = useQuery({
    queryKey: ["ac-users"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_list_users");
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminUser[];
    },
    enabled: active,
  });
  const agents = useQuery({
    queryKey: ["ac-agents"],
    queryFn: async () => {
      const { data, error } = await adminRpc("admin_list_agents");
      if (error) throw new Error(error.message);
      return (data ?? []) as AdminAgent[];
    },
    enabled: active,
  });

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const needle = q.trim().toLowerCase();
  const userHits = active
    ? (users.data ?? []).filter((u) => u.email.toLowerCase().includes(needle) || (u.name ?? "").toLowerCase().includes(needle)).slice(0, 5)
    : [];
  const agentHits = active
    ? (agents.data ?? []).filter((a) => a.name.toLowerCase().includes(needle) || a.owner_email.toLowerCase().includes(needle)).slice(0, 5)
    : [];
  const loading = active && (users.isLoading || agents.isLoading);

  const go = (path: string) => {
    navigate(path);
    setQ("");
    setOpen(false);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (q.trim()) go(`/adminosciva/users?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <div ref={boxRef} className="relative hidden md:block">
      <form onSubmit={submit}>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="Search users, orgs, agents…"
          className="w-64 pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-[12.5px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </form>
      {open && active && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-premium overflow-hidden z-50">
          {loading ? (
            <p className="px-4 py-3 text-[12px] text-foreground-muted">Searching…</p>
          ) : userHits.length === 0 && agentHits.length === 0 ? (
            <p className="px-4 py-3 text-[12px] text-foreground-muted">No users or agents match "{q.trim()}".</p>
          ) : (
            <>
              {userHits.length > 0 && (
                <div className="py-1.5">
                  <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground-muted/70">Users</p>
                  {userHits.map((u) => (
                    <button
                      key={u.user_id}
                      onClick={() => go(`/adminosciva/users?q=${encodeURIComponent(u.email)}`)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-secondary/60 transition-colors text-left"
                    >
                      <Users size={14} className="text-foreground-muted shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-semibold text-foreground truncate">{u.name || u.email.split("@")[0]}</span>
                        <span className="block text-[11px] text-foreground-muted truncate">{u.email}</span>
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${planBadgeClass[u.plan] ?? planBadgeClass.free}`}>{u.plan}</span>
                    </button>
                  ))}
                </div>
              )}
              {agentHits.length > 0 && (
                <div className="py-1.5 border-t border-border/60">
                  <p className="px-4 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground-muted/70">Agents</p>
                  {agentHits.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => go(`/adminosciva/agents?q=${encodeURIComponent(a.name)}`)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-secondary/60 transition-colors text-left"
                    >
                      <Bot size={14} className="text-foreground-muted shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[12.5px] font-semibold text-foreground truncate">{a.name}</span>
                        <span className="block text-[11px] text-foreground-muted truncate">{a.owner_email}</span>
                      </span>
                      {!a.active && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive shrink-0">disabled</span>}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AdminLogin({ notAdmin, email }: { notAdmin: boolean; email?: string | null }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { signOut } = useAuth();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { error: err } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });
    setBusy(false);
    if (err) setError(err.message === "Invalid login credentials" ? "Incorrect email or password." : err.message);
    // On success AuthProvider refetches the profile; the gate re-evaluates.
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="h-9 w-9 object-contain" />
          <span className="text-[17px] font-bold tracking-[-0.02em] text-foreground">
            Osciva <span className="text-primary">AI</span> Admin
          </span>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          {notAdmin ? (
            <>
              <div className="w-11 h-11 mx-auto rounded-xl bg-destructive/10 flex items-center justify-center mb-3">
                <ShieldCheck size={20} className="text-destructive" />
              </div>
              <p className="text-[14px] font-bold text-foreground text-center">Access denied</p>
              <p className="text-[12.5px] text-foreground-muted text-center mt-1.5 leading-relaxed">
                {email} is signed in but doesn't have admin access. Sign out and use an admin account.
              </p>
              <button
                onClick={() => signOut()}
                className="mt-4 w-full py-2.5 rounded-xl bg-secondary text-foreground text-[13px] font-semibold hover:bg-secondary/70 transition-colors"
              >
                Sign out & try another account
              </button>
            </>
          ) : (
            <>
              <h1 className="text-[16px] font-bold text-foreground">Admin console</h1>
              <p className="text-[12.5px] text-foreground-muted mt-1 mb-5">
                Sign in with an admin account to continue.
              </p>
              <form onSubmit={submit} className="space-y-3">
                <input
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="Admin email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-[13.5px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-border bg-background text-[13.5px] text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && <p className="text-[12px] text-destructive">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-2.5 rounded-xl bg-primary text-white text-[13.5px] font-semibold hover:bg-[#e05f40] transition-colors disabled:opacity-60"
                >
                  {busy ? "Signing in…" : "Sign in"}
                </button>
              </form>
            </>
          )}
        </div>
        <p className="text-[11px] text-foreground-muted text-center mt-4">
          Restricted area. All actions are attributed to your account.
        </p>
      </div>
    </div>
  );
}

export default function AdminConsole() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileNav, setMobileNav] = useState(false);

  if (loading) return <div className="min-h-screen bg-background" />;

  // Gate: needs a session AND an admin profile. While the profile is still
  // fetching (user set, profile null) render nothing to avoid a login flash.
  if (!user) return <AdminLogin notAdmin={false} />;
  if (!profile) return <div className="min-h-screen bg-background" />;
  if (!profile.is_admin) return <AdminLogin notAdmin email={user.email} />;

  const current = NAV.flatMap((g) => g.items).find((i) => location.pathname.startsWith(i.path));

  const sidebar = (
    <aside
      className={
        isMobile
          ? "fixed left-0 top-0 bottom-0 z-40 w-[250px] flex flex-col border-r border-border bg-card shadow-2xl"
          : "fixed left-0 top-0 bottom-0 z-40 w-[236px] flex flex-col border-r border-border bg-card"
      }
    >
      <div className="flex items-center justify-between px-4 h-16 shrink-0">
        <button onClick={() => navigate("/adminosciva/dashboard")} className="flex items-center gap-2.5">
          <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="h-8 w-8 object-contain" />
          <span className="text-[14px] font-bold tracking-[-0.02em] text-foreground text-left leading-tight">
            Osciva <span className="text-primary">AI</span>
            <span className="block text-[10px] font-semibold text-foreground-muted tracking-wide">ADMIN CONSOLE</span>
          </span>
        </button>
        {isMobile && (
          <button onClick={() => setMobileNav(false)} className="p-1.5 rounded-lg hover:bg-secondary text-foreground-muted">
            <X size={18} />
          </button>
        )}
      </div>
      <nav className="flex-1 px-3 pb-3 space-y-4 overflow-y-auto">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="px-2.5 mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground-muted/70">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileNav(false)}
                  className={({ isActive }) =>
                    `group relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-foreground-secondary hover:bg-secondary/60 hover:text-foreground"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />}
                      <item.icon size={17} className={isActive ? "text-primary" : "text-foreground-muted group-hover:text-foreground"} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
            {getInitials(profile.name, user.email)}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-foreground truncate">{profile.name || user.email?.split("@")[0]}</p>
            <p className="text-[10px] text-primary font-semibold">Super Admin</p>
          </div>
        </div>
        <button
          onClick={async () => {
            await signOut();
            navigate("/adminosciva");
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-foreground-muted hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      {(!isMobile || mobileNav) && sidebar}
      {isMobile && mobileNav && (
        <div className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm" onClick={() => setMobileNav(false)} />
      )}
      <div className={isMobile ? "" : "pl-[236px]"}>
        <header className="sticky top-0 z-20 flex items-center gap-3 h-16 px-4 sm:px-6 border-b border-border bg-background/80 backdrop-blur">
          {isMobile && (
            <button onClick={() => setMobileNav(true)} className="p-2 rounded-lg hover:bg-secondary text-foreground-muted">
              <Menu size={18} />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-bold text-foreground truncate">{current?.label ?? "Admin"}</h1>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-success" /> Production
          </span>
          <GlobalSearch />
        </header>
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
