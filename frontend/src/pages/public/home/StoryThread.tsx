import { motion, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";

/**
 * THE STORY THREAD — MediKiosk's homepage signature element.
 *
 * The brand mark is a heartbeat folded into a health record. This is that
 * idea stretched down the page: a single line that runs the length of the
 * story (hero → patient voice → product → journey), with a pulse that
 * travels as the reader scrolls. It's the one place on the page allowed to
 * be a little theatrical — everything else stays quiet around it.
 *
 * Desktop only (a fixed rail makes no sense on a narrow viewport); hidden
 * entirely for prefers-reduced-motion, since its only job is motion.
 */
export function StoryThread({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end end"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20, mass: 0.4 });
  const dotTop = useTransform(smooth, [0, 1], ["0%", "100%"]);
  const lineScale = smooth;
  const glowOpacity = useTransform(smooth, [0, 0.05, 0.95, 1], [0, 1, 1, 0.4]);
  const containerRef = useRef<HTMLDivElement>(null);

  if (prefersReducedMotion) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 bottom-0 left-6 z-30 hidden w-px lg:block xl:left-10"
    >
      {/* Track */}
      <div className="absolute inset-y-8 left-0 w-px bg-mx-border-strong/60" />
      {/* Progress fill */}
      <motion.div
        className="absolute top-8 left-0 w-px origin-top bg-gradient-to-b from-mx-green via-mx-blue to-mx-purple"
        style={{ scaleY: lineScale, height: "calc(100% - 4rem)" }}
      />
      {/* Traveling pulse */}
      <motion.div
        className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-mx-green shadow-[0_0_0_4px_var(--mx-green-soft)]"
        style={{ top: dotTop, opacity: glowOpacity }}
      />
    </div>
  );
}
