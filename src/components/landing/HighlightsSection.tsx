import { Zap, Clock4, IndianRupee, Puzzle } from "lucide-react";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn } from "./xui";

const cards = [
  {
    icon: Zap,
    title: "Live in 30 Minutes",
    desc: "No setup hell. Upload your docs, connect your website, go live. Faster than writing one support email.",
    bg: X.coralSoft,
  },
  {
    icon: Clock4,
    title: "24/7 Answers",
    desc: "Your agent answers at 2 pm and 2 am with the same patience. Customers never wait for office hours again.",
    bg: X.lavender,
  },
  {
    icon: IndianRupee,
    title: "Built for India",
    desc: "INR pricing with GST invoices, 20+ Indian languages, and your data hosted in Indian data centres.",
    bg: X.coralSoft,
  },
  {
    icon: Puzzle,
    title: "Fits Your Business",
    desc: "Stores, clinics, institutes, SaaS, agencies — if customers ask you questions, Osciva answers them.",
    bg: X.lavender,
  },
];

export default function HighlightsSection() {
  return (
    <section className="mkt-x py-20 md:py-24 px-5 sm:px-8" style={{ background: X.white }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHead
          pre="Why Choose"
          hl="Osciva AI"
          sub="Four reasons we're different from every other chatbot tool"
        />

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((c, i) => (
            <FadeIn key={c.title} delay={i * 0.08}>
              <div
                className="h-full flex flex-col items-center text-center px-6 py-12 transition-transform duration-300 hover:-translate-y-1.5"
                style={{ background: c.bg, borderRadius: 16 }}
              >
                <c.icon size={34} strokeWidth={1.6} style={{ color: X.ink }} />
                <h3 className="mt-7 text-[17px] font-bold" style={{ color: X.ink }}>
                  {c.title}
                </h3>
                <p className="mt-3 text-[13.5px] leading-[21px]" style={{ color: X.sub }}>
                  {c.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
