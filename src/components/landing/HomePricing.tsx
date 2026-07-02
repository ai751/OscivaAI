import { useNavigate, Link } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn } from "./xui";

const tiers = [
  {
    name: "Free",
    price: "₹0",
    per: "forever",
    note: "Try it on your own site",
    features: ["1 agent", "500 messages/mo", "Website + PDF training", "Community support"],
    popular: false,
  },
  {
    name: "Starter",
    price: "₹999",
    per: "/month",
    note: "For small businesses",
    features: ["3 agents", "10,000 messages/mo", "All knowledge sources", "Remove Osciva branding"],
    popular: false,
  },
  {
    name: "Growth",
    price: "₹1,999",
    per: "/month",
    note: "For growing teams",
    features: ["10 agents", "25,000 messages/mo", "Human handoff & inbox", "Priority support"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    per: "",
    note: "For serious volume",
    features: ["Unlimited agents", "Custom message volume", "SLA & dedicated support", "Custom integrations"],
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
          sub="Start free. Scale as you grow. INR pricing with GST invoices."
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
                <ul className="mt-5 space-y-2.5 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13.5px]" style={{ color: X.sub }}>
                      <Check size={15} className="mt-0.5 shrink-0" style={{ color: X.coral }} />
                      {f}
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
