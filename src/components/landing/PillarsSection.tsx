import { BrainCircuit, MessagesSquare, LayoutDashboard, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn, DiamondItem } from "./xui";

const pillars = [
  {
    icon: BrainCircuit,
    name: "The Brain",
    bg: X.coralSoft,
    points: [
      "Reads and remembers everything you upload",
      "Re-syncs your website and docs automatically",
      "Grounded answers only, no making things up",
    ],
  },
  {
    icon: MessagesSquare,
    name: "The Agent",
    bg: X.lavender,
    points: [
      "Chats with customers 24/7 in 20+ languages",
      "Answers in seconds with source citations",
      "Escalates to your team when it should",
    ],
  },
  {
    icon: LayoutDashboard,
    name: "The Dashboard",
    bg: X.coralSoft,
    points: [
      "Every conversation, searchable in one inbox",
      "Weekly insights on what customers ask",
      "Gaps in your knowledge base, flagged for you",
    ],
  },
];

export default function PillarsSection() {
  const navigate = useNavigate();
  return (
    <section className="mkt-x py-20 md:py-24 px-5 sm:px-8" style={{ background: X.white }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHead
          pre="One Platform That"
          hl="Learns, Chats, and Reports"
          sub="Three parts working together, so support runs itself"
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1080px] mx-auto">
          {pillars.map((p, i) => (
            <FadeIn key={p.name} delay={i * 0.1}>
              <div
                className="h-full flex flex-col px-7 pt-14 pb-6"
                style={{
                  background: `linear-gradient(180deg, ${p.bg} 0%, #fafafa 100%)`,
                  borderRadius: "160px 160px 16px 16px",
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="w-24 h-24 rounded-full grid place-items-center" style={{ background: X.white, boxShadow: X.shadow3 }}>
                    <p.icon size={38} strokeWidth={1.5} style={{ color: X.coral }} />
                  </span>
                  <h3 className="mt-6 text-[20px] font-bold" style={{ color: X.ink }}>
                    {p.name}
                  </h3>
                </div>
                <ul className="mt-6 space-y-3 flex-1">
                  {p.points.map((pt) => (
                    <DiamondItem key={pt}>
                      <span className="text-[13.5px]">{pt}</span>
                    </DiamondItem>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/auth")}
                  className="mt-8 pt-4 border-t w-full text-center text-[14px] font-bold inline-flex items-center justify-center gap-1 transition-colors"
                  style={{ borderColor: "rgba(17,24,39,0.08)", color: X.ink }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = X.coral)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = X.ink)}
                >
                  Start Free Trial <ChevronRight size={15} />
                </button>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
