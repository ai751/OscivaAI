import { useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, SendHorizonal } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { X } from "@/components/landing/LandingNavbar";
import FooterSection from "@/components/landing/FooterSection";
import PageHero from "@/components/landing/PageHero";
import CTASection from "@/components/landing/CTASection";
import { SectionHead, FadeIn, DiamondItem } from "@/components/landing/xui";
import { getIndustry, type Industry } from "@/data/industries";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Widget-style preview of an industry conversation, built from the same
    visual language as the real embed widget. */
function ChatPreview({ industry }: { industry: Industry }) {
  return (
    <div
      className="w-full max-w-[420px] mx-auto overflow-hidden"
      style={{ background: X.white, borderRadius: 20, boxShadow: X.shadow1, border: `1px solid ${X.border}` }}
    >
      {/* Header */}
      <div className="px-5 py-4 flex items-center gap-3" style={{ background: X.coralGrad }}>
        <div className="w-9 h-9 rounded-full grid place-items-center shrink-0" style={{ background: "rgba(255,255,255,0.22)" }}>
          <industry.icon size={18} className="text-white" strokeWidth={1.8} />
        </div>
        <div>
          <div className="text-[14.5px] font-bold text-white leading-tight">{industry.chatAgentName}</div>
          <div className="text-[12px]" style={{ color: "rgba(255,255,255,0.85)" }}>Typically replies instantly</div>
        </div>
      </div>

      {/* Messages */}
      <div className="px-4 py-5 space-y-3" style={{ background: X.cream }}>
        {industry.chat.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.45, delay: i * 0.18, ease: EASE }}
            className={`flex ${m.from === "visitor" ? "justify-end" : "justify-start"}`}
          >
            <div
              className="max-w-[85%] px-4 py-2.5 text-[13.5px] leading-[20px]"
              style={
                m.from === "visitor"
                  ? { background: X.coralGrad, color: "#fff", borderRadius: "16px 16px 4px 16px" }
                  : { background: X.white, color: X.ink, borderRadius: "16px 16px 16px 4px", boxShadow: X.shadow3 }
              }
            >
              {m.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input bar (preview only) */}
      <div className="px-4 py-3 flex items-center gap-2 border-t" style={{ background: X.white, borderColor: X.border }}>
        <div
          className="flex-1 px-4 py-2.5 text-[13px] rounded-full"
          style={{ background: X.surface, color: X.faint }}
        >
          Ask anything...
        </div>
        <div className="w-9 h-9 rounded-full grid place-items-center shrink-0" style={{ background: X.coralGrad }}>
          <SendHorizonal size={15} className="text-white" />
        </div>
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: X.white, borderRadius: 14, boxShadow: X.shadow3 }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-[15px] font-bold" style={{ color: X.ink }}>{q}</span>
        <ChevronDown
          size={18}
          className="shrink-0 transition-transform duration-300"
          style={{ color: X.coral, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <p className="px-6 pb-5 -mt-1 text-[14px] leading-[23px]" style={{ color: X.sub }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function SolutionPage() {
  const { slug } = useParams();
  const industry = getIndustry(slug);

  if (!industry) return <Navigate to="/features" replace />;

  return (
    <div className="mkt-x min-h-screen" style={{ background: X.white }} key={industry.slug}>
      <LandingNavbar />

      <PageHero
        breadcrumb={`Solutions / ${industry.name}`}
        title={industry.hero.title}
        highlight={industry.hero.highlight}
        subtitle={industry.hero.subtitle}
        secondaryCta={{ label: "View pricing", to: "/pricing" }}
      />

      {/* Pain points */}
      <section className="py-16 md:py-20 px-5 sm:px-8" style={{ background: X.cream }}>
        <div className="max-w-[1280px] mx-auto">
          <SectionHead pre="Does This Sound" hl="Familiar?" />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {industry.pains.map((p, i) => (
              <FadeIn key={p.title} delay={i * 0.08}>
                <div className="h-full p-7" style={{ background: X.white, borderRadius: 16, boxShadow: X.shadow3 }}>
                  <h3 className="text-[16px] font-bold mb-2.5" style={{ color: X.ink }}>{p.title}</h3>
                  <p className="text-[14px] leading-[22px]" style={{ color: X.sub }}>{p.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* What the agent handles */}
      <section className="py-20 md:py-24 px-5 sm:px-8" style={{ background: X.white }}>
        <div className="max-w-[1280px] mx-auto">
          <SectionHead
            pre="What Your Agent"
            hl="Handles For You"
            sub="Trained on your own content, it takes these questions off your team's plate"
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {industry.handles.map((u, i) => (
              <FadeIn key={u.title} delay={(i % 3) * 0.08}>
                <div
                  className="h-full p-6 transition-all duration-300 hover:-translate-y-1"
                  style={{ background: i % 2 === 0 ? X.coralSoft : X.lavender, borderRadius: 16 }}
                >
                  <u.icon size={26} strokeWidth={1.7} style={{ color: X.ink }} />
                  <h3 className="mt-4 text-[15.5px] font-bold mb-1.5" style={{ color: X.ink }}>{u.title}</h3>
                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: X.sub }}>{u.desc}</p>
                  <div className="text-[12.5px] rounded-[8px] px-3 py-2 italic" style={{ background: X.white, color: X.sub }}>
                    {u.ex}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Conversation preview: copy left, widget right */}
      <section className="py-20 md:py-24 px-5 sm:px-8" style={{ background: X.lavender }}>
        <div className="max-w-[1180px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <FadeIn>
            <div>
              <h2 className="text-[28px] md:text-[34px] font-bold leading-[1.2] tracking-[-0.01em]" style={{ color: X.ink }}>
                {industry.chatTitle}
              </h2>
              <p className="mt-4 text-[15px] leading-[24px] max-w-md" style={{ color: X.sub }}>
                This is what visitors experience on your site: specific answers from your
                own content, in a widget that carries your brand.
              </p>
              <ul className="mt-7 space-y-3.5">
                {industry.chatPoints.map((p) => (
                  <DiamondItem key={p}>{p}</DiamondItem>
                ))}
              </ul>
            </div>
          </FadeIn>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <ChatPreview industry={industry} />
          </motion.div>
        </div>
      </section>

      {/* Industry FAQ */}
      <section className="py-20 md:py-24 px-5 sm:px-8" style={{ background: X.cream }}>
        <div className="max-w-[860px] mx-auto">
          <SectionHead pre="Common Questions From" hl={industry.name} />
          <div className="mt-10 space-y-4">
            {industry.faqs.map((f, i) => (
              <FadeIn key={f.q} delay={i * 0.06}>
                <FAQItem q={f.q} a={f.a} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <FooterSection />
    </div>
  );
}
