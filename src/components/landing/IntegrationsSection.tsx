import { X } from "./LandingNavbar";
import { SectionHead, FadeIn } from "./xui";

/* Simple monogram tiles, no third-party logo assets needed. */
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
          sub="A single script tag for anything with HTML, plus one-click installs for the platforms you already use"
        />

        <FadeIn delay={0.1}>
          {/* One continuous line of platforms, drifting left forever.
              The list is rendered twice so the loop is seamless. */}
          <style>{`
            @keyframes osciva-marquee {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            .osciva-marquee-track { animation: osciva-marquee 28s linear infinite; }
            .osciva-marquee:hover .osciva-marquee-track { animation-play-state: paused; }
            @media (prefers-reduced-motion: reduce) {
              .osciva-marquee-track { animation: none; }
            }
          `}</style>
          <div
            className="osciva-marquee mt-12 overflow-hidden"
            style={{
              maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
            }}
          >
            <div className="osciva-marquee-track flex w-max gap-4">
              {[...platforms, ...platforms].map((p, i) => (
                <div
                  key={`${p.name}-${i}`}
                  className="flex items-center gap-3 rounded-[16px] border pl-3 pr-5 py-3 shrink-0"
                  style={{ borderColor: X.border, background: X.white, boxShadow: "rgba(0,0,0,0.04) 0px 2px 8px" }}
                >
                  <span
                    className="w-10 h-10 rounded-[12px] grid place-items-center text-[14px] font-bold text-white shrink-0"
                    style={{ background: p.hue }}
                  >
                    {p.mark}
                  </span>
                  <span className="text-[13.5px] font-medium whitespace-nowrap" style={{ color: X.sub }}>
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
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
