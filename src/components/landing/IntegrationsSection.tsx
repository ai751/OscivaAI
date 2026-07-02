import { X } from "./LandingNavbar";
import { SectionHead, FadeIn } from "./xui";

/* Simple monogram tiles — no third-party logo assets needed. */
const platforms = [
  { name: "WordPress", mark: "W", hue: "#21759b" },
  { name: "Shopify", mark: "S", hue: "#5e8e3e" },
  { name: "React", mark: "R", hue: "#149eca" },
  { name: "Webflow", mark: "Wf", hue: "#4353ff" },
  { name: "Wix", mark: "Wx", hue: "#111827" },
  { name: "Next.js", mark: "N", hue: "#111827" },
  { name: "Framer", mark: "F", hue: "#0055ff" },
  { name: "HTML", mark: "<>", hue: "#e34f26" },
  { name: "Squarespace", mark: "Sq", hue: "#111827" },
  { name: "Magento", mark: "M", hue: "#ee672f" },
];

export default function IntegrationsSection() {
  return (
    <section className="mkt-x py-20 md:py-24 px-5 sm:px-8" style={{ background: X.white }}>
      <div className="max-w-[1280px] mx-auto">
        <SectionHead
          pre="One Snippet."
          hl="Works Everywhere."
          sub="A single script tag for anything with HTML — plus one-click installs for the platforms you already use"
        />

        <FadeIn delay={0.1}>
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-[900px] mx-auto">
            {platforms.map((p, i) => (
              <div
                key={p.name}
                className="flex flex-col items-center gap-3 rounded-[16px] border px-4 py-6 transition-all duration-300 hover:-translate-y-1"
                style={{ borderColor: X.border, background: X.white, boxShadow: "rgba(0,0,0,0.04) 0px 2px 8px" }}
              >
                <span
                  className="w-12 h-12 rounded-[12px] grid place-items-center text-[16px] font-bold text-white"
                  style={{ background: p.hue }}
                >
                  {p.mark}
                </span>
                <span className="text-[13px] font-medium" style={{ color: X.sub }}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* The snippet itself */}
        <FadeIn delay={0.2}>
          <div className="mt-10 max-w-[640px] mx-auto rounded-[12px] overflow-hidden" style={{ boxShadow: X.shadow1 }}>
            <div className="flex items-center justify-between px-4 py-2.5" style={{ background: "#1b2130" }}>
              <span className="text-[12px] font-medium" style={{ color: "rgba(255,255,255,0.5)" }}>
                Paste before &lt;/body&gt;
              </span>
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded cursor-default"
                style={{ background: X.coral, color: "#fff" }}
              >
                Copy
              </span>
            </div>
            <div className="px-5 py-4 font-mono text-[13px]" style={{ background: "#111827" }}>
              <span style={{ color: "#c084fc" }}>&lt;script </span>
              <span style={{ color: "#86efac" }}>src="https://cdn.osciva.io/widget.js" data-agent="your-agent"</span>
              <span style={{ color: "#c084fc" }}> defer&gt;&lt;/script&gt;</span>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
