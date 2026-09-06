import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface RotatingStatementProps {
  statements: readonly string[];
  className?: string;
  intervalMs?: number;
}

/**
 * The hero's "Healthcare is personal. → Healthcare is complex. → …" line.
 * Auto-advances on a slow, readable interval. For prefers-reduced-motion we
 * stop the timer entirely and land on the final statement — the one meant
 * to resolve the sequence — rather than looping motion indefinitely.
 */
export function RotatingStatement({ statements, className, intervalMs = 2800 }: RotatingStatementProps) {
  const prefersReducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % statements.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion, statements.length, intervalMs]);

  const activeIndex = prefersReducedMotion ? statements.length - 1 : index;

  return (
    <div className={className} role="status" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.p
          key={activeIndex}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: -14 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {statements[activeIndex]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
