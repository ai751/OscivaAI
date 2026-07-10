import { useEffect, useState } from "react";
import { Upload, Wand2, Code2, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn } from "./xui";

const steps = [
  {
    icon: Upload,
    time: "Minute 0-10",
    title: "Upload your knowledge",
    desc: "Drop in PDFs, docs and your website URL. Osciva reads and indexes everything automatically.",
  },
  {
    icon: Wand2,
    time: "Minute 10-20",
    title: "Shape your agent",
    desc: "Pick the tone, greeting, languages and brand colors in a point-and-click editor. Preview it live.",
  },
  {
    icon: Code2,
    time: "Minute 20-30",
    title: "Embed with one line",
    desc: "Paste a single script tag, or one-click install on WordPress and Shopify. That's the whole job.",
  },
  {
    icon: Rocket,
    time: "Minute 30 →",
    title: "It starts answering",
    desc: "Your agent handles real customers while you watch every conversation in the dashboard.",
  },
];

export default function HomeHowItWorks() {
  /* Spotlight sweeps across the step icons, lighting each one up in turn. */
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % steps.length), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="mkt-x py-20 md:py-24 px-5 sm:px-8" style={{ background: X.cream }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHead
          pre="Go"
          hl="Live in 30 Minutes,"
          post="Not 30 Days"
          sub="From signup to your first answered customer, here's the whole journey"
        />

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
          {/* Connector line (desktop) */}
          <div
            aria-hidden
            className="hidden lg:block absolute top-[44px] left-[12%] right-[12%] border-t-2 border-dashed"
            style={{ borderColor: "#f3c5b5" }}
          />
          {steps.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.1}>
              <div className="relative flex flex-col items-center text-center px-4">
                <motion.span
                  animate={{ scale: active === i ? 1.08 : 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative z-10 w-[88px] h-[88px] rounded-full grid place-items-center border-4"
                  style={{
                    background: active === i ? X.coralGrad : X.white,
                    borderColor: X.coralSoft,
                    boxShadow:
                      active === i
                        ? "0 0 0 7px rgba(239,120,91,0.16), 0 12px 28px rgba(239,120,91,0.38)"
                        : X.shadow3,
                    transition: "background 0.35s ease, box-shadow 0.35s ease",
                  }}
                >
                  <s.icon
                    size={30}
                    strokeWidth={1.7}
                    style={{ color: active === i ? "#ffffff" : X.coral, transition: "color 0.35s ease" }}
                  />
                </motion.span>
                <span
                  className="mt-5 text-[11px] font-bold uppercase tracking-[0.1em] px-2.5 py-1 rounded-full"
                  style={{ background: X.coralSoft, color: X.coralDark }}
                >
                  {s.time}
                </span>
                <h3 className="mt-3 text-[17px] font-bold" style={{ color: X.ink }}>
                  {s.title}
                </h3>
                <p className="mt-2 text-[13.5px] leading-[21px] max-w-[260px]" style={{ color: X.sub }}>
                  {s.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.3}>
          <div className="mt-12 flex justify-center">
            <Link
              to="/features"
              className="inline-flex items-center gap-1.5 text-[15px] font-bold transition-colors"
              style={{ color: X.coral }}
            >
              See the full walkthrough <ChevronRight size={16} />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
