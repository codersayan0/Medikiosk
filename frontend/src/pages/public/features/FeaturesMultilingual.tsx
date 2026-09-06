import { Globe2, MessageCircle } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "../home/RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../home/Reveal";
import { SlideUp } from "../home/motion";
import { cn } from "../../../utils/cn";

const ACCENTS = [
  "border-mx-blue/20 bg-mx-blue-soft text-mx-blue",
  "border-mx-green/20 bg-mx-green-soft text-mx-green-strong",
  "border-mx-purple/20 bg-mx-purple-soft text-mx-purple",
];
const LANG_TAGS = ["en", "bn", "hi"] as const;

/**
 * SECTION 8 — MULTILINGUAL
 * Three language panels shown side by side (rather than the homepage's
 * rotating single card) so every supported language is visible at once.
 */
export function FeaturesMultilingual() {
  const { t } = useTranslation();
  const home = t.features.multilingual;

  return (
    <section className="bg-mx-bg/68 py-16 sm:py-24" aria-labelledby="multilingual-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-mx-green-strong uppercase">
            <Globe2 size={13} aria-hidden="true" />
            {home.eyebrow}
          </p>
          <RevealHeading
            as="h2"
            id="multilingual-heading"
            lines={[home.heading]}
            className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
          />
          <ScrollReveal as="p" variant={SlideUp} className="mx-auto mt-4 max-w-lg text-base text-mx-ink-soft">
            {home.description}
          </ScrollReveal>
        </div>

        <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-3 sm:gap-5" stagger={0.12} amount={0.25}>
          {home.languages.map((lang, i) => (
            <StaggerItem key={lang.label} variant={SlideUp}>
              <div className="group flex h-full flex-col overflow-hidden rounded-mx-xl border border-mx-border bg-mx-surface-raised shadow-mx-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-mx-border-strong hover:shadow-mx-md">
                <div className={cn("flex items-center justify-between border-b px-5 py-3", ACCENTS[i])}>
                  <span className="font-display text-base font-bold" lang={LANG_TAGS[i]}>
                    {lang.nativeLabel}
                  </span>
                  <MessageCircle size={15} className="transition-transform duration-200 ease-out group-hover:scale-110" aria-hidden="true" />
                </div>
                <div className="flex flex-1 items-center p-5">
                  <p className="text-sm leading-relaxed text-mx-ink" lang={LANG_TAGS[i]}>
                    {lang.sample}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}