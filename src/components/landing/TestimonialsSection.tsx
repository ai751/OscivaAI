import { Star } from "lucide-react";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn } from "./xui";

const featured = {
  company: "ShopKart",
  industry: "D2C Store",
  quote:
    "Setting up our agent took under 30 minutes. It now handles 70% of customer queries with no human in the loop, including the midnight 'where is my order' wave.",
  name: "Rahul Menon",
  role: "Founder, ShopKart",
  stats: [
    { value: "70%", label: "queries resolved without a human" },
    { value: "30 min", label: "from signup to live agent" },
    { value: "24/7", label: "coverage without night shifts" },
    { value: "4.8/5", label: "customer satisfaction score" },
  ],
};

const quotes = [
  {
    text: "Response time dropped 80% and CSAT went through the roof. Our support team finally works on real problems.",
    name: "Priya Sharma",
    role: "CTO, FinEdge Solutions",
    initials: "PS",
    hue: "#4A7DDE",
  },
  {
    text: "The knowledge-base retrieval is a game-changer. It answers complex queries accurately from our own docs.",
    name: "Ananya Gupta",
    role: "VP Product, HealthBridge",
    initials: "AG",
    hue: "#9A5BC2",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="mkt-x py-20 md:py-24 px-5 sm:px-8" style={{ background: X.cream }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHead
          pre="See How Businesses Like Yours"
          hl="Answer Faster"
          sub="Real results, not just promises"
        />

        {/* Featured case */}
        <FadeIn delay={0.1}>
          <div
            className="mt-12 grid grid-cols-1 lg:grid-cols-[380px_1fr] rounded-[16px] overflow-hidden border"
            style={{ borderColor: X.border, background: X.white }}
          >
            {/* Left visual block */}
            <div className="relative flex flex-col justify-between p-8 min-h-[280px]" style={{ background: X.coral }}>
              <span
                className="self-start text-[12px] font-bold px-2.5 py-1 rounded"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
              >
                {featured.industry}
              </span>
              <div>
                <div className="text-[34px] font-bold text-white leading-tight">{featured.company}</div>
                <div className="mt-1 text-[13px]" style={{ color: "rgba(255,255,255,0.75)" }}>
                  Customer story
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} className="text-white" style={{ fill: "#fff" }} />
                ))}
              </div>
            </div>

            {/* Right content */}
            <div className="p-8 md:p-10">
              <p className="text-[17px] md:text-[19px] leading-relaxed font-medium" style={{ color: X.ink }}>
                “{featured.quote}”
              </p>
              <div className="mt-4 text-[14px]" style={{ color: X.mute }}>
                <span className="font-bold" style={{ color: X.ink }}>{featured.name}</span>, {featured.role}
              </div>
              <div className="mt-7 grid grid-cols-2 md:grid-cols-4 gap-3">
                {featured.stats.map((s) => (
                  <div key={s.label} className="px-4 py-4 text-center" style={{ background: X.coral, borderRadius: 8 }}>
                    <div className="text-[22px] font-bold text-white leading-none">{s.value}</div>
                    <div className="mt-1.5 text-[11px] leading-snug" style={{ color: "rgba(255,255,255,0.85)" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Supporting quotes */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {quotes.map((q, i) => (
            <FadeIn key={q.name} delay={0.15 + i * 0.08}>
              <figure
                className="h-full rounded-[16px] border p-7"
                style={{ borderColor: X.border, background: X.white }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} style={{ color: X.coral, fill: X.coral }} />
                  ))}
                </div>
                <blockquote className="text-[15px] leading-relaxed" style={{ color: X.ink }}>
                  “{q.text}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span
                    className="w-10 h-10 rounded-full grid place-items-center text-[12px] font-bold text-white"
                    style={{ background: q.hue }}
                  >
                    {q.initials}
                  </span>
                  <div>
                    <div className="text-[14px] font-bold" style={{ color: X.ink }}>{q.name}</div>
                    <div className="text-[12px]" style={{ color: X.faint }}>{q.role}</div>
                  </div>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
