import { Fragment } from "react";
import { Check, Minus, ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { X } from "@/components/landing/LandingNavbar";
import FooterSection from "@/components/landing/FooterSection";
import PageHero from "@/components/landing/PageHero";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import CTASection from "@/components/landing/CTASection";
import { SectionHead, FadeIn } from "@/components/landing/xui";

const planNames = ["Free", "Starter", "Growth", "Enterprise"];

type Row = { label: string; values: (string | boolean)[] };
const rows: { group: string; items: Row[] }[] = [
  {
    group: "Core",
    items: [
      { label: "AI agents", values: ["1", "2", "5", "Custom"] },
      { label: "Messages / month", values: ["50 (on our key)", "Unlimited — your key", "Unlimited — your key", "Unlimited — your key"] },
      { label: "Documents per agent", values: ["1 MB", "5 MB", "10 MB", "Custom"] },
      { label: "Website indexing", values: [false, "7 pages", "15 pages", "Custom"] },
      { label: "AI models", values: ["GPT-4o Mini (included)", "Budget models", "All models + premium", "All models + premium"] },
    ],
  },
  {
    group: "Features",
    items: [
      { label: "Analytics & transcripts", values: ["7 days", "Full", "Full history", "Full history"] },
      { label: "Remove Osciva badge", values: [false, true, true, true] },
      { label: "Widget customization", values: [false, true, true, true] },
      { label: "Custom rate limits", values: [false, false, true, true] },
      { label: "20+ Indian languages", values: [true, true, true, true] },
    ],
  },
  {
    group: "Support & ops",
    items: [
      { label: "Support", values: ["Community", "Email", "Priority", "Dedicated manager"] },
      { label: "SLA guarantee", values: [false, false, false, true] },
      { label: "Custom integrations", values: [false, false, false, true] },
    ],
  },
];

const guarantees = [
  { icon: ShieldCheck, title: "No lock-in", desc: "Month-to-month billing. Cancel anytime, export your data whenever." },
  { icon: RefreshCw, title: "Switch plans freely", desc: "Upgrade or downgrade instantly as your volume changes." },
  { icon: Headphones, title: "Real human support", desc: "Talk to people who know the product — not a script." },
];

function Cell({ v }: { v: string | boolean }) {
  if (v === true) return <Check size={16} className="mx-auto" style={{ color: X.coral }} />;
  if (v === false) return <Minus size={15} className="mx-auto" style={{ color: X.borderStrong }} />;
  return <span className="text-[13px]" style={{ color: X.sub }}>{v}</span>;
}

export default function PricingPage() {
  return (
    <div className="mkt-x min-h-screen" style={{ background: X.white }}>
      <LandingNavbar />

      <PageHero
        breadcrumb="Pricing"
        title="Pricing That Scales"
        highlight="With You"
        subtitle="Start free — your first agent answers on us. Upgrade for unlimited messages with your own API key. No hidden fees, ever."
        primaryCta={{ label: "Start Free Trial", to: "/auth" }}
        secondaryCta={{ label: "Talk to sales", to: "/contact" }}
      />

      {/* Plan cards */}
      <PricingSection />

      {/* Comparison table */}
      <section className="py-20 md:py-24 px-5 sm:px-8" style={{ background: X.cream }}>
        <div className="max-w-[1100px] mx-auto">
          <SectionHead pre="Every Feature," hl="Side by Side" />

          <FadeIn delay={0.1}>
            <div className="mt-12 overflow-x-auto" style={{ background: X.white, borderRadius: 16, border: `1.5px solid ${X.coral}` }}>
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${X.border}` }}>
                    <th className="text-left text-[13px] font-bold px-6 py-5 w-[28%]" style={{ color: X.mute }}>Plan</th>
                    {planNames.map((n) => (
                      <th
                        key={n}
                        className="text-center text-[14px] font-bold px-4 py-5"
                        style={{ color: n === "Growth" ? X.coral : X.ink }}
                      >
                        {n}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((grp) => (
                    <Fragment key={grp.group}>
                      <tr style={{ background: X.surface }}>
                        <td colSpan={5} className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: X.faint }}>
                          {grp.group}
                        </td>
                      </tr>
                      {grp.items.map((r) => (
                        <tr key={r.label} style={{ borderBottom: `1px solid ${X.border}` }}>
                          <td className="px-6 py-3.5 text-[13.5px]" style={{ color: X.sub }}>{r.label}</td>
                          {r.values.map((v, i) => (
                            <td key={i} className="text-center px-4 py-3.5" style={i === 2 ? { background: X.coralSoft } : undefined}>
                              <Cell v={v} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          {/* Guarantees */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
            {guarantees.map((g, i) => (
              <FadeIn key={g.title} delay={i * 0.08}>
                <div className="h-full p-6 flex items-start gap-4" style={{ background: X.white, borderRadius: 16, boxShadow: X.shadow3 }}>
                  <div className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: X.coralSoft }}>
                    <g.icon size={19} style={{ color: X.coral }} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold mb-1.5" style={{ color: X.ink }}>{g.title}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: X.sub }}>{g.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <FAQSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}
