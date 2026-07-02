import { motion } from "framer-motion";
import { type ReactNode } from "react";
import { X } from "./LandingNavbar";

/* Shared building blocks for the expedify-style marketing sections. */

/** Key-phrase highlight in headings: coral text on a soft rounded tint
    (Osciva's own take — softer than a solid block). */
export function HL({ children }: { children: ReactNode }) {
  return (
    <span
      className="inline-block px-3 py-0.5 rounded-full"
      style={{ background: X.coralSoft, color: X.coralDark }}
    >
      {children}
    </span>
  );
}

/** Scroll reveal wrapper. */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Centered section heading: "pre [highlight] post" + grey sub line. */
export function SectionHead({
  pre,
  hl,
  post,
  sub,
}: {
  pre?: string;
  hl?: string;
  post?: string;
  sub?: string;
}) {
  return (
    <FadeIn className="text-center max-w-3xl mx-auto">
      <h2
        className="text-[30px] sm:text-[36px] md:text-[40px] font-bold leading-[1.2] tracking-[-0.01em]"
        style={{ color: X.ink }}
      >
        {pre && <>{pre} </>}
        {hl && <HL>{hl}</HL>}
        {post && <> {post}</>}
      </h2>
      {sub && (
        <p className="mt-4 text-[16px] leading-[24px]" style={{ color: X.mute }}>
          {sub}
        </p>
      )}
    </FadeIn>
  );
}

/** Diamond bullet list item (expedify-style ✦ bullets). */
export function DiamondItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-[15px] leading-[24px]" style={{ color: X.sub }}>
      <span className="mt-[7px] shrink-0" aria-hidden>
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M5 0 L6.5 3.5 L10 5 L6.5 6.5 L5 10 L3.5 6.5 L0 5 L3.5 3.5 Z" fill={X.coral} />
        </svg>
      </span>
      {children}
    </li>
  );
}

/** Coral gradient pill CTA button. */
export function CoralButton({
  children,
  onClick,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-full text-white text-[15px] font-bold transition-colors ${className}`}
      style={{ background: X.coralGrad, boxShadow: X.btnShadow }}
      onMouseEnter={(e) => (e.currentTarget.style.background = X.coralGradHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = X.coralGrad)}
    >
      {children}
    </button>
  );
}
