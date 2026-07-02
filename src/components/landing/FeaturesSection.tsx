import { motion } from "framer-motion";
import { Database, Workflow, BarChart3, MessageSquare, Code2, Paintbrush, Globe, Shield, Zap } from "lucide-react";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn } from "./xui";

const spotlight = {
  icon: Database,
  title: "Train on your own data",
  desc: "Upload PDFs, documents, URLs and FAQs — anything. Osciva embeds your content into a private knowledge base so every answer is grounded in your real business, never made up.",
};

const features = [
  { icon: Workflow, title: "Any use case", desc: "Support, sales, lead capture, internal helpdesk, tutoring — design it for whatever you need." },
  { icon: BarChart3, title: "Built-in analytics", desc: "Every conversation, top questions and resolution rate — no extra tools to wire up." },
  { icon: MessageSquare, title: "Human handoff", desc: "When the AI can't help, it hands off to your team with full context preserved." },
  { icon: Globe, title: "20+ Indian languages", desc: "Native Hindi, Tamil, Telugu, Bengali, Kannada, Marathi, Gujarati and more." },
  { icon: Shield, title: "India-first security", desc: "DPDP-ready, encrypted everywhere, data hosted in India." },
  { icon: Code2, title: "Embed anywhere", desc: "One line of code. Native WordPress, Shopify, React and WhatsApp support." },
  { icon: Paintbrush, title: "Your brand, not ours", desc: "Your colors, logo and welcome message — it looks like part of your product." },
  { icon: Zap, title: "Truly no-code", desc: "No JSON, no APIs, no developer. If you've filled a form, you can build one." },
];

const integrations = ["WhatsApp", "Slack", "Zendesk", "Freshdesk", "Salesforce", "Zapier", "Shopify", "WordPress", "Razorpay", "Stripe"];

export default function FeaturesSection() {
  return (
    <section id="features" className="mkt-x py-20 md:py-24 px-5 sm:px-8" style={{ background: X.white }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHead
          pre="Everything You Need."
          hl="None of the Complexity."
          sub="A complete AI assistant platform built for operators, not engineers"
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr gap-4">
          {/* Spotlight card */}
          <FadeIn className="md:col-span-2 lg:row-span-2">
            <div
              className="relative h-full overflow-hidden p-8 text-white"
              style={{ background: `linear-gradient(135deg, #f08a67 0%, ${X.coral} 50%, #e2603f 100%)`, borderRadius: 16 }}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-[12px] flex items-center justify-center mb-6" style={{ background: "rgba(255,255,255,0.22)" }}>
                  <spotlight.icon size={22} className="text-white" />
                </div>
                <h3 className="text-[22px] md:text-[26px] font-bold mb-3">{spotlight.title}</h3>
                <p className="text-[14.5px] leading-relaxed max-w-md" style={{ color: "rgba(255,255,255,0.9)" }}>
                  {spotlight.desc}
                </p>

                {/* mini "indexing" visual */}
                <div className="mt-8 grid grid-cols-3 gap-2.5 max-w-md">
                  {["product-guide.pdf", "returns-policy.md", "company.osciva.io", "pricing.pdf", "faq.docx", "support.csv"].map((f, i) => (
                    <motion.div
                      key={f}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08, duration: 0.5 }}
                      className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-2 text-[10px]"
                      style={{ background: "rgba(255,255,255,0.16)", color: "rgba(255,255,255,0.95)" }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#bff2d1" }} />
                      <span className="truncate">{f}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {features.map((f, i) => (
            <FadeIn key={f.title} delay={(i % 3) * 0.08}>
              <div
                className="group h-full p-6 transition-all duration-300 hover:-translate-y-1"
                style={{ background: i % 2 === 0 ? X.coralSoft : X.lavender, borderRadius: 16 }}
              >
                <f.icon size={26} strokeWidth={1.7} style={{ color: X.ink }} />
                <h3 className="mt-4 text-[15px] font-bold mb-1.5" style={{ color: X.ink }}>{f.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: X.sub }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Integrations marquee */}
        <FadeIn>
          <div className="mt-14 py-10" style={{ background: X.cream, borderRadius: 16 }}>
            <p className="text-center text-[13.5px] mb-6" style={{ color: X.sub }}>
              <span className="font-bold" style={{ color: X.ink }}>Works with your stack</span> — connect the tools your team already uses
            </p>
            <div className="relative overflow-hidden mask-fade-x">
              <div className="flex w-max gap-3 animate-marquee-slow">
                {[...integrations, ...integrations].map((name, i) => (
                  <span
                    key={i}
                    className="px-5 py-2.5 rounded-[50px] border text-[13px] font-medium whitespace-nowrap"
                    style={{ borderColor: X.border, background: X.white, color: X.sub }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
