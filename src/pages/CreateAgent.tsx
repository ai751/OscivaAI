import Topbar from "@/components/layout/Topbar";
import { useState, useRef } from "react";
import { Check, Upload, X, Plus, Send, RotateCcw, Sparkles, Copy, AlertCircle, Maximize2, Minimize2, ChevronDown, Search, FileText, Globe } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAgents, Agent, AgentSource, AgentChunk } from "@/context/AgentContext";
import { chatComplete, MissingApiKeyError, ChatMessage } from "@/lib/aiClient";
import { extractPdfText, extractUrlText, chunkText, retrieveTopChunks, buildRagSystemPrompt } from "@/lib/rag";
import { recordAgentActivity } from "@/lib/agentStats";
import { PROMPT_TEMPLATES, PromptTemplate } from "@/lib/promptTemplates";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { normalizePlan, planLimits, FREE_MODEL_ID, STARTER_MODEL_IDS, parseSizeMB } from "@/lib/plans";

const providers = [
  { id: "OpenAI", label: "OpenAI", dot: "#16a34a", desc: "GPT-4o & GPT-4o Mini", badge: "bg-green-100 text-green-700" },
  { id: "Anthropic", label: "Anthropic", dot: "#ea580c", desc: "Claude Sonnet & Haiku", badge: "bg-orange-100 text-orange-700" },
  { id: "Google", label: "Google", dot: "#2563eb", desc: "Gemini Flash & Pro", badge: "bg-blue-100 text-blue-700" },
  { id: "OpenRouter", label: "OpenRouter", dot: "#7c3aed", desc: "Llama, Mistral, DeepSeek +more", badge: "bg-purple-100 text-purple-700" },
];

