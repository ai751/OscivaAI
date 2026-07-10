import Topbar from "@/components/layout/Topbar";
import { useState } from "react";
import { Copy, Check, Send, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAgents } from "@/context/AgentContext";
import { recordAgentActivity } from "@/lib/agentStats";

// Public chat edge function, the same backend the embedded widget uses.
const CHAT_FN = `${import.meta.env.VITE_SUPABASE_URL ?? "https://ydvzfinuypdjkfnzdpkt.supabase.co"}/functions/v1/chat`;

type ChatMessage = { role: "user" | "assistant"; content: string };

const configOptions = [
  { key: "data-agent-id", type: "string", desc: "Your Osciva agent ID (required)" },
  { key: "data-api", type: "string", desc: "Osciva chat endpoint (pre-filled, don't change)" },
];

const installSteps = [
  {
    title: "Copy the snippet",
    body: "Hit Copy above. It's a single <script> tag, no build step, no dependencies, no npm install.",
  },
  {
    title: "Open your site's HTML",
    body: "Edit the page's source, your theme's global template, or your CMS's “custom HTML / footer code” box. Anywhere you can add raw HTML works.",
  },
  {
    title: "Paste it right before </body>",
    body: "Drop the snippet just above the closing </body> tag. Putting it at the end of the page means the widget never blocks your content from loading.",
  },
  {
    title: "Save & publish, then reload",
    body: "Refresh the live page, a chat bubble appears in the corner. That's it; the widget pulls its config, knowledge base, and styling from this agent automatically.",
  },
];

