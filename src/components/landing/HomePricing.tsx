import { useNavigate, Link } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn } from "./xui";

const tiers = [
  {
    name: "Free",
    price: "₹0",
    per: "forever",
    note: "Your first agent, on us",
    plusLabel: "",
    features: [
      { t: "1 agent, live in 30 minutes", hot: false },
      { t: "50 messages/mo, no API key needed", hot: true },
      { t: "Train it with your documents", hot: false },
      { t: "Embed anywhere with one snippet", hot: false },
    ],
    popular: false,
  },
  {
    name: "Starter",
    price: "₹999",
    per: "/month",
    note: "For small businesses",
    plusLabel: "Everything in Free, plus:",
    features: [
      { t: "2 agents", hot: false },
      { t: "UNLIMITED messages, your API key", hot: true },
      { t: "5 MB docs + website indexing", hot: false },
      { t: "White-label, no Osciva branding", hot: false },
    ],
    popular: false,
  },
  {
    name: "Growth",
    price: "₹2,499",
    per: "/month",
    note: "For growing teams",
    plusLabel: "Everything in Starter, plus:",
    features: [
      { t: "5 agents, support, sales & more", hot: false },
      { t: "ALL premium models, GPT-4o, Claude", hot: true },
      { t: "2× knowledge + custom rate limits", hot: false },
      { t: "Priority support", hot: false },
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    per: "",
    note: "For serious volume",
    plusLabel: "Everything in Growth, plus:",
    features: [
      { t: "As many agents as you need", hot: true },
      { t: "Custom knowledge scale", hot: false },
      { t: "SLA & dedicated support", hot: false },
      { t: "Custom integrations", hot: false },
    ],
    popular: false,
  },
];

export default function HomePricing() {
  const navigate = useNavigate();
  return (
    <section className="mkt-x py-20 md:py-24 px-5 sm:px-8" style={{ background: X.white }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHead
          hl="Simple Pricing."
          post="Zero Surprises."
          sub="Start free, your first agent answers on us. Upgrade for unlimited messages with your own API key."
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((t, i) => (
            <FadeIn key={t.name} delay={i * 0.07}>
              <div
                className="relative h-full flex flex-col border-[1.5px] rounded-[12px] p-6"
                style={{
                  borderColor: X.coral,
                  background: t.popular ? X.coralSoft : X.white,
                }}
              >
                {t.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold px-3 py-1 rounded-full text-white"
                    style={{ background: X.coral }}
                  >
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-[17px] font-bold text-center" style={{ color: X.ink }}>
                  {t.name}
                </h3>
                <div className="mt-3 text-center">
                  <span className="text-[32px] font-bold" style={{ color: X.ink }}>
                    {t.price}
                  </span>
                  {t.per && (
                    <span className="text-[13px] ml-1" style={{ color: X.faint }}>
                      {t.per}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-[12.5px] text-center" style={{ color: X.mute }}>
                  {t.note}
                </p>
                {t.plusLabel && (
                  <div className="mt-5 text-[10.5px] font-bold uppercase tracking-wide" style={{ color: X.coral }}>
                    {t.plusLabel}
                  </div>
                )}
                <ul className={`${t.plusLabel ? "mt-2.5" : "mt-5"} space-y-2.5 flex-1`}>
                  {t.features.map((f) => (
                    <li
                      key={f.t}
                      className="flex items-start gap-2 text-[13.5px]"
                      style={{ color: f.hot ? X.ink : X.sub, fontWeight: f.hot ? 700 : 400 }}
                    >
                      <Check size={15} className="mt-0.5 shrink-0" style={{ color: X.coral }} />
                      {f.t}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/auth")}
                  className="mt-6 w-full py-3 rounded-full text-[14px] font-bold text-white transition-colors"
                  style={{ background: X.coralGrad, boxShadow: X.btnShadow }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = X.coralGradHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = X.coralGrad)}
                >
                  {t.price === "Custom" ? "Talk to Us" : "Start Free Trial"}
                </button>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.25}>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[13.5px]" style={{ color: X.sub }}>
            {["No credit card required", "Cancel anytime", "No hidden fees"].map((t, i) => (
              <span key={t} className="inline-flex items-center gap-3">
                {i > 0 && <span style={{ color: X.borderStrong }}>|</span>}
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} style={{ color: X.green }} /> {t}
                </span>
              </span>
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1.5 text-[14.5px] font-bold"
              style={{ color: X.coral }}
            >
              Compare all plans & features <ChevronRight size={15} />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
