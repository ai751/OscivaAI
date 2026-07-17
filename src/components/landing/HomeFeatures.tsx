import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Globe, HelpCircle, UploadCloud, Palette, MessageSquareText, Languages, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn, DiamondItem } from "./xui";

/* ---------- Panel 1: knowledge sources (lavender) ---------- */

const sources = [
  {
    tab: "Website",
    icon: Globe,
    title: "Website Crawling",
    desc: "Point Osciva at your domain, it reads every page and keeps re-reading them on a schedule",
    points: [
      "Indexes your key pages automatically",
      "Re-syncs nightly so answers never go stale",
      "Handles product pages, policies & blogs",
      "No sitemap or setup required",
    ],
    visual: { icon: Globe, label: "yourstore.in", meta: "12 pages indexed · synced 2h ago" },
  },
  {
    tab: "PDFs & Docs",
    icon: FileText,
    title: "Documents & PDFs",
    desc: "Price lists, manuals, brochures, policies, if you can upload it, your agent can answer from it",
    points: [
      "PDF, Word, text and markdown files",
      "Up to 10 MB of documents per agent",
      "Answers cite the exact page they came from",
      "Update a file and answers update too",
    ],
    visual: { icon: FileText, label: "product-catalog-2026.pdf", meta: "96 pages · indexed in 40s" },
  },
  {
    tab: "FAQs",
    icon: HelpCircle,
    title: "Question & Answer Pairs",
    desc: "Already have a FAQ? Paste it in. Need a new one? Write pairs directly in the dashboard",
    points: [
      "Import from Notion, Sheets or plain text",
      "Highest-priority source for exact answers",
      "Perfect for policies with zero wiggle room",
      "Edit inline, changes apply instantly",
    ],
    visual: { icon: HelpCircle, label: "48 Q&A pairs", meta: "Returns · Shipping · Payments" },
  },
  {
    tab: "Manual Notes",
    icon: UploadCloud,
    title: "Tribal Knowledge",
    desc: "The stuff that lives in your head, store timings, unwritten rules, seasonal exceptions",
    points: [
      "Type notes straight into the knowledge base",
      "Great for temporary info like festival hours",
      "Set expiry dates on time-limited notes",
      "Your team can contribute without training",
    ],
    visual: { icon: UploadCloud, label: "Diwali hours note", meta: "Active until Nov 15" },
  },
];

/* ---------- Panel 2: customization (peach) ---------- */

const custom = [
  {
    tab: "Personality",
    icon: MessageSquareText,
    title: "Tone & Personality",
    desc: "Warm, professional, playful or concise, your agent chats the way your brand does",
    points: [
      "Pick a base tone, then fine-tune the greeting",
      "Set what it should never say or promise",
      "Add sign-offs, emoji style and formality",
      "Test changes in the live preview",
    ],
  },
  {
    tab: "Appearance",
    icon: Palette,
    title: "Your Brand, Not Ours",
    desc: "Logo, colors and position, the widget looks like you built it in-house",
    points: [
      "Upload your logo, pick your brand color",
      "Light or dark widget theme",
      "Left or right placement, custom launcher text",
      "No 'powered by' on paid plans",
    ],
  },
  {
    tab: "Languages",
    icon: Languages,
    title: "20+ Indian Languages",
    desc: "Enable the languages your customers actually use, the agent switches automatically",
    points: [
      "Hindi, Tamil, Telugu, Marathi, Bengali & more",
      "Detects language mid-conversation",
      "Answers from English docs in any language",
      "Hinglish handled natively",
    ],
  },
  {
    tab: "Guardrails",
    icon: SlidersHorizontal,
    title: "Rules & Handoff",
    desc: "Decide exactly when the AI answers and when a human takes over",
    points: [
      "Confidence threshold before escalating",
      "Blocked topics it must never touch",
      "Office-hours routing to your team",
      "Every handoff includes the full transcript",
    ],
  },
];

