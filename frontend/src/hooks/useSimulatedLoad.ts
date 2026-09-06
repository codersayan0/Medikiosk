import { useEffect, useState } from "react";

/**
 * Simulates the brief loading window a real API call would have, so pages
 * can show their skeleton loader before the (already-available) mock data
 * renders. Also exposes `retry`/`failed` so a page can demo its ErrorState
 * fallback — call `simulateError()` to flip into the error branch.
 */
export function useSimulatedLoad(delayMs = 600) {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), delayMs);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = () => {
    setFailed(false);
    setLoading(true);
    window.setTimeout(() => setLoading(false), delayMs);
  };

  return { loading, failed, retry, simulateError: () => { setLoading(false); setFailed(true); } };
}
