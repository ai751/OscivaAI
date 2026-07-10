// High-fidelity, animated product mockups, pure CSS/SVG + Framer Motion.
// No external images; crisp at any size. Designed to look like real screen
// recordings of the Osciva dashboard.
import { motion, AnimatePresence } from "framer-motion";
import { SendHorizonal } from "lucide-react";
import { useEffect, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

function Chrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-[#F7F8FA] border-b border-[#EBEDF0]">
      <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
      <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
      <div className="ml-3 flex-1 h-6 bg-white rounded-md text-[10px] text-[#9CA3AF] flex items-center px-2.5 border border-[#EBEDF0]">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" className="mr-1.5 text-[#9CA3AF]">
          <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm3 8H9V6a3 3 0 0 1 6 0v3Z" fill="currentColor" />
        </svg>
        {url}
      </div>
    </div>
  );
}

const frame =
  "bg-white rounded-2xl border border-[#EBEDF0] shadow-premium overflow-hidden w-full";

export function DashboardMockup() {
  const bars = [42, 64, 50, 78, 58, 88, 72];
  return (
    <div className={frame}>
      <Chrome url="app.osciva.io/dashboard" />
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden sm:block w-[124px] bg-[#0B0E14] p-3 space-y-1">
          <div className="flex items-center gap-2 mb-4 px-1">
            <div className="w-5 h-5 rounded-md bg-[#E8613C]" />
            <span className="text-[10px] font-bold text-white">Osciva <span className="text-[#E8613C]">AI</span></span>
          </div>
          {["Dashboard", "Agents", "Create", "Analytics", "Embed", "API keys"].map((l, i) => (
            <div
              key={l}
              className={`text-[10px] px-2.5 py-1.5 rounded-md flex items-center gap-1.5 ${
                i === 0 ? "bg-white/10 text-white font-semibold" : "text-white/45"
              }`}
            >
              <span className={`w-1 h-1 rounded-full ${i === 0 ? "bg-[#E8613C]" : "bg-white/25"}`} />
              {l}
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="flex-1 p-4 bg-[#FBFBFC]">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[12px] font-bold text-[#0B0E14]">Overview</div>
            <div className="flex items-center gap-1.5 text-[9px] text-[#16A34A] font-semibold bg-[#16A34A]/10 px-2 py-1 rounded-full">
              <motion.span
                className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              Live
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { l: "Agents", v: "12", c: "#E8613C" },
              { l: "Messages", v: "8.4k", c: "#16A34A" },
              { l: "Resolved", v: "94%", c: "#2563EB" },
            ].map((s, i) => (
              <motion.div
                key={s.l}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: EASE }}
                className="bg-white border border-[#EBEDF0] rounded-xl p-2.5"
              >
                <div className="text-[8px] text-[#8C94A1] font-medium">{s.l}</div>
                <div className="text-[15px] font-extrabold text-[#0B0E14] mt-0.5">{s.v}</div>
                <div className="h-1 mt-1.5 rounded-full" style={{ background: `${s.c}22` }}>
                  <div className="h-full rounded-full w-2/3" style={{ background: s.c }} />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chart with growing bars */}
          <div className="bg-white border border-[#EBEDF0] rounded-xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[9px] font-semibold text-[#0B0E14]">Weekly conversations</div>
              <div className="text-[8px] text-[#8C94A1]">+18.2%</div>
            </div>
            <div className="flex items-end gap-1.5 h-16">
              {bars.map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 rounded-t-[3px] origin-bottom"
                  style={{
                    height: `${h}%`,
                    background:
                      i === bars.length - 2
                        ? "#E8613C"
                        : "linear-gradient(180deg,#F3C5B5,#FBE7DF)",
                  }}
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.6, ease: EASE }}
                />
              ))}
            </div>
          </div>

          {/* Agents list */}
          <div className="bg-white border border-[#EBEDF0] rounded-xl p-3 space-y-2">
            <div className="text-[9px] font-semibold text-[#0B0E14] mb-0.5">Recent agents</div>
            {[
              { n: "Support Bot", m: "1.2k msgs", a: true },
              { n: "Sales Assistant", m: "847 msgs", a: true },
              { n: "Onboarding Helper", m: "412 msgs", a: false },
            ].map((a) => (
              <div key={a.n} className="flex items-center justify-between text-[9px]">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${a.a ? "bg-[#16A34A]" : "bg-[#CBD5E1]"}`} />
                  <span className="text-[#0B0E14] font-medium">{a.n}</span>
                </div>
                <span className="text-[#8C94A1]">{a.m}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const WIZARD_TABS = ["General", "Knowledge", "Appearance", "Security", "Preview"] as const;

// Small shared building blocks for the wizard panels.
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] font-semibold text-[#586072] mb-1">{label}</div>
      {children}
    </div>
  );
}

function GeneralPanel() {
  return (
    <div className="space-y-3">
      <Field label="Agent name">
        <div className="h-8 rounded-lg bg-[#FBFBFC] border border-[#EBEDF0] flex items-center px-2.5 text-[10px] text-[#0B0E14]">
          My Support Bot
          <motion.span
            className="ml-0.5 w-px h-3 bg-[#E8613C]"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          />
        </div>
      </Field>
      <Field label="System instructions">
        <div className="h-14 rounded-lg bg-[#FBFBFC] border border-[#EBEDF0] p-2 text-[9px] text-[#586072] leading-relaxed">
          You are a helpful assistant for our store. Answer questions about products, shipping, and returns using the knowledge base.
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        {[
          { l: "AI model", v: "GPT-4o" },
          { l: "Personality", v: "Friendly" },
        ].map((f) => (
          <Field key={f.l} label={f.l}>
            <div className="h-8 rounded-lg bg-[#FBFBFC] border border-[#EBEDF0] flex items-center justify-between px-2.5 text-[10px]">
              <span className="text-[#0B0E14] font-medium">{f.v}</span>
              <span className="text-[#8C94A1]">▾</span>
            </div>
          </Field>
        ))}
      </div>
    </div>
  );
}

function KnowledgePanel() {
  const sources = [
    { n: "product-catalog.pdf", m: "248 KB · 1,204 chunks", s: "Ready" },
    { n: "yourstore.in/faq", m: "Crawled · 38 pages", s: "Ready" },
    { n: "shipping-policy.docx", m: "62 KB · 180 chunks", s: "Indexing" },
  ];
  return (
    <div className="space-y-3">
      <Field label="Knowledge sources">
        <div className="space-y-1.5">
          {sources.map((src, i) => (
            <motion.div
              key={src.n}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.35, ease: EASE }}
              className="flex items-center gap-2 rounded-lg bg-[#FBFBFC] border border-[#EBEDF0] px-2.5 py-2"
            >
              <span className="w-5 h-5 rounded-md bg-[#E8613C]/10 flex items-center justify-center text-[8px] text-[#E8613C]">★</span>
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-semibold text-[#0B0E14] truncate">{src.n}</div>
                <div className="text-[8px] text-[#8C94A1]">{src.m}</div>
              </div>
              <span
                className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${
                  src.s === "Ready"
                    ? "bg-[#16A34A]/10 text-[#16A34A]"
                    : "bg-[#E8613C]/10 text-[#E8613C]"
                }`}
              >
                {src.s}
              </span>
            </motion.div>
          ))}
        </div>
      </Field>
      <div className="h-8 rounded-lg border border-dashed border-[#D5DAE1] flex items-center justify-center text-[9px] font-semibold text-[#8C94A1]">
        + Upload file or add a URL
      </div>
    </div>
  );
}

function AppearancePanel() {
  const colors = ["#E8613C", "#2563EB", "#16A34A", "#7C3AED", "#0B0E14"];
  return (
    <div className="space-y-3">
      <Field label="Accent color">
        <div className="flex items-center gap-2">
          {colors.map((c, i) => (
            <span
              key={c}
              className="w-6 h-6 rounded-full"
              style={{
                background: c,
                boxShadow: i === 0 ? "0 0 0 2px #fff, 0 0 0 4px #E8613C" : "none",
              }}
            />
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Theme">
          <div className="h-8 rounded-lg bg-[#FBFBFC] border border-[#EBEDF0] flex items-center justify-between px-2.5 text-[10px]">
            <span className="text-[#0B0E14] font-medium">Dark</span>
            <span className="text-[#8C94A1]">▾</span>
          </div>
        </Field>
        <Field label="Position">
          <div className="h-8 rounded-lg bg-[#FBFBFC] border border-[#EBEDF0] flex items-center justify-between px-2.5 text-[10px]">
            <span className="text-[#0B0E14] font-medium">Bottom right</span>
            <span className="text-[#8C94A1]">▾</span>
          </div>
        </Field>
      </div>
      <Field label="Live preview">
        <div className="rounded-lg bg-[#0B0E14] p-2.5 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#E8613C] flex items-center justify-center text-[11px] font-bold text-white">S</div>
          <div>
            <div className="text-[10px] font-bold text-white leading-none">Support Bot</div>
            <div className="text-[8px] text-[#16A34A] mt-1 flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-[#16A34A]" /> Online
            </div>
          </div>
        </div>
      </Field>
    </div>
  );
}

function SecurityPanel() {
  const rows = [
    { l: "Password protection", v: "On", on: true },
    { l: "Rate limiting", v: "60 / min", on: true },
  ];
  return (
    <div className="space-y-3">
      {rows.map((r) => (
        <div
          key={r.l}
          className="flex items-center justify-between rounded-lg bg-[#FBFBFC] border border-[#EBEDF0] px-2.5 py-2"
        >
          <span className="text-[9px] font-semibold text-[#0B0E14]">{r.l}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-[#8C94A1]">{r.v}</span>
            <span className="w-7 h-4 rounded-full bg-[#16A34A] flex items-center px-0.5 justify-end">
              <span className="w-3 h-3 rounded-full bg-white" />
            </span>
          </div>
        </div>
      ))}
      <Field label="Allowed domains">
        <div className="flex flex-wrap gap-1.5">
          {["yourstore.in", "app.yourstore.in"].map((d) => (
            <span
              key={d}
              className="text-[9px] font-medium text-[#0B0E14] bg-[#FBFBFC] border border-[#EBEDF0] rounded-full px-2 py-1"
            >
              {d}
            </span>
          ))}
          <span className="text-[9px] font-semibold text-[#8C94A1] border border-dashed border-[#D5DAE1] rounded-full px-2 py-1">
            + Add
          </span>
        </div>
      </Field>
    </div>
  );
}

function PreviewPanel() {
  const lines = [
    { bot: true, t: "Hi! How can I help you today?" },
    { bot: false, t: "What's your return policy?" },
    { bot: true, t: "We offer 30-day returns on all items" },
  ];
  return (
    <div className="space-y-2">
      {lines.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.25, duration: 0.4, ease: EASE }}
          className={`text-[9px] rounded-xl p-2 max-w-[85%] leading-snug ${
            m.bot
              ? "bg-[#FBFBFC] border border-[#EBEDF0] rounded-bl-sm text-[#374151]"
              : "bg-[#0B0E14] text-white rounded-br-sm ml-auto"
          }`}
        >
          {m.t}
        </motion.div>
      ))}
      <div className="flex items-center gap-1.5 border-t border-[#EBEDF0] pt-2">
        <div className="flex-1 px-2.5 py-1.5 rounded-full text-[9px] text-[#9CA3AF] border border-[#EBEDF0]">
          Type a message…
        </div>
        <div className="w-6 h-6 rounded-full bg-[#E8613C] flex items-center justify-center text-white text-[9px]">
          <SendHorizonal size={10} />
        </div>
      </div>
    </div>
  );
}

