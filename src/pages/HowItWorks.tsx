import { ShoppingBag, GraduationCap, HeartPulse, Building2, Briefcase, Home, X as XIcon, Check } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { X } from "@/components/landing/LandingNavbar";
import FooterSection from "@/components/landing/FooterSection";
import PageHero from "@/components/landing/PageHero";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CTASection from "@/components/landing/CTASection";
import { SectionHead, FadeIn } from "@/components/landing/xui";

const useCases = [
  { icon: ShoppingBag, title: "E-commerce", desc: "Order tracking, returns, product Q&A and cart recovery.", ex: "“Where is my order #4821?”" },
  { icon: GraduationCap, title: "Education", desc: "Admissions, course details, fees and student support.", ex: "“What's the fee for the BCA program?”" },
  { icon: HeartPulse, title: "Healthcare", desc: "Appointments, departments, doctors and reports.", ex: "“Book a cardiology appointment for Friday.”" },
  { icon: Building2, title: "Real estate", desc: "Listings, site visits, pricing and EMI questions.", ex: "“Show 3BHK flats under ₹80L in Whitefield.”" },
  { icon: Briefcase, title: "SaaS & startups", desc: "Onboarding, docs, billing and tier-1 support.", ex: "“How do I reset my API key?”" },
  { icon: Home, title: "Local services", desc: "Bookings, quotes, hours and FAQs for any business.", ex: "“Are you open this Sunday?”" },
];

const compare = [
  { old: "Weeks of developer time and API wiring", neu: "Live in about 30 minutes, no code" },
  { old: "Generic bot that makes up answers", neu: "Grounded in your real documents" },
  { old: "Expensive per-seat support tooling", neu: "Transparent INR pricing, GST invoices" },
  { old: "English-only, rigid scripts", neu: "20+ Indian languages, natural replies" },
  { old: "No visibility into conversations", neu: "Full transcripts and analytics built in" },
];

export default function HowItWorksPage() {
  return (
    <div className="mkt-x min-h-screen" style={{ background: X.white }}>
      <LandingNavbar />

      <PageHero
        breadcrumb="How it works"
        title="Launch a Real AI Agent in"
        highlight="Three Steps"
        subtitle="No engineering team, no integrations to maintain. Configure, train on your data, and embed — that's the whole process."
        secondaryCta={{ label: "View pricing", to: "/pricing" }}
      />

      {/* 3-step section */}
      <HowItWorksSection />

      {/* Use cases */}
      <section className="py-20 md:py-24 px-5 sm:px-8" style={{ background: X.white }}>
        <div className="max-w-[1280px] mx-auto">
          <SectionHead
            pre="One Platform,"
            hl="Every Kind of Business"
            sub="If you have customers with questions, Osciva fits in. Here's what teams build."
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {useCases.map((u, i) => (
              <FadeIn key={u.title} delay={(i % 3) * 0.08}>
                <div
                  className="h-full p-6 transition-all duration-300 hover:-translate-y-1"
                  style={{ background: i % 2 === 0 ? X.coralSoft : X.lavender, borderRadius: 16 }}
                >
                  <u.icon size={26} strokeWidth={1.7} style={{ color: X.ink }} />
                  <h3 className="mt-4 text-[15.5px] font-bold mb-1.5" style={{ color: X.ink }}>{u.title}</h3>
                  <p className="text-[13px] leading-relaxed mb-4" style={{ color: X.sub }}>{u.desc}</p>
                  <div
                    className="text-[12.5px] rounded-[8px] px-3 py-2 italic"
                    style={{ background: X.white, color: X.sub }}
                  >
                    {u.ex}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Before / after comparison */}
      <section className="py-20 md:py-24 px-5 sm:px-8" style={{ background: X.cream }}>
        <div className="max-w-[1000px] mx-auto">
          <SectionHead pre="The Old Way vs." hl="The Osciva Way" />
          <FadeIn delay={0.1}>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-7" style={{ background: X.white, borderRadius: 16, border: `1px solid ${X.border}` }}>
                <h3 className="text-[15px] font-bold mb-5" style={{ color: X.faint }}>The old way</h3>
                <ul className="space-y-4">
                  {compare.map((c) => (
                    <li key={c.old} className="flex items-start gap-3 text-[14px]" style={{ color: X.sub }}>
                      <span className="grid place-items-center w-5 h-5 rounded-full mt-0.5 shrink-0" style={{ background: "#fee2e2" }}>
                        <XIcon size={12} style={{ color: "#ef4444" }} />
                      </span>
                      {c.old}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="p-7 text-white"
                style={{ background: `linear-gradient(135deg, #f08a67 0%, ${X.coral} 50%, #e2603f 100%)`, borderRadius: 16, boxShadow: X.shadow1 }}
              >
                <h3 className="text-[15px] font-bold mb-5 text-white">With Osciva</h3>
                <ul className="space-y-4">
                  {compare.map((c) => (
                    <li key={c.neu} className="flex items-start gap-3 text-[14px]" style={{ color: "rgba(255,255,255,0.95)" }}>
                      <span className="grid place-items-center w-5 h-5 rounded-full mt-0.5 shrink-0" style={{ background: "rgba(255,255,255,0.25)" }}>
                        <Check size={12} className="text-white" />
                      </span>
                      {c.neu}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <CTASection />
      <FooterSection />
    </div>
  );
}
