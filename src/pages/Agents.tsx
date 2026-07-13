import Topbar from "@/components/layout/Topbar";
import { Plus, MessageSquare, MessagesSquare, FileText, MoreVertical, Pencil, Code2, Trash2, Bot, Power, PowerOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAgents, type Agent } from "@/context/AgentContext";
import { useTheme } from "@/hooks/useTheme";
import { agentAvatarStyle } from "@/lib/agentColor";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { planLimits } from "@/lib/plans";

export default function Agents() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const limits = planLimits(profile?.plan);
  const { agents, deleteAgent, updateAgent, loading, refreshFromStorage } = useAgents();
  const { theme } = useTheme();
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    refreshFromStorage();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    await deleteAgent(id);
    setMenuOpen(null);
    toast.success(`"${name}" deleted`);
  };

  const handleToggleActive = async (a: Agent) => {
    if (toggling) return;
    const next = !a.active;
    setToggling(a.id);
    try {
      await updateAgent(a.id, { active: next });
      toast.success(
        next
          ? `"${a.name}" is live and responding`
          : `"${a.name}" is paused, it won't reply until you turn it back on`,
      );
    } catch {
      toast.error("Couldn't update the agent. Please try again.");
    } finally {
      setToggling(null);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar title="My Agents" subtitle="Loading…" />
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  if (agents.length === 0) {
    return (
      <>
        <Topbar title="My Agents" subtitle="No agents yet" />
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bot size={30} className="text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">No agents yet</h2>
            <p className="text-sm text-foreground-muted mt-1">Create your first AI agent to get started.</p>
          </div>
          <button
            onClick={() => navigate("/agents/create")}
            className="mt-1 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white text-sm font-semibold hover:bg-[#e05f40] transition-colors shadow-brand"
          >
            <Plus size={16} /> Create agent
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="My Agents" subtitle={`${agents.length} agent${agents.length !== 1 ? "s" : ""} deployed`} />
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-border bg-card p-5 hover:shadow-premium hover:border-primary/20 transition-all relative"
            >
              <div className="flex items-start gap-3 mb-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
                  style={agentAvatarStyle(a.color, theme === "dark")}
                >
                  {a.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-[14px] font-bold text-foreground truncate">{a.name}</h3>
                  <span className={`mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-medium ${a.active ? "text-success" : "text-foreground-muted"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${a.active ? "bg-success" : "bg-foreground-muted"}`} />
                    {a.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === a.id ? null : a.id)}
                    className="p-1.5 rounded-lg hover:bg-secondary text-foreground-muted"
                  >
                    <MoreVertical size={15} />
                  </button>
                  {menuOpen === a.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-0 top-9 w-36 bg-card border border-border rounded-xl shadow-premium py-1 z-20">
                        <button onClick={() => { setMenuOpen(null); navigate(`/agents/edit/${a.id}`); }} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground-secondary hover:bg-secondary">
                          <Pencil size={13} /> Edit
                        </button>
                        <button onClick={() => { setMenuOpen(null); navigate("/embed"); }} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground-secondary hover:bg-secondary">
                          <Code2 size={13} /> Embed
                        </button>
                        <button
                          onClick={() => { setMenuOpen(null); handleToggleActive(a); }}
                          disabled={toggling === a.id}
                          className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-foreground-secondary hover:bg-secondary disabled:opacity-50"
                        >
                          {a.active ? <PowerOff size={13} /> : <Power size={13} />}
                          {a.active ? "Deactivate" : "Activate"}
                        </button>
                        <div className="my-1 border-t border-border" />
                        <button onClick={() => handleDelete(a.id, a.name)} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-destructive hover:bg-destructive/10">
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {[
                  { icon: MessageSquare, v: a.messages.toLocaleString(), l: "Messages" },
                  { icon: MessagesSquare, v: a.conversations.toLocaleString(), l: "Convos" },
                  { icon: FileText, v: a.sources.length.toString(), l: "Sources" },
                ].map((m) => (
                  <div key={m.l} className="rounded-xl bg-secondary/60 p-3 text-center">
                    <m.icon size={13} className="mx-auto mb-1.5 text-foreground-muted" />
                    <div className="text-[14px] font-bold text-foreground">{m.v}</div>
                    <div className="text-[10px] text-foreground-muted">{m.l}</div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] px-2.5 py-1 rounded-full bg-secondary text-foreground-secondary font-medium">{a.model}</span>
                <button
                  onClick={() => navigate(`/agents/edit/${a.id}`)}
                  className="text-[12px] font-semibold text-primary hover:underline"
                >
                  Manage →
                </button>
              </div>
            </motion.div>
          ))}

          {agents.length >= limits.agents ? (
            <div className="min-h-[220px] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2.5 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                <Plus size={24} className="text-foreground-muted" />
              </div>
              <span className="text-sm font-semibold text-foreground-secondary">
                {limits.label} plan includes {limits.agents} agent{limits.agents > 1 ? "s" : ""}
              </span>
              <p className="text-[11px] text-foreground-muted -mt-1">Upgrade to create more agents.</p>
              <button
                onClick={() => navigate("/settings")}
                className="mt-1 px-4 py-2 rounded-full bg-primary text-white text-xs font-semibold hover:bg-[#e05f40] transition-colors"
              >
                View plans
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate(agents.length === 0 ? "/onboarding" : "/agents/create")}
              className="min-h-[220px] rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/[0.03] transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus size={24} className="text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground-secondary group-hover:text-primary transition-colors">
                {agents.length === 0 ? "Set up your first assistant" : "Create new agent"}
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
