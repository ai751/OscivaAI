import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { notify } from "@/lib/notify";

export interface AgentSource {
  id: string;
  name: string;
  type: string;
  size: string;
  status: string;
}

export interface AgentChunk {
  text: string;
  sourceId: string;
}

export interface Agent {
  id: string;
  name: string;
  instructions: string;
  model: string;
  personality: string;
  color: string;
  position: "left" | "right";
  chatIcon: string;
  logoUrl: string;
  welcomeMsg: string;
  suggestions: string[];
  sources: AgentSource[];
  chunks: AgentChunk[];
  passwordEnabled: boolean;
  /** Write-only: the plaintext access password to set. Never populated on read. */
  password?: string;
  rateLimitEnabled: boolean;
  rateLimitPerHour: number;
  domains: string[];
  messages: number;
  conversations: number;
  rating: number;
  active: boolean;
  createdAt: string;
}

interface AgentContextType {
  agents: Agent[];
  loading: boolean;
  /** Creates the agent and resolves with its new DB id. */
  addAgent: (agent: Agent) => Promise<string>;
  updateAgent: (id: string, agent: Partial<Agent>) => Promise<void>;
  deleteAgent: (id: string) => Promise<void>;
  updateAgentStats: (id: string, messageDelta: number, conversationDelta: number) => Promise<void>;
  refreshFromStorage: () => Promise<void>;
}

const AgentContext = createContext<AgentContextType | null>(null);

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// SHA-256 hex — the access password is hashed before it leaves the browser.
async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Persist (or clear) an agent's access password in the owner-only agent_access table.
async function writeAgentPassword(agentId: string, password: string | undefined, enabled: boolean) {
  if (!enabled) {
    // Protection turned off → remove any stored hash.
    await supabase.from("agent_access").delete().eq("agent_id", agentId);
    return;
  }
  if (password && password.trim()) {
    const password_hash = await sha256Hex(password.trim());
    await supabase
      .from("agent_access")
      .upsert({ agent_id: agentId, password_hash, updated_at: new Date().toISOString() });
  }
  // enabled but no new password provided → keep the existing hash untouched.
}

function rowToAgent(
  row: any,
  sources: any[],
  chunks: any[],
): Agent {
  const agentSources: AgentSource[] = sources.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    size: s.size,
    status: s.status,
  }));
  const agentChunks: AgentChunk[] = chunks
    .sort((a, b) => a.chunk_index - b.chunk_index)
    .map((c) => ({ text: c.content, sourceId: c.source_id }));
  return {
    id: row.id,
    name: row.name,
    instructions: row.instructions,
    model: row.model,
    personality: row.personality,
    color: row.color,
    position: row.position,
    chatIcon: row.chat_icon,
    logoUrl: row.logo_url ?? "",
    welcomeMsg: row.welcome_msg,
    suggestions: row.suggestions ?? [],
    sources: agentSources,
    chunks: agentChunks,
    passwordEnabled: row.password_enabled,
    rateLimitEnabled: row.rate_limit_enabled,
    rateLimitPerHour: row.rate_limit_per_hour ?? 20,
    domains: row.domains ?? [],
    messages: row.message_count ?? 0,
    conversations: row.conversation_count ?? 0,
    rating: 0,
    active: row.active,
    createdAt: row.created_at,
  };
}

