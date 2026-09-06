import { motion, useReducedMotion } from "framer-motion";
import { VIEWPORT, WordReveal, wordContainer, reducedFallback } from "./motion";
import { cn } from "../../../utils/cn";

interface RevealHeadingProps {
  /** One array entry per visual line. Each line is split into words and staggered in. */
  lines: string[];
  className?: string;
  lineClassName?: string;
  as?: "h1" | "h2" | "h3" | "p";
  /** Stagger delay applied between whole lines, on top of the per-word stagger. */
  lineStagger?: number;
  /** Optional id, e.g. to satisfy a section's aria-labelledby. */
  id?: string;
}

/**
 * TextReveal / WordReveal from the MediKiosk animation system, applied to
 * headline copy. Splits on spaces so each word rises in on its own beat —
 * used for every large statement across the homepage so the "story" motif
 * (words arriving one at a time) stays consistent section to section.
 */
export function RevealHeading({ lines, className, lineClassName, as = "h2", lineStagger = 0.09, id }: RevealHeadingProps) {
  const prefersReducedMotion = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag id={id} className={className}>
      {lines.map((line, lineIndex) => (
        <motion.span
          key={line}
          className={cn("block overflow-hidden", lineClassName)}
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          variants={prefersReducedMotion ? reducedFallback : wordContainer(0.055, lineIndex * lineStagger)}
        >
          {line.split(" ").map((word, wordIndex) => (
            <motion.span
              key={`${word}-${wordIndex}`}
              className="inline-block"
              variants={prefersReducedMotion ? reducedFallback : WordReveal}
            >
              {word}
              {wordIndex < line.split(" ").length - 1 ? "\u00A0" : ""}
            </motion.span>
          ))}
        </motion.span>
      ))}
    </Tag>
  );
}
