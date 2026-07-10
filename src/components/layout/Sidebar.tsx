import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Bot, PlusCircle, BarChart3, Code2, Key,
  BookOpen, Settings, LogOut, ChevronLeft, ChevronRight, X, ArrowUpRight, ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";

const groups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { label: "My Agents", icon: Bot, path: "/agents" },
      { label: "Analytics", icon: BarChart3, path: "/analytics" },
    ],
  },
  {
    label: "Build",
    items: [
      { label: "Create Agent", icon: PlusCircle, path: "/agents/create" },
      { label: "Embed & Deploy", icon: Code2, path: "/embed" },
      { label: "API Keys", icon: Key, path: "/api-keys" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Documentation", icon: BookOpen, path: "/docs" },
      { label: "Settings", icon: Settings, path: "/settings" },
    ],
  },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

function isActive(path: string, pathname: string): boolean {
  if (path === "/dashboard") return pathname === "/dashboard";
  if (path === "/agents") return pathname === "/agents";
  if (path === "/agents/create") return pathname === "/agents/create" || pathname.startsWith("/agents/edit/");
  return pathname === path;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const { signOut, profile, user } = useAuth();

  const showLabels = !collapsed || isMobile;

  // Admin group only renders for is_admin accounts; the real gate is server-side.
  const navGroups = profile?.is_admin
    ? [...groups, { label: "Platform", items: [{ label: "Admin console", icon: ShieldCheck, path: "/adminosciva/dashboard" }] }]
    : groups;

  const handleNav = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  if (isMobile && !mobileOpen) return null;

  return (
    <>
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      )}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-border bg-card transition-all duration-300 ${
          isMobile ? "w-[260px] shadow-2xl" : ""
        }`}
        style={!isMobile ? { width: collapsed ? 72 : 236 } : undefined}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-16 shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="h-8 w-8 object-contain" />
            {showLabels && <span className="text-[15px] font-bold tracking-[-0.02em] text-foreground">Osciva <span className="text-primary">AI</span></span>}
          </div>
          {isMobile && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-foreground-muted">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-3 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isActive(item.path, location.pathname);
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      title={collapsed && !isMobile ? item.label : undefined}
                      className={`group relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all ${
                        active
                          ? "bg-secondary text-foreground"
                          : "text-foreground-secondary hover:bg-secondary/60 hover:text-foreground"
                      } ${collapsed && !isMobile ? "justify-center" : ""}`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-primary" />
                      )}
                      <item.icon size={18} className={active ? "text-primary" : "text-foreground-muted group-hover:text-foreground"} />
                      {showLabels && item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Current plan + upgrade */}
        {showLabels && (
          <div className="px-3 pb-2">
            <button
              onClick={() => navigate("/pricing")}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary/60 transition-colors text-left"
            >
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold text-foreground capitalize truncate">
                  {(profile?.plan || "Free")} plan
                </span>
                <span className="block text-[10.5px] text-foreground-muted">Upgrade for more agents</span>
              </span>
              <ArrowUpRight size={15} className="text-primary shrink-0" />
            </button>
          </div>
        )}

        {/* Bottom */}
        <div className="p-3 border-t border-border space-y-1">
          {showLabels && (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                {(profile?.name || user?.email || "U").slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-foreground truncate">{profile?.name || user?.email?.split("@")[0] || "User"}</p>
                <p className="text-[10px] text-foreground-muted truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            title={collapsed && !isMobile ? "Sign out" : undefined}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-foreground-muted hover:bg-destructive/10 hover:text-destructive transition-all ${
              collapsed && !isMobile ? "justify-center" : ""
            }`}
          >
            <LogOut size={17} />
            {showLabels && "Sign out"}
          </button>
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center py-1.5 text-foreground-muted hover:text-foreground transition-colors"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
