import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Check } from "lucide-react";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn } from "./xui";

type Feature = { t: string; hot?: boolean };
type Plan = {
  name: string;
  monthly: number | "custom";
  yearly: number | "custom";
  desc: string;
  plusLabel?: string; // "Everything in X, plus:", makes plan differences obvious
  features: Feature[];
  cta: string;
  popular: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    desc: "Your first agent answers on us, no credit card",
    features: [
      { t: "1 AI agent, live in 30 minutes" },
      { t: "50 messages/mo on our GPT-4o Mini, no API key needed", hot: true },
      { t: "Train it with your documents (1 MB)" },
      { t: "Accurate RAG answers with source citations" },
      { t: "Embed on any website with one snippet" },
      { t: "Speaks 20+ Indian languages" },
      { t: "Basic analytics (7 days)" },
      { t: "Community support" },
    ],
    cta: "Get started free",
    popular: false,
  },
  {
    name: "Starter",
    monthly: 999,
    yearly: 799,
    desc: "For small businesses going live",
    plusLabel: "Everything in Free, plus:",
    features: [
      { t: "2 AI agents" },
      { t: "UNLIMITED messages, your API key, zero markup", hot: true },
      { t: "5× bigger knowledge base (5 MB of documents)" },
      { t: "Website indexing, your key pages, auto-synced" },
      { t: "Fast, affordable AI models (GPT-4o Mini, Gemini Flash…)" },
      { t: "Remove 'Powered by Osciva', fully white-label" },
      { t: "Your logo, colors & widget position" },
      { t: "Full analytics & conversation transcripts" },
      { t: "Email support" },
    ],
    cta: "Start free trial",
    popular: false,
  },
  {
    name: "Growth",
    monthly: 2499,
    yearly: 1999,
    desc: "For growing teams that need it all",
    plusLabel: "Everything in Starter, plus:",
    features: [
      { t: "5 AI agents, support, sales, FAQs & more" },
      { t: "ALL premium AI models, GPT-4o, Claude, Gemini Pro", hot: true },
      { t: "Double the knowledge, 10 MB docs + 15 web pages" },
      { t: "Custom rate limits & abuse protection" },
      { t: "Unlimited conversation history" },
      { t: "Priority support, real humans, fast" },
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Enterprise",
    monthly: "custom",
    yearly: "custom",
    desc: "For large-scale, mission-critical use",
    plusLabel: "Everything in Growth, plus:",
    features: [
      { t: "As many agents as your business needs", hot: true },
      { t: "Custom knowledge base scale" },
      { t: "SLA guarantee & dedicated manager" },
      { t: "Custom integrations with your stack" },
      { t: "Hands-on onboarding & migration help" },
    ],
    cta: "Contact sales",
    popular: false,
  },
];

export default function PricingSection() {
  const navigate = useNavigate();
  const [yearly, setYearly] = useState(false);

  const price = (p: Plan) => {
    const v = yearly ? p.yearly : p.monthly;
    if (v === "custom") return "Custom";
    if (v === 0) return "Free";
    return `₹${v.toLocaleString("en-IN")}`;
  };

  return (
    <section id="pricing" className="mkt-x py-16 md:py-20 px-5 sm:px-8" style={{ background: X.white }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHead
          hl="Simple Pricing."
          post="Zero Surprises."
          sub="Start free, your first agent answers on us. Upgrade for unlimited messages with your own API key."
        />

        <FadeIn delay={0.1}>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center gap-1 p-1 rounded-[50px] border" style={{ background: X.surface, borderColor: X.border }}>
              <button
                onClick={() => setYearly(false)}
                className="px-5 py-2 rounded-[50px] text-[13px] font-bold transition-all"
                style={!yearly ? { background: X.white, color: X.ink, boxShadow: "rgba(0,0,0,0.06) 0px 2px 6px" } : { color: X.faint }}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className="px-5 py-2 rounded-[50px] text-[13px] font-bold transition-all flex items-center gap-2"
                style={yearly ? { background: X.white, color: X.ink, boxShadow: "rgba(0,0,0,0.06) 0px 2px 6px" } : { color: X.faint }}
              >
                Yearly
                <span className="text-[10px] px-2 py-0.5 rounded-[50px] font-bold text-white" style={{ background: X.coral }}>
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>
        </FadeIn>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.07}>
              <div
                className="relative h-full border-[1.5px] rounded-[12px] p-6 flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{
                  borderColor: X.coral,
                  background: plan.popular ? X.coralSoft : X.white,
                  boxShadow: plan.popular ? X.shadow3 : "none",
                }}
              >
                {plan.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-[50px] text-white text-[11px] font-bold tracking-wide"
                    style={{ background: X.coral }}
                  >
                    MOST POPULAR
                  </span>
                )}
                <h3 className="text-[16px] font-bold" style={{ color: X.ink }}>{plan.name}</h3>
                <p className="text-[12px] mt-1 mb-5" style={{ color: X.faint }}>{plan.desc}</p>

                <div className="flex items-baseline gap-1">
                  <span className="text-[34px] font-bold" style={{ color: X.ink }}>{price(plan)}</span>
                  {plan.monthly !== "custom" && plan.monthly !== 0 && (
                    <span className="text-[13px]" style={{ color: X.faint }}>/mo</span>
                  )}
                </div>
                <div className="text-[11px] h-4 mb-5" style={{ color: X.faint }}>
                  {yearly && typeof plan.yearly === "number" && plan.yearly > 0
                    ? `Billed ₹${(plan.yearly * 12).toLocaleString("en-IN")}/yr`
                    : ""}
                </div>

                <button
                  onClick={() => navigate(plan.name === "Enterprise" ? "/contact" : "/auth")}
                  className="w-full py-3 rounded-full text-[14px] font-bold text-white transition-colors mb-6"
                  style={{ background: X.coralGrad, boxShadow: X.btnShadow }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = X.coralGradHover)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = X.coralGrad)}
                >
                  {plan.cta}
                </button>

                {plan.plusLabel && (
                  <div className="text-[11.5px] font-bold uppercase tracking-wide mb-3" style={{ color: X.coral }}>
                    {plan.plusLabel}
                  </div>
                )}
                <ul className="space-y-3">
                  {plan.features.map((f) => (
                    <li key={f.t} className="flex items-start gap-2.5 text-[13px]" style={{ color: f.hot ? X.ink : X.sub }}>
                      <Check size={15} className="mt-0.5 shrink-0" style={{ color: X.coral }} />
                      <span className={f.hot ? "font-bold" : ""}>{f.t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
