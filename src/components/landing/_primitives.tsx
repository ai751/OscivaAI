import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

/* Shared brand palette for the marketing site (single source of truth). */
export const C = {
  ink: "#0B0E14",
  sub: "#586072",
  mute: "#8C94A1",
  line: "#EBEDF0",
  soft: "#F7F8FA",
  brand: "#E8613C",
  brandDk: "#CF4F2C",
  brandSoft: "#FFF1EC",
} as const;

/* One easing curve everywhere, calm, premium. */
const EASE = [0.22, 1, 0.36, 1] as const;

export const reveal: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.6, ease: EASE },
  }),
};

/** Scroll-triggered reveal wrapper. */
export function Reveal({
  children,
  i = 0,
  className,
  as = "div",
}: {
  children: ReactNode;
  i?: number;
  className?: string;
  as?: "div" | "span" | "li";
}) {
  const Comp = motion[as];
  return (
    <Comp
      custom={i}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      className={className}
    >
      {children}
    </Comp>
  );
}

/** Centered section heading block. */
export function SectionHeading({
  title,
  subtitle,
  align = "center",
}: {
  /** @deprecated No longer rendered, the orange dot-eyebrow was removed site-wide. */
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
}) {
  const wrap = align === "center" ? "text-center mx-auto items-center" : "text-left items-start";
  return (
    <div className={`flex flex-col ${wrap} max-w-2xl ${align === "center" ? "mx-auto" : ""}`}>
      <Reveal>
        <h2 className="display text-[30px] sm:text-[36px] md:text-[44px] font-extrabold text-[#0B0E14]">
          {title}
        </h2>
      </Reveal>
      {subtitle && (
        <Reveal i={1}>
          <p className="mt-4 text-[15px] md:text-[16px] leading-relaxed text-[#586072]">{subtitle}</p>
        </Reveal>
      )}
    </div>
  );
}
