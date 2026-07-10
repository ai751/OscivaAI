import LandingNavbar from "@/components/landing/LandingNavbar";
import { X } from "@/components/landing/LandingNavbar";
import FooterSection from "@/components/landing/FooterSection";
import PageHero from "@/components/landing/PageHero";
import CTASection from "@/components/landing/CTASection";
import { SectionHead, FadeIn } from "@/components/landing/xui";

const stats = [
  { value: "500+", label: "Businesses building on Osciva" },
  { value: "10M+", label: "Messages handled" },
  { value: "20+", label: "Indian languages supported" },
  { value: "India", label: "Where your data stays" },
];

const values = [
  { title: "Operators first", desc: "We build for founders, marketers and support leads, not just engineers. If you can fill a form, you can ship an agent." },
  { title: "Grounded answers", desc: "Every reply comes from your real data. We would rather an agent say it does not know than make something up." },
  { title: "India by default", desc: "INR pricing, GST invoices, India-hosted data and native support for the languages your customers actually speak." },
];

export default function About() {
  return (
    <div className="mkt-x min-h-screen" style={{ background: X.white }}>
      <LandingNavbar />

      <PageHero
        breadcrumb="About"
        title="Making AI Useful for"
        highlight="Every Indian Business"
        subtitle="Osciva is the no-code platform to build, train and deploy AI assistants on your own data. Our goal is simple: put a capable AI teammate within reach of any business, without an engineering team."
        primaryCta={{ label: "Start Free Trial", to: "/auth" }}
        secondaryCta={{ label: "Explore features", to: "/features" }}
      />

      {/* Stats band */}
      <section className="py-14 md:py-16 px-5 sm:px-8" style={{ background: X.white }}>
        <div className="max-w-[1280px] mx-auto">
          <FadeIn>
            <div
              className="p-8 md:p-12"
              style={{ background: `linear-gradient(135deg, #f08a67 0%, ${X.coral} 50%, #e2603f 100%)`, borderRadius: 16 }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-[28px] md:text-[38px] font-bold text-white">{s.value}</div>
                    <div className="text-[12.5px] font-medium mt-1" style={{ color: "rgba(255,255,255,0.85)" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 md:py-16 px-5 sm:px-8" style={{ background: X.white }}>
        <div className="max-w-[1280px] mx-auto">
          <SectionHead
            pre="What We"
            hl="Believe"
            sub="The principles that shape how we build the product"
          />
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.08}>
                <div
                  className="h-full p-7"
                  style={{ background: i % 2 === 0 ? X.coralSoft : X.lavender, borderRadius: 16 }}
                >
                  <h3 className="text-[16px] font-bold mb-2" style={{ color: X.ink }}>{v.title}</h3>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: X.sub }}>{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <FooterSection />
    </div>
  );
}
