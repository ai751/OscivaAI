import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  Check,
  ChevronRight,
  Code2,
  Gauge,
  KeyRound,
  Languages,
  LayoutDashboard,
  MessageSquare,
  MessagesSquare,
  Play,
  Plus,
  PlusCircle,
  Send,
  Settings,
  TrendingUp,
} from "lucide-react";
import { X } from "./LandingNavbar";

const INDUSTRIES = ["E-Commerce", "Healthcare", "Education", "Real Estate", "SaaS", "Hospitality"];

const stats = [
  { icon: MessagesSquare, value: "10M+", lines: ["Customer questions", "answered by agents"] },
  { icon: BrainCircuit, value: "500+", lines: ["Businesses run support", "on Osciva"] },
  { icon: Gauge, value: "1.2s", lines: ["Average first-reply", "time, day or night"] },
];

const journey = ["Answer three questions.", "Get a ready-made assistant.", "Train it on your content.", "Live in 30 minutes."];

/* Gentle float, staggered per card so the collage feels alive. */
const float = (delay: number, dur = 5.5) => ({
  animate: { y: [0, -10, 0] },
  transition: { duration: dur, delay, repeat: Infinity, ease: "easeInOut" as const },
});

/* ----------------------------------------------------------------------------
 * Slide 1, floating-card collage
 * ------------------------------------------------------------------------- */
