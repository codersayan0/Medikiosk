import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "../home/RevealHeading";
import { FeaturesHeroVisual } from "./FeaturesHeroVisual";
import { FadeIn, SlideUp, VIEWPORT } from "../home/motion";

export function FeaturesHero() {
  const { t } = useTranslation();
  const home = t.features.hero;
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-mx-bg" aria-labelledby="features-hero-heading">
      <div className="pointer-events-none absolute inset-0 -z-30 overflow-hidden" aria-hidden="true">
        {prefersReducedMotion ? (
          <img src="/videos/features-bg-poster.jpg" alt="" className="h-full w-full object-cover opacity-45" />
        ) : (
          <video
            className="h-full w-full object-cover opacity-75"
            style={{ filter: "saturate(0.95) contrast(1.1)" }}
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
        <div className="absolute inset-0" aria-hidden="true" style={{ background: "rgba(0, 0, 0, var(--mx-hero-video-tint, 0.12))" }} />
        <div className="absolute inset-0" aria-hidden="true" style={{ background: "linear-gradient(115deg, color-mix(in srgb, var(--mx-bg) 78%, transparent) 0%, color-mix(in srgb, var(--mx-bg) 58%, transparent) 30%, color-mix(in srgb, var(--mx-bg) 42%, transparent) 60%, color-mix(in srgb, var(--mx-bg) 32%, transparent) 100%)" }} />
        <div className="absolute inset-0" aria-hidden="true" style={{ background: "linear-gradient(to bottom, transparent 78%, var(--mx-bg) 99%)" }} />
      </div>

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <motion.div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-mx-green-soft blur-3xl" animate={prefersReducedMotion ? undefined : { y: [0, 24, 0], x: [0, 12, 0] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute top-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-mx-blue-soft blur-3xl" animate={prefersReducedMotion ? undefined : { y: [0, -20, 0], x: [0, -14, 0] }} transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-mx-purple-soft blur-3xl" animate={prefersReducedMotion ? undefined : { y: [0, 16, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
      </div>

      <div className="mx-auto grid max-w-7xl gap-14 px-4 pt-16 pb-20 sm:px-6 sm:pt-20 sm:pb-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:pt-24 lg:pb-32">
        <div>
          <motion.p initial="hidden" whileInView="show" viewport={VIEWPORT} variants={prefersReducedMotion ? undefined : FadeIn} className="mb-5 inline-flex items-center gap-2 rounded-full border border-mx-border-strong bg-mx-surface px-3.5 py-1.5 text-xs font-bold tracking-wide text-mx-green-strong uppercase">
            <Sparkles size={13} aria-hidden="true" />
            {home.badge}
          </motion.p>

          <RevealHeading as="h1" id="features-hero-heading" lines={[home.headline]} className="font-display text-[2.6rem] leading-[1.05] font-extrabold tracking-tight text-mx-ink sm:text-6xl lg:text-[4rem]" />

          <motion.p initial="hidden" whileInView="show" viewport={VIEWPORT} variants={prefersReducedMotion ? undefined : SlideUp} className="mt-6 max-w-lg text-lg leading-relaxed text-mx-ink-soft">
            {home.subtext}
          </motion.p>

          <motion.div initial="hidden" whileInView="show" viewport={VIEWPORT} variants={prefersReducedMotion ? undefined : SlideUp} className="mt-8 flex flex-wrap items-center gap-3">
            <motion.div whileHover={prefersReducedMotion ? undefined : { y: -3 }} whileTap={{ scale: 0.97 }}>
              <Link to="/how-it-works" className="group inline-flex h-12 items-center justify-center gap-2 rounded-mx-md bg-mx-green px-6 text-base font-semibold text-mx-ink-inverse shadow-mx-sm transition-[background-color,box-shadow] duration-200 ease-out hover:bg-mx-green-strong hover:shadow-mx-md" onClick={(e) => { e.preventDefault(); document.getElementById("ai-assistant-heading")?.scrollIntoView({ behavior: "smooth" }); }}>
                {home.ctaPrimary}
                <ArrowRight size={17} aria-hidden="true" className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={prefersReducedMotion ? undefined : { y: -3 }} whileTap={{ scale: 0.97 }}>
              <Link to="/how-it-works" className="group inline-flex h-12 items-center justify-center gap-2 rounded-mx-md border border-mx-border-strong px-6 text-base font-semibold text-mx-ink transition-[background-color,box-shadow,border-color] duration-200 ease-out hover:border-mx-green hover:bg-mx-surface-sunken hover:shadow-mx-sm">
                <PlayCircle size={18} aria-hidden="true" className="transition-transform duration-200 ease-out group-hover:scale-110" />
                {home.ctaSecondary}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div initial="hidden" whileInView="show" viewport={VIEWPORT} variants={prefersReducedMotion ? undefined : SlideUp}>
          <FeaturesHeroVisual />
        </motion.div>
      </div>
    </section>
  );
}