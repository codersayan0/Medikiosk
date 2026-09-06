import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "./Reveal";
import { SlideUp } from "./motion";

/**
 * SECTION 26 — FINAL PATIENT MESSAGE
 * The emotional peak of the homepage: one large declarative headline,
 * three quiet supporting lines, and the MediKiosk name landing last before
 * the primary CTA — a moment of stillness before the closing calls to action.
 */
export function FinalMessage() {
  const { t } = useTranslation();
  const home = t.home.phase3.finalMessage;

  return (
    <section className="bg-mx-surface py-24 sm:py-32" aria-labelledby="finalmessage-heading">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <RevealHeading
          as="h2"
          id="finalmessage-heading"
          lines={home.headline}
          className="font-display text-4xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-6xl"
        />

        <StaggerGroup as="div" className="mt-8 flex flex-col gap-1.5" stagger={0.12} delayChildren={0.15} amount={0.5}>
          {home.lines.map((line) => (
            <StaggerItem key={line} as="p" variant={SlideUp} className="text-lg text-mx-ink-soft sm:text-xl">
              {line}
            </StaggerItem>
          ))}
        </StaggerGroup>

        <ScrollReveal variant={SlideUp} amount={0.5} delay={0.4} className="mt-8">
          <p className="font-display text-2xl font-extrabold text-mx-green-strong sm:text-3xl">{home.brandLine}</p>
        </ScrollReveal>

        <ScrollReveal variant={SlideUp} amount={0.5} delay={0.5} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            to="/get-started"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-mx-md bg-mx-green px-7 text-base font-semibold text-mx-ink-inverse transition-colors hover:bg-mx-green-strong sm:w-auto"
          >
            {home.ctaPrimary}
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link
            to="/how-it-works"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-mx-md border border-mx-border px-7 text-base font-semibold text-mx-ink transition-colors hover:bg-mx-surface-sunken sm:w-auto"
          >
            {home.ctaSecondary}
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