export default function Embed() {
  const { agents } = useAgents();
  const [selectedAgent, setSelectedAgent] = useState(0);
  const [copied, setCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const currentAgent = agents[selectedAgent];
  const agentId = currentAgent?.id ?? "";

  // Widget is served from this app's own domain (Vite/Vercel serves /public).
  const widgetSrc = `${typeof window !== "undefined" ? window.location.origin : "https://app.osciva.io"}/osciva-chat.js`;

  const htmlSnippet = currentAgent
    ? `<!-- Osciva AI Chat Widget -->
<script src="${widgetSrc}"
  data-agent-id="${currentAgent.id}"
  data-api="${CHAT_FN}"></script>`
    : "";

  const copyCode = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const sendTestMessage = async () => {
    if (!chatInput.trim() || chatLoading || !currentAgent) return;
    const userMsg = chatInput.trim();
    const newHistory: ChatMessage[] = [...chatMessages, { role: "user", content: userMsg }];
    setChatMessages(newHistory);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch(CHAT_FN, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ agentId: currentAgent.id, messages: newHistory.slice(-12), test: true }),
      });
      const data = await res.json();
      const reply = data?.reply || (data?.error ? `Error: ${data.error}` : "(no response)");
      setChatMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      recordAgentActivity(currentAgent.id);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${err instanceof Error ? err.message : "Connection failed"}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <>
      <Topbar title="Embed & Deploy" subtitle="Add your AI agent to any website" />
      <div className="p-6 space-y-6 animate-fade-up">
        {agents.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <p className="text-sm text-foreground-muted">No agents created yet. Create an agent first to generate embed code.</p>
          </div>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap">
              {agents.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAgent(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedAgent === i ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground-secondary hover:bg-secondary"
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>

            <div className="glass-card p-4 flex items-center gap-3">
              <span className="text-xs text-foreground-muted">Agent ID:</span>
              <code className="flex-1 text-xs font-mono text-primary bg-secondary px-3 py-1.5 rounded">{agentId}</code>
              <button onClick={() => { navigator.clipboard.writeText(agentId); toast.success("Agent ID copied!"); }} className="p-2 rounded-lg hover:bg-secondary text-foreground-muted hover:text-foreground">
                <Copy size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">HTML embed snippet</h2>
                  <p className="text-[11px] text-foreground-muted mt-0.5">One script tag. Works on any website or CMS that lets you add HTML.</p>
                </div>

                <div className="glass-card p-4 relative">
                  <button
                    onClick={copyCode}
                    className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-[10px] font-medium text-foreground-secondary hover:text-foreground transition-colors z-10"
                  >
                    {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <pre className="text-[11px] text-foreground-secondary overflow-x-auto leading-relaxed font-mono whitespace-pre-wrap max-h-[480px] overflow-y-auto">
                    {htmlSnippet}
                  </pre>
                </div>

                <div className="glass-card p-5 space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">How &amp; where to embed</h3>
                    <p className="text-[11px] text-foreground-muted mt-0.5">Four steps from copy to a live chat bubble.</p>
                  </div>

                  <ol className="space-y-3">
                    {installSteps.map((s, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{s.title}</p>
                          <p className="text-[11px] text-foreground-muted leading-relaxed mt-0.5">{s.body}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="border-t border-border pt-4">
                    <h4 className="text-xs font-semibold text-foreground-secondary mb-2">Where it shows up</h4>
                    <p className="text-[11px] text-foreground-muted leading-relaxed">
                      The widget injects a floating chat launcher pinned to the bottom corner of the page (left or right, per the agent's
                      Appearance settings), it doesn't take over your layout. Add the snippet to a global template/footer to load it
                      site-wide, or to a single page's HTML to scope it to that page only.
                    </p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="text-xs font-semibold text-foreground-secondary mb-2">Technical notes</h4>
                    <ul className="space-y-1.5 text-[11px] text-foreground-muted leading-relaxed list-disc pl-4">
                      <li>The script is loaded <span className="text-foreground-secondary">async</span> and renders into its own container, so it never blocks page render.</li>
                      <li>Add it <span className="text-foreground-secondary">once per page</span>, a second copy of the tag will load a duplicate widget.</li>
                      <li>
                        <span className="text-foreground-secondary">data-agent-id</span> is required; <span className="text-foreground-secondary">data-api</span> is pre-filled, leave it as-is.
                      </li>
                      <li>No cookies, no framework, no build step, it runs on plain HTML, React, Vue, Webflow, Shopify, WordPress, or any host that allows a script tag.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-foreground">Live Test Chat</h3>
                    <button onClick={() => setChatMessages([])} className="text-[10px] text-foreground-muted hover:text-foreground flex items-center gap-1">
                      <RotateCcw size={10} /> Clear
                    </button>
                  </div>
                  <p className="text-[10px] text-foreground-muted mb-3">Live answers from your agent's real backend + knowledge base, exactly what visitors get.</p>
                  <div className="bg-secondary/30 rounded-lg p-3 h-56 overflow-y-auto space-y-2 mb-2">
                    <div className="bg-background p-2 rounded-lg rounded-bl-none max-w-[85%] border border-border">
                      <p className="text-[11px] text-foreground-secondary">{currentAgent?.welcomeMsg ?? "Hi! How can I help you today?"}</p>
                    </div>
                    {chatMessages.map((m, i) => (
                      <div key={i} className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : ""}`}>
                        <div className={`p-2 rounded-lg text-[11px] whitespace-pre-wrap ${
                          m.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-background border border-border text-foreground-secondary rounded-bl-none"
                        }`}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="bg-background p-2 rounded-lg rounded-bl-none max-w-[60%] border border-border">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="w-1.5 h-1.5 bg-foreground-muted rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendTestMessage()}
                      placeholder="Type a message…"
                      className="flex-1 px-3 py-2 rounded-full bg-secondary border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button onClick={sendTestMessage} disabled={chatLoading} className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 disabled:opacity-50">
                      <Send size={12} />
                    </button>
                  </div>
                </div>

                <div className="glass-card p-4">
                  <h3 className="text-xs font-semibold text-foreground mb-3">Configuration Attributes</h3>
                  <div className="space-y-2.5">
                    {configOptions.map((c) => (
                      <div key={c.key} className="p-2 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-0.5">
                          <code className="text-[10px] text-primary font-mono">{c.key}</code>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-secondary text-foreground-muted">{c.type}</span>
                        </div>
                        <p className="text-[10px] text-foreground-muted">{c.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
