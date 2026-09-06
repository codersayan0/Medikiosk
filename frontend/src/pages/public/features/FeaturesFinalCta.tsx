import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "../home/RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../home/Reveal";
import { SlideUp } from "../home/motion";

/**
 * SECTION 13 — FINAL CTA
 * Closes the features page on the same declarative register as the brand
 * tagline. Dark section, mirroring the homepage's closing CTA treatment,
 * built fresh for this page rather than reused.
 */
export function FeaturesFinalCta() {
  const { t } = useTranslation();
  const home = t.features.finalCta;

  return (
    <section className="bg-mx-ink/72 py-20 sm:py-28" aria-labelledby="features-finalcta-heading">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <RevealHeading
          as="h2"
          id="features-finalcta-heading"
          lines={home.headline}
          className="font-display text-4xl leading-tight font-extrabold tracking-tight text-mx-ink-inverse sm:text-5xl"
        />

        <ScrollReveal
          as="p"
          variant={SlideUp}
          delay={0.1}
          className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-mx-ink-inverse/75 sm:text-lg"
        >
          {home.subtext}
        </ScrollReveal>

        <StaggerGroup className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row" stagger={0.1} amount={0.4}>
          <StaggerItem variant={SlideUp} className="w-full sm:w-auto">
            <Link
              to="/get-started"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-mx-md bg-mx-green px-7 text-base font-semibold text-mx-ink-inverse shadow-mx-sm transition-[background-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-mx-green-strong hover:shadow-mx-md active:translate-y-0 sm:w-auto"
            >
              {home.ctaPrimary}
              <ArrowRight size={17} aria-hidden="true" className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </Link>
          </StaggerItem>
          <StaggerItem variant={SlideUp} className="w-full sm:w-auto">
            <Link
              to="/how-it-works"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-mx-md border border-mx-ink-inverse/20 bg-mx-ink-soft/20 px-7 text-base font-semibold text-mx-ink-inverse shadow-mx-sm transition-[background-color,border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-mx-green hover:bg-mx-green/10 hover:shadow-mx-md active:translate-y-0 sm:w-auto"
            >
              <PlayCircle size={18} aria-hidden="true" className="transition-transform duration-200 ease-out group-hover:scale-110" />
              {home.ctaSecondary}
            </Link>
          </StaggerItem>
        </StaggerGroup>
      </div>
    </section>
  );
}