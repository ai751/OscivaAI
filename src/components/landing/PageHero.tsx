import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { type ReactNode } from "react";
import { X } from "./LandingNavbar";
import { HL } from "./xui";

const EASE = [0.22, 1, 0.36, 1] as const;
const up = (d: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay: d, ease: EASE },
});

/** Expedify-style hero band for every marketing sub-page. */
export default function PageHero({
  breadcrumb,
  title,
  highlight,
  subtitle,
  primaryCta = { label: "Start Free Trial", to: "/auth" },
  secondaryCta,
  children,
}: {
  breadcrumb: string;
  title: string;
  highlight?: string;
  subtitle: string;
  primaryCta?: { label: string; to: string } | null;
  secondaryCta?: { label: string; to: string } | null;
  children?: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <section
      className="mkt-x relative overflow-hidden pt-[140px] pb-14 md:pt-[170px] md:pb-16 px-5 sm:px-8"
      style={{ background: `linear-gradient(180deg, ${X.cream} 0%, ${X.white} 100%)` }}
    >
      <div className="relative max-w-[880px] mx-auto text-center">
        <motion.nav {...up(0)} className="flex items-center justify-center gap-1.5 text-[13px] mb-6" style={{ color: X.faint }}>
          <button
            onClick={() => navigate("/")}
            className="transition-colors"
            onMouseEnter={(e) => (e.currentTarget.style.color = X.coral)}
            onMouseLeave={(e) => (e.currentTarget.style.color = X.faint)}
          >
            Home
          </button>
          <ChevronRight size={13} />
          <span className="font-medium" style={{ color: X.sub }}>{breadcrumb}</span>
        </motion.nav>

        <motion.h1
          {...up(0.08)}
          className="text-[34px] sm:text-[44px] md:text-[52px] font-bold leading-[1.18] tracking-[-0.01em]"
          style={{ color: X.ink }}
        >
          {title}
          {highlight && (
            <>
              {" "}
              <HL>{highlight}</HL>
            </>
          )}
        </motion.h1>

        <motion.p
          {...up(0.16)}
          className="mt-5 text-[16px] md:text-[17px] leading-[26px] max-w-xl mx-auto"
          style={{ color: X.mute }}
        >
          {subtitle}
        </motion.p>

        {(primaryCta || secondaryCta) && (
          <motion.div {...up(0.24)} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {primaryCta && (
              <button
                onClick={() => navigate(primaryCta.to)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full text-[15px] font-bold text-white transition-colors"
                style={{ background: X.coralGrad, boxShadow: X.btnShadow }}
                onMouseEnter={(e) => (e.currentTarget.style.background = X.coralGradHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = X.coralGrad)}
              >
                {primaryCta.label}
              </button>
            )}
            {secondaryCta && (
              <button
                onClick={() => navigate(secondaryCta.to)}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full text-[15px] font-medium border transition-colors"
                style={{ borderColor: X.coral, color: X.coral, background: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = X.coralSoft)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {secondaryCta.label}
              </button>
            )}
          </motion.div>
        )}

        {children && <motion.div {...up(0.32)}>{children}</motion.div>}
      </div>
    </section>
  );
}
