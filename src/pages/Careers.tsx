import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Lightbulb } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { X } from "@/components/landing/LandingNavbar";
import FooterSection from "@/components/landing/FooterSection";
import PageHero from "@/components/landing/PageHero";
import { FadeIn } from "@/components/landing/xui";
import ImageCycler, { imgFallback, type CycleImage } from "@/components/landing/ImageCycler";

// Indian-context professional imagery (Unsplash), each with a Picsum fallback.
const cycle: CycleImage[] = [
  { src: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=1100&q=80", seed: "osciva-in-1", alt: "Indian professionals collaborating in an office" },
  { src: "https://images.unsplash.com/photo-1776248783518-400b6d0da64c?auto=format&fit=crop&w=1100&q=80", seed: "osciva-in-2", alt: "Indian business team in a conference room" },
  { src: "https://images.unsplash.com/flagged/photo-1576485436509-a7d286952b65?auto=format&fit=crop&w=1100&q=80", seed: "osciva-in-3", alt: "Colleagues in a working meeting" },
];

const featureImg = {
  src: "https://images.unsplash.com/photo-1770626899426-baed57609a30?auto=format&fit=crop&w=900&q=80",
  seed: "osciva-in-4",
  alt: "A professional working at her desk",
};

const reasons = [
  { title: "Real ownership", desc: "Small team, big surface area. What you build reaches customers in days, not quarters." },
  { title: "Remote-first, India-wide", desc: "Work from anywhere in the country. We optimise for outcomes, not hours at a desk." },
  { title: "At the AI frontier", desc: "Spend your day applying the latest models to problems real businesses actually have." },
];

export default function Careers() {
  const navigate = useNavigate();

  return (
    <div className="mkt-x min-h-screen" style={{ background: X.white }}>
      <LandingNavbar />

      <PageHero
        breadcrumb="Careers"
        title="Build AI That Every Business Can"
        highlight="Actually Use"
        subtitle="We are a small, remote-first team in India shipping fast. If you like turning hard problems into simple products, you will feel at home here."
        primaryCta={null}
        secondaryCta={{ label: "About Osciva", to: "/about" }}
      />

      {/* Cycling team imagery */}
      <section className="px-5 sm:px-8 pb-4 md:pb-8" style={{ background: X.white }}>
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <ImageCycler images={cycle} />
          </FadeIn>
        </div>
      </section>

      {/* Why join, split with image */}
      <section className="py-14 md:py-20 px-5 sm:px-8" style={{ background: X.white }}>
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <FadeIn>
            <img
              src={featureImg.src}
              alt={featureImg.alt}
              loading="lazy"
              onError={(e) => imgFallback(e, featureImg.seed)}
              className="w-full h-[300px] md:h-[420px] object-cover"
              style={{ borderRadius: 16, border: `1px solid ${X.border}` }}
            />
          </FadeIn>
          <FadeIn delay={0.1}>
            <div>
              <h2 className="text-[28px] md:text-[36px] font-bold leading-tight" style={{ color: X.ink }}>
                A place to do your best work
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed max-w-md" style={{ color: X.sub }}>
                No layers, no busywork. Just a focused team building something people use every day.
              </p>
              <ul className="mt-7 space-y-5">
                {reasons.map((r) => (
                  <li key={r.title} className="flex items-start gap-3.5">
                    <span className="grid place-items-center w-6 h-6 rounded-full mt-0.5 shrink-0" style={{ background: X.coralSoft }}>
                      <Check size={14} style={{ color: X.coral }} />
                    </span>
                    <div>
                      <h3 className="text-[15px] font-bold" style={{ color: X.ink }}>{r.title}</h3>
                      <p className="text-[13.5px] leading-relaxed mt-0.5" style={{ color: X.sub }}>{r.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Open application, share your idea */}
      <section className="px-5 sm:px-8 pb-20 md:pb-24" style={{ background: X.white }}>
        <div className="max-w-[900px] mx-auto">
          <FadeIn>
            <div
              className="px-6 py-14 md:px-14 md:py-16 text-center"
              style={{ background: `linear-gradient(135deg, #f08a67 0%, ${X.coral} 50%, #e2603f 100%)`, borderRadius: 16 }}
            >
              <div className="w-12 h-12 rounded-[12px] flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(255,255,255,0.22)" }}>
                <Lightbulb size={22} className="text-white" />
              </div>
              <h2 className="text-[26px] md:text-[34px] font-bold text-white max-w-xl mx-auto">
                No open role? Pitch us your idea.
              </h2>
              <p className="mt-4 text-[15px] max-w-lg mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.9)" }}>
                We do not have positions posted right now, but we always make room for sharp, kind people. Tell us what you would want to build at Osciva and why.
              </p>
              <button
                onClick={() => navigate("/contact")}
                className="group mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-[15px] font-bold transition-opacity hover:opacity-90 text-white"
                style={{ background: X.inkSolid }}
              >
                Share your idea
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
