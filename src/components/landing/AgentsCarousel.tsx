import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn, DiamondItem, CoralButton, HL } from "./xui";

const agents = [
  {
    tab: "Customer Support",
    tag: "Support",
    title: "Answers Instantly. Never Sleeps.",
    desc: "Handles order status, policies, troubleshooting and everything in your docs, so your team stops repeating themselves.",
    points: [
      "Replies in under 2 seconds, day or night",
      "Cites the exact document behind every answer",
      "Hands off to a human when it's unsure",
    ],
    chat: [
      { from: "them", text: "Where is my order #4218?" },
      { from: "bot", text: "It's out for delivery, arriving today by 8 pm" },
      { from: "them", text: "Can I change the delivery address?" },
      { from: "bot", text: "It's already with the courier, so not for today. I can have it held for pickup instead. Want that?" },
      { from: "them", text: "No, today works. Thanks!" },
      { from: "bot", text: "You're welcome! Sending your live tracking link now." },
    ],
  },
  {
    tab: "Sales Assistant",
    tag: "Sales",
    title: "Turns Visitors Into Buyers.",
    desc: "Recommends products, explains pricing and nudges hesitant visitors, right when they're deciding.",
    points: [
      "Answers pricing & comparison questions",
      "Suggests the right plan or product",
      "Captures leads before they bounce",
    ],
    chat: [
      { from: "them", text: "Which plan is right for a small clinic?" },
      { from: "bot", text: "Starter fits you: 3 agents at ₹999/mo. Want a breakdown?" },
      { from: "them", text: "Does it include Hindi support?" },
      { from: "bot", text: "Yes, every plan speaks 20+ Indian languages at no extra cost." },
      { from: "them", text: "Nice. How do I get started?" },
      { from: "bot", text: "Sign up free, no card needed. Your clinic can be live tonight." },
    ],
  },
  {
    tab: "FAQ Agent",
    tag: "Knowledge",
    title: "Your FAQ Page, But Alive.",
    desc: "Every policy, price list and how-to you've ever written becomes a conversation instead of a wall of text.",
    points: [
      "Trained on PDFs, docs and your website",
      "Re-syncs automatically when content changes",
      "No more 'did you check the FAQ?'",
    ],
    chat: [
      { from: "them", text: "What's your return policy?" },
      { from: "bot", text: "7-day no-questions returns. Refunds in 3 to 5 days" },
      { from: "them", text: "Do I need the original box?" },
      { from: "bot", text: "Just the tags. The box helps but isn't required." },
      { from: "them", text: "Who pays for return shipping?" },
      { from: "bot", text: "We do. Pickup is free from your address." },
    ],
  },
  {
    tab: "Lead Capture",
    tag: "Growth",
    title: "Never Lose a Lead Again.",
    desc: "Collects names and numbers naturally inside the conversation and sends them wherever your team works.",
    points: [
      "Asks for contact details at the right moment",
      "Qualifies leads with your own questions",
      "Full transcripts with every lead",
    ],
    chat: [
      { from: "them", text: "Can someone call me about bulk orders?" },
      { from: "bot", text: "Absolutely! What's the best number to reach you?" },
      { from: "them", text: "98860 44321. I'm Priya from Nashik." },
      { from: "bot", text: "Thanks Priya! Roughly how many units per month?" },
      { from: "them", text: "Around 500 to start." },
      { from: "bot", text: "Perfect. Our sales team will call you before 6 pm today" },
    ],
  },
  {
    tab: "Multilingual",
    tag: "Languages",
    title: "Speaks Your Customer's Language.",
    desc: "Detects the language automatically and answers in it, from the same English documents you already have.",
    points: [
      "20+ Indian languages out of the box",
      "Handles Hinglish and code-switching",
      "Same accuracy in every language",
    ],
    chat: [
      { from: "them", text: "क्या COD उपलब्ध है?" },
      { from: "bot", text: "हाँ! ₹5,000 तक के ऑर्डर पर COD उपलब्ध है" },
      { from: "them", text: "डिलीवरी में कितने दिन लगेंगे?" },
      { from: "bot", text: "आपके पिनकोड पर 2 से 3 दिन में डिलीवरी हो जाती है।" },
      { from: "them", text: "बहुत बढ़िया, धन्यवाद!" },
      { from: "bot", text: "स्वागत है! और कोई सवाल हो तो पूछिए" },
    ],
  },
  {
    tab: "Insights",
    tag: "Analytics",
    title: "Learns What Customers Want.",
    desc: "Every conversation becomes data, what people ask, where your docs have gaps, what's driving tickets.",
    points: [
      "Top questions and trends each week",
      "Gaps in your knowledge base, flagged",
      "Full transcripts, searchable forever",
    ],
    chat: [
      { from: "them", text: "What did customers ask most this week?" },
      { from: "bot", text: "Delivery time was #1 with 132 questions, then returns." },
      { from: "them", text: "Anything we should fix?" },
      { from: "bot", text: "Your kidswear size guide is missing. 28 shoppers asked for it." },
      { from: "them", text: "And the resolution rate?" },
      { from: "bot", text: "86% resolved without a human, up from 79% last week" },
    ],
  },
];

