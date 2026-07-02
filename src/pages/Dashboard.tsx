import Topbar from "@/components/layout/Topbar";
import { Bot, MessageSquare, MessagesSquare, Clock, TrendingUp, TrendingDown, Plus, ArrowRight, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAgents } from "@/context/AgentContext";
import { useTheme } from "@/hooks/useTheme";
import { agentAvatarStyle } from "@/lib/agentColor";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { getLast7Days, onStatsChanged } from "@/lib/agentStats";
import { useAuth } from "@/hooks/useAuth";

const EASE = [0.22, 1, 0.36, 1] as const;

const cardVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: EASE } }),
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { agents, refreshFromStorage } = useAgents();
  const { theme } = useTheme();
  const { profile, user } = useAuth();
  const [tick, setTick] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      refreshFromStorage();
      setTick((t) => t + 1);
      setLastUpdated(Date.now());
    }, 30000);
    const off = onStatsChanged(() => {
      refreshFromStorage();
      setTick((t) => t + 1);
      setLastUpdated(Date.now());
    });
    return () => {
      clearInterval(id);
      off();
    };
  }, [refreshFromStorage]);

  const weeklyData = useMemo(() => getLast7Days(), [tick, agents]);
  const maxVal = Math.max(1, ...weeklyData.map((d) => d.value));
  const todayIndex = weeklyData.length - 1;

  const totalMessages = useMemo(() => agents.reduce((s, a) => s + a.messages, 0), [agents]);
  const totalConversations = useMemo(() => agents.reduce((s, a) => s + a.conversations, 0), [agents]);
  const activeAgents = useMemo(() => agents.filter((a) => a.active), [agents]);
  const weekTotal = useMemo(() => weeklyData.reduce((s, d) => s + d.value, 0), [weeklyData]);

  const stats = [
    { label: "Total agents", value: String(agents.length), trend: agents.length > 0 ? `${activeAgents.length} active` : "Create your first", up: true, icon: Bot, tint: "text-primary bg-primary/10" },
    { label: "Total messages", value: totalMessages.toLocaleString(), trend: "Live", up: true, icon: MessageSquare, tint: "text-success bg-success/10" },
    { label: "Conversations", value: totalConversations.toLocaleString(), trend: "Live", up: true, icon: MessagesSquare, tint: "text-info bg-info/10" },
    { label: "Avg response", value: "1.2s", trend: "0.3s faster", up: false, icon: Clock, tint: "text-warning bg-warning/10" },
  ];

  const updatedAgo = Math.max(0, Math.floor((Date.now() - lastUpdated) / 1000));
  const greeting = new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening";

  // First name for the greeting (from profile, falling back to email local part)
  const firstName = useMemo(() => {
    const raw = profile?.name?.trim() || user?.email?.split("@")[0] || "there";
    const first = raw.split(/[\s._-]+/)[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  }, [profile?.name, user?.email]);

  // Rotating greeting phrases (cycles every few seconds)
  const phrases = useMemo(
    () => [`Good ${greeting}, ${firstName}`, `Let's build, ${firstName}`, `Welcome back, ${firstName}`],
    [greeting, firstName],
  );
  const [phraseIdx, setPhraseIdx] = useState(0);
  useEffect(() => {
    let step = 0;
    const id = setInterval(() => {
      step += 1;
      setPhraseIdx(step % phrases.length);
      // Run one full loop, then settle back on the greeting and stop.
      if (step >= phrases.length) clearInterval(id);
    }, 4500);
    return () => clearInterval(id);
  }, [phrases.length]);

  return (
    <>
      <Topbar title="Dashboard" subtitle="Welcome back to Osciva AI" />
      <div className="p-4 sm:p-6 space-y-5">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative overflow-hidden rounded-2xl border border-border bg-[#0B0E14] p-6"
        >
          <div className="absolute inset-0 bg-aurora-dark" aria-hidden />
          <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-primary/25 blur-[90px]" aria-hidden />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={phraseIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="text-[20px] font-extrabold text-white display"
                >
                  {phrases[phraseIdx]}
                </motion.h2>
              </AnimatePresence>
              <p className="text-[13.5px] text-white/60 mt-1">Here's how your AI agents are performing today.</p>
              <p className="text-[11px] text-white/40 mt-2">Updated {updatedAgo < 5 ? "just now" : `${updatedAgo}s ago`}</p>
            </div>
            <button
              onClick={() => navigate("/agents/create")}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-full text-[13.5px] font-semibold hover:bg-[#e05f40] transition-colors shadow-brand shrink-0"
            >
              <Plus size={16} /> New agent
            </button>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariant}
              className="rounded-2xl border border-border bg-card p-5 hover:shadow-premium transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[12px] text-foreground-muted font-medium">{s.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.tint}`}>
                  <s.icon size={16} />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-foreground display">{s.value}</div>
              <div className={`mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium ${s.up ? "text-success" : "text-info"}`}>
                {s.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {s.trend}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chart + Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2 rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[14px] font-bold text-foreground">Weekly messages</h3>
                <p className="text-[12px] text-foreground-muted mt-0.5">{weekTotal.toLocaleString()} in the last 7 days</p>
              </div>
              <span className="text-[11px] text-foreground-secondary bg-secondary px-2.5 py-1 rounded-full font-medium">Last 7 days</span>
            </div>
            <div className="flex items-stretch gap-2 sm:gap-3 h-48">
              {weeklyData.map((d, i) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className={`text-[11px] font-bold tabular-nums ${i === todayIndex ? "text-primary" : "text-foreground-secondary"}`}>
                    {d.value.toLocaleString()}
                  </span>
                  {/* full-height track so the chart reads as columns even with low data */}
                  <div className="relative w-full flex-1 rounded-md bg-secondary/60 overflow-hidden">
                    <motion.div
                      key={`${d.date}-${d.value}`}
                      initial={{ height: 0 }}
                      animate={{ height: `${(d.value / maxVal) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.55, ease: EASE }}
                      className={`absolute bottom-0 inset-x-0 rounded-md min-h-[3px] ${
                        i === todayIndex ? "bg-primary" : "bg-primary/45 group-hover:bg-primary/65 transition-colors"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] font-medium ${i === todayIndex ? "text-primary" : "text-foreground-muted"}`}>{d.day}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-bold text-foreground">Active agents</h3>
              <button onClick={() => navigate("/agents")} className="text-[11px] text-foreground-muted hover:text-primary transition-colors inline-flex items-center gap-1">
                View all <ArrowUpRight size={12} />
              </button>
            </div>
            <div className="space-y-1.5">
              {activeAgents.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Bot size={22} className="text-primary" />
                  </div>
                  <p className="text-[12px] text-foreground-muted mb-3">No active agents yet</p>
                  <button
                    onClick={() => navigate("/agents/create")}
                    className="text-[12px] text-primary font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    Create your first <ArrowRight size={12} />
                  </button>
                </div>
              ) : (
                activeAgents.slice(0, 6).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer"
                    onClick={() => navigate(`/agents/edit/${a.id}`)}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0" style={agentAvatarStyle(a.color, theme === "dark")}>
                      {a.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-foreground truncate">{a.name}</div>
                      <div className="text-[11px] text-foreground-muted">{a.messages.toLocaleString()} msgs · {a.conversations} convs</div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-success shrink-0" />
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Insight card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="rounded-2xl border border-border bg-card p-5 flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp size={20} className="text-primary" />
          </div>
          <p className="text-[13px] text-foreground-secondary leading-relaxed">
            Your agents handled <span className="text-foreground font-semibold">{totalMessages.toLocaleString()} messages</span> across{" "}
            <span className="text-foreground font-semibold">{totalConversations.toLocaleString()} conversations</span>. Keep your knowledge base fresh to push resolution rates even higher.
          </p>
        </motion.div>
      </div>
    </>
  );
}
