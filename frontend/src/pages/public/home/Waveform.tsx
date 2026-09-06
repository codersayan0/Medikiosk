import { motion, useReducedMotion } from "framer-motion";

const BAR_HEIGHTS = [0.35, 0.7, 0.45, 1, 0.6, 0.85, 0.4, 0.65, 0.3, 0.75, 0.5, 0.9];

/** Small ambient waveform used to signal "listening" in voice-mode mockups. */
export function Waveform({ active = true, className }: { active?: boolean; className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const animate = active && !prefersReducedMotion;

  return (
    <div className={className ?? "flex h-10 items-center gap-[3px]"} aria-hidden="true">
      {BAR_HEIGHTS.map((h, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-mx-green"
          style={{ height: `${h * 100}%` }}
          animate={
            animate
              ? { scaleY: [0.4, 1, 0.5, 0.9, 0.4] }
              : { scaleY: active ? 0.6 : 0.15 }
          }
          transition={
            animate
              ? { duration: 1.1 + (i % 4) * 0.15, repeat: Infinity, ease: "easeInOut", delay: i * 0.06 }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  );
}
