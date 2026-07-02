import Topbar from "@/components/layout/Topbar";
import { useEffect, useState } from "react";
import { Shield, Eye, EyeOff, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { loadKeys, setKey, loadKeysFromServer, syncKeyToServer, ApiKeyMap, Provider } from "@/lib/apiKeyStore";
import { notify } from "@/lib/notify";

const providers: { name: Provider; docs: string; description?: string }[] = [
  { name: "OpenAI", docs: "https://platform.openai.com/api-keys" },
  { name: "Anthropic", docs: "https://console.anthropic.com/settings/keys" },
  { name: "Google AI", docs: "https://aistudio.google.com/apikey" },
  { name: "OpenRouter", docs: "https://openrouter.ai/keys", description: "Open-source gateway · use any LLM (Llama, Mistral, DeepSeek, Qwen, etc.)" },
];

export default function ApiKeys() {
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [keys, setKeys] = useState<ApiKeyMap>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    // Server is the source of truth; mirror into localStorage for the pre-save preview.
    setKeys(loadKeys());
    loadKeysFromServer().then((serverKeys) => {
      setKeys(serverKeys);
      (Object.keys(serverKeys) as Provider[]).forEach((p) => setKey(p, serverKeys[p] ?? ""));
    });
  }, []);

  const toggleVisibility = (name: string) => setVisible((prev) => ({ ...prev, [name]: !prev[name] }));

  const saveKey = async (name: Provider) => {
    const value = drafts[name]?.trim();
    if (!value) {
      toast.error("Please enter an API key first");
      return;
    }
    setKey(name, value); // local mirror
    setKeys((prev) => ({ ...prev, [name]: value }));
    setDrafts((prev) => ({ ...prev, [name]: "" }));
    try {
      await syncKeyToServer(name, value);
      toast.success(`${name} API key saved`);
      void notify("info", `${name} API key connected`, "Agents using this provider can now answer chats.");
    } catch {
      toast.error("Saved locally, but failed to sync to server. Check your connection.");
    }
  };

  const removeKey = async (name: Provider) => {
    setKey(name, "");
    setKeys((prev) => {
      const { [name]: _, ...rest } = prev;
      return rest;
    });
    await syncKeyToServer(name, "").catch(() => {});
    toast.success(`${name} key removed`);
  };

  return (
    <>
      <Topbar title="API Keys" subtitle="Manage your AI provider keys" />
      <div className="p-4 sm:p-6 space-y-4 max-w-4xl">
        <div className="rounded-2xl border border-border bg-card p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield size={17} className="text-primary" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-foreground">Saved securely to your account</p>
            <p className="text-[12px] text-foreground-muted mt-0.5 leading-relaxed">Keys are stored server-side in your Osciva account and used only when your widget answers. Visitors never see them.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {providers.map((p) => {
            const stored = keys[p.name];
            const hasKey = !!stored;
            return (
              <div key={p.name} className="rounded-2xl border border-border bg-card p-4 hover:shadow-premium transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-semibold text-foreground">{p.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      hasKey ? "bg-success/10 text-success" : "bg-foreground-muted/10 text-foreground-muted"
                    }`}>
                      {hasKey ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <a href={p.docs} target="_blank" rel="noopener" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                    Get API Key <ExternalLink size={10} />
                  </a>
                </div>
                {p.description && (
                  <p className="text-[10px] text-foreground-muted mb-3 -mt-2">{p.description}</p>
                )}
                {hasKey && (
                  <div className="mb-3 px-3 py-2 rounded-lg bg-secondary/50 text-[11px] font-mono text-foreground-muted">
                    {stored.slice(0, 6)}…{stored.slice(-4)}
                  </div>
                )}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={visible[p.name] ? "text" : "password"}
                      value={drafts[p.name] ?? ""}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [p.name]: e.target.value }))}
                      placeholder={hasKey ? "Replace existing key…" : "Enter API key…"}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-secondary border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button onClick={() => toggleVisibility(p.name)} className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground">
                      {visible[p.name] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <button onClick={() => saveKey(p.name)} className="px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-[#e05f40] transition-colors">
                    Save
                  </button>
                  {hasKey && (
                    <button
                      onClick={() => removeKey(p.name)}
                      className="p-2.5 rounded-lg bg-secondary text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-border bg-secondary/40 p-4 flex items-start gap-3">
          <Shield size={15} className="text-foreground-muted shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-foreground-muted leading-relaxed">
            Your key is used server-side only to call your chosen AI provider when your chatbot answers. It is never sent to the embedded widget or shown to your website visitors.
          </p>
        </div>
      </div>
    </>
  );
}
