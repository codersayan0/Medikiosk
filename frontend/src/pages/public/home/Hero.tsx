import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Mic, PlayCircle, Sparkles } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { RotatingStatement } from "./RotatingStatement";
import { Waveform } from "./Waveform";
import { FadeIn, SlideUp, VIEWPORT } from "./motion";

export function Hero() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const home = t.home.hero;

  return (
    <section className="relative isolate overflow-hidden bg-mx-bg" aria-label={t.brand.tagline}>
      {/* Background video — a quiet, looping glimpse of MediKiosk's AI health-scanning view.
          Opacity is a plain CSS class (no JS/event gating) so it always renders, with or without autoplay succeeding. */}
      <div className="pointer-events-none absolute inset-0 -z-30 overflow-hidden" aria-hidden="true">
        {prefersReducedMotion ? (
          // Static poster only — no motion for anyone who has asked their OS to reduce it.
          <img src="/videos/hero-bg-poster.jpg" alt="" className="h-full w-full object-cover opacity-45" />
        ) : (
          <video
            className="h-full w-full object-cover opacity-75"
            style={{ filter: "saturate(0.95) contrast(1.1)" }}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/videos/hero-bg-poster.jpg"
          >
            <source src="/videos/hero-bg.mp4" type="video/mp4" />
          </video>
        )}

        {/* Dimming layer — strength is theme-aware via --mx-hero-video-tint (barely-there in light, stronger in dark) so light theme stays bright and dark theme keeps its depth */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: "rgba(0, 0, 0, var(--mx-hero-video-tint, 0.12))" }}
        />

        {/* Scrim — a soft wash across the whole section (not a solid block) so the clip stays visible everywhere, with just enough extra fade behind the copy for contrast */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(115deg, color-mix(in srgb, var(--mx-bg) 78%, transparent) 0%, color-mix(in srgb, var(--mx-bg) 58%, transparent) 30%, color-mix(in srgb, var(--mx-bg) 42%, transparent) 60%, color-mix(in srgb, var(--mx-bg) 32%, transparent) 100%)",
          }}
        />
        {/* Bottom fade — blends the clip into the section below instead of cutting hard */}
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{ background: "linear-gradient(to bottom, transparent 50%, var(--mx-bg) 96%)" }}
        />
      </div>

      {/* Ambient background — quiet, slow-drifting brand-color blooms behind the hero */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <motion.div
          className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-mx-green-soft blur-3xl"
          animate={prefersReducedMotion ? undefined : { y: [0, 24, 0], x: [0, 12, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-24 -right-24 h-[28rem] w-[28rem] rounded-full bg-mx-purple-soft blur-3xl"
          animate={prefersReducedMotion ? undefined : { y: [0, -20, 0], x: [0, -14, 0] }}
          transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-mx-blue-soft blur-3xl"
          animate={prefersReducedMotion ? undefined : { y: [0, 16, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto grid max-w-7xl gap-14 px-4 pt-16 pb-20 sm:px-6 sm:pt-20 sm:pb-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-10 lg:pt-24 lg:pb-32">
        <div>
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            variants={prefersReducedMotion ? undefined : FadeIn}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-mx-border-strong bg-mx-surface px-3.5 py-1.5 text-xs font-bold tracking-wide text-mx-green-strong uppercase"
          >
            <Sparkles size={13} aria-hidden="true" />
            {home.eyebrow}
          </motion.p>

          <RevealHeading
            as="h1"
            lines={home.headline}
            className="font-display text-[2.6rem] leading-[1.05] font-extrabold tracking-tight text-mx-ink sm:text-6xl lg:text-[4.2rem]"
          />

          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            variants={prefersReducedMotion ? undefined : SlideUp}
            className="mt-6 max-w-lg text-lg leading-relaxed text-mx-ink-soft"
          >
            {home.subtext}
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            variants={prefersReducedMotion ? undefined : SlideUp}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <motion.div whileHover={prefersReducedMotion ? undefined : { y: -3 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/get-started"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-mx-md bg-mx-green px-6 text-base font-semibold text-mx-ink-inverse shadow-mx-sm transition-[background-color,box-shadow] duration-300 hover:bg-mx-green-strong hover:shadow-mx-md"
              >
                {home.ctaPrimary}
                <ArrowRight
                  size={17}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </motion.div>
            <motion.div whileHover={prefersReducedMotion ? undefined : { y: -3 }} whileTap={{ scale: 0.97 }}>
              <a
                href="#how-it-works"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-mx-md border border-mx-border-strong px-6 text-base font-semibold text-mx-ink transition-[background-color,box-shadow] duration-300 hover:bg-mx-surface-sunken hover:shadow-mx-sm"
              >
                <PlayCircle
                  size={18}
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                {home.ctaSecondary}
              </a>
            </motion.div>
          </motion.div>

          {/* Animated rotating statement — the elegant, non-gimmicky text transition */}
          <div className="mt-12 border-t border-mx-border pt-6">
            <RotatingStatement
              statements={home.rotating}
              className="font-display min-h-[2.5rem] text-xl font-bold text-mx-ink-soft sm:text-2xl"
            />
          </div>
        </div>

        {/* Cinematic hero visual — a quiet preview of the AI assistant in voice mode */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={VIEWPORT}
          variants={prefersReducedMotion ? undefined : SlideUp}
          className="relative mx-auto w-full max-w-sm lg:max-w-none"
        >
          <div className="relative rounded-mx-xl border border-mx-border-strong bg-mx-surface-raised/95 p-6 shadow-mx-lg backdrop-blur-md">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                <Mic size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-mx-ink">{home.mockAssistant}</p>
                <p className="text-xs text-mx-ink-muted">{home.mockListening}</p>
              </div>
              <span className="ml-auto h-2 w-2 animate-pulse rounded-full bg-mx-green" />
            </div>

            <Waveform className="flex h-16 items-end justify-center gap-1" />

            <div className="mt-6 space-y-2">
              <div className="h-2.5 w-4/5 rounded-full bg-mx-surface-sunken" />
              <div className="h-2.5 w-3/5 rounded-full bg-mx-surface-sunken" />
            </div>
          </div>

          {/* small floating card echoing structured output, tucked behind the main card */}
          <div className="absolute -bottom-6 -left-6 hidden w-48 rounded-mx-lg border border-mx-border-strong bg-mx-surface/95 p-3.5 shadow-mx-md backdrop-blur-md sm:block">
            <p className="text-[10px] font-bold tracking-wide text-mx-purple uppercase">
              {t.home.experience.fields.chiefComplaint}
            </p>
            <p className="mt-1 text-xs font-semibold text-mx-ink">{t.home.experience.fieldValues.chiefComplaint}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}