const WIZARD_PANELS: Record<(typeof WIZARD_TABS)[number], () => JSX.Element> = {
  General: GeneralPanel,
  Knowledge: KnowledgePanel,
  Appearance: AppearancePanel,
  Security: SecurityPanel,
  Preview: PreviewPanel,
};

export function WizardMockup() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-cycle through the tabs so the card demos every step on its own;
  // pauses while the visitor is hovering or after they click a tab.
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % WIZARD_TABS.length);
    }, 2600);
    return () => clearInterval(t);
  }, [paused]);

  const activeTab = WIZARD_TABS[active];
  const Panel = WIZARD_PANELS[activeTab];

  return (
    <div
      className={frame}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Chrome url="app.osciva.io/agents/create" />
      <div className="p-5 bg-[#FBFBFC]">
        <div className="text-[12px] font-bold text-[#0B0E14] mb-3">Create agent</div>
        <div className="flex gap-1 p-1 bg-[#EEF1F5] rounded-lg mb-3">
          {WIZARD_TABS.map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setActive(i);
                setPaused(true);
              }}
              className={`relative flex-1 text-center py-1.5 text-[9px] font-semibold rounded-md transition-colors ${
                i === active ? "text-[#0B0E14]" : "text-[#8C94A1] hover:text-[#586072]"
              }`}
            >
              {i === active && (
                <motion.span
                  layoutId="wizard-tab-pill"
                  className="absolute inset-0 bg-white rounded-md shadow-sm"
                  transition={{ duration: 0.3, ease: EASE }}
                />
              )}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-[#EBEDF0] p-3.5">
          <div className="h-[196px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: EASE }}
              >
                <Panel />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="h-9 mt-3 rounded-lg bg-[#E8613C] flex items-center justify-center text-[10px] font-semibold text-white shadow-brand">
            {activeTab === "Preview" ? "Publish agent" : "Create agent"}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WidgetMockup() {
  const lines = [
    { bot: true, t: "Hi! How can I help you today?" },
    { bot: false, t: "What's your return policy?" },
    { bot: true, t: "We offer 30-day returns on all items" },
  ];
  return (
    <div className={frame}>
      <Chrome url="yourstore.in" />
      <div className="relative h-[360px] bg-gradient-to-br from-[#F7F8FA] to-white p-5 overflow-hidden">
        <div className="space-y-2.5">
          <div className="h-3.5 bg-[#EAEDF1] rounded w-2/3" />
          <div className="h-3.5 bg-[#EAEDF1] rounded w-1/2" />
          <div className="h-2 bg-[#EFF1F4] rounded w-full mt-3" />
          <div className="h-2 bg-[#EFF1F4] rounded w-5/6" />
          <div className="h-2 bg-[#EFF1F4] rounded w-4/6" />
          <div className="grid grid-cols-3 gap-2.5 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-[#EFF1F4]" />
            ))}
          </div>
        </div>

        {/* Widget */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
          className="absolute bottom-4 right-4 w-[235px] rounded-2xl overflow-hidden shadow-float border border-[#0B0E14]/10 bg-white"
        >
          <div className="bg-[#0B0E14] px-3.5 py-3 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E8613C] flex items-center justify-center text-[10px] font-bold text-white">
              S
            </div>
            <div>
              <div className="text-[11px] font-bold text-white leading-none">Support Bot</div>
              <div className="text-[8px] text-[#16A34A] mt-1 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-[#16A34A]" /> Online
              </div>
            </div>
          </div>
          <div className="bg-[#FBFBFC] p-2.5 space-y-2 h-[150px]">
            {lines.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + i * 0.5, duration: 0.4, ease: EASE }}
                className={`text-[9px] rounded-xl p-2 max-w-[85%] leading-snug ${
                  m.bot
                    ? "bg-white border border-[#EBEDF0] rounded-bl-sm text-[#374151]"
                    : "bg-[#0B0E14] text-white rounded-br-sm ml-auto"
                }`}
              >
                {m.t}
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: [0, 1, 1, 0] }}
              viewport={{ once: true }}
              transition={{ delay: 1.6, duration: 1.2, times: [0, 0.2, 0.8, 1] }}
              className="flex gap-1 px-1"
            >
              {[0, 1, 2].map((d) => (
                <span key={d} className="w-1 h-1 rounded-full bg-[#CBD5E1]" />
              ))}
            </motion.div>
          </div>
          <div className="bg-white p-2 flex items-center gap-1.5 border-t border-[#EBEDF0]">
            <div className="flex-1 px-2.5 py-1.5 rounded-full text-[9px] text-[#9CA3AF] border border-[#EBEDF0]">
              Type a message…
            </div>
            <div className="w-6 h-6 rounded-full bg-[#E8613C] flex items-center justify-center text-white text-[9px]">
              <SendHorizonal size={10} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Full-size chat mockup for the hero, no browser chrome, just the assistant
