import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn } from "./xui";
import { industries } from "@/data/industries";

const tints = [X.coralSoft, X.lavender, X.lavender, X.coralSoft];

/** Clickable industry cards: each opens the dedicated /solutions/:slug page. */
export default function IndustriesSection() {
  const navigate = useNavigate();

  return (
    <section className="mkt-x py-20 md:py-24 px-5 sm:px-8" style={{ background: X.white }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHead
          pre="Built for"
          hl="Your Industry"
          sub="One platform, tuned to the questions your customers actually ask. Pick yours."
        />
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {industries.map((ind, i) => (
            <FadeIn key={ind.slug} delay={i * 0.08}>
              <button
                onClick={() => navigate(`/solutions/${ind.slug}`)}
                className="group w-full h-full p-7 text-left transition-all duration-300 hover:-translate-y-1.5"
                style={{ background: tints[i % tints.length], borderRadius: 16 }}
              >
                <div
                  className="w-12 h-12 rounded-[12px] grid place-items-center mb-5"
                  style={{ background: X.white, boxShadow: X.shadow3 }}
                >
                  <ind.icon size={23} strokeWidth={1.7} style={{ color: X.coral }} />
                </div>
                <h3 className="text-[17px] font-bold mb-2" style={{ color: X.ink }}>{ind.name}</h3>
                <p className="text-[13.5px] leading-[21px] mb-5" style={{ color: X.sub }}>
                  {ind.shortDesc}
                </p>
                <span
                  className="inline-flex items-center gap-1.5 text-[14px] font-bold transition-all duration-300 group-hover:gap-2.5"
                  style={{ color: X.coral }}
                >
                  See how it fits <ArrowRight size={15} />
                </span>
              </button>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
