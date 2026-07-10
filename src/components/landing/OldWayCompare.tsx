import { X as XIcon, Check } from "lucide-react";
import { X } from "./LandingNavbar";
import { SectionHead, FadeIn } from "./xui";

const compare = [
  { old: "Weeks of developer time and API wiring", neu: "Live in about 30 minutes, no code" },
  { old: "Generic bot that makes up answers", neu: "Grounded in your real documents" },
  { old: "Expensive per-seat support tooling", neu: "Transparent INR pricing, GST invoices" },
  { old: "English-only, rigid scripts", neu: "20+ Indian languages, natural replies" },
  { old: "No visibility into conversations", neu: "Full transcripts and analytics built in" },
];

/** Before / after comparison band (moved here from the retired How-it-works page). */
export default function OldWayCompare() {
  return (
    <section className="mkt-x py-20 md:py-24 px-5 sm:px-8" style={{ background: X.white }}>
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
  );
}
