import { Brain, FileSearch, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "../home/RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../home/Reveal";
import { SlideUp, ScaleIn } from "../home/motion";

const MARKERS = [Sparkles, Brain, FileSearch, ShieldCheck];

/**
 * SECTION 2 — INTRO
 * Clean, spacious statement section. A quiet row of icon markers stands in
 * for the section's four pillars instead of a heavy card grid.
 */
export function FeaturesIntro() {
  const { t } = useTranslation();
  const home = t.features.intro;

  return (
    <section className="bg-mx-bg/68 py-16 sm:py-20" aria-labelledby="features-intro-heading">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <RevealHeading
          as="h2"
          id="features-intro-heading"
          lines={[home.heading]}
          className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
        />
        <ScrollReveal as="p" variant={SlideUp} className="mx-auto mt-5 max-w-xl text-base text-mx-ink-soft sm:text-lg">
          {home.subtext}
        </ScrollReveal>

        <StaggerGroup className="mt-10 flex items-center justify-center gap-4 sm:gap-6" stagger={0.1} amount={0.3}>
          {MARKERS.map((Icon, i) => (
            <StaggerItem key={i} variant={ScaleIn}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-mx-border bg-mx-surface text-mx-ink-soft sm:h-12 sm:w-12">
                <Icon size={18} aria-hidden="true" />
              </span>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}