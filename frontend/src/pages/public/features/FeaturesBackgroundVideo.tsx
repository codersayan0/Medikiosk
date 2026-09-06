import { useReducedMotion } from "framer-motion";

/**
 * FEATURES PAGE — BACKGROUND VIDEO LAYER
 *
 * Scope: /features ONLY. Do not reuse on the homepage or any other route —
 * the homepage keeps its own hero video (see home/Hero.tsx) untouched.
 *
 * Renders a fixed, full-viewport video that sits behind every section on the
 * Features page (z-index below all content) with a subtle dark navy/teal
 * overlay for text/button readability. Because it's `position: fixed` it
 * covers the whole scrollable page rather than just one section, while each
 * section keeps its own background color (now with a touch of transparency)
 * so the clip stays visible-but-quiet underneath the existing design instead
 * of replacing it.
 */
export function FeaturesBackgroundVideo() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-50 overflow-hidden"
      aria-hidden="true"
    >
      {prefersReducedMotion ? (
        <img
          src="/videos/features-bg-poster.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/videos/features-bg-poster.jpg"
        >
          <source src="/videos/features-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* Subtle dark navy/teal overlay — keeps every section's text and
          buttons clearly legible over the moving footage without hiding it entirely. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(9,16,26,0.45) 0%, rgba(11,24,32,0.35) 45%, rgba(10,30,34,0.4) 100%)",
        }}
      />
    </div>
  );
}