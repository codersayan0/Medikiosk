import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const SESSION_KEY = "mx-counted-up";

function hasAlreadyCounted(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

function markCounted() {
  try {
    sessionStorage.setItem(SESSION_KEY, "1");
  } catch {
    // sessionStorage unavailable (private mode, etc.) — just skip persistence.
  }
}

/**
 * Animates a number counting up from 0 to `value` on first mount only —
 * short (~500-600ms), eased out, never a slot-machine effect. After the
 * first time it has run once in this browser session, every subsequent
 * mount (route revisits, re-renders) renders the final value instantly so
 * it doesn't replay on every navigation back to Overview.
 */
export function useCountUp(value: number, duration = 550) {
  const prefersReducedMotion = useReducedMotion();
  const alreadyCounted = useRef(hasAlreadyCounted());
  const [display, setDisplay] = useState(alreadyCounted.current || prefersReducedMotion ? value : 0);

  useEffect(() => {
    if (alreadyCounted.current || prefersReducedMotion) {
      setDisplay(value);
      return;
    }

    let raf: number;
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3); // ease-out cubic

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplay(Math.round(ease(progress) * value));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        markCounted();
        alreadyCounted.current = true;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return display;
}