const models = [
  // ---- OpenAI ----
  { id: "gpt-4o", name: "GPT-4o", desc: "Flagship · vision + text", provider: "OpenAI" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini", desc: "Fast & affordable", provider: "OpenAI" },
  { id: "gpt-4.1", name: "GPT-4.1", desc: "Smartest GPT-4 class", provider: "OpenAI" },
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini", desc: "Balanced speed/cost", provider: "OpenAI" },
  { id: "gpt-4.1-nano", name: "GPT-4.1 Nano", desc: "Cheapest, fastest", provider: "OpenAI" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", desc: "Previous flagship", provider: "OpenAI" },
  { id: "o4-mini", name: "o4-mini", desc: "Reasoning · efficient", provider: "OpenAI" },
  { id: "o3", name: "o3", desc: "Deep reasoning", provider: "OpenAI" },
  // ---- Anthropic ----
  { id: "claude-fable-5", name: "Claude Fable 5", desc: "Most capable model", provider: "Anthropic" },
  { id: "claude-opus-4-8", name: "Claude Opus 4.8", desc: "Top-tier reasoning", provider: "Anthropic" },
  { id: "claude-opus-4-7", name: "Claude Opus 4.7", desc: "Highly capable Opus", provider: "Anthropic" },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", desc: "Best speed/intelligence", provider: "Anthropic" },
  { id: "claude-haiku-4-5", name: "Claude Haiku 4.5", desc: "Fastest, most affordable", provider: "Anthropic" },
  { id: "claude-sonnet", name: "Claude Sonnet (legacy)", desc: "Alias → Sonnet 4.6", provider: "Anthropic" },
  { id: "claude-haiku", name: "Claude Haiku (legacy)", desc: "Alias → Haiku 4.5", provider: "Anthropic" },
  // ---- Google ----
  { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", desc: "Advanced reasoning", provider: "Google" },
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", desc: "Fast & smart", provider: "Google" },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", desc: "Google's fastest", provider: "Google" },
  { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash-Lite", desc: "Lightest & cheapest", provider: "Google" },
  { id: "gemini-flash", name: "Gemini Flash (legacy)", desc: "Alias → 2.0 Flash", provider: "Google" },
  { id: "gemini-pro", name: "Gemini Pro (legacy)", desc: "Alias → 2.5 Pro", provider: "Google" },
  // ---- OpenRouter (open-source & multi-vendor) ----
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", desc: "Meta · open-source flagship", provider: "OpenRouter" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", desc: "DeepSeek · cheap & smart", provider: "OpenRouter" },
  { id: "deepseek/deepseek-r1", name: "DeepSeek R1", desc: "DeepSeek · reasoning", provider: "OpenRouter" },
  { id: "mistralai/mistral-large", name: "Mistral Large", desc: "Mistral · strong reasoning", provider: "OpenRouter" },
  { id: "qwen/qwen-2.5-72b-instruct", name: "Qwen 2.5 72B", desc: "Alibaba · multilingual", provider: "OpenRouter" },
  { id: "x-ai/grok-2", name: "Grok 2", desc: "xAI · conversational", provider: "OpenRouter" },
  { id: "openrouter/auto", name: "OpenRouter Auto", desc: "Auto-route to best model", provider: "OpenRouter" },
  { id: "__custom_openrouter__", name: "Custom model…", desc: "Paste any OpenRouter slug", provider: "OpenRouter" },
];

const DEFAULT_INSTRUCTIONS =
  "You are a helpful customer support assistant for our company. Answer questions based on the provided knowledge base.";

const personalities = [
  { id: "professional", name: "Professional", desc: "Formal and precise" },
  { id: "friendly", name: "Friendly", desc: "Warm and approachable" },
  { id: "concise", name: "Concise", desc: "Brief and to the point" },
  { id: "expert", name: "Expert", desc: "Deep domain knowledge" },
  { id: "empathetic", name: "Empathetic", desc: "Understanding and caring" },
  { id: "playful", name: "Playful", desc: "Fun and engaging" },
];


export default function CreateAgent() {
  const navigate = useNavigate();
  const { id: editId } = useParams();
  const { agents, addAgent, updateAgent } = useAgents();
  const { user, profile } = useAuth();
  const plan = normalizePlan(profile?.plan);
  const limits = planLimits(profile?.plan);
  const existingAgent = editId ? agents.find((a) => a.id === editId) : null;

  const [searchParams] = useSearchParams();
  // Deep-linkable tab (e.g. onboarding's "Train it now" → ?tab=1 Knowledge Base).
  const [tab, setTab] = useState(() => {
    const t = Number(searchParams.get("tab"));
    return Number.isInteger(t) && t >= 0 && t <= 4 ? t : 0;
  });
  const [name, setName] = useState(existingAgent?.name ?? "");
  const [instructions, setInstructions] = useState(existingAgent?.instructions ?? DEFAULT_INSTRUCTIONS);
  const initialModel = existingAgent?.model ?? "";
  const isPresetModel = !!initialModel && models.some((m) => m.id === initialModel);
  const [selectedModel, setSelectedModel] = useState(
    initialModel ? (isPresetModel ? initialModel : "__custom_openrouter__") : ""
  );
  const [customModel, setCustomModel] = useState(initialModel && !isPresetModel ? initialModel : "");
  const effectiveModel =
    plan === "free" ? FREE_MODEL_ID : selectedModel === "__custom_openrouter__" ? customModel.trim() : selectedModel;
  const [personality, setPersonality] = useState(existingAgent?.personality ?? "professional");
  const [sources, setSources] = useState<AgentSource[]>(existingAgent?.sources ?? []);
  const [chunks, setChunks] = useState<AgentChunk[]>(existingAgent?.chunks ?? []);
  const [welcomeMsg, setWelcomeMsg] = useState(existingAgent?.welcomeMsg ?? "Hi! How can I help you today?");
  const [logoUrl, setLogoUrl] = useState(existingAgent?.logoUrl ?? "");
  // Friendly name for an uploaded logo; truthy means "came from upload" (so we
  // show the filename instead of the raw storage URL, and hide the URL field).
  const [logoFileName, setLogoFileName] = useState(
    (existingAgent?.logoUrl ?? "").includes("/storage/v1/object/public/agent-logos/") ? "Uploaded image" : ""
  );
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [suggestions, setSuggestions] = useState(existingAgent?.suggestions ?? ["What services do you offer?", "How can I contact support?"]);
  const [newSuggestion, setNewSuggestion] = useState("");
  const [position, setPosition] = useState<"left" | "right">(existingAgent?.position ?? "right");
  // Password Protection + Domain Whitelist are no longer editable in the UI; existing values are preserved as-is.
  const passwordEnabled = existingAgent?.passwordEnabled ?? false;
  const domains = existingAgent?.domains ?? [];
  const [rateLimitEnabled, setRateLimitEnabled] = useState(existingAgent?.rateLimitEnabled ?? true);
  const [rateLimitPerHour, setRateLimitPerHour] = useState(existingAgent?.rateLimitPerHour ?? 20);
  const [urlInput, setUrlInput] = useState("");

  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [widgetOpen, setWidgetOpen] = useState(true);
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);
  const [refining, setRefining] = useState(false);
  const [modelSearch, setModelSearch] = useState("");
  const [modelFilter, setModelFilter] = useState<string>("All");
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const [personalityOpen, setPersonalityOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const tabs = ["General", "Knowledge Base", "Appearance", "Security", "Preview"];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toUpperCase() ?? "TXT";
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

    // Plan cap: total uploaded document size per agent.
    const usedDocMB = sources.filter((s) => s.type !== "URL").reduce((sum, s) => sum + parseSizeMB(s.size), 0);
    if (usedDocMB + file.size / (1024 * 1024) > limits.docMB) {
      toast.error(
        `Your ${limits.label} plan includes ${limits.docMB} MB of documents per agent (${usedDocMB.toFixed(2)} MB used). Upgrade for more.`
      );
      e.target.value = "";
      return;
    }

    const newSource: AgentSource = {
      id: crypto.randomUUID(),
      name: file.name,
      type: ext,
      size: `${sizeMB} MB`,
      status: "Processing...",
    };
    setSources((prev) => [...prev, newSource]);
    e.target.value = "";

    try {
      let text = "";
      if (ext === "PDF") {
        text = await extractPdfText(file);
      } else {
        // TXT (DOCX falls back to raw text)
        text = await file.text();
      }
      const newChunks = chunkText(text, newSource.id);
      if (!newChunks.length) throw new Error("No extractable text found");
      setChunks((prev) => [...prev, ...newChunks]);
      setSources((prev) =>
        prev.map((s) => (s.id === newSource.id ? { ...s, status: "Indexed ✓" } : s))
      );
      toast.success(`${file.name} indexed (${newChunks.length} chunks)`);
    } catch (err) {
      setSources((prev) =>
        prev.map((s) => (s.id === newSource.id ? { ...s, status: "Failed" } : s))
      );
      toast.error(`Failed to index: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!user) {
      toast.error("Please sign in to upload a logo");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPG, WebP, SVG…)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image too large, max 2 MB. Try a smaller file.");
      return;
    }
    setUploadingLogo(true);
    try {
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("agent-logos")
        .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("agent-logos").getPublicUrl(path);
      if (!data?.publicUrl) throw new Error("Could not resolve public URL");
      setLogoUrl(data.publicUrl);
      setLogoFileName(file.name);
      toast.success("Logo uploaded ✓");
    } catch (err) {
      toast.error(`Upload failed: ${err instanceof Error ? err.message : "unknown error"}`);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleAddUrl = async () => {
    const url = urlInput.trim();
    if (!url) {
      toast.error("Enter a URL first");
      return;
    }
    // Plan cap: website indexing (0 = not on this plan).
    const urlCount = sources.filter((s) => s.type === "URL").length;
    if (limits.webPages === 0) {
      toast.error("Website indexing is available on paid plans. Upgrade to index your site.");
      return;
    }
    if (urlCount >= limits.webPages) {
      toast.error(`Your ${limits.label} plan indexes up to ${limits.webPages} web pages per agent. Upgrade for more.`);
      return;
    }
    const newSource: AgentSource = {
      id: crypto.randomUUID(),
      name: url,
      type: "URL",
      size: "-",
      status: "Processing...",
    };
    setSources((prev) => [...prev, newSource]);
    setUrlInput("");

    try {
      const text = await extractUrlText(url);
      const newChunks = chunkText(text, newSource.id);
      if (!newChunks.length) throw new Error("No extractable text found");
      setChunks((prev) => [...prev, ...newChunks]);
      setSources((prev) =>
        prev.map((s) => (s.id === newSource.id ? { ...s, status: "Indexed ✓", size: `${newChunks.length} chunks` } : s))
      );
      toast.success(`URL indexed (${newChunks.length} chunks)`);
    } catch (err) {
      setSources((prev) =>
        prev.map((s) => (s.id === newSource.id ? { ...s, status: "Failed" } : s))
      );
      toast.error(`Failed to fetch URL: ${err instanceof Error ? err.message : "unknown error"}`);
    }
  };

  const addSuggestion = () => {
    if (newSuggestion.trim()) {
      setSuggestions((prev) => [...prev, newSuggestion.trim()]);
      setNewSuggestion("");
    }
  };

  const DEFAULT_WELCOME = "Hi! How can I help you today?";
  const DEFAULT_SUGGESTIONS = ["What services do you offer?", "How can I contact support?"];

  const applyTemplate = (tpl: PromptTemplate) => {
    const current = instructions.trim();
    // Applies instantly (no confirm dialog). Hand-written text is recoverable
    // via the toast's Undo; template-to-template switches don't need one.
    const wasCustom =
      current !== "" &&
      current !== DEFAULT_INSTRUCTIONS &&
      !PROMPT_TEMPLATES.some((t) => t.prompt.trim() === current);
    const prev = { instructions, welcomeMsg, suggestions };
    setInstructions(tpl.prompt);
    // Only fill welcome/suggestions if the user hasn't customised them yet.
    const welcomeWasDefault = welcomeMsg.trim() === DEFAULT_WELCOME;
    const suggestionsWereDefault = JSON.stringify(suggestions) === JSON.stringify(DEFAULT_SUGGESTIONS);
    if (tpl.welcomeMsg && welcomeWasDefault) setWelcomeMsg(tpl.welcomeMsg);
    if (tpl.suggestions && suggestionsWereDefault) setSuggestions(tpl.suggestions);
    if (wasCustom) {
      toast.success(`${tpl.label} template applied.`, {
        description: "Your previous instructions were replaced.",
        action: {
          label: "Undo",
          onClick: () => {
            setInstructions(prev.instructions);
            if (tpl.welcomeMsg && welcomeWasDefault) setWelcomeMsg(prev.welcomeMsg);
            if (tpl.suggestions && suggestionsWereDefault) setSuggestions(prev.suggestions);
          },
        },
      });
    } else {
      toast.success(`${tpl.label} template applied. Fill in the [BRACKETS].`);
    }
  };

  const refineInstructions = async () => {
    const current = instructions.trim();
    if (current.length < 20) {
      toast.error("Write a bit of your prompt first, then I'll clean it up.");
      return;
    }
    if (refining) return;
    setRefining(true);
    try {
      const metaSystem =
        "You are a prompt engineer. You rewrite a chatbot's system prompt to be clean, " +
        "well-structured, and easy for an LLM to follow. RULES: (1) Preserve ALL of the user's " +
        "intent, rules, facts, names, contact details, links, and placeholders like [BRACKETS], " +
        "never drop or invent information. (2) Organise it with clear section headings and short " +
        "bullet points. (3) Keep it concise, remove repetition and filler. (4) Keep the same " +
        "language. (5) Output ONLY the rewritten system prompt, no preamble, no explanation, no code fences.";
      const refined = await chatComplete(effectiveModel, metaSystem, [
        { role: "user", content: `Clean up and structure this system prompt:\n\n${current}` },
      ]);
      const cleaned = (refined || "").trim().replace(/^```[a-z]*\n?|\n?```$/g, "").trim();
      if (!cleaned) throw new Error("Empty response");
      setInstructions(cleaned);
      toast.success("Prompt refined. Review the result.");
    } catch (err) {
      if (err instanceof MissingApiKeyError) {
        toast.error(
          plan === "free"
            ? "AI refine on the Free plan needs an OpenAI key (Settings → API Keys), it runs on GPT-4o Mini."
            : `Add your ${err.provider} API key in Settings → API Keys to use AI refine`,
        );
      } else {
        toast.error(`Refine failed: ${err instanceof Error ? err.message : "unknown error"}`);
      }
    } finally {
      setRefining(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    const newHistory: ChatMessage[] = [
      ...chatMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: userMsg },
    ];
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatInput("");
    setChatLoading(true);
    try {
      const contextChunks = retrieveTopChunks(userMsg, chunks, 3);
      const systemPrompt = buildRagSystemPrompt({
        agentName: name,
        instructions,
        personality,
        contextChunks,
      });
      const reply = await chatComplete(effectiveModel, systemPrompt, newHistory);
      setChatMessages((prev) => [...prev, { role: "assistant", content: reply || "(empty response)" }]);
      // Record activity against the persisted agent (only if it's been saved)
      if (existingAgent?.id) recordAgentActivity(existingAgent.id);
    } catch (err) {
      const message =
        err instanceof MissingApiKeyError
          ? plan === "free"
            ? `The Free plan runs on GPT-4o Mini, so testing here needs an **OpenAI** key (Settings → API Keys). Keys for other providers (Google, Anthropic…) work on paid plans.`
            : `Please add your **${err.provider}** API key in Settings → API Keys to use this model.`
          : `Error: ${err instanceof Error ? err.message : "Something went wrong"}`;
      setChatMessages((prev) => [...prev, { role: "assistant", content: message }]);
      if (err instanceof MissingApiKeyError) toast.error(`Missing ${err.provider} API key`);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter an agent name");
      return;
    }
    if (!effectiveModel) {
      toast.error("Please select an AI model");
      return;
    }
    if (selectedModel === "__custom_openrouter__" && !customModel.trim()) {
      toast.error("Please enter an OpenRouter model slug (e.g. meta-llama/llama-3.1-8b-instruct)");
      return;
    }
    const agentData: Omit<Agent, "id" | "createdAt" | "messages" | "conversations" | "rating" | "active"> = {
      name: name.trim(),
      instructions,
      model: effectiveModel,
      personality,
      color: "#1e293b",
      position,
      chatIcon: "",
      logoUrl: logoUrl.trim(),
      welcomeMsg,
      suggestions,
      sources,
      chunks,
      passwordEnabled,
      password: undefined,
      rateLimitEnabled,
      rateLimitPerHour,
      domains,
    };

    try {
      if (existingAgent) {
        await updateAgent(existingAgent.id, agentData);
        toast.success("Agent updated successfully!");
        navigate("/agents");
      } else {
        const newAgent: Agent = {
          ...agentData,
          id: "agent_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11),
          createdAt: new Date().toISOString(),
          messages: 0,
          conversations: 0,
          rating: 0,
          active: true,
        };
        await addAgent(newAgent);
        toast.success("Agent created successfully!");
        navigate("/agents");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save agent");
    }
  };

  const agentId = existingAgent?.id ?? "Will be generated on save";

  return (
    <>
      <Topbar title={existingAgent ? "Edit Agent" : "Create Agent"} subtitle="Configure your AI agent" />

      {/* Expanded System Instructions editor */}
      {instructionsExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-up" onClick={() => setInstructionsExpanded(false)}>
          <div className="glass-card w-full max-w-3xl h-[85vh] flex flex-col p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-foreground">System Instructions</h3>
                <p className="text-[10px] text-foreground-muted">Tell your AI how to behave. Replace every <span className="font-mono text-primary">[BRACKET]</span> with your details.</p>
              </div>
              <button
                type="button"
                onClick={() => setInstructionsExpanded(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-[#e05f40] transition-colors"
              >
                <Minimize2 size={12} /> Done
              </button>
            </div>

            {/* Template chips */}
            <div className="flex items-center gap-1.5 mb-3 flex-wrap shrink-0">
              <span className="text-[10px] text-foreground-muted flex items-center gap-0.5"><Sparkles size={11} className="text-primary" /> Start from a template:</span>
              {PROMPT_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyTemplate(tpl)}
                  title={`${tpl.label}, ${tpl.desc}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary border border-border text-[10px] font-medium text-foreground-secondary hover:border-primary/50 hover:bg-primary/5 hover:text-foreground transition-all"
                >
                  <span>{tpl.label}</span>
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-h-0">
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                autoFocus
                placeholder="Write your system prompt here, or pick a template above…"
                className="absolute inset-0 w-full h-full px-4 py-3 pb-12 rounded-lg bg-secondary border border-border text-sm leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none font-mono"
              />
              {/* AI refine, bottom corner */}
              <button
                type="button"
                onClick={refineInstructions}
                disabled={refining}
                title="Clean up & structure your prompt with AI (keeps all your details)"
                className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[11px] font-semibold shadow-lg hover:bg-[#e05f40] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {refining ? (
                  <>
                    <RotateCcw size={12} className="animate-spin" /> Refining…
                  </>
                ) : (
                  <>
                    <Sparkles size={12} /> Refine with AI
                  </>
                )}
              </button>
            </div>
            <div className="flex justify-between mt-2 shrink-0">
              <span className="text-[10px] text-foreground-muted">Messy prompt? Hit <span className="text-primary font-medium">Refine with AI</span> to clean &amp; structure it, your details are kept.</span>
              <span className="text-[10px] text-foreground-muted">{instructions.length} chars</span>
            </div>
          </div>
        </div>
      )}
      {/* Model picker */}
      {modelPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-up" onClick={() => setModelPickerOpen(false)}>
          <div className="glass-card w-full max-w-2xl max-h-[85vh] flex flex-col p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-foreground">Choose a model</h3>
                <p className="text-[10px] text-foreground-muted">Uses your own API key for the provider, add keys in Settings → API Keys.</p>
              </div>
              <button type="button" onClick={() => setModelPickerOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary text-foreground-muted hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-2 shrink-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <input
                value={modelSearch}
                onChange={(e) => setModelSearch(e.target.value)}
                autoFocus
                placeholder="Search models…"
                className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            {/* Provider filter */}
            <div className="flex flex-wrap gap-1.5 mb-3 shrink-0">
              {["All", ...providers.map((p) => p.id)].map((f) => {
                const meta = providers.find((p) => p.id === f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setModelFilter(f)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                      modelFilter === f
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-foreground-secondary border-border hover:border-primary/50"
                    }`}
                  >
                    {meta?.label ?? "All"}
                  </button>
                );
              })}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-1.5 overflow-y-auto p-0.5 flex-1 min-h-0">
              {models
                .filter((m) => {
                  // Plan gate: starter = budget models (+ OpenRouter); growth = all.
                  if (plan === "starter" && m.provider !== "OpenRouter" && !STARTER_MODEL_IDS.has(m.id)) return false;
                  const matchProvider = modelFilter === "All" || m.provider === modelFilter;
                  const q = modelSearch.trim().toLowerCase();
                  const matchSearch = !q || m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
                  return matchProvider && matchSearch;
                })
                .map((m) => {
                  const meta = providers.find((p) => p.id === m.provider);
                  const active = selectedModel === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m.id);
                        if (m.id !== "__custom_openrouter__") setModelPickerOpen(false);
                      }}
                      className={`text-left p-2.5 rounded-lg border transition-all ${
                        active
                          ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                          : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[12px] font-semibold text-foreground truncate">{m.name}</span>
                        {active && <Check size={12} className="text-primary shrink-0" />}
                      </div>
                      <div className="text-[9px] text-foreground-muted truncate mb-1">{m.desc}</div>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${meta?.badge ?? "bg-secondary text-foreground-muted"}`}>
                        {meta?.label}
                      </span>
                    </button>
                  );
                })}
            </div>

            {selectedModel === "__custom_openrouter__" && (
              <div className="mt-3 shrink-0">
                <input
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  placeholder="e.g. meta-llama/llama-3.1-8b-instruct"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-border text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-[10px] text-foreground-muted mt-1">
                  Paste any slug from <a href="https://openrouter.ai/models" target="_blank" rel="noopener" className="text-primary hover:underline">openrouter.ai/models</a>, then close.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Personality picker */}
      {personalityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-up" onClick={() => setPersonalityOpen(false)}>
          <div className="glass-card w-full max-w-md max-h-[85vh] flex flex-col p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-foreground">Choose a personality</h3>
                <p className="text-[10px] text-foreground-muted">Sets the tone your agent replies in.</p>
              </div>
              <button type="button" onClick={() => setPersonalityOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary text-foreground-muted hover:text-foreground">
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 overflow-y-auto p-0.5">
              {personalities.map((p) => {
                const active = personality === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => { setPersonality(p.id); setPersonalityOpen(false); }}
                    className={`text-left p-2.5 rounded-lg border transition-all ${
                      active
                        ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                        : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-[12px] font-semibold text-foreground truncate">{p.name}</span>
                      {active && <Check size={12} className="text-primary shrink-0" />}
                    </div>
                    <div className="text-[9px] text-foreground-muted truncate">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="p-6 animate-fade-up">
        {/* Quick Setup shortcut — the guided, outcome-first path (all plans) */}
        {!existingAgent && (
          <div className="glass-card p-4 mb-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sparkles size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-foreground">In a hurry? Try Quick Setup</div>
              <p className="text-[11.5px] text-foreground-muted mt-0.5">
                Answer three questions about your business and get a ready-made assistant — no configuration needed.
              </p>
            </div>
            <button
              onClick={() => navigate("/onboarding")}
              className="px-4 py-2 rounded-full bg-primary text-white text-[12px] font-semibold hover:bg-[#e05f40] transition-colors shrink-0"
            >
              Quick Setup →
            </button>
          </div>
        )}

        {/* Agent ID bar */}
        {existingAgent && (
          <div className="glass-card p-3 mb-4 flex items-center gap-3">
            <span className="text-xs text-foreground-muted">Agent ID:</span>
            <code className="flex-1 text-xs font-mono text-primary bg-secondary px-3 py-1.5 rounded">{existingAgent.id}</code>
            <button
              onClick={() => { navigator.clipboard.writeText(existingAgent.id); toast.success("Agent ID copied!"); }}
              className="p-2 rounded-lg hover:bg-secondary text-foreground-muted hover:text-foreground"
            >
              <Copy size={14} />
            </button>
          </div>
        )}

        <div className="flex gap-6">
          {/* Left: Config */}
          <div className="flex-1 min-w-0">
            <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-5">
              {tabs.map((t, i) => (
                <button
                  key={t}
                  onClick={() => setTab(i)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    tab === i ? "bg-card text-foreground shadow-sm" : "text-foreground-muted hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="glass-card p-5 space-y-5">
              {/* Tab 0: General */}
              {tab === 0 && (
                <>
                  <div>
                    <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Agent Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="My AI Agent"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5 gap-2">
                      <label className="text-xs font-semibold text-foreground-secondary">System Instructions</label>
                      <button
                        type="button"
                        onClick={() => setInstructionsExpanded(true)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary border border-border text-[10px] font-medium text-foreground-secondary hover:border-primary/50 hover:text-foreground transition-all"
                      >
                        <Maximize2 size={11} /> Expand & edit
                      </button>
                    </div>
                    <div
                      onClick={() => setInstructionsExpanded(true)}
                      className={`w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-border cursor-pointer hover:border-primary/40 transition-all overflow-hidden whitespace-pre-wrap ${
                        instructions.trim()
                          ? "text-xs leading-relaxed text-foreground-muted font-mono"
                          : "text-sm text-foreground-muted"
                      }`}
                      style={{ height: 80 }}
                    >
                      {instructions.trim() || "Click to write your system prompt, or pick an industry template…"}
                    </div>
                    <div className="flex justify-between mt-1">
                      <button type="button" onClick={() => setInstructionsExpanded(true)} className="text-[10px] text-primary hover:underline">
                        Click to expand and see the full prompt →
                      </button>
                      <span className="text-[10px] text-foreground-muted">{instructions.length} chars</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">AI Model</label>
                      {plan === "free" ? (
                        // Free plan is locked to GPT-4o Mini on Osciva's key.
                        <div>
                          <div className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-secondary border border-border text-sm opacity-80 cursor-not-allowed">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: "#16a34a" }} />
                            <span className="font-medium truncate flex-1 text-left text-foreground">GPT-4o Mini</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold shrink-0">Included</span>
                          </div>
                          <p className="text-[10px] text-foreground-muted mt-1">
                            Free plan runs on GPT-4o Mini (on us), upgrade to choose your own models.
                          </p>
                        </div>
                      ) : (
                        (() => {
                        const sel = models.find((m) => m.id === selectedModel);
                        const meta = providers.find((p) => p.id === sel?.provider);
                        const isEmpty = !selectedModel;
                        const label = isEmpty
                          ? "Select model"
                          : selectedModel === "__custom_openrouter__"
                            ? (customModel.trim() || "Custom OpenRouter model")
                            : (sel?.name ?? selectedModel);
                        return (
                          <button
                            type="button"
                            onClick={() => setModelPickerOpen(true)}
                            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-secondary border border-border text-sm hover:border-primary/50 transition-all"
                          >
                            {!isEmpty && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: meta?.dot ?? "#9ca3af" }} />}
                            <span className={`font-medium truncate flex-1 text-left ${isEmpty ? "text-foreground-muted" : "text-foreground"}`}>{label}</span>
                            <ChevronDown size={14} className="text-foreground-muted shrink-0" />
                          </button>
                        );
                        })()
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Personality</label>
                      {(() => {
                        const sel = personalities.find((p) => p.id === personality);
                        return (
                          <button
                            type="button"
                            onClick={() => setPersonalityOpen(true)}
                            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-secondary border border-border text-sm hover:border-primary/50 transition-all"
                          >
                            <span className="font-medium truncate flex-1 text-left text-foreground">{sel?.name ?? "Select personality"}</span>
                            <ChevronDown size={14} className="text-foreground-muted shrink-0" />
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </>
              )}

              {/* Tab 1: Knowledge Base */}
              {tab === 1 && (
                <>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-foreground-secondary">
                    <Sparkles size={14} className="inline mr-1.5 text-primary" />
                    <strong className="text-primary">How RAG works</strong>, Your documents are chunked, embedded, and retrieved to give your AI accurate answers from YOUR data.
                  </div>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <Upload size={24} className="mx-auto mb-2 text-foreground-muted" />
                    <p className="text-xs font-semibold text-foreground-secondary">Drop files here or click to browse</p>
                    <p className="text-[10px] text-foreground-muted mt-1">
                      PDF, DOCX, TXT supported · {limits.docMB} MB of documents on your {limits.label} plan
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.docx,.txt"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://docs.example.com"
                      className="flex-1 px-3.5 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button onClick={handleAddUrl} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-[#e05f40] transition-colors">
                      Add URL
                    </button>
                  </div>
                  {sources.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground-secondary">Sources</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          {sources.length} sources ·{" "}
                          {sources.filter((s) => s.type !== "URL").reduce((sum, s) => sum + parseSizeMB(s.size), 0).toFixed(2)}/
                          {limits.docMB} MB docs
                          {limits.webPages > 0 && ` · ${sources.filter((s) => s.type === "URL").length}/${limits.webPages} pages`}
                        </span>
                      </div>
                      {sources.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                          <span className="text-sm">{s.type === "URL" ? <Globe size={14} className="text-foreground-muted" /> : <FileText size={14} className="text-foreground-muted" />}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-foreground truncate">{s.name}</div>
                            <div className="text-[10px] text-foreground-muted">{s.type} · {s.size}</div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            s.status === "Indexed ✓" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                          }`}>
                            {s.status}
                          </span>
                          <button onClick={() => setSources((prev) => prev.filter((x) => x.id !== s.id))} className="text-foreground-muted hover:text-destructive">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Tab 2: Appearance (locked on the free plan) */}
              {tab === 2 && !limits.appearance && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-foreground-secondary">
                  <Sparkles size={14} className="inline mr-1.5 text-primary" />
                  <strong className="text-primary">Appearance customization is a paid feature</strong>, upgrade to
                  upload your logo, edit the welcome message, suggestions and widget position. Your widget uses the
                  default Osciva look on the Free plan.
                </div>
              )}
              {tab === 2 && (
                <div className={!limits.appearance ? "opacity-50 pointer-events-none select-none space-y-5" : "contents"}>
                  <div>
                    <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Business Logo (shown in the chat header)</label>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />

                    {logoUrl ? (
                      /* Filled state, preview + replace/remove */
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
                        <img
                          src={logoUrl}
                          alt="logo preview"
                          className="w-12 h-12 rounded-lg object-contain bg-white border border-border p-1 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{logoFileName || "Logo set"}</p>
                          <p className="text-[11px] text-foreground-muted">Shown in your chat header</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadingLogo}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-background border border-border text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {uploadingLogo ? "Uploading…" : "Replace"}
                        </button>
                        <button
                          type="button"
                          onClick={() => { setLogoUrl(""); setLogoFileName(""); }}
                          className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background transition-all shrink-0"
                          title="Remove logo"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ) : (
                      /* Empty state, dashed dropzone */
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="w-full flex items-center gap-2.5 border-2 border-dashed border-border rounded-xl px-3.5 py-2.5 text-left cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Upload size={15} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground leading-tight">
                            {uploadingLogo ? "Uploading…" : "Upload your business logo"}
                          </p>
                          <p className="text-[10px] text-foreground-muted">PNG, JPG, WebP or SVG · max 2 MB</p>
                        </div>
                      </button>
                    )}

                    {/* Alternative: paste a URL (hidden once an image has been uploaded) */}
                    {!logoFileName && (
                      <>
                        <div className="flex items-center gap-3 my-2.5">
                          <div className="h-px flex-1 bg-border" />
                          <span className="text-[10px] uppercase tracking-wide text-foreground-muted">or paste a URL</span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <input
                          value={logoUrl}
                          onChange={(e) => setLogoUrl(e.target.value)}
                          placeholder="https://your-site.com/logo.png"
                          className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </>
                    )}
                    <p className="text-[10px] text-foreground-muted mt-1.5">Leave blank to use the default chat icon.</p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Welcome Message</label>
                    <input
                      value={welcomeMsg}
                      onChange={(e) => setWelcomeMsg(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">Suggested Questions</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        value={newSuggestion}
                        onChange={(e) => setNewSuggestion(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSuggestion()}
                        placeholder="Add a suggestion..."
                        className="flex-1 px-3.5 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <button onClick={addSuggestion} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-xs text-foreground-secondary">
                          {s}
                          <button onClick={() => setSuggestions((prev) => prev.filter((_, j) => j !== i))}>
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground-secondary mb-2 block">Widget Position</label>
                    <div className="flex gap-2">
                      {(["left", "right"] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPosition(p)}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            position === p ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground-secondary"
                          }`}
                        >
                          {p === "left" ? "← Left" : "→ Right"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Security (configurable on Growth; defaults protect everyone) */}
              {tab === 3 && !limits.security && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs text-foreground-secondary">
                  <Sparkles size={14} className="inline mr-1.5 text-primary" />
                  <strong className="text-primary">Custom rate limits are a Growth feature</strong>, your agents are
                  protected with the default limit (20 messages per visitor per hour). Upgrade to tune or disable it.
                </div>
              )}
              {tab === 3 && (
                <div className={!limits.security ? "opacity-50 pointer-events-none select-none space-y-3" : "contents"}>
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <div className="text-xs font-semibold text-foreground">Rate Limiting</div>
                      <div className="text-[10px] text-foreground-muted">Caps messages per visitor each hour, protects your API costs.</div>
                    </div>
                    <button
                      onClick={() => setRateLimitEnabled(!rateLimitEnabled)}
                      className={`w-10 h-5 rounded-full transition-all relative ${rateLimitEnabled ? "bg-primary" : "bg-border"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground transition-all ${rateLimitEnabled ? "left-5" : "left-0.5"}`} />
                    </button>
                  </div>
                  {rateLimitEnabled && (
                    <div className="flex items-center justify-between gap-3 p-3 bg-secondary/30 rounded-lg">
                      <label className="text-xs text-foreground-secondary">
                        Messages per visitor / hour
                        <span className="block text-[10px] text-foreground-muted">A visitor who exceeds this is asked to try again later.</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={rateLimitPerHour}
                        onChange={(e) => setRateLimitPerHour(Math.max(1, Math.min(1000, Number(e.target.value) || 1)))}
                        className="w-20 px-3 py-2 rounded-lg bg-secondary border border-border text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Preview Chat */}
              {tab === 4 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground-secondary">Live Chat Preview</span>
                    <button onClick={() => setChatMessages([])} className="text-[10px] text-foreground-muted hover:text-foreground flex items-center gap-1">
                      <RotateCcw size={10} /> Clear
                    </button>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-4 h-72 overflow-y-auto space-y-3">
                    <div className="bg-background p-3 rounded-lg rounded-bl-none max-w-[80%] border border-border">
                      <p className="text-xs text-foreground-secondary">{welcomeMsg}</p>
                    </div>
                    {chatMessages.map((m, i) => (
                      <div key={i} className={`max-w-[80%] ${m.role === "user" ? "ml-auto" : ""}`}>
                        <div className={`p-3 rounded-lg text-xs ${
                          m.role === "user"
                            ? "bg-background-elevated text-foreground rounded-br-none"
                            : "bg-background border border-border text-foreground-secondary rounded-bl-none"
                        }`}>
                          {m.content}
                        </div>
                        {m.role === "assistant" && sources.length > 0 && (
                          <span className="text-[9px] text-foreground-muted mt-1 inline-block">Source: {sources[0].name}</span>
                        )}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="bg-background p-3 rounded-lg rounded-bl-none max-w-[80%] border border-border">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <span key={i} className="w-1.5 h-1.5 bg-foreground-muted rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => setChatInput(s)}
                          className="text-[10px] px-2.5 py-1 rounded-full border border-border text-foreground-secondary hover:bg-secondary"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3.5 py-2.5 rounded-full bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button onClick={sendChatMessage} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-[#e05f40] transition-colors">
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleSave} className="mt-4 w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-[#e05f40] transition-colors transition-all glow-primary">
              {existingAgent ? "Update Agent" : "Create Agent"}
            </button>
          </div>

          {/* Right: Widget Preview */}
          <div className="w-[340px] shrink-0 hidden lg:block">
            <div className="sticky top-20">
              <h3 className="text-xs font-semibold text-foreground-secondary mb-3">Widget Preview</h3>
              <div className="bg-background-elevated rounded-xl border border-border overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
                  <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
                  <div className="flex-1 ml-2 h-5 bg-secondary rounded text-[8px] text-foreground-muted flex items-center px-2">yoursite.com</div>
                </div>
                <div className="relative h-[420px] bg-background p-4">
                  <div className="space-y-2 mb-6">
                    <div className="h-3 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                    <div className="h-3 bg-secondary rounded w-2/3" />
                    <div className="h-2 bg-secondary/50 rounded w-full mt-4" />
                    <div className="h-2 bg-secondary/50 rounded w-5/6" />
                  </div>

                  {widgetOpen ? (
                    <div
                      className={`absolute bottom-14 w-[280px] rounded-2xl overflow-hidden shadow-2xl ${
                        position === "right" ? "right-3" : "left-3"
                      }`}
                      style={{ border: `1px solid rgba(30,41,59,0.2)` }}
                    >
                      {/* Header, logo + name aligned to the start (matches the live widget) */}
                      <div className="px-3 py-2.5 flex items-center gap-2 relative overflow-hidden" style={{ backgroundColor: "#1e293b" }}>
                        <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.2), transparent)` }} />
                        <img
                          src={logoUrl || "https://osciva.io/images/osciva-web.png"}
                          alt=""
                          className="relative z-10 h-7 w-7 rounded-full bg-white object-contain p-0.5 shrink-0"
                        />
                        <div className="relative z-10 min-w-0 flex-1">
                          <div className="text-[11px] font-bold leading-tight truncate" style={{ color: "#fff" }}>{name || "My Agent"}</div>
                          <div className="text-[8px] flex items-center gap-1 leading-tight" style={{ color: "rgba(255,255,255,0.7)" }}>
                            <span className="w-1 h-1 rounded-full bg-green-400" /> Online
                          </div>
                        </div>
                        <div className="relative z-10 flex gap-1 shrink-0">
                          <button className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
                            <RotateCcw size={8} style={{ color: "#fff" }} />
                          </button>
                          <button onClick={() => setWidgetOpen(false)} className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.2)" }}>
                            <X size={8} style={{ color: "#fff" }} />
                          </button>
                        </div>
                      </div>
                      {/* Chat area */}
                      <div className="p-2.5 space-y-2 h-[160px] overflow-y-auto" style={{ backgroundColor: "#ffffff" }}>
                        <div className="p-2 rounded-lg rounded-bl-sm text-[9px] shadow-sm" style={{ backgroundColor: "#f1f5f9", color: "#374151", border: "1px solid #e2e8f0" }}>
                          {welcomeMsg}
                        </div>
                      </div>
                      {/* Suggestions */}
                      {suggestions.length > 0 && (
                        <div className="px-2.5 pb-1.5 flex flex-wrap gap-1" style={{ backgroundColor: "#ffffff" }}>
                          {suggestions.slice(0, 2).map((s, i) => (
                            <span key={i} className="text-[7px] px-2 py-0.5 rounded-full" style={{ border: "1px solid rgba(30,41,59,0.4)", color: "#1e293b" }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Input area */}
                      <div className="p-2 flex items-center gap-1.5" style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
                        <div className="flex-1 px-2 py-1.5 rounded-full text-[8px]" style={{ border: "1px solid #e2e8f0", color: "#9ca3af" }}>
                          Type a message...
                        </div>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1e293b" }}>
                          <Send size={8} style={{ color: "#fff" }} />
                        </div>
                      </div>
                      {/* Footer */}
                      <div className="text-center py-1" style={{ backgroundColor: "#ffffff" }}>
                        <span className="text-[7px]" style={{ color: "#9ca3af" }}>Powered by Osciva</span>
                      </div>
                    </div>
                  ) : null}

                  <div className={`absolute bottom-3 ${position === "right" ? "right-3" : "left-3"}`}>
                    {!widgetOpen && (
                      <div className="mb-2 px-3 py-1.5 rounded-full bg-foreground text-background text-[9px] font-medium shadow-lg whitespace-nowrap">
                        Need help?
                      </div>
                    )}
                    <button
                      onClick={() => setWidgetOpen(!widgetOpen)}
                      className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 bg-white"
                    >
                      <img src="https://osciva.io/images/osciva-web.png" alt="" className="w-full h-full object-contain p-2 rounded-full" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
