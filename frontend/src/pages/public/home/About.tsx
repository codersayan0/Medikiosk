import { useTranslation } from "../../../i18n";
import { ScrollReveal } from "./Reveal";
import { SlideUp } from "./motion";

/**
 * SECTION — ABOUT
 *
 * This content originally lived as a trailing block inside ProductJourney.
 * It's split out here, unchanged, so it can occupy its own place in the
 * homepage's top-to-bottom order and be reachable directly via the
 * Navbar's "About" anchor (previously the "#about" id sat much earlier on
 * the page than the nav order implied). Copy, styling, and behavior are
 * identical to the original block — only its position and wrapping
 * markup changed.
 */
export function About() {
  const { t } = useTranslation();
  const home = t.home.journey;

  return (
    <section id="about" className="scroll-mt-28 bg-mx-surface py-14 sm:py-20" aria-labelledby="about-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ScrollReveal variant={SlideUp} className="border-t border-mx-border pt-14 text-center">
          <p id="about-heading" className="text-xs font-bold tracking-wide text-mx-green-strong uppercase">
            {home.aboutHeading}
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-mx-ink-soft">{home.aboutText}</p>
          <p className="mt-6 text-sm font-semibold text-mx-ink-muted">{home.footnote}</p>
        </ScrollReveal>
      </div>
    </section>
  );
}
