import Topbar from "@/components/layout/Topbar";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Check, LayoutDashboard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Agent, useAgents } from "@/context/AgentContext";
import { useAuth } from "@/hooks/useAuth";
import { FREE_MODEL_ID, planLimits } from "@/lib/plans";
import { BUSINESS_TYPES, GOALS, LANGUAGES, buildAssistantConfig } from "@/lib/onboarding";

const EASE = [0.22, 1, 0.36, 1] as const;

const STEP_LABELS = ["Business", "Goals", "Details"];

const inputCls =
  "w-full px-3.5 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function Onboarding() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { agents, loading, addAgent } = useAgents();
  const { profile } = useAuth();
  const limits = planLimits(profile?.plan);

  const [step, setStep] = useState(0); // 0 type · 1 goals · 2 details · 3 done
  const [btId, setBtId] = useState<string | null>(null);
  const [goalIds, setGoalIds] = useState<string[]>(["enquiries"]);
  const [businessName, setBusinessName] = useState("");
  const [about, setAbout] = useState("");
  const [city, setCity] = useState("");
  const [roleName, setRoleName] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [creating, setCreating] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const bt = useMemo(() => BUSINESS_TYPES.find((b) => b.id === btId) ?? null, [btId]);
  const needsAbout = bt?.templateId === "general" || bt?.templateId === "ecommerce";

  const stepMotion = {
    initial: { opacity: 0, x: reduceMotion ? 0 : 24 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: reduceMotion ? 0 : -24 },
    transition: { duration: 0.25, ease: EASE },
  };

  const toggleGoal = (id: string) =>
    setGoalIds((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

  const handleCreate = async () => {
    if (!bt || !businessName.trim() || creating) return;
    if (agents.length >= limits.agents) {
      toast.error(
        `Your ${limits.label} plan includes ${limits.agents} assistant${limits.agents > 1 ? "s" : ""}. Upgrade (or delete an agent) to add another.`,
      );
      return;
    }
    setCreating(true);
    try {
      const cfg = buildAssistantConfig(bt, {
        businessName,
        about,
        city,
        language,
        roleName,
        goalIds,
      });
      const agent: Agent = {
        id: "agent_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11),
        name: cfg.name,
        instructions: cfg.instructions,
        model: FREE_MODEL_ID, // works on every plan; owners can switch later
        personality: cfg.personality,
        color: "#1e293b",
        position: "right",
        chatIcon: "",
        logoUrl: "",
        welcomeMsg: cfg.welcomeMsg,
        suggestions: cfg.suggestions,
        sources: [],
        chunks: [],
        passwordEnabled: false,
        password: undefined,
        rateLimitEnabled: true,
        rateLimitPerHour: 20,
        domains: [],
        messages: 0,
        conversations: 0,
        rating: 0,
        active: true,
        createdAt: new Date().toISOString(),
      };
      const id = await addAgent(agent);
      setCreatedId(id);
      setStep(3);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create your assistant. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <>
        <Topbar title="Quick Setup" subtitle="Answer three questions, get a working assistant" />
        <div className="p-6 max-w-2xl mx-auto space-y-4">
          <div className="h-6 w-56 rounded-lg bg-secondary animate-pulse" />
          <div className="h-40 rounded-2xl bg-secondary animate-pulse" />
        </div>
      </>
    );
  }

  // At the plan's agent limit the wizard stays browsable; only creation is blocked.
  const atLimit = !createdId && agents.length >= limits.agents;

  return (
    <>
      <Topbar title="Quick Setup" subtitle="Answer three questions, get a working assistant" />
      <div className="p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          {/* Plan-limit notice — wizard stays explorable, creation needs headroom */}
          {atLimit && step < 3 && (
            <div className="mb-6 rounded-xl border border-border bg-secondary/60 px-4 py-3 text-[12px] text-foreground-secondary">
              Heads up: your {limits.label} plan includes {limits.agents} assistant{limits.agents > 1 ? "s" : ""} and
              you already have {agents.length}. You can explore the setup, but{" "}
              <button onClick={() => navigate("/settings")} className="text-primary font-semibold hover:underline">
                upgrade your plan
              </button>{" "}
              (or delete an agent) to create another one.
            </div>
          )}

          {/* Progress — hidden on the success screen */}
          {step < 3 && (
            <div className="mb-8">
              <div className="flex items-center gap-2">
                {STEP_LABELS.map((label, i) => (
                  <div key={label} className="flex-1">
                    <div className={`h-1 rounded-full transition-colors duration-300 ${i <= step ? "bg-primary" : "bg-secondary"}`} />
                    <span className={`mt-1.5 block text-[11px] font-medium ${i <= step ? "text-primary" : "text-foreground-muted"}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="type" {...stepMotion}>
                <h2 className="text-[19px] font-extrabold text-foreground display text-balance">
                  What type of business do you run?
                </h2>
                <p className="text-[13px] text-foreground-muted mt-1 mb-5">
                  We'll set up the right assistant for it — trained manners, job role and all.
                </p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {BUSINESS_TYPES.map((b) => {
                    const selected = btId === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          setBtId(b.id);
                          setRoleName(b.role);
                        }}
                        aria-pressed={selected}
                        className={`text-left rounded-2xl border p-4 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${selected ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                          <b.icon size={17} />
                        </div>
                        <div className="text-[13px] font-semibold text-foreground leading-snug">{b.label}</div>
                        <div className="text-[11px] text-foreground-muted mt-0.5 leading-snug">{b.desc}</div>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => navigate("/agents/create")}
                    className="text-[12px] text-foreground-muted hover:text-primary transition-colors"
                  >
                    Prefer full control? Start from a blank agent
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    disabled={!btId}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-[13px] font-semibold hover:bg-[#e05f40] transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && bt && (
              <motion.div key="goals" {...stepMotion}>
                <h2 className="text-[19px] font-extrabold text-foreground display text-balance">
                  What should your {bt.role} handle?
                </h2>
                <p className="text-[13px] text-foreground-muted mt-1 mb-5">
                  Pick as many as you like — these become its priorities.
                </p>
                <div className="space-y-2 max-w-xl">
                  {GOALS.map((g) => {
                    const selected = goalIds.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGoal(g.id)}
                        aria-pressed={selected}
                        className={`w-full flex items-center gap-3.5 text-left rounded-xl border p-3.5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                          selected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                            selected ? "bg-primary border-primary text-white" : "border-border bg-background text-transparent"
                          }`}
                        >
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[13px] font-semibold text-foreground">{g.label}</span>
                          <span className="block text-[11.5px] text-foreground-muted mt-0.5">{g.desc}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setStep(0)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border text-[13px] font-semibold text-foreground hover:bg-secondary transition-colors"
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={goalIds.length === 0}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-[13px] font-semibold hover:bg-[#e05f40] transition-colors disabled:opacity-40 disabled:pointer-events-none"
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && bt && (
              <motion.div key="details" {...stepMotion}>
                <h2 className="text-[19px] font-extrabold text-foreground display text-balance">
                  Almost done — a few details
                </h2>
                <p className="text-[13px] text-foreground-muted mt-1 mb-5">
                  Your assistant introduces itself with these. Everything is editable later.
                </p>
                <div className="max-w-lg space-y-4">
                  <div>
                    <label htmlFor="ob-name" className="block text-[12px] font-semibold text-foreground mb-1.5">
                      Business name <span className="text-primary">*</span>
                    </label>
                    <input
                      id="ob-name"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder={bt.templateId === "healthcare" ? "e.g. Shraddha Multi-speciality Hospital" : "e.g. Adyatech Solutions"}
                      className={inputCls}
                    />
                  </div>
                  {needsAbout && (
                    <div>
                      <label htmlFor="ob-about" className="block text-[12px] font-semibold text-foreground mb-1.5">
                        What do you {bt.templateId === "ecommerce" ? "sell" : "do"}? <span className="font-normal text-foreground-muted">(optional)</span>
                      </label>
                      <input
                        id="ob-about"
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        placeholder={bt.templateId === "ecommerce" ? "e.g. handmade skincare products" : "e.g. a digital marketing agency"}
                        className={inputCls}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ob-city" className="block text-[12px] font-semibold text-foreground mb-1.5">
                        City <span className="font-normal text-foreground-muted">(optional)</span>
                      </label>
                      <input
                        id="ob-city"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Pune, Maharashtra"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="ob-lang" className="block text-[12px] font-semibold text-foreground mb-1.5">
                        Replies in
                      </label>
                      <select id="ob-lang" value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls}>
                        {LANGUAGES.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ob-role" className="block text-[12px] font-semibold text-foreground mb-1.5">
                      Your assistant's name
                    </label>
                    <input
                      id="ob-role"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder={bt.role}
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <button
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border text-[13px] font-semibold text-foreground hover:bg-secondary transition-colors"
                  >
                    <ArrowLeft size={15} /> Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!businessName.trim() || creating}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-[13px] font-semibold hover:bg-[#e05f40] transition-colors disabled:opacity-40 disabled:pointer-events-none shadow-brand"
                  >
                    {creating ? (
                      <>
                        <Loader2 size={15} className="animate-spin" /> Setting up…
                      </>
                    ) : (
                      <>Create my assistant</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && createdId && (
              <motion.div key="done" {...stepMotion} className="text-center pt-8">
                <motion.div
                  initial={{ scale: reduceMotion ? 1 : 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="w-14 h-14 mx-auto rounded-2xl bg-success/15 text-success flex items-center justify-center"
                >
                  <Check size={26} strokeWidth={2.5} />
                </motion.div>
                <h2 className="text-[20px] font-extrabold text-foreground display mt-5 text-balance">
                  {roleName.trim() || bt?.role} is ready
                </h2>
                <p className="text-[13.5px] text-foreground-muted mt-2 max-w-md mx-auto">
                  It already knows how to greet visitors, stay on topic and capture leads. Now train it on
                  your real content — that's where it gets smart.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => navigate(`/agents/edit/${createdId}?tab=1`)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-[13px] font-semibold hover:bg-[#e05f40] transition-colors shadow-brand"
                  >
                    <BookOpen size={15} /> Train it on your content
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-[13px] font-semibold text-foreground hover:bg-secondary transition-colors"
                  >
                    <LayoutDashboard size={15} /> Go to dashboard
                  </button>
                </div>
                <p className="text-[11.5px] text-foreground-muted mt-4">
                  You can fine-tune its instructions, look and security anytime in My Agents.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
