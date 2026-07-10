import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, MessageCircle, MapPin, Phone, Clock, CheckCircle2, ArrowRight } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { X } from "@/components/landing/LandingNavbar";
import FooterSection from "@/components/landing/FooterSection";
import PageHero from "@/components/landing/PageHero";
import { SectionHead, FadeIn, CoralButton } from "@/components/landing/xui";

const methods = [
  { icon: Mail, label: "Email us", value: "hello@osciva.io", sub: "We reply within 24 hours" },
  { icon: Phone, label: "Call us", value: "+91 98765 43210", sub: "Mon-Sat, 9am-7pm IST" },
  { icon: MessageCircle, label: "WhatsApp", value: "Chat with us", sub: "Fastest way to reach us" },
  { icon: MapPin, label: "Visit", value: "Bengaluru, India", sub: "Koramangala, 560034" },
];

const reasons = [
  "Get a guided product walkthrough",
  "Discuss enterprise & volume pricing",
  "Ask about security, DPDP & data residency",
  "Explore custom integrations",
];

export default function ContactPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const fields = [
    { id: "name", label: "Your name", type: "text", placeholder: "Rahul Sharma" },
    { id: "email", label: "Work email", type: "email", placeholder: "rahul@company.com" },
    { id: "company", label: "Company (optional)", type: "text", placeholder: "Acme Inc." },
  ] as const;

  const inputStyle: React.CSSProperties = {
    border: `1px solid ${X.borderStrong}`,
    background: X.white,
    color: X.ink,
    borderRadius: 8,
  };

  return (
    <div className="mkt-x min-h-screen" style={{ background: X.white }}>
      <LandingNavbar />

      <PageHero
        breadcrumb="Contact"
        title="Let's Talk About Your"
        highlight="AI Agent"
        subtitle="Questions about the product, pricing, security or a custom rollout? Send a note and a real person will get back to you."
        primaryCta={null}
      />

      <section className="pb-12 px-5 sm:px-8" style={{ background: X.white }}>
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14 items-start">
          {/* Left: methods + reasons */}
          <div>
            <FadeIn>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {methods.map((m, i) => (
                  <div
                    key={m.label}
                    className="p-5 transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: i % 2 === 0 ? X.coralSoft : X.lavender, borderRadius: 16 }}
                  >
                    <m.icon size={24} strokeWidth={1.8} style={{ color: X.ink }} />
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: X.faint }}>{m.label}</p>
                    <p className="text-[14.5px] font-bold" style={{ color: X.ink }}>{m.value}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: X.mute }}>{m.sub}</p>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div
                className="mt-6 p-6 text-white"
                style={{ background: `linear-gradient(135deg, #f08a67 0%, ${X.coral} 50%, #e2603f 100%)`, borderRadius: 16 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={16} className="text-white" />
                  <span className="text-[13px] font-bold">What you can expect</span>
                </div>
                <ul className="space-y-3">
                  {reasons.map((r) => (
                    <li key={r} className="flex items-start gap-3 text-[13.5px]" style={{ color: "rgba(255,255,255,0.95)" }}>
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-white" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          </div>

          {/* Right: form */}
          <FadeIn delay={0.1}>
            <div className="p-7 md:p-9" style={{ background: X.white, borderRadius: 16, boxShadow: X.shadow1, border: `1px solid ${X.border}` }}>
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "#dcf3e5" }}>
                    <CheckCircle2 size={30} style={{ color: "#16a34a" }} />
                  </div>
                  <h3 className="text-[22px] font-bold mb-2" style={{ color: X.ink }}>Message sent</h3>
                  <p className="text-[14px] mb-7" style={{ color: X.sub }}>Thanks, we'll get back to you within 24 hours.</p>
                  <CoralButton onClick={() => navigate("/")}>Back to home</CoralButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-[18px] font-bold" style={{ color: X.ink }}>Send us a message</h3>
                    <p className="text-[13px] mt-1" style={{ color: X.faint }}>We'll route it to the right person on our team.</p>
                  </div>
                  {fields.map((field) => (
                    <div key={field.id}>
                      <label className="block text-[13px] font-bold mb-1.5" style={{ color: X.ink }}>{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.id as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [field.id]: e.target.value })}
                        className="w-full px-4 py-3 text-[14px] focus:outline-none transition-all"
                        style={inputStyle}
                        onFocus={(e) => (e.currentTarget.style.borderColor = X.coral)}
                        onBlur={(e) => (e.currentTarget.style.borderColor = X.borderStrong)}
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[13px] font-bold mb-1.5" style={{ color: X.ink }}>How can we help?</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us a bit about what you're building…"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full px-4 py-3 text-[14px] focus:outline-none transition-all resize-none"
                      style={inputStyle}
                      onFocus={(e) => (e.currentTarget.style.borderColor = X.coral)}
                      onBlur={(e) => (e.currentTarget.style.borderColor = X.borderStrong)}
                    />
                  </div>
                  <button
                    type="submit"
                    className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-white text-[15px] font-bold transition-colors"
                    style={{ background: X.coralGrad, boxShadow: X.btnShadow }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = X.coralGradHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = X.coralGrad)}
                  >
                    Send message
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <p className="text-[11.5px] text-center" style={{ color: X.faint }}>
                    By submitting, you agree to our privacy policy. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Reassurance band */}
      <section className="pt-8 pb-20 px-5 sm:px-8" style={{ background: X.white }}>
        <div className="max-w-[1100px] mx-auto">
          <SectionHead
            pre="You Don't Have to"
            hl="Wait to Start"
            sub="Create your first agent free in minutes, no sales call required"
          />
          <FadeIn delay={0.1}>
            <div className="mt-8 flex justify-center">
              <CoralButton onClick={() => navigate("/auth")} className="px-8 py-3.5">
                Start Free Trial
              </CoralButton>
            </div>
          </FadeIn>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