// holding a real conversation. Fills the slide height (h-full) so it lines up
// with the dashboard slide.
export function ChatMockup() {
  const convo = [
    { bot: true, t: "Hi! I'm your Osciva assistant. Ask me anything about your order." },
    { bot: false, t: "Where's my order #1043?" },
    { bot: true, t: "It shipped yesterday and arrives Thursday. Here's your tracking:", card: true },
    { bot: false, t: "Can I change the delivery address?" },
    { bot: true, t: "Done! Your address is updated. A confirmation email is on its way." },
  ];
  return (
    <div className={`${frame} h-full flex flex-col`}>
      {/* Header */}
      <div className="bg-[#0B0E14] px-4 py-3.5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#E8613C] flex items-center justify-center text-[14px] font-bold text-white">S</div>
        <div className="flex-1">
          <div className="text-[13px] font-bold text-white leading-none">Support Bot</div>
          <div className="text-[10px] text-[#16A34A] mt-1.5 flex items-center gap-1.5">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            />
            Online · replies instantly
          </div>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((d) => (
            <span key={d} className="w-1 h-1 rounded-full bg-white/40" />
          ))}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 bg-gradient-to-b from-[#F7F8FA] to-white p-4 space-y-3 overflow-hidden">
        {convo.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.55, duration: 0.45, ease: EASE }}
            className={m.bot ? "" : "flex justify-end"}
          >
            <div
              className={`text-[12px] leading-snug rounded-2xl px-3 py-2 max-w-[82%] inline-block ${
                m.bot
                  ? "bg-white border border-[#EBEDF0] rounded-bl-md text-[#374151] shadow-sm"
                  : "bg-[#0B0E14] text-white rounded-br-md"
              }`}
            >
              {m.t}
              {m.card && (
                <div className="mt-2 rounded-xl bg-[#FBFBFC] border border-[#EBEDF0] p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#0B0E14]">Order #1043</span>
                    <span className="text-[9px] font-semibold text-[#16A34A] bg-[#16A34A]/10 px-1.5 py-0.5 rounded-full">In transit</span>
                  </div>
                  <div className="mt-2 flex items-center gap-1">
                    {[1, 1, 1, 0].map((on, j) => (
                      <span key={j} className="flex-1 h-1 rounded-full" style={{ background: on ? "#E8613C" : "#E8613C22" }} />
                    ))}
                  </div>
                  <div className="mt-1.5 text-[9px] text-[#8C94A1]">Out for delivery · arrives Thu, 26 Jun</div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* typing shimmer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ delay: 1.6, duration: 1.1, times: [0, 0.2, 0.8, 1] }}
          className="flex gap-1 px-1"
        >
          {[0, 1, 2].map((d) => (
            <motion.span
              key={d}
              className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }}
            />
          ))}
        </motion.div>
      </div>

      {/* Input */}
      <div className="bg-white p-3 flex items-center gap-2 border-t border-[#EBEDF0]">
        <div className="flex-1 px-3.5 py-2.5 rounded-full text-[11px] text-[#9CA3AF] border border-[#EBEDF0]">
          Type a message…
        </div>
        <div className="w-9 h-9 rounded-full bg-[#E8613C] flex items-center justify-center text-white text-[12px] shadow-brand">
          <SendHorizonal size={10} />
        </div>
      </div>
    </div>
  );
}

