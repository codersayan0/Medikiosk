import { Activity, CircleDot, Flame, Footprints, Leaf, Utensils } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "../home/RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../home/Reveal";
import { ScaleIn, SlideUp } from "../home/motion";

const FIELD_ICONS: LucideIcon[] = [Leaf, Activity, Flame, CircleDot, Utensils, Footprints];

/**
 * SECTION 9 — AYUSH MODE
 * Six structured health-information fields, presented as clean,
 * patient-friendly cards. No medical claims are made — each field is
 * framed as information captured, not a diagnosis rendered.
 */
export function FeaturesAyush() {
  const { t } = useTranslation();
  const home = t.features.ayush;

  const fields = [
    { label: home.fields.prakriti, desc: home.fieldDescriptions.prakriti },
    { label: home.fields.vikriti, desc: home.fieldDescriptions.vikriti },
    { label: home.fields.agni, desc: home.fieldDescriptions.agni },
    { label: home.fields.koshtha, desc: home.fieldDescriptions.koshtha },
    { label: home.fields.ahara, desc: home.fieldDescriptions.ahara },
    { label: home.fields.vihara, desc: home.fieldDescriptions.vihara },
  ];

  return (
    <section className="bg-mx-bg-canvas/68 py-16 sm:py-24" aria-labelledby="ayush-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold tracking-wide text-mx-green-strong uppercase">{home.eyebrow}</p>
          <RevealHeading
            as="h2"
            id="ayush-heading"
            lines={[home.heading]}
            className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
          />
          <ScrollReveal as="p" variant={SlideUp} className="mx-auto mt-4 max-w-lg text-base text-mx-ink-soft">
            {home.description}
          </ScrollReveal>
        </div>

        <StaggerGroup className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" stagger={0.08} amount={0.2}>
          {fields.map((field, i) => {
            const Icon = FIELD_ICONS[i];
            return (
              <StaggerItem key={field.label} variant={ScaleIn}>
                <div className="group flex h-full flex-col gap-2.5 rounded-mx-md border border-mx-border bg-mx-surface-raised p-4 shadow-mx-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-mx-border-strong hover:shadow-mx-md">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong transition-transform duration-200 ease-out group-hover:scale-110">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <p className="font-display text-sm font-bold text-mx-ink">{field.label}</p>
                  <p className="text-xs leading-snug text-mx-ink-muted">{field.desc}</p>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <ScrollReveal as="p" variant={SlideUp} className="mx-auto mt-8 max-w-md text-center text-xs text-mx-ink-muted">
          {home.note}
        </ScrollReveal>
      </div>
    </section>
  );
}