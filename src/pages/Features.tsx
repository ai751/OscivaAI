import { motion } from "framer-motion";
import { Lock, Server, FileCheck2, KeyRound } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { X } from "@/components/landing/LandingNavbar";
import FooterSection from "@/components/landing/FooterSection";
import PageHero from "@/components/landing/PageHero";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import IndustriesSection from "@/components/landing/IndustriesSection";
import OldWayCompare from "@/components/landing/OldWayCompare";
import CTASection from "@/components/landing/CTASection";
import { SectionHead, FadeIn, DiamondItem, HL } from "@/components/landing/xui";
import { WizardMockup, DashboardMockup, WidgetMockup } from "@/components/landing/UIMockups";

const EASE = [0.22, 1, 0.36, 1] as const;

const deepDive = [
  {
    tag: "Knowledge",
    title: "Answers grounded in your real content",
    desc: "Upload PDFs, docs, spreadsheets, your website URL and FAQs. Osciva chunks and embeds everything into a private vector index, so every reply is retrieved from your data, never hallucinated.",
    points: ["PDF, DOCX, CSV, URL & raw text", "Automatic re-indexing on update", "Per-agent isolated knowledge base"],
    Mockup: WizardMockup,
  },
  {
    tag: "Insight",
    title: "See exactly how your AI performs",
    desc: "Every conversation is logged with full transcripts. Track message volume, top questions and resolution rate from a clean dashboard, no Google Analytics setup, no spreadsheets.",
    points: ["Live conversation transcripts", "Top questions & resolution rate", "Per-agent usage breakdown"],
    Mockup: DashboardMockup,
  },
  {
    tag: "Deploy",
    title: "Live on any site in one snippet",
    desc: "Copy one line of code, or use the WordPress, Shopify and React integrations. The widget is fully themable to your brand and streams replies token-by-token like a human typing.",
    points: ["One-line embed, any framework", "Brand colors, logo & welcome message", "Streaming replies in real time"],
    Mockup: WidgetMockup,
  },
];

const security = [
  { icon: Lock, title: "Encrypted everywhere", desc: "TLS in transit and encryption at rest for all data and knowledge bases." },
  { icon: Server, title: "Hosted in India", desc: "Your data stays on Indian infrastructure to meet local residency needs." },
  { icon: FileCheck2, title: "DPDP ready", desc: "Controls and data handling aligned with India's DPDP Act." },
  { icon: KeyRound, title: "Bring your own key", desc: "Use your own LLM provider key, it's stored server-side, never exposed to visitors." },
];

export default function FeaturesPage() {
  return (
    <div className="mkt-x min-h-screen" style={{ background: X.white }}>
      <LandingNavbar />

      <PageHero
        breadcrumb="Features"
        title="Everything You Need to Ship a"
        highlight="Production AI Agent"
        subtitle="From private knowledge bases to live analytics and one-line embedding, Osciva covers the whole journey, without a single line of glue code."
        secondaryCta={{ label: "View pricing", to: "/pricing" }}
      />

      {/* 3-step process (merged in from the retired How-it-works page) */}
      <HowItWorksSection />

      {/* Deep-dive alternating rows */}
      <section className="py-12 md:py-16 px-5 sm:px-8" style={{ background: X.white }}>
        <div className="max-w-[1280px] mx-auto space-y-16 md:space-y-24">
          {deepDive.map((d, i) => {
            const flip = i % 2 === 1;
            return (
              <div key={d.title} className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <FadeIn className={flip ? "lg:order-2" : ""}>
                  <div>
                    <div className="mb-4 text-[13px] font-medium" style={{ color: X.ink }}>
                      <HL>{d.tag}</HL>
                    </div>
                    <h3 className="text-[26px] md:text-[32px] font-bold leading-tight" style={{ color: X.ink }}>
                      {d.title}
                    </h3>
                    <p className="mt-4 text-[15px] leading-[24px] max-w-md" style={{ color: X.sub }}>
                      {d.desc}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {d.points.map((p) => (
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
                  className={flip ? "lg:order-1" : ""}
                >
                  <d.Mockup />
                </motion.div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Full capability grid + integrations */}
      <FeaturesSection />

      {/* Industry solutions */}
      <IndustriesSection />

      {/* Security band */}
      <section className="py-20 md:py-24 px-5 sm:px-8" style={{ background: X.cream }}>
        <div className="max-w-[1280px] mx-auto">
          <SectionHead
            pre="Enterprise-Grade"
            hl="By Default"
            sub="The controls serious businesses expect, without an enterprise contract"
          />
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {security.map((s, i) => (
              <FadeIn key={s.title} delay={i * 0.08}>
                <div className="h-full p-6" style={{ background: X.white, borderRadius: 16, boxShadow: X.shadow3 }}>
                  <div className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-4" style={{ background: X.coralSoft }}>
                    <s.icon size={19} style={{ color: X.coral }} />
                  </div>
                  <h3 className="text-[15px] font-bold mb-2" style={{ color: X.ink }}>{s.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: X.sub }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <OldWayCompare />

      <CTASection />
      <FooterSection />
    </div>
  );
}