// "Embed anywhere" mockup, install snippet + the channels the assistant
// plugs into. Fills the slide height to match the other slides.
export function EmbedMockup() {
  // Monogram tiles, same treatment as IntegrationsSection (no emoji, no logo assets).
  const channels = [
    { n: "Website", e: "W", s: "Connected" },
    { n: "WhatsApp", e: "WA", s: "Connected" },
    { n: "Instagram", e: "IG", s: "Connected" },
    { n: "Slack", e: "SL", s: "Connected" },
    { n: "Email", e: "@", s: "Connected" },
    { n: "REST API", e: "</>", s: "Connected" },
  ];
  return (
    <div className={`${frame} h-full flex flex-col`}>
      <div className="bg-[#0B0E14] px-4 py-3.5 flex items-center justify-between">
        <div className="text-[13px] font-bold text-white">Embed anywhere</div>
        <span className="text-[10px] font-semibold text-[#16A34A] bg-[#16A34A]/15 px-2 py-0.5 rounded-full">Live in ~30 min</span>
      </div>

      <div className="flex-1 bg-[#FBFBFC] p-4 flex flex-col gap-3.5">
        {/* Install snippet */}
        <div>
          <div className="text-[9px] font-semibold text-[#586072] mb-1.5">Paste one line before &lt;/body&gt;</div>
          <div className="rounded-xl bg-[#0B0E14] p-3 font-mono text-[10px] leading-relaxed">
            <span className="text-[#5B6472]">{"// Drop in once, works everywhere"}</span>
            <br />
            <span className="text-[#8C94A1]">&lt;script </span>
            <span className="text-[#7DD3FC]">src</span>
            <span className="text-[#8C94A1]">=</span>
            <span className="text-[#86EFAC]">"https://cdn.osciva.io/widget.js"</span>
            <br />
            <span className="text-[#7DD3FC]">&nbsp;&nbsp;data-agent</span>
            <span className="text-[#8C94A1]">=</span>
            <span className="text-[#86EFAC]">"support-bot"</span>
            <span className="text-[#8C94A1]">&gt;&lt;/script&gt;</span>
            <motion.span
              className="inline-block ml-0.5 w-1.5 h-3 align-middle bg-[#E8613C]"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
          </div>
        </div>

        {/* Channels */}
        <div>
          <div className="text-[9px] font-semibold text-[#586072] mb-1.5">Works across every channel</div>
          <div className="grid grid-cols-2 gap-2">
            {channels.map((c, i) => (
              <motion.div
                key={c.n}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.4, ease: EASE }}
                className="flex items-center gap-2 rounded-xl bg-white border border-[#EBEDF0] px-2.5 py-2.5"
              >
                <span className="w-7 h-7 rounded-lg bg-[#F2F4F7] flex items-center justify-center text-[9px] font-bold text-[#586072]">{c.e}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold text-[#0B0E14] leading-none">{c.n}</div>
                  <div className="text-[9px] text-[#16A34A] mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-[#16A34A]" /> {c.s}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer status, pinned to the bottom so the card fills cleanly */}
        <div className="mt-auto rounded-xl bg-white border border-[#EBEDF0] px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-[#0B0E14]">
            <span className="w-5 h-5 rounded-full bg-[#16A34A]/10 flex items-center justify-center text-[#16A34A] text-[10px]">✓</span>
            6 channels live · no code changes
          </div>
          <span className="text-[10px] font-bold text-[#E8613C]">Copy snippet</span>
        </div>
      </div>
    </div>
  );
}

// Auto-rotating hero carousel: cycles through the live dashboard, a full-size
// chat conversation, and the embed/channels view. Slides are stacked in one
// grid cell so the container height matches the tallest slide and never jumps.
const HERO_SLIDES = [
  { id: "dashboard", label: "Dashboard" },
  { id: "chat", label: "Live chat" },
  { id: "embed", label: "Embed anywhere" },
] as const;

export const HERO_SLIDE_COUNT = HERO_SLIDES.length;

// Controlled: the active index + timer live in HeroSection so the rotating
// headline word and the carousel advance in lockstep. `cycle` bumps whenever
// the active slide changes so the chat/embed animations replay each time.
export function HeroCarousel({
  active,
  onSelect,
  onHoverChange,
}: {
  active: number;
  onSelect: (i: number) => void;
  onHoverChange: (hovered: boolean) => void;
}) {
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    setCycle((c) => c + 1);
  }, [active]);

  const go = (i: number) => onSelect(i);

  return (
    <div
      className="relative"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <div className="grid">
        {HERO_SLIDES.map((s, i) => (
          <motion.div
            key={s.id}
            className="[grid-area:1/1]"
            animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 0.97 }}
            transition={{ duration: 0.55, ease: EASE }}
            style={{ pointerEvents: i === active ? "auto" : "none" }}
            aria-hidden={i !== active}
          >
            {s.id === "chat" ? (
              <ChatMockup key={cycle} />
            ) : s.id === "embed" ? (
              <EmbedMockup key={cycle} />
            ) : (
              <DashboardMockup />
            )}
          </motion.div>
        ))}
      </div>

      {/* Slide controls, absolute so they don't change the card's layout height */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-11 flex items-center gap-3">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show ${s.label}`}
            className="group flex items-center gap-1.5"
          >
            <span
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-7 bg-[#E8613C]" : "w-1.5 bg-white/30 group-hover:bg-white/50"
              }`}
            />
            <span
              className={`text-[11px] font-semibold transition-colors ${
                i === active ? "text-white" : "text-white/40 group-hover:text-white/70"
              }`}
            >
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
