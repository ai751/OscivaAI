import { useNavigate } from "react-router-dom";
import { Check, Play, Send } from "lucide-react";
import { X } from "./LandingNavbar";
import { FadeIn } from "./xui";

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section className="mkt-x px-5 sm:px-8 py-16 md:py-20" style={{ background: X.white }}>
      <div className="max-w-[1280px] mx-auto">
        <FadeIn>
          <div
            className="relative overflow-hidden rounded-[16px] px-7 sm:px-12 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center"
            style={{ background: X.inkSolid }}
          >
            {/* Soft coral glow, echoing the dashboard welcome banner */}
            <div
              aria-hidden
              className="absolute -top-24 -right-16 w-[380px] h-[380px] rounded-full"
              style={{ background: "rgba(239,120,91,0.25)", filter: "blur(90px)" }}
            />
            <div
              aria-hidden
              className="absolute -bottom-32 -left-20 w-[300px] h-[300px] rounded-full"
              style={{ background: "rgba(239,120,91,0.12)", filter: "blur(80px)" }}
            />

            {/* Copy */}
            <div className="relative">
              <h2 className="text-[30px] md:text-[40px] font-bold text-white tracking-[-0.01em] leading-[1.15]">
                Your AI agent is ready.
                <br />
                <span style={{ color: X.coral }}>Your customers are waiting.</span>
              </h2>
              <p className="mt-4 text-[16px] md:text-[17px] max-w-[480px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                Upload your docs, brand the widget, paste one snippet, and every
                question gets answered from tonight onwards.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  onClick={() => navigate("/auth")}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full text-[15px] font-bold text-white transition-colors"
                  style={{ background: X.coralGrad, boxShadow: X.btnShadow }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = X.coralGradHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = X.coralGrad)}
                >
                  Start Free Trial
                </button>
                <button
                  onClick={() => navigate("/features")}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-[15px] font-medium text-white border transition-colors"
                  style={{ borderColor: "rgba(255,255,255,0.35)", background: "transparent" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <Play size={12} style={{ fill: "#fff" }} />
                  Watch Overview
                </button>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13.5px]" style={{ color: "rgba(255,255,255,0.65)" }}>
                {["No credit card required", "50 free messages/mo", "Cancel anytime"].map((t, i) => (
                  <span key={t} className="inline-flex items-center gap-4">
                    {i > 0 && <span style={{ color: "rgba(255,255,255,0.25)" }}>|</span>}
                    <span className="inline-flex items-center gap-1.5">
                      <Check size={14} style={{ color: X.green }} /> {t}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Product visual: the widget your customers will see */}
            <div className="relative hidden lg:block">
              <div
                className="w-[340px] ml-auto rounded-[16px] overflow-hidden"
                style={{ background: X.white, boxShadow: "0 24px 60px rgba(0,0,0,0.45)" }}
              >
                <div className="flex items-center gap-2.5 px-4 py-3" style={{ background: "#1b2130" }}>
                  <img src="https://osciva.io/images/osciva-web.png" alt="Osciva" className="w-7 h-7 rounded-full" />
                  <div>
                    <div className="text-[12.5px] font-bold text-white leading-tight">Your assistant</div>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/55">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: X.green }} />
                      Live on your website
                    </div>
                  </div>
                </div>
                <div className="px-3.5 py-4 space-y-2" style={{ background: "#f3f4f6" }}>
                  <div
                    className="rounded-[12px] rounded-bl-[4px] px-3 py-2 text-[12.5px] leading-relaxed border w-fit max-w-[85%]"
                    style={{ background: "#ffffff", borderColor: "#e5e7eb", color: "#111827" }}
                  >
                    Hi! I'm trained on your business. Try me.
                  </div>
                  <div
                    className="ml-auto rounded-[12px] rounded-br-[4px] px-3 py-2 text-[12.5px] leading-relaxed text-white w-fit max-w-[85%]"
                    style={{ background: X.coral }}
                  >
                    What are your store hours?
                  </div>
                  <div
                    className="rounded-[12px] rounded-bl-[4px] px-3 py-2 text-[12.5px] leading-relaxed border w-fit max-w-[85%]"
                    style={{ background: "#ffffff", borderColor: "#e5e7eb", color: "#111827" }}
                  >
                    Mon-Sat, 10 am to 9 pm. Open till 11 pm during festivals
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 border-t" style={{ borderColor: "#e5e7eb", background: "#ffffff" }}>
                  <span className="flex-1 text-[12px]" style={{ color: "#6b7280" }}>Type a message…</span>
                  <span className="w-7 h-7 rounded-full grid place-items-center" style={{ background: X.coral }}>
                    <Send size={12} className="text-white" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
