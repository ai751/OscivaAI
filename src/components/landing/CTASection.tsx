import { useNavigate } from "react-router-dom";
import { Check, Play } from "lucide-react";
import { X } from "./LandingNavbar";
import { FadeIn } from "./xui";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="mkt-x px-5 sm:px-8 py-16 md:py-20" style={{ background: X.white }}>
      <div className="max-w-[1280px] mx-auto">
        <FadeIn>
          <div
            className="rounded-[16px] px-6 py-16 md:py-20 text-center"
            style={{ background: `linear-gradient(135deg, #f08a67 0%, ${X.coral} 45%, #e2603f 100%)` }}
          >
            <h2 className="text-[32px] md:text-[44px] font-bold text-white tracking-[-0.01em]">
              Your AI Agent is Ready. Are You?
            </h2>
            <p className="mt-4 text-[16px] md:text-[17px]" style={{ color: "rgba(255,255,255,0.9)" }}>
              Get live in 30 minutes. Answer customers forever.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate("/auth")}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-[15px] font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: X.inkSolid }}
              >
                Start Free Trial
              </button>
              <button
                onClick={() => navigate("/how-it-works")}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-[15px] font-bold text-white border transition-colors"
                style={{ borderColor: "rgba(255,255,255,0.7)", background: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Play size={12} style={{ fill: "#fff" }} />
                Watch Overview
              </button>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13.5px]" style={{ color: "rgba(255,255,255,0.9)" }}>
              {["No credit card required", "50 free credits", "Cancel anytime"].map((t, i) => (
                <span key={t} className="inline-flex items-center gap-4">
                  {i > 0 && <span style={{ color: "rgba(255,255,255,0.45)" }}>|</span>}
                  <span className="inline-flex items-center gap-1.5">
                    <Check size={14} /> {t}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
