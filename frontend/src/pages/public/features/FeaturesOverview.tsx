import { AlertTriangle, Bot, FileSearch, Languages, ListChecks, ShieldCheck, Sparkles, Timer } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "../home/RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../home/Reveal";
import { ScaleIn, SlideUp } from "../home/motion";
import { cn } from "../../../utils/cn";

const CARD_ICONS: LucideIcon[] = [Bot, ListChecks, Timer, FileSearch, AlertTriangle, Languages, Sparkles, ShieldCheck];
// Two wide cards (AI Assistant, Multilingual) break up the grid so it doesn't
// read as eight identical tiles; the rest stay compact.
const CARD_SPANS = ["sm:col-span-2", "", "", "", "", "sm:col-span-2", "", ""];
const CARD_ACCENTS = [
  "text-mx-green bg-mx-green-soft",
  "text-mx-blue bg-mx-blue-soft",
  "text-mx-purple bg-mx-purple-soft",
  "text-mx-blue bg-mx-blue-soft",
  "text-mx-warning bg-mx-warning-soft",
  "text-mx-green bg-mx-green-soft",
  "text-mx-purple bg-mx-purple-soft",
  "text-mx-green bg-mx-green-soft",
];
// Mini waveform preview for the AI Health Assistant card
const WAVE_HEIGHTS = [6, 12, 8, 16, 10, 14, 7];
// Multilingual card renders its subtitle as three small chips instead of plain text
const LANG_CHIPS = ["English", "বাংলা", "हिन्दी"];

/**
 * SECTION 12 — FEATURE OVERVIEW
 * A closing bento-style grid recapping every feature on the page. Two cards
 * are wider and carry a small UI preview (a waveform, language chips) so the
 * grid reads as varied rather than eight identical tiles.
 */
export function FeaturesOverview() {
  const { t } = useTranslation();
  const home = t.features.overview;

  return (
    <section className="bg-mx-bg-canvas/68 py-16 sm:py-24" aria-labelledby="overview-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold tracking-wide text-mx-blue uppercase">{home.eyebrow}</p>
          <RevealHeading
            as="h2"
            id="overview-heading"
            lines={[home.heading]}
            className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
          />
          <ScrollReveal as="p" variant={SlideUp} className="mx-auto mt-4 max-w-lg text-base text-mx-ink-soft">
            {home.description}
          </ScrollReveal>
        </div>

        <StaggerGroup className="mt-12 grid grid-cols-1 gap-3.5 sm:grid-cols-4 sm:gap-4" stagger={0.07} amount={0.15}>
          {home.cards.map((card, i) => {
            const Icon = CARD_ICONS[i];
            return (
              <StaggerItem key={card.title} variant={ScaleIn} className={cn(CARD_SPANS[i])}>
                <div className="group flex h-full items-center gap-3.5 rounded-mx-md border border-mx-border bg-mx-surface-raised p-4 shadow-mx-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-mx-border-strong hover:shadow-mx-md sm:p-5">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ease-out group-hover:scale-110",
                      CARD_ACCENTS[i]
                    )}
                  >
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-mx-ink sm:text-[0.95rem]">{card.title}</p>

                    {i === 5 ? (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {LANG_CHIPS.map((chip) => (
                          <span
                            key={chip}
                            className="rounded-full border border-mx-border bg-mx-surface-sunken px-2 py-0.5 text-[10px] font-semibold text-mx-ink-soft"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="truncate text-xs text-mx-ink-muted">{card.subtitle}</p>
                    )}
                  </div>

                  {i === 0 && (
                    <div className="hidden shrink-0 items-end gap-[3px] sm:flex" aria-hidden="true">
                      {WAVE_HEIGHTS.map((h, wi) => (
                        <span
                          key={wi}
                          className="w-[3px] rounded-full bg-mx-green/60"
                          style={{ height: `${h}px` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}