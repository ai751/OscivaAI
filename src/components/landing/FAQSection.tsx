import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn } from "./xui";

const faqs = [
  {
    q: "How is Osciva different from other chatbot builders?",
    a: "Osciva agents are grounded in your own documents and website — every answer cites its source, and the agent hands off to a human instead of guessing. You get real support automation, not a scripted decision tree, and it's built for India: INR pricing, GST invoices, 20+ Indian languages and India-hosted data.",
  },
  {
    q: "Do I need technical skills to set it up?",
    a: "No. If you can fill a form and copy-paste one line of code, you can launch an agent. Uploading documents, styling the widget and setting the tone all happen in a point-and-click dashboard. WordPress and Shopify installs are one click.",
  },
  {
    q: "How does Osciva handle my customer data?",
    a: "Your data is encrypted in transit and at rest, hosted in Indian data centres, and used only to power your own agent. We're DPDP-ready, and you can delete your data at any time from the dashboard.",
  },
  {
    q: "What happens when the agent doesn't know an answer?",
    a: "It says so honestly and escalates to your team with the full conversation attached. You control the confidence threshold, blocked topics and office-hours routing — the AI never invents answers.",
  },
  {
    q: "Which languages does it support?",
    a: "English, Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Bengali, Gujarati, Punjabi and 10+ more — including Hinglish. The agent detects your customer's language automatically and answers in it, even if your documents are in English.",
  },
  {
    q: "Can I try it before paying?",
    a: "Yes — the Free plan gives you 1 agent and 50 messages a month on our GPT-4o Mini, forever. No credit card, no API key needed to start. Most businesses are live within 30 minutes of signing up.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mkt-x py-20 md:py-24 px-5 sm:px-8" style={{ background: X.white }}>
      <div className="max-w-[900px] mx-auto">
        <SectionHead pre="Still Got" hl="Questions?" />

        <FadeIn delay={0.1}>
          <div className="mt-12">
            {faqs.map((f, i) => (
              <div key={f.q} className="border-b" style={{ borderColor: X.ink }}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-5 text-left"
                  aria-expanded={open === i}
                >
                  <span className="text-[16px] md:text-[17px] font-bold" style={{ color: X.ink }}>
                    {f.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className="shrink-0 transition-transform duration-300"
                    style={{ color: X.ink, transform: open === i ? "rotate(180deg)" : "none" }}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 text-[15px] leading-[26px] max-w-[820px]" style={{ color: X.sub }}>
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
