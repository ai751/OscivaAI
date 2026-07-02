import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, HeadphonesIcon, MessageCircle, BookOpenCheck, UserPlus, Languages, LineChart } from "lucide-react";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn, DiamondItem, CoralButton, HL } from "./xui";

const agents = [
  {
    tab: "Customer Support",
    tag: "Support",
    icon: HeadphonesIcon,
    title: "Answers Instantly. Never Sleeps.",
    desc: "Handles order status, policies, troubleshooting and everything in your docs — so your team stops repeating themselves.",
    points: [
      "Replies in under 2 seconds, day or night",
      "Cites the exact document behind every answer",
      "Hands off to a human when it's unsure",
    ],
    chat: [
      { from: "them", text: "Where is my order #4218?" },
      { from: "bot", text: "It's out for delivery — arriving today by 8 pm 🚚" },
    ],
  },
  {
    tab: "Sales Assistant",
    tag: "Sales",
    icon: MessageCircle,
    title: "Turns Visitors Into Buyers.",
    desc: "Recommends products, explains pricing and nudges hesitant visitors — right when they're deciding.",
    points: [
      "Answers pricing & comparison questions",
      "Suggests the right plan or product",
      "Captures leads before they bounce",
    ],
    chat: [
      { from: "them", text: "Which plan is right for a small clinic?" },
      { from: "bot", text: "Starter fits you — 3 agents, ₹999/mo. Want a breakdown?" },
    ],
  },
  {
    tab: "FAQ Agent",
    tag: "Knowledge",
    icon: BookOpenCheck,
    title: "Your FAQ Page, But Alive.",
    desc: "Every policy, price list and how-to you've ever written becomes a conversation instead of a wall of text.",
    points: [
      "Trained on PDFs, docs and your website",
      "Re-syncs automatically when content changes",
      "No more 'did you check the FAQ?'",
    ],
    chat: [
      { from: "them", text: "What's your return policy?" },
      { from: "bot", text: "7-day no-questions returns. Refunds in 3–5 days ✅" },
    ],
  },
  {
    tab: "Lead Capture",
    tag: "Growth",
    icon: UserPlus,
    title: "Never Lose a Lead Again.",
    desc: "Collects names and numbers naturally inside the conversation and sends them wherever your team works.",
    points: [
      "Asks for contact details at the right moment",
      "Qualifies leads with your own questions",
      "Full transcripts with every lead",
    ],
    chat: [
      { from: "them", text: "Can someone call me about bulk orders?" },
      { from: "bot", text: "Absolutely — what's the best number to reach you?" },
    ],
  },
  {
    tab: "Multilingual",
    tag: "Languages",
    icon: Languages,
    title: "Speaks Your Customer's Language.",
    desc: "Detects the language automatically and answers in it — from the same English documents you already have.",
    points: [
      "20+ Indian languages out of the box",
      "Handles Hinglish and code-switching",
      "Same accuracy in every language",
    ],
    chat: [
      { from: "them", text: "क्या COD उपलब्ध है?" },
      { from: "bot", text: "हाँ! ₹5,000 तक के ऑर्डर पर COD उपलब्ध है 👍" },
    ],
  },
  {
    tab: "Insights",
    tag: "Analytics",
    icon: LineChart,
    title: "Learns What Customers Want.",
    desc: "Every conversation becomes data — what people ask, where your docs have gaps, what's driving tickets.",
    points: [
      "Top questions and trends each week",
      "Gaps in your knowledge base, flagged",
      "Full transcripts, searchable forever",
    ],
    chat: [
      { from: "them", text: "— This week —" },
      { from: "bot", text: "412 questions answered · 86% resolved without a human 📊" },
    ],
  },
];

export default function AgentsCarousel() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);

  const scrollToCard = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[i] as HTMLElement | undefined;
    if (card) track.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
  };

  const go = (i: number) => {
    const next = (i + agents.length) % agents.length;
    setActive(next);
    scrollToCard(next);
  };

  // Auto-rotate the cards; pause on hover.
  useEffect(() => {
    const id = setInterval(() => {
      if (!paused.current) {
        setActive((a) => {
          const next = (a + 1) % agents.length;
          scrollToCard(next);
          return next;
        });
      }
    }, 4600);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mkt-x py-20 md:py-24 px-5 sm:px-8" style={{ background: X.white }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHead
          pre="Meet Your"
          hl="24/7 AI Team"
          post="That Never Misses a Customer"
          sub="Day or night, your Osciva agents handle every question, lead and follow-up"
        />

        {/* Tabs */}
        <FadeIn delay={0.1}>
          <div
            className="mt-10 flex gap-1 overflow-x-auto justify-start lg:justify-center border-b pb-0"
            style={{ borderColor: X.border }}
          >
            {agents.map((a, i) => (
              <button
                key={a.tab}
                onClick={() => go(i)}
                className="relative px-4 py-3 text-[14.5px] font-medium whitespace-nowrap transition-colors"
                style={{ color: i === active ? X.coral : X.mute }}
              >
                {a.tab}
                {i === active && (
                  <span
                    className="absolute left-3 right-3 -bottom-px h-[2.5px] rounded-full"
                    style={{ background: X.coral }}
                  />
                )}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* Cards */}
        <div
          ref={trackRef}
          onMouseEnter={() => (paused.current = true)}
          onMouseLeave={() => (paused.current = false)}
          className="mt-8 flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {agents.map((a) => (
            <div
              key={a.tab}
              className="snap-start shrink-0 w-[88%] sm:w-[560px] border rounded-[16px] p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6"
              style={{ borderColor: X.border, background: X.white }}
            >
              {/* Visual */}
              <div
                className="rounded-[12px] p-4 flex flex-col justify-between min-h-[210px]"
                style={{ background: X.coral }}
              >
                <span className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(255,255,255,0.22)" }}>
                  <a.icon size={17} className="text-white" />
                </span>
                <div className="space-y-2">
                  {a.chat.map((m, j) => (
                    <div
                      key={j}
                      className="rounded-[10px] px-2.5 py-1.5 text-[11px] leading-snug max-w-[95%]"
                      style={
                        m.from === "them"
                          ? { background: "rgba(255,255,255,0.92)", color: X.ink }
                          : { background: "rgba(17,24,39,0.85)", color: "#fff", marginLeft: "auto" }
                      }
                    >
                      {m.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Copy */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: X.ink }}>
                  <HL>{a.tag}</HL> Agent
                </div>
                <h3 className="mt-3 text-[19px] font-bold" style={{ color: X.coral }}>
                  {a.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[21px]" style={{ color: X.sub }}>
                  {a.desc}
                </p>
                <ul className="mt-4 space-y-2">
                  {a.points.map((p) => (
                    <DiamondItem key={p}>
                      <span className="text-[13px]">{p}</span>
                    </DiamondItem>
                  ))}
                </ul>
                <div className="mt-5">
                  <CoralButton onClick={() => navigate("/auth")}>
                    Start Free Trial <ChevronRight size={15} className="inline -mt-0.5" />
                  </CoralButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[14px]" style={{ color: X.mute }}>
          <button onClick={() => go(active - 1)} aria-label="Previous agent" className="p-1.5" style={{ color: X.faint }}>
            <ChevronLeft size={18} />
          </button>
          Scroll to explore all agents
          <button onClick={() => go(active + 1)} aria-label="Next agent" className="p-1.5" style={{ color: X.faint }}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
