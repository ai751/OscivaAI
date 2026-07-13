import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "@/components/landing/LandingNavbar";

/* Once per browser tab session: plays when the site is first opened, but
   never again on refresh or in-app navigation. A new tab or a fresh browser
   session gets the intro again. */
const SEEN_KEY = "osciva-splash-seen";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/* "Osciva AI" split into characters (NBSP so the gap survives flex layout);
   the trailing two get the coral accent. */
const LETTERS = ["O", "s", "c", "i", "v", "a", " ", "A", "I"];
const CORAL_FROM = 7;

const HOLD_MS = 2050; // choreography runs, then the dot-dissolve exit begins
const DISSOLVE_MS = 950; // blurry-dot dissolve length; unmount after it finishes
const HOLD_MS_REDUCED = 1000;

/* Brand intro shown before the homepage (kore.ai-style: brand mark over an
   ambient ripple, then the whole layer dissolves while the page sharpens in).
   The homepage renders underneath from the first frame, this layer only
   covers it, so nothing is gated on the animation finishing.
   Colors come from the mkt-x tokens, so the splash follows the site theme. */
export default function SplashIntro() {
  const reduceMotion = useReducedMotion();
  const [show, setShow] = useState(() => {
    try {
      // /?intro=1 always replays it (for demos and design review)
      if (new URLSearchParams(window.location.search).has("intro")) return true;
    } catch {
      /* ignore */
    }
    try {
      return sessionStorage.getItem(SEEN_KEY) !== "1";
    } catch {
      return true;
    }
  });

  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!show) return;
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* private mode, splash just replays next visit */
    }
    document.body.style.overflow = "hidden";
    // Reduced motion keeps the simple fade branch; otherwise: start the CSS
    // dot-dissolve at HOLD_MS, unmount once it has fully played out.
    const t1 = setTimeout(
      () => (reduceMotion ? setShow(false) : setLeaving(true)),
      reduceMotion ? HOLD_MS_REDUCED : HOLD_MS,
    );
    const t2 = reduceMotion ? undefined : setTimeout(() => setShow(false), HOLD_MS + DISSOLVE_MS);
    return () => {
      clearTimeout(t1);
      if (t2) clearTimeout(t2);
      document.body.style.overflow = "";
    };
  }, [show, reduceMotion]);

  // Click-to-skip runs the same dissolve, just immediately.
  const dismiss = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => setShow(false), DISSOLVE_MS);
  };

  if (reduceMotion) {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            key="splash"
            aria-hidden="true"
            onClick={() => setShow(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: X.cream }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.35, ease: "easeOut" } }}
            exit={{ opacity: 0, transition: { duration: 0.3, ease: "easeOut" } }}
          >
            <span className="text-4xl font-bold tracking-[-0.02em]" style={{ color: X.ink }}>
              Osciva <span style={{ color: X.coral }}>AI</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          aria-hidden="true"
          onClick={dismiss}
          className={`splash-dissolve${leaving ? " leaving" : ""} fixed inset-0 z-[100] flex items-center justify-center overflow-hidden`}
          style={{ background: X.cream }}
          initial={false}
        >
          {/* Exit effect: the whole layer breaks into soft blurry dots that
              shrink away (animatable @property drives the mask's dot radius),
              with a light blur + micro-buzz jitter while it goes. */}
          <style>{`
            @property --splash-dot {
              syntax: "<percentage>";
              inherits: false;
              initial-value: 160%;
            }
            .splash-dissolve {
              --splash-dot: 160%;
              -webkit-mask-image: radial-gradient(circle, #000 calc(var(--splash-dot) - 45%), transparent var(--splash-dot));
              mask-image: radial-gradient(circle, #000 calc(var(--splash-dot) - 45%), transparent var(--splash-dot));
              -webkit-mask-size: 18px 18px;
              mask-size: 18px 18px;
              -webkit-mask-position: center;
              mask-position: center;
              transition:
                --splash-dot 0.9s cubic-bezier(0.4, 0, 0.2, 1),
                filter 0.9s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.75s cubic-bezier(0.4, 0, 0.2, 1) 0.2s;
            }
            .splash-dissolve.leaving {
              --splash-dot: 0%;
              opacity: 0;
              filter: blur(10px);
              animation: splash-buzz 0.5s linear 1;
              pointer-events: none;
            }
            @keyframes splash-buzz {
              0%   { transform: translate(0, 0); }
              18%  { transform: translate(-2px, 1px); }
              36%  { transform: translate(2px, -1px); }
              54%  { transform: translate(-2px, -1px); }
              72%  { transform: translate(1px, 2px); }
              100% { transform: translate(0, 0); }
            }
          `}</style>

          {/* Ambient ripple: concentric rings breathing behind the mark */}
          <div className="absolute inset-0 flex items-center justify-center">
            {[420, 720, 1060].map((size, i) => (
              <motion.div
                key={size}
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  border: `1.5px solid ${X.coral}`,
                  opacity: 0.1,
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: [0.9, 1.04, 0.98], opacity: [0, 0.12 - i * 0.03, 0.08 - i * 0.02] }}
                transition={{ duration: 2.6, delay: 0.2 + i * 0.25, ease: "easeOut" }}
              />
            ))}
          </div>

          {/* Content: the leaving-class dissolve (dots + blur + buzz) takes the
              whole layer out, so no separate exit choreography needed here */}
          <div className="flex flex-col items-center px-6">
            {/* Logo: scales in, then floats; a coral arc orbits it like a loader */}
            <motion.div
              className="relative mb-8"
              initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.7, delay: 0.05, ease: EASE_OUT_EXPO }}
            >
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.75 }}
              >
                <motion.svg
                  viewBox="0 0 100 100"
                  className="absolute -inset-3 h-[calc(100%+24px)] w-[calc(100%+24px)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  transition={{
                    opacity: { duration: 0.4, delay: 0.5 },
                    rotate: { duration: 1.3, repeat: Infinity, ease: "linear", delay: 0.5 },
                  }}
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke={X.coral}
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeDasharray="80 209"
                  />
                </motion.svg>
                <img
                  src="https://osciva.io/images/osciva-web.png"
                  alt=""
                  className="h-14 w-14 sm:h-[68px] sm:w-[68px]"
                />
              </motion.div>
            </motion.div>

            {/* Each letter rises out of its own overflow mask */}
            <div className="flex" style={{ fontSize: "clamp(44px, 8vw, 92px)" }}>
              {LETTERS.map((ch, i) => (
                <span key={i} className="overflow-hidden inline-block pb-[0.08em] -mb-[0.08em]">
                  <motion.span
                    className="inline-block font-bold leading-[1.05] tracking-[-0.03em]"
                    style={{ color: i >= CORAL_FROM ? X.coral : X.ink }}
                    initial={{ y: "115%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.65, delay: 0.3 + i * 0.05, ease: EASE_OUT_EXPO }}
                  >
                    {ch}
                  </motion.span>
                </span>
              ))}
            </div>

            <motion.p
              className="mt-4 text-[15px] sm:text-[17px] font-medium"
              style={{ color: X.mute }}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0, ease: EASE_OUT_EXPO }}
            >
              AI agents, trained on your business
            </motion.p>
          </div>

          {/* Loading hairline along the bottom edge */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[3px] origin-left"
            style={{ background: X.coralGrad }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.85, delay: 0.15, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
