import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export type CycleImage = { src: string; seed: string; alt: string };

/** Swaps a broken image URL for a Picsum placeholder so a box is never empty. */
export function imgFallback(e: React.SyntheticEvent<HTMLImageElement>, seed: string) {
  const img = e.currentTarget;
  if (img.dataset.fallback) return;
  img.dataset.fallback = "1";
  img.src = `https://picsum.photos/seed/${seed}/1100/700`;
}

/**
 * A single framed image that crossfades through `images` one by one on a timer.
 * Stays static under reduced-motion.
 */
export default function ImageCycler({
  images,
  interval = 3200,
  className = "h-[300px] sm:h-[440px]",
}: {
  images: CycleImage[];
  interval?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce || images.length < 2) return;
    const id = setInterval(() => setI((p) => (p + 1) % images.length), interval);
    return () => clearInterval(id);
  }, [reduce, images.length, interval]);

  const slide = images[i];

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border border-[#EBEDF0] bg-[#F7F8FA] ${className}`}>
      <AnimatePresence initial={false}>
        <motion.img
          key={slide.seed}
          src={slide.src}
          alt={slide.alt}
          onError={(e) => imgFallback(e, slide.seed)}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
    </div>
  );
}