type ChatEvent = { type: "typing" } | { type: "msg"; from: string; text: string };

/* A compact chat widget that plays the WHOLE conversation in a loop: each
   visitor message slides in, the agent "types" and replies, and older messages
   push up out of view like a real live chat. Holds at the end, then restarts. */
function MiniChat({ tag, chat }: { tag: string; chat: { from: string; text: string }[] }) {
  // Playback timeline: a typing beat before every agent reply.
  const events = useMemo(() => {
    const ev: ChatEvent[] = [];
    chat.forEach((m) => {
      if (m.from === "bot") ev.push({ type: "typing" });
      ev.push({ type: "msg", from: m.from, text: m.text });
    });
    return ev;
  }, [chat]);

  const [count, setCount] = useState(1); // how many timeline events are on screen

  useEffect(() => {
    const atEnd = count >= events.length;
    const last = events[count - 1];
    const hold = atEnd ? 4200 : last.type === "typing" ? 950 : 1250;
    const id = window.setTimeout(() => setCount(atEnd ? 1 : count + 1), hold);
    return () => clearTimeout(id);
  }, [count, events]);

  const visible = events.slice(0, count);

  return (
    <div
      className="rounded-[12px] border flex flex-col overflow-hidden h-[290px]"
      style={{ background: X.white, borderColor: X.border }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: X.inkSolid }}>
        <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="w-6 h-6 rounded-full shrink-0" />
        <div className="min-w-0">
          <div className="text-[10.5px] font-bold text-white leading-tight truncate">{tag} agent</div>
          <div className="flex items-center gap-1 text-[8.5px] text-white/55">
            <span className="w-1 h-1 rounded-full" style={{ background: X.green }} />
            Online
          </div>
        </div>
      </div>

      {/* Conversation: newest at the bottom, older messages clip out the top */}
      <div className="flex-1 flex flex-col justify-end gap-1.5 px-2.5 py-2.5 overflow-hidden" style={{ background: X.surface }}>
        {visible.map((ev, i) => {
          if (ev.type === "typing") {
            // A typing beat only shows while it's the latest event; once the
            // reply lands it disappears.
            if (i !== visible.length - 1) return null;
            return (
              <motion.div
                key={`typing-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 rounded-[10px] rounded-bl-[3px] px-2.5 py-2 border w-fit"
                style={{ background: X.white, borderColor: X.border }}
              >
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    className="w-1 h-1 rounded-full"
                    style={{ background: X.faint }}
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
                  />
                ))}
              </motion.div>
            );
          }
          return ev.from === "them" ? (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="ml-auto max-w-[92%] rounded-[10px] rounded-br-[3px] px-2.5 py-1.5 text-[11px] leading-snug text-white w-fit"
              style={{ background: X.inkSolid }}
            >
              {ev.text}
            </motion.div>
          ) : (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="max-w-[92%] rounded-[10px] rounded-bl-[3px] px-2.5 py-1.5 text-[11px] leading-snug border w-fit"
              style={{ background: X.white, borderColor: X.border, color: X.ink }}
            >
              {ev.text}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

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
              {/* Visual: the agent live in a chat, looping */}
              <MiniChat tag={a.tag} chat={a.chat} />

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
