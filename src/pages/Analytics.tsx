import Topbar from "@/components/layout/Topbar";
import { MessageSquare, MessagesSquare, CheckCircle, Star, Bot, ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useAgents } from "@/context/AgentContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { planLimits } from "@/lib/plans";

interface ConversationRow {
  id: string;
  agent_id: string;
  message_count: number;
  last_message_at: string;
}
interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export default function Analytics() {
  const { agents } = useAgents();
  const { profile } = useAuth();
  const limits = planLimits(profile?.plan);

  const totalMessages = agents.reduce((sum, a) => sum + a.messages, 0);
  const totalConversations = agents.reduce((sum, a) => sum + a.conversations, 0);
  const avgRating = agents.length > 0
    ? (agents.reduce((sum, a) => sum + a.rating, 0) / agents.length).toFixed(1)
    : "0.0";
  const activeAgents = agents.filter((a) => a.active).length;

  const agentName = (id: string) => agents.find((a) => a.id === id)?.name ?? "Agent";

  // --- Recent conversation transcripts (owner-only via RLS) ---
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ConversationMessage[]>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        let q = supabase
          .from("conversations")
          .select("id, agent_id, message_count, last_message_at")
          .order("last_message_at", { ascending: false })
          .limit(25);
        // Free plan keeps 7 days of visible history; paid plans see everything.
        if (limits.analyticsDays) {
          const cutoff = new Date(Date.now() - limits.analyticsDays * 24 * 60 * 60 * 1000).toISOString();
          q = q.gte("last_message_at", cutoff);
        }
        const { data, error } = await q;
        if (!error && active && data) setConversations(data as ConversationRow[]);
      } catch {
        // table may not be deployed yet — silently skip the section
      }
    })();
    return () => { active = false; };
  }, [agents.length, limits.analyticsDays]);

  const toggleConversation = async (id: string) => {
    if (expandedId === id) { setExpandedId(null); return; }
    setExpandedId(id);
    if (!messages[id]) {
      try {
        const { data } = await supabase
          .from("conversation_messages")
          .select("id, role, content, created_at")
          .eq("conversation_id", id)
          .order("created_at", { ascending: true });
        setMessages((prev) => ({ ...prev, [id]: (data as ConversationMessage[]) ?? [] }));
      } catch {
        setMessages((prev) => ({ ...prev, [id]: [] }));
      }
    }
  };

  const stats = [
    { label: "Total Messages", value: totalMessages.toLocaleString(), icon: MessageSquare, color: "text-primary" },
    { label: "Conversations", value: totalConversations.toLocaleString(), icon: MessagesSquare, color: "text-info" },
    { label: "Active Agents", value: `${activeAgents}`, icon: CheckCircle, color: "text-success" },
    { label: "Avg Rating", value: `${avgRating}/5`, icon: Star, color: "text-warning" },
  ];

  if (agents.length === 0) {
    return (
      <>
        <Topbar title="Analytics" subtitle="Performance insights" />
        <div className="p-6 animate-fade-up flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bot size={32} className="text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">No data yet</h2>
          <p className="text-sm text-foreground-muted text-center max-w-sm">
            Create and deploy agents to start seeing analytics. Data will appear here in real-time as your agents handle conversations.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Analytics" subtitle="Performance insights" />
      <div className="p-4 md:p-6 space-y-6 animate-fade-up">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-foreground-muted font-medium">{s.label}</span>
                <s.icon size={18} className={s.color} />
              </div>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Agent table */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">Agent Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Agent", "Messages", "Conversations", "Rating", "Sources", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agents.map((a) => (
                  <tr key={a.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-xs font-medium text-foreground">{a.name}</td>
                    <td className="px-4 py-3 text-xs text-foreground-secondary">{a.messages.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-foreground-secondary">{a.conversations}</td>
                    <td className="px-4 py-3 text-xs text-warning font-medium">{a.rating}</td>
                    <td className="px-4 py-3 text-xs text-foreground-secondary">{a.sources.length}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${a.active ? "bg-success/10 text-success" : "bg-foreground-muted/10 text-foreground-muted"}`}>
                        {a.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent conversations */}
        {conversations.length > 0 && (
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Recent Conversations</h3>
              <p className="text-[11px] text-foreground-muted mt-0.5">
                Real visitor chats from your embedded widget. Click to view the transcript.
                {limits.analyticsDays ? ` Free plan shows the last ${limits.analyticsDays} days — upgrade for full history.` : ""}
              </p>
            </div>
            <div className="divide-y divide-border/50">
              {conversations.map((c) => (
                <div key={c.id}>
                  <button
                    onClick={() => toggleConversation(c.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors text-left"
                  >
                    {expandedId === c.id ? <ChevronDown size={14} className="text-foreground-muted shrink-0" /> : <ChevronRight size={14} className="text-foreground-muted shrink-0" />}
                    <span className="text-xs font-medium text-foreground flex-1 truncate">{agentName(c.agent_id)}</span>
                    <span className="text-[10px] text-foreground-muted">{new Date(c.last_message_at).toLocaleString()}</span>
                  </button>
                  {expandedId === c.id && (
                    <div className="px-4 pb-4 pt-1 space-y-2 bg-secondary/20">
                      {(messages[c.id] ?? []).length === 0 ? (
                        <p className="text-[11px] text-foreground-muted py-2">No messages.</p>
                      ) : (
                        messages[c.id].map((m) => (
                          <div key={m.id} className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : ""}`}>
                            <div className={`p-2 rounded-lg text-[11px] whitespace-pre-wrap ${
                              m.role === "user"
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-background border border-border text-foreground-secondary rounded-bl-none"
                            }`}>
                              {m.content}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
