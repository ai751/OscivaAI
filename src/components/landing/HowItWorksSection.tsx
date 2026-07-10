import { motion } from "framer-motion";
import { DashboardMockup, WizardMockup, WidgetMockup } from "./UIMockups";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn } from "./xui";

const EASE = [0.22, 1, 0.36, 1] as const;

const steps = [
  {
    num: "01",
    title: "Configure your assistant",
    desc: "Use the point-and-click wizard to name your AI, set its personality, pick a model, and describe what it should do, all in plain English.",
    Mockup: WizardMockup,
  },
  {
    num: "02",
    title: "Upload your business data",
    desc: "Add PDFs, documents, your website URL and FAQs. Osciva indexes everything so the assistant answers like an employee who actually works at your company.",
    Mockup: DashboardMockup,
  },
  {
    num: "03",
    title: "Embed anywhere in one click",
    desc: "Copy a single snippet, or use the WordPress, React and Shopify integrations, and your assistant is live, helping customers 24/7.",
    Mockup: WidgetMockup,
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mkt-x py-20 md:py-24 px-5 sm:px-8" style={{ background: X.white }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHead
          pre="From Idea to Live AI in"
          hl="Three Steps"
          sub="No coding. No glue work. Designed for non-technical founders and teams."
        />

        <div className="mt-14 space-y-6 lg:space-y-8">
          {steps.map((s, i) => {
            const flip = i % 2 === 1;
            return (
              <FadeIn key={s.num}>
                <div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center p-6 md:p-10"
                  style={{ background: i % 2 === 0 ? X.coralSoft : X.lavender, borderRadius: 16 }}
                >
                  <div className={flip ? "lg:order-2" : ""}>
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className="inline-flex items-center justify-center h-9 px-3.5 rounded-full text-white text-[12px] font-bold tracking-wide"
                        style={{ background: X.coralGrad }}
                      >
                        STEP {s.num}
                      </span>
                      <span className="h-px flex-1" style={{ background: "rgba(17,24,39,0.1)" }} />
                    </div>
                    <h3 className="text-[22px] md:text-[28px] font-bold mb-3" style={{ color: X.ink }}>
                      {s.title}
                    </h3>
                    <p className="text-[14.5px] leading-relaxed max-w-md" style={{ color: X.sub }}>
                      {s.desc}
                    </p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, ease: EASE }}
                    className={flip ? "lg:order-1" : ""}
                  >
                    <s.Mockup />
                  </motion.div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