function TabbedPanel({
  items,
  bg,
  visualBg,
}: {
  items: typeof sources | typeof custom;
  bg: string;
  visualBg: string;
}) {
  const [active, setActive] = useState(0);
  const paused = useRef(false);
  const a = items[active] as (typeof sources)[number] & { visual?: { icon: typeof Globe; label: string; meta: string } };

  // Cycle through every tab automatically; pause while the visitor hovers.
  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current) setActive((v) => (v + 1) % items.length);
    }, 4200);
    return () => clearInterval(id);
  }, [items.length]);

  return (
    <div
      className="rounded-[16px] overflow-hidden"
      style={{ background: bg }}
      onMouseEnter={() => (paused.current = true)}
      onMouseLeave={() => (paused.current = false)}
    >
      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto justify-start sm:justify-center px-4 pt-4 border-b" style={{ borderColor: "rgba(17,24,39,0.08)" }}>
        {items.map((s, i) => (
          <button
            key={s.tab}
            onClick={() => setActive(i)}
            className="relative px-4 py-2.5 text-[14px] font-medium whitespace-nowrap"
            style={{ color: i === active ? X.coral : X.mute }}
          >
            {s.tab}
            {i === active && (
              <span className="absolute left-3 right-3 -bottom-px h-[2.5px] rounded-full" style={{ background: X.coral }} />
            )}
          </button>
        ))}
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={a.tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center px-6 sm:px-12 py-10 sm:py-14"
        >
          {/* Visual */}
          <div className="relative flex items-center justify-center min-h-[240px]">
            <div aria-hidden className="absolute w-[240px] h-[240px] rounded-full" style={{ background: visualBg }} />
            <div
              className="relative w-[300px] rounded-[16px] p-5"
              style={{ background: X.white, boxShadow: X.shadow1 }}
            >
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-[10px] grid place-items-center" style={{ background: X.coralSoft }}>
                  <a.icon size={20} style={{ color: X.coral }} />
                </span>
                <div>
                  <div className="text-[14px] font-bold" style={{ color: X.ink }}>
                    {"visual" in a && a.visual ? a.visual.label : a.tab}
                  </div>
                  <div className="text-[11.5px]" style={{ color: X.faint }}>
                    {"visual" in a && a.visual ? a.visual.meta : "Configured in the dashboard"}
                  </div>
                </div>
              </div>
              <div className="mt-4 h-1.5 rounded-full overflow-hidden" style={{ background: X.surface }}>
                <motion.div
                  key={a.tab}
                  className="h-full rounded-full"
                  style={{ background: X.coral }}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.1, ease: "easeOut" }}
                />
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px]" style={{ color: "#16a34a" }}>
                <CheckCircle2 size={11} /> Ready, your agent can answer from this
              </div>
            </div>
          </div>

          {/* Copy */}
          <div>
            <h3 className="text-[24px] font-bold" style={{ color: X.coral }}>
              {a.title}
            </h3>
            <p className="mt-2.5 text-[15px] leading-[24px]" style={{ color: X.sub }}>
              {a.desc}
            </p>
            <ul className="mt-5 space-y-2.5">
              {a.points.map((p) => (
                <DiamondItem key={p}>{p}</DiamondItem>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function HomeFeatures() {
  return (
    <section className="mkt-x py-20 md:py-24 px-5 sm:px-8" style={{ background: X.white }}>
      <div className="max-w-[1280px] mx-auto space-y-24">
        <div>
          <SectionHead
            pre="Train It on"
            hl="Everything You Know"
            post=""
            sub="Four ways to feed your agent, without writing a single line of code"
          />
          <FadeIn delay={0.15} className="mt-12">
            <TabbedPanel items={sources} bg={X.lavender} visualBg="#dde1f7" />
          </FadeIn>
        </div>

        <div>
          <SectionHead
            pre="Make It"
            hl="Unmistakably Yours"
            post=""
            sub="Your brand, your look, your rules, customers should never feel a difference"
          />
          <FadeIn delay={0.15} className="mt-12">
            <TabbedPanel items={custom} bg={X.coralSoft} visualBg="#fbdccd" />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
