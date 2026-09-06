import { Sparkles } from "lucide-react";
import { cn } from "../../utils/cn";

interface AIIconProps {
  size?: number;
  withPulse?: boolean;
  className?: string;
}

/**
 * Marks content generated or assisted by the MediKiosk AI Health Assistant
 * (draft summaries, AI timelines). The soft pulse ring gives a gentle sense
 * of "listening/processing" without being distracting — respects reduced motion.
 */
export function AIIcon({ size = 16, withPulse = true, className }: AIIconProps) {
  return (
    <span className={cn("relative inline-flex items-center justify-center", className)}>
      {withPulse && (
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mx-purple/30 motion-reduce:animate-none"
          aria-hidden="true"
        />
      )}
      <span className="relative flex items-center justify-center rounded-full bg-mx-purple-soft p-1.5 text-mx-purple">
        <Sparkles size={size} aria-hidden="true" />
      </span>
    </span>
  );
}