export function AgentProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAgents = useCallback(async () => {
    if (!user) {
      setAgents([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: agentRows } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!agentRows) { setAgents([]); return; }
      const ids = agentRows.map((a) => a.id);
      const [{ data: sources }, { data: chunks }] = await Promise.all([
        ids.length
          ? supabase.from("agent_sources").select("*").in("agent_id", ids)
          : Promise.resolve({ data: [] as any[] }),
        ids.length
          ? supabase.from("agent_chunks").select("*").in("agent_id", ids)
          : Promise.resolve({ data: [] as any[] }),
      ]);
      const byAgentS: Record<string, any[]> = {};
      const byAgentC: Record<string, any[]> = {};
      (sources ?? []).forEach((s: any) => {
        (byAgentS[s.agent_id] ||= []).push(s);
      });
      (chunks ?? []).forEach((c: any) => {
        (byAgentC[c.agent_id] ||= []).push(c);
      });
      setAgents(agentRows.map((r) => rowToAgent(r, byAgentS[r.id] ?? [], byAgentC[r.id] ?? [])));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    loadAgents();
  }, [authLoading, loadAgents]);

  // Cross-tab sync trigger
  useEffect(() => {
    const handler = () => loadAgents();
    window.addEventListener("osciva-agents-updated", handler);
    return () => window.removeEventListener("osciva-agents-updated", handler);
  }, [loadAgents]);

  const addAgent = async (agent: Agent) => {
    if (!user) throw new Error("Not authenticated");
    // Insert agent (let DB generate uuid; ignore client id)
    const { data: inserted, error } = await supabase
      .from("agents")
      .insert({
        user_id: user.id,
        name: agent.name,
        instructions: agent.instructions,
        model: agent.model,
        personality: agent.personality,
        color: agent.color,
        position: agent.position,
        chat_icon: agent.chatIcon,
        logo_url: agent.logoUrl,
        welcome_msg: agent.welcomeMsg,
        suggestions: agent.suggestions,
        password_enabled: agent.passwordEnabled,
        rate_limit_enabled: agent.rateLimitEnabled,
        rate_limit_per_hour: agent.rateLimitPerHour,
        domains: agent.domains,
        active: agent.active,
      })
      .select()
      .single();
    if (error || !inserted) throw error;
    const agentId = inserted.id;

    // Store the access password (if any) in the owner-only table.
    await writeAgentPassword(agentId, agent.password, agent.passwordEnabled);

    // Notify the owner (shows live in the dashboard bell). Best-effort.
    void notify("agent", `🎉 ${agent.name} is live!`, `Congrats — your new agent "${agent.name}" is ready. Embed it on your site to start helping customers.`, agentId);

    // Map old client source IDs -> new DB IDs
    const idMap: Record<string, string> = {};
    if (agent.sources.length) {
      const sourcePayload = agent.sources.map((s) => ({
        agent_id: agentId,
        user_id: user.id,
        name: s.name,
        type: s.type,
        size: s.size,
        status: s.status,
      }));
      const { data: insSources } = await supabase
        .from("agent_sources")
        .insert(sourcePayload)
        .select();
      (insSources ?? []).forEach((row: any, i: number) => {
        idMap[agent.sources[i].id] = row.id;
      });
    }

    if (agent.chunks.length) {
      const chunkPayload = agent.chunks.map((c, i) => ({
        agent_id: agentId,
        source_id: idMap[c.sourceId] ?? null,
        chunk_index: i,
        content: c.text,
      })).filter((c) => c.source_id);
      for (const batch of chunk(chunkPayload, 100)) {
        await supabase.from("agent_chunks").insert(batch);
      }
      // Build embeddings server-side (RAG). Fire-and-forget; sources flip to
      // "Indexed ✓" when the edge function finishes.
      supabase.functions.invoke("ingest", { body: { agentId } }).catch(() => {});
    }

    await loadAgents();
    return agentId;
  };

  const updateAgent = async (id: string, data: Partial<Agent>) => {
    if (!user) return;
    const agentName = data.name ?? agents.find((a) => a.id === id)?.name ?? "your agent";
    const patch: any = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.instructions !== undefined) patch.instructions = data.instructions;
    if (data.model !== undefined) patch.model = data.model;
    if (data.personality !== undefined) patch.personality = data.personality;
    if (data.color !== undefined) patch.color = data.color;
    if (data.position !== undefined) patch.position = data.position;
    if (data.chatIcon !== undefined) patch.chat_icon = data.chatIcon;
    if (data.logoUrl !== undefined) patch.logo_url = data.logoUrl;
    if (data.welcomeMsg !== undefined) patch.welcome_msg = data.welcomeMsg;
    if (data.suggestions !== undefined) patch.suggestions = data.suggestions;
    if (data.passwordEnabled !== undefined) patch.password_enabled = data.passwordEnabled;
    if (data.rateLimitEnabled !== undefined) patch.rate_limit_enabled = data.rateLimitEnabled;
    if (data.rateLimitPerHour !== undefined) patch.rate_limit_per_hour = data.rateLimitPerHour;
    if (data.domains !== undefined) patch.domains = data.domains;
    if (data.active !== undefined) patch.active = data.active;
    if (Object.keys(patch).length) {
      await supabase.from("agents").update(patch).eq("id", id);
    }

    // Update / clear the access password (owner-only table).
    if (data.passwordEnabled !== undefined || data.password !== undefined) {
      await writeAgentPassword(id, data.password, data.passwordEnabled ?? true);
    }

    // Replace sources/chunks if provided
    if (data.sources !== undefined) {
      await supabase.from("agent_sources").delete().eq("agent_id", id);
      const idMap: Record<string, string> = {};
      if (data.sources.length) {
        const { data: ins } = await supabase
          .from("agent_sources")
          .insert(
            data.sources.map((s) => ({
              agent_id: id,
              user_id: user.id,
              name: s.name,
              type: s.type,
              size: s.size,
              status: s.status,
            })),
          )
          .select();
        (ins ?? []).forEach((row: any, i: number) => {
          idMap[data.sources![i].id] = row.id;
        });
      }
      // Always replace chunks when sources change
      await supabase.from("agent_chunks").delete().eq("agent_id", id);
      const newChunks = data.chunks ?? [];
      if (newChunks.length) {
        const payload = newChunks
          .map((c, i) => ({
            agent_id: id,
            source_id: idMap[c.sourceId] ?? null,
            chunk_index: i,
            content: c.text,
          }))
          .filter((c) => c.source_id);
        for (const batch of chunk(payload, 100)) {
          await supabase.from("agent_chunks").insert(batch);
        }
      }
    } else if (data.chunks !== undefined) {
      // Chunks-only replace (sources unchanged)
      await supabase.from("agent_chunks").delete().eq("agent_id", id);
      if (data.chunks.length) {
        const payload = data.chunks.map((c, i) => ({
          agent_id: id,
          source_id: c.sourceId,
          chunk_index: i,
          content: c.text,
        }));
        for (const batch of chunk(payload, 100)) {
          await supabase.from("agent_chunks").insert(batch);
        }
      }
    }

    // If knowledge changed, (re)build embeddings server-side for the new chunks.
    if (data.sources !== undefined || data.chunks !== undefined) {
      supabase.functions.invoke("ingest", { body: { agentId: id } }).catch(() => {});
    }

    const knowledgeChanged = data.sources !== undefined || data.chunks !== undefined;
    void notify(
      "agent",
      `Agent updated: ${agentName}`,
      knowledgeChanged ? `Knowledge base for "${agentName}" was re-indexed.` : `Your changes to "${agentName}" were saved.`,
      id,
    );

    await loadAgents();
  };

  const deleteAgent = async (id: string) => {
    const name = agents.find((a) => a.id === id)?.name ?? "Agent";
    await supabase.from("agents").delete().eq("id", id);
    setAgents((prev) => prev.filter((a) => a.id !== id));
    void notify("agent", `Agent deleted: ${name}`);
  };

  const updateAgentStats = async (id: string, msgs: number, convs: number) => {
    const target = agents.find((a) => a.id === id);
    if (!target) return;
    await supabase
      .from("agents")
      .update({
        message_count: target.messages + msgs,
        conversation_count: target.conversations + convs,
      })
      .eq("id", id);
    setAgents((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, messages: a.messages + msgs, conversations: a.conversations + convs } : a,
      ),
    );
  };

  const refreshFromStorage = async () => {
    await loadAgents();
  };

  return (
    <AgentContext.Provider
      value={{ agents, loading, addAgent, updateAgent, deleteAgent, updateAgentStats, refreshFromStorage }}
    >
      {children}
    </AgentContext.Provider>
  );
}

export function useAgents() {
  const ctx = useContext(AgentContext);
  if (!ctx) throw new Error("useAgents must be used within AgentProvider");
  return ctx;
}
