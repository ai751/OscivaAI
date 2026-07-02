import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import { X } from "@/components/landing/LandingNavbar";
import FooterSection from "@/components/landing/FooterSection";
import PageHero from "@/components/landing/PageHero";
import { FadeIn } from "@/components/landing/xui";
import { imgFallback } from "@/components/landing/ImageCycler";

const upcoming = [
  { tag: "Guide", title: "How to train an AI agent on your own documents", desc: "A practical walkthrough from raw PDFs to a grounded, production-ready assistant.", img: "https://images.unsplash.com/photo-1777635168256-be42aa28c457?auto=format&fit=crop&w=800&q=80", seed: "osciva-blog-1" },
  { tag: "Playbook", title: "Cutting support volume without hurting CSAT", desc: "Where automation helps, where it hurts, and how to draw the line.", img: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?auto=format&fit=crop&w=800&q=80", seed: "osciva-blog-2" },
  { tag: "Product", title: "Designing for 20+ Indian languages", desc: "What it takes to make an assistant feel native, not translated.", img: "https://images.unsplash.com/photo-1776248783518-400b6d0da64c?auto=format&fit=crop&w=800&q=80", seed: "osciva-blog-3" },
];

export default function Blog() {
  const navigate = useNavigate();

  return (
    <div className="mkt-x min-h-screen" style={{ background: X.white }}>
      <LandingNavbar />

      <PageHero
        breadcrumb="Blog"
        title="Notes on Building"
        highlight="Useful AI"
        subtitle="Practical writing on AI agents, customer support and shipping product for Indian businesses. The first articles are on the way."
        primaryCta={null}
        secondaryCta={{ label: "Talk to us", to: "/contact" }}
      />

      <section className="px-5 sm:px-8 pb-20 md:pb-24" style={{ background: X.white }}>
        <div className="max-w-[1000px] mx-auto">
          <FadeIn>
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] mb-6" style={{ color: X.faint }}>
              Coming soon
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {upcoming.map((a, i) => (
              <FadeIn key={a.title} delay={i * 0.08}>
                <article
                  className="h-full overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1"
                  style={{ background: X.white, borderRadius: 16, border: `1px solid ${X.border}`, boxShadow: "rgba(0,0,0,0.04) 0px 2px 8px" }}
                >
                  <img
                    src={a.img}
                    alt=""
                    loading="lazy"
                    onError={(e) => imgFallback(e, a.seed)}
                    className="w-full h-[170px] object-cover"
                  />
                  <div className="p-6 flex flex-col flex-1">
                    <span
                      className="self-start text-[11px] font-bold px-2.5 py-1 rounded-[4px] mb-4 text-white"
                      style={{ background: X.coral }}
                    >
                      {a.tag}
                    </span>
                    <h3 className="text-[16px] font-bold leading-snug mb-2" style={{ color: X.ink }}>{a.title}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: X.sub }}>{a.desc}</p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>

          <FadeIn>
            <div className="mt-12 p-10 text-center" style={{ background: X.coralSoft, borderRadius: 16 }}>
              <h2 className="text-[20px] font-bold" style={{ color: X.ink }}>Want these in your inbox?</h2>
              <p className="mt-3 text-[14px] max-w-md mx-auto" style={{ color: X.sub }}>
                We will start publishing soon. Reach out and we will let you know when the first articles go live.
              </p>
              <button
                onClick={() => navigate("/contact")}
                className="group mt-7 inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-[14px] font-bold transition-colors"
                style={{ background: X.coralGrad, boxShadow: X.btnShadow }}
                onMouseEnter={(e) => (e.currentTarget.style.background = X.coralGradHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = X.coralGrad)}
              >
                Get notified
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </FadeIn>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}