function CollageSlide() {
  return (
    <div className="absolute inset-0">
      {/* Pastel blobs */}
      <div
        aria-hidden
        className="absolute right-[40px] top-[30px] w-[300px] h-[300px] rounded-full"
        style={{ background: "var(--mx-blob-green)" }}
      />
      <div
        aria-hidden
        className="absolute left-[10px] bottom-[40px] w-[260px] h-[260px] rounded-full"
        style={{ background: X.coralSoft }}
      />

      {/* Dashed connectors */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden>
        <path d="M 150 130 C 220 150, 260 220, 300 270" fill="none" stroke="#b9dcc6" strokeWidth="1.5" strokeDasharray="4 6" />
        <path d="M 420 120 C 400 200, 380 240, 330 280" fill="none" stroke="#b9dcc6" strokeWidth="1.5" strokeDasharray="4 6" />
        <path d="M 160 420 C 230 400, 280 350, 310 300" fill="none" stroke="#f3c5b5" strokeWidth="1.5" strokeDasharray="4 6" />
      </svg>

      {/* Card: incoming question */}
      <motion.div
        {...float(0)}
        className="absolute left-0 top-[60px] w-[240px] rounded-[16px] p-4"
        style={{ background: X.white, boxShadow: X.shadow1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-full grid place-items-center text-[10px] font-bold text-white" style={{ background: "#4A7DDE" }}>
            RS
          </span>
          <div>
            <div className="text-[12px] font-bold" style={{ color: X.ink }}>Riya Shah</div>
            <div className="text-[10px]" style={{ color: X.faint }}>on your website · 11:42 pm</div>
          </div>
        </div>
        <div className="rounded-[12px] px-3 py-2 text-[12px] leading-relaxed" style={{ background: X.surface, color: X.ink }}>
          mera order kab tak aayega?
        </div>
      </motion.div>

      {/* Card: agent reply */}
      <motion.div
        {...float(0.8, 6)}
        className="absolute right-0 top-[30px] w-[260px] rounded-[16px] p-4"
        style={{ background: X.white, boxShadow: X.shadow1 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="w-7 h-7 rounded-full" />
          <div>
            <div className="text-[12px] font-bold" style={{ color: X.ink }}>Your Osciva agent</div>
            <div className="text-[10px]" style={{ color: X.faint }}>replied in 1.1s</div>
          </div>
        </div>
        <div className="rounded-[12px] px-3 py-2 text-[12px] leading-relaxed text-white" style={{ background: X.coral }}>
          आपका ऑर्डर #4218 कल शाम तक डिलीवर होगा
        </div>
        <div className="mt-2 text-[10px]" style={{ color: X.faint }}>
          Source: shipping-policy.pdf
        </div>
      </motion.div>

      {/* Card: languages */}
      <motion.div
        {...float(1.4, 5)}
        className="absolute left-[10px] bottom-[70px] w-[220px] rounded-[16px] p-4"
        style={{ background: X.white, boxShadow: X.shadow1 }}
      >
        <div className="flex items-center gap-2 mb-2.5">
          <Languages size={15} style={{ color: X.coral }} />
          <span className="text-[12px] font-bold" style={{ color: X.ink }}>Speaks 20+ languages</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["English", "हिंदी", "தமிழ்", "मराठी", "+17"].map((l) => (
            <span key={l} className="text-[10.5px] px-2 py-0.5 rounded-full border" style={{ borderColor: X.border, color: X.sub }}>
              {l}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Centre: mini widget */}
      <motion.div
        {...float(0.4, 7)}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[230px] rounded-[16px] overflow-hidden"
        style={{ background: X.white, boxShadow: X.shadow1 }}
      >
        <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ background: X.inkSolid }}>
          <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="w-6 h-6 rounded-full" />
          <span className="text-[11px] font-bold text-white">Support assistant</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: X.green }} />
        </div>
        <div className="p-3 space-y-2" style={{ background: X.surface }}>
          <div className="rounded-[10px] px-2.5 py-1.5 text-[10.5px] border" style={{ background: X.white, borderColor: X.border, color: X.ink }}>
            Hi! Ask me about orders, returns or payments.
          </div>
          <div className="ml-auto max-w-[80%] rounded-[10px] px-2.5 py-1.5 text-[10.5px] text-white" style={{ background: X.coral }}>
            Do you ship to Pune?
          </div>
          <div className="rounded-[10px] px-2.5 py-1.5 text-[10.5px] border" style={{ background: X.white, borderColor: X.border, color: X.ink }}>
            Yes, 2-day delivery, free above ₹499
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 border-t" style={{ borderColor: X.border, background: X.white }}>
          <span className="flex-1 text-[10px]" style={{ color: X.faint }}>Type a message…</span>
          <Send size={11} style={{ color: X.coral }} />
        </div>
      </motion.div>

      {/* Chip: no human needed */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.5, type: "spring", stiffness: 200 }}
        className="absolute right-[190px] top-[195px]"
      >
        <motion.div
          {...float(2.2, 6)}
          className="flex items-center gap-2 rounded-[50px] px-4 py-2"
          style={{ background: X.white, boxShadow: X.shadow3 }}
        >
          <span className="w-2 h-2 rounded-full" style={{ background: X.green }} />
          <span className="text-[11.5px] font-medium" style={{ color: X.sub }}>Answered without a human</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Slide 2, the owner's app, cycling through Dashboard → My Agents → Analytics
 * so visitors see all three sections. The sidebar highlight follows the view.
 * ------------------------------------------------------------------------- */
const APP_VIEWS = ["Dashboard", "My Agents", "Analytics"] as const;
const VIEW_MS = 2500;

const demoAgents = [
  { init: "S", name: "Support bot", msgs: "8,214 msgs", rating: "4.9" },
  { init: "V", name: "Sales bot", msgs: "3,102 msgs", rating: "4.7" },
  { init: "F", name: "FAQ bot", msgs: "1,164 msgs", rating: "4.8" },
];

/* View 1, mirrors pages/Agents.tsx (cards with Active status + messages) */
function AgentsView() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[12px] font-extrabold" style={{ color: X.ink }}>My Agents</div>
          <div className="text-[8.5px]" style={{ color: X.faint }}>3 agents deployed</div>
        </div>
        <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[9px] font-semibold text-white" style={{ background: X.coral }}>
          <Plus size={9} /> New agent
        </span>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {demoAgents.map((a) => (
          <div key={a.name} className="rounded-[10px] border px-2.5 py-2.5" style={{ borderColor: X.border, background: X.white }}>
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-[8px] grid place-items-center text-[10px] font-bold" style={{ background: X.coralSoft, color: X.coral }}>
                {a.init}
              </span>
              <span className="w-6 h-3.5 rounded-full relative" style={{ background: X.green }}>
                <span className="absolute right-0.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white" />
              </span>
            </div>
            <div className="mt-2 text-[10px] font-bold truncate" style={{ color: X.ink }}>{a.name}</div>
            <div className="mt-0.5 flex items-center gap-1 text-[8px] font-medium" style={{ color: "#16a34a" }}>
              <span className="w-1 h-1 rounded-full" style={{ background: X.green }} /> Active
            </div>
            <div className="mt-1.5 flex items-center gap-1 text-[8px]" style={{ color: X.faint }}>
              <MessageSquare size={8} /> {a.msgs}
            </div>
          </div>
        ))}
      </div>
      <div
        className="mt-2 rounded-[10px] border border-dashed px-2.5 py-2 text-center text-[8.5px] font-medium"
        style={{ borderColor: X.borderStrong, color: X.faint }}
      >
        + Create your next agent, live in 30 minutes
      </div>
    </div>
  );
}

/* View 2, mirrors pages/Analytics.tsx (stat cards + Agent Performance) */
function AnalyticsView() {
  return (
    <div>
      <div className="text-[12px] font-extrabold" style={{ color: X.ink }}>Analytics</div>
      <div className="text-[8.5px]" style={{ color: X.faint }}>Performance insights</div>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {[
          { l: "Total Messages", v: "12,480" },
          { l: "Conversations", v: "1,284" },
          { l: "Active Agents", v: "3" },
          { l: "Avg Rating", v: "4.8/5" },
        ].map((s) => (
          <div key={s.l} className="rounded-[10px] border px-2 py-2" style={{ borderColor: X.border, background: X.white }}>
            <div className="text-[7.5px] font-medium truncate" style={{ color: X.faint }}>{s.l}</div>
            <div className="mt-1 text-[12px] font-extrabold leading-none" style={{ color: X.ink }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 rounded-[10px] border overflow-hidden" style={{ borderColor: X.border, background: X.white }}>
        <div className="px-2.5 py-1.5 text-[9px] font-bold border-b" style={{ color: X.ink, borderColor: X.border }}>
          Agent Performance
        </div>
        <div className="grid grid-cols-3 px-2.5 py-1 text-[7px] font-semibold uppercase tracking-wider border-b" style={{ color: X.faint, borderColor: X.border }}>
          <span>Agent</span>
          <span className="text-center">Messages</span>
          <span className="text-right">Rating</span>
        </div>
        {demoAgents.map((a) => (
          <div key={a.name} className="grid grid-cols-3 items-center px-2.5 py-1.5 border-b last:border-b-0" style={{ borderColor: X.hairline }}>
            <span className="flex items-center gap-1.5 text-[8.5px] font-semibold truncate" style={{ color: X.ink }}>
              <span className="w-4 h-4 rounded-[5px] grid place-items-center text-[7px] font-bold shrink-0" style={{ background: X.coralSoft, color: X.coral }}>
                {a.init}
              </span>
              {a.name}
            </span>
            <span className="text-center text-[8.5px]" style={{ color: X.sub }}>{a.msgs.replace(" msgs", "")}</span>
            <span className="text-right text-[8.5px] font-semibold" style={{ color: X.coral }}>★ {a.rating}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardSlide() {
  const [view, setView] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setView((v) => (v + 1) % APP_VIEWS.length), VIEW_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0">
      {/* Pastel blobs */}
      <div
        aria-hidden
        className="absolute right-[20px] top-[10px] w-[280px] h-[280px] rounded-full"
        style={{ background: "var(--mx-blob-green)" }}
      />
      <div
        aria-hidden
        className="absolute left-[10px] bottom-[20px] w-[240px] h-[240px] rounded-full"
        style={{ background: X.coralSoft }}
      />

      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] max-w-full rounded-[18px] overflow-hidden border"
        style={{ background: X.white, boxShadow: X.shadow1, borderColor: X.hairline }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: X.border, background: X.surface }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#f87171" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#fbbf24" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#34d399" }} />
          <span className="mx-auto px-4 py-1 rounded-[6px] text-[10.5px]" style={{ background: X.white, color: X.faint }}>
            app.osciva.io/dashboard
          </span>
        </div>

        <div className="flex">
          {/* Sidebar, mirrors the real app sidebar (layout/Sidebar.tsx) */}
          <div className="w-[126px] shrink-0 border-r px-2.5 py-3" style={{ borderColor: X.border, background: X.surface }}>
            <div className="flex items-center gap-1.5 px-1.5 mb-2.5">
              <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="w-5 h-5 rounded-full" />
              <span className="text-[11px] font-extrabold" style={{ color: X.ink }}>Osciva <span style={{ color: X.coral }}>AI</span></span>
            </div>
            {[
              {
                group: "Overview",
                items: [
                  { icon: LayoutDashboard, l: "Dashboard" },
                  { icon: Bot, l: "My Agents" },
                  { icon: BarChart3, l: "Analytics" },
                ],
              },
              {
                group: "Build",
                items: [
                  { icon: PlusCircle, l: "Create Agent" },
                  { icon: Code2, l: "Embed & Deploy" },
                  { icon: KeyRound, l: "API Keys" },
                ],
              },
              {
                group: "Account",
                items: [
                  { icon: BookOpen, l: "Documentation" },
                  { icon: Settings, l: "Settings" },
                ],
              },
            ].map((g) => (
              <div key={g.group} className="mb-2">
                {g.items.map((n) => (
                  <div
                    key={n.l}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-[7px] mb-0.5 text-[9px] font-semibold whitespace-nowrap transition-colors duration-300"
                    style={n.l === APP_VIEWS[view] ? { background: X.coralSoft, color: X.coral } : { color: X.faint }}
                  >
                    <n.icon size={10} className="shrink-0" />
                    {n.l}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Main, fades between Dashboard / My Agents / Analytics */}
          <div className="flex-1 min-w-0 px-3.5 py-3 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={APP_VIEWS[view]}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {view === 1 ? (
                  <AgentsView />
                ) : view === 2 ? (
                  <AnalyticsView />
                ) : (
                  <>
            {/* Welcome banner */}
            <div className="relative overflow-hidden rounded-[12px] px-3.5 py-3 flex items-center justify-between gap-3" style={{ background: X.inkSolid }}>
              <div
                aria-hidden
                className="absolute -top-8 -right-4 w-28 h-28 rounded-full"
                style={{ background: "rgba(239,120,91,0.3)", filter: "blur(30px)" }}
              />
              <div className="relative">
                <div className="text-[12.5px] font-extrabold text-white">Good morning, Aman</div>
                <div className="text-[9.5px] text-white/60 mt-0.5">Here's how your AI agents are performing today.</div>
              </div>
              <span className="relative flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[9.5px] font-semibold text-white shrink-0" style={{ background: X.coral }}>
                <Plus size={10} /> New agent
              </span>
            </div>

            {/* Stat cards */}
            <div className="mt-2.5 grid grid-cols-4 gap-2">
              {[
                { l: "Total agents", v: "3", t: "2 active", icon: Bot, tint: X.coral, tintBg: X.coralSoft },
                { l: "Total messages", v: "12,480", t: "Live", icon: MessageSquare, tint: "#16a34a", tintBg: "rgba(34,197,94,0.12)" },
                { l: "Conversations", v: "1,284", t: "Live", icon: MessagesSquare, tint: "#2563eb", tintBg: "rgba(37,99,235,0.12)" },
                { l: "Avg response", v: "1.2s", t: "0.3s faster", icon: Gauge, tint: "#d97706", tintBg: "rgba(217,119,6,0.12)" },
              ].map((s) => (
                <div key={s.l} className="rounded-[10px] border px-2 py-2" style={{ borderColor: X.border, background: X.white }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[8px] font-medium truncate" style={{ color: X.faint }}>{s.l}</span>
                    <span className="w-5 h-5 rounded-[6px] grid place-items-center shrink-0" style={{ background: s.tintBg }}>
                      <s.icon size={10} style={{ color: s.tint }} />
                    </span>
                  </div>
                  <div className="text-[13px] font-extrabold leading-none" style={{ color: X.ink }}>{s.v}</div>
                  <div className="mt-1 flex items-center gap-0.5 text-[7.5px] font-medium" style={{ color: "#16a34a" }}>
                    <TrendingUp size={8} />
                    {s.t}
                  </div>
                </div>
              ))}
            </div>

            {/* Chart + Active agents */}
            <div className="mt-2.5 grid grid-cols-3 gap-2">
              <div className="col-span-2 rounded-[10px] border px-3 py-2.5" style={{ borderColor: X.border, background: X.white }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[10px] font-bold" style={{ color: X.ink }}>Weekly messages</div>
                    <div className="text-[8px]" style={{ color: X.faint }}>2,640 in the last 7 days</div>
                  </div>
                  <span className="text-[7.5px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: X.surface, color: X.sub }}>
                    Last 7 days
                  </span>
                </div>
                <div className="flex items-stretch gap-1.5 h-[74px]">
                  {[
                    { d: "Mon", h: 38 }, { d: "Tue", h: 52 }, { d: "Wed", h: 44 },
                    { d: "Thu", h: 63 }, { d: "Fri", h: 55 }, { d: "Sat", h: 78 }, { d: "Sun", h: 100 },
                  ].map((b, i) => (
                    <div key={b.d} className="flex-1 flex flex-col items-center gap-1">
                      <div className="relative w-full flex-1 rounded-[4px] overflow-hidden" style={{ background: X.surface }}>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${b.h}%` }}
                          transition={{ duration: 0.55, delay: 0.35 + i * 0.06, ease: "easeOut" }}
                          className="absolute bottom-0 inset-x-0 rounded-[4px]"
                          style={{ background: i === 6 ? X.coral : "rgba(239,120,91,0.4)" }}
                        />
                      </div>
                      <span className="text-[7px] font-medium" style={{ color: i === 6 ? X.coral : X.faint }}>{b.d}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[10px] border px-2.5 py-2.5" style={{ borderColor: X.border, background: X.white }}>
                <div className="text-[10px] font-bold mb-1.5" style={{ color: X.ink }}>Active agents</div>
                {[
                  { init: "S", name: "Support bot", meta: "8,214 msgs" },
                  { init: "V", name: "Sales bot", meta: "3,102 msgs" },
                  { init: "F", name: "FAQ bot", meta: "1,164 msgs" },
                ].map((a) => (
                  <div key={a.name} className="flex items-center gap-1.5 py-1">
                    <span className="w-5 h-5 rounded-[6px] grid place-items-center text-[8px] font-bold shrink-0" style={{ background: X.coralSoft, color: X.coral }}>
                      {a.init}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[8.5px] font-semibold leading-tight truncate" style={{ color: X.ink }}>{a.name}</div>
                      <div className="text-[7.5px]" style={{ color: X.faint }}>{a.meta}</div>
                    </div>
                    <span className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" style={{ background: X.green }} />
                  </div>
                ))}
              </div>
            </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Slide 3, auto-playing chat demo (all English). Runs once per mount; the
 * carousel remounts it on every cycle, so it starts fresh each time.
 * ------------------------------------------------------------------------- */
type ChatEvent =
  | { kind: "user"; text: string }
  | { kind: "agent"; text: string; source?: string };

const SCRIPT: ChatEvent[] = [
  { kind: "user", text: "Do you ship to Pune?" },
  { kind: "agent", text: "Yes, 2-day delivery, free above ₹499", source: "shipping-policy.pdf" },
  { kind: "user", text: "When will my order arrive?" },
  { kind: "agent", text: "Your order #4218 arrives tomorrow by 6 pm", source: "orders · live lookup" },
];

function ChatDemoSlide() {
  const [messages, setMessages] = useState<ChatEvent[]>([]);
  const [typing, setTyping] = useState(false);
  const [inputText, setInputText] = useState("");

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => {
        timers.push(window.setTimeout(res, ms));
      });

    (async () => {
      await wait(700);
      for (const ev of SCRIPT) {
        if (cancelled) return;
        if (ev.kind === "user") {
          for (let i = 1; i <= ev.text.length; i++) {
            if (cancelled) return;
            setInputText(ev.text.slice(0, i));
            await wait(38);
          }
          await wait(380);
          setInputText("");
          setMessages((m) => [...m, ev]);
          await wait(550);
        } else {
          setTyping(true);
          await wait(1150);
          setTyping(false);
          setMessages((m) => [...m, ev]);
          await wait(950);
        }
      }
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="absolute inset-0">
      {/* Pastel blobs */}
      <div
        aria-hidden
        className="absolute right-[30px] top-[20px] w-[300px] h-[300px] rounded-full"
        style={{ background: "var(--mx-blob-green)" }}
      />
      <div
        aria-hidden
        className="absolute left-[20px] bottom-[30px] w-[260px] h-[260px] rounded-full"
        style={{ background: X.coralSoft }}
      />

      {/* Widget */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[360px] rounded-[18px] overflow-hidden"
        style={{ background: X.white, boxShadow: X.shadow1 }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3" style={{ background: X.inkSolid }}>
          <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="w-7 h-7 rounded-full" />
          <div>
            <div className="text-[12.5px] font-bold text-white leading-tight">Support assistant</div>
            <div className="flex items-center gap-1.5 text-[10px] text-white/55">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: X.green }} />
              Online, replies in seconds
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="h-[330px] px-3.5 py-3 flex flex-col justify-end gap-2 overflow-hidden" style={{ background: X.surface }}>
          <div
            className="max-w-[85%] rounded-[12px] rounded-bl-[4px] px-3 py-2 text-[12.5px] leading-relaxed border w-fit"
            style={{ background: X.white, borderColor: X.border, color: X.ink }}
          >
            Hi! Ask me about orders, returns or payments.
          </div>
          {messages.map((m, i) =>
            m.kind === "user" ? (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="ml-auto max-w-[85%] rounded-[12px] rounded-br-[4px] px-3 py-2 text-[12.5px] leading-relaxed text-white"
                style={{ background: X.coral }}
              >
                {m.text}
              </motion.div>
            ) : (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="max-w-[85%]"
              >
                <div
                  className="rounded-[12px] rounded-bl-[4px] px-3 py-2 text-[12.5px] leading-relaxed border w-fit"
                  style={{ background: X.white, borderColor: X.border, color: X.ink }}
                >
                  {m.text}
                </div>
                {m.source && (
                  <div className="mt-1 text-[10px]" style={{ color: X.faint }}>
                    Source: {m.source}
                  </div>
                )}
              </motion.div>
            )
          )}
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1 rounded-[12px] rounded-bl-[4px] px-3 py-2.5 border w-fit"
              style={{ background: X.white, borderColor: X.border }}
            >
              {[0, 1, 2].map((d) => (
                <motion.span
                  key={d}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: X.faint }}
                  animate={{ opacity: [0.25, 1, 0.25] }}
                  transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* Input bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-t" style={{ borderColor: X.border, background: X.white }}>
          <span className="flex-1 text-[12px] truncate" style={{ color: inputText ? X.ink : X.faint }}>
            {inputText || "Type a message…"}
            {inputText && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.7, repeat: Infinity }}
                style={{ color: X.coral }}
              >
                |
              </motion.span>
            )}
          </span>
          <span className="w-7 h-7 rounded-full grid place-items-center shrink-0" style={{ background: X.coral }}>
            <Send size={12} className="text-white" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* Per-slide display time. The chat slide gets longer so the whole scripted
   conversation (~9s) plays out before the carousel moves on. */
const SLIDES = [
  { key: "dashboard", dur: 8000, node: <DashboardSlide /> },
  { key: "chat", dur: 10500, node: <ChatDemoSlide /> },
  { key: "collage", dur: 6000, node: <CollageSlide /> },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const [ind, setInd] = useState(0);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setInd((i) => (i + 1) % INDUSTRIES.length), 2600);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setSlide((s) => (s + 1) % SLIDES.length), SLIDES[slide].dur);
    return () => clearTimeout(id);
  }, [slide]);

  return (
    <section
      className="mkt-x relative overflow-hidden pt-[150px] pb-16 md:pb-20 px-5 sm:px-8"
      style={{ background: `linear-gradient(180deg, ${X.cream} 0%, ${X.white} 90%)` }}
    >
      <div className="relative max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-14 lg:gap-8 items-center">
        {/* ---------- Copy ---------- */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-[15px] font-medium"
            style={{ color: X.ink }}
          >
            The AI Assistant For
            <span className="relative inline-flex min-w-[120px] h-[24px]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={INDUSTRIES[ind]}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-0 top-0 font-bold whitespace-nowrap"
                  style={{ color: X.coral }}
                >
                  {INDUSTRIES[ind]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-5 text-[38px] sm:text-[48px] md:text-[54px] font-bold leading-[1.12] tracking-[-0.01em]"
            style={{ color: X.ink }}
          >
            Every Enquiry Answered.
            <br />
            Every Lead Captured.
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="mt-2 text-[26px] sm:text-[32px] font-bold leading-tight tracking-[-0.01em]"
            style={{ color: X.ink }}
          >
            <span style={{ color: X.coral }}>Trained</span> on your business
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="mt-5 text-[16px] leading-[24px]"
            style={{ color: X.mute }}
          >
            Your AI assistant answers customers 24/7 — admissions, appointments, orders,
            support — and saves the details of every interested visitor.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.32 }}
            className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3"
          >
            <button
              onClick={() => navigate("/auth")}
              className="px-7 py-3.5 rounded-full text-white text-[16px] font-bold transition-colors w-full sm:w-auto"
              style={{ background: X.coralGrad, boxShadow: X.btnShadow }}
              onMouseEnter={(e) => (e.currentTarget.style.background = X.coralGradHover)}
              onMouseLeave={(e) => (e.currentTarget.style.background = X.coralGrad)}
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate("/features")}
              className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-[16px] font-medium border transition-colors w-full sm:w-auto"
              style={{ borderColor: X.coral, color: X.coral, background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = X.coralSoft)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Play size={13} style={{ fill: X.coral }} />
              Watch Overview
            </button>
          </motion.div>

          {/* Journey strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="mt-8 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[14px]"
            style={{ color: X.sub }}
          >
            {journey.map((step, i) => (
              <span key={step} className="inline-flex items-center gap-2.5">
                {step}
                {i < journey.length - 1 && <ChevronRight size={14} style={{ color: X.coral }} />}
              </span>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-[560px]"
          >
            {stats.map((s) => (
              <div key={s.value} className="flex items-start gap-3">
                <span
                  className="w-10 h-10 rounded-full grid place-items-center shrink-0"
                  style={{ background: X.coral }}
                >
                  <s.icon size={18} className="text-white" />
                </span>
                <div>
                  <div className="text-[22px] font-bold leading-none" style={{ color: X.ink }}>
                    {s.value}
                  </div>
                  <div className="mt-1 text-[12.5px] leading-snug" style={{ color: X.mute }}>
                    {s.lines[0]}
                    <br />
                    {s.lines[1]}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Fine print */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.58 }}
            className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13.5px]"
            style={{ color: X.sub }}
          >
            {["No credit card required", "50 free messages/mo", "Live in 30 minutes"].map((t, i) => (
              <span key={t} className="inline-flex items-center gap-3">
                {i > 0 && <span style={{ color: X.borderStrong }}>|</span>}
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} style={{ color: X.green }} />
                  {t}
                </span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* ---------- Rotating product visuals ---------- */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative hidden md:block h-[540px] select-none"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={SLIDES[slide].key}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.98 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="absolute inset-0"
            >
              {SLIDES[slide].node}
            </motion.div>
          </AnimatePresence>

        </motion.div>
      </div>
    </section>
  );
}
