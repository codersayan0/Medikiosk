import { ArrowRight, AlertTriangle, Bot, History, Pill, Scissors, Stethoscope, User, UserCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "../home/RevealHeading";
import { ScrollReveal, StaggerGroup, StaggerItem } from "../home/Reveal";
import { ProductTransition, ScaleIn, SlideUp } from "../home/motion";
import { cn } from "../../../utils/cn";

const CATEGORY_ICONS: LucideIcon[] = [Stethoscope, History, Pill, AlertTriangle, Users, Scissors];
type StatusKey = "patientProvided" | "aiStructured" | "doctorVerified";
const CATEGORY_STATUS: StatusKey[] = ["aiStructured", "doctorVerified", "patientProvided", "doctorVerified", "patientProvided", "aiStructured"];

const STATUS_STYLES: Record<StatusKey, string> = {
  patientProvided: "border-mx-purple/30 bg-mx-purple-soft text-mx-purple",
  aiStructured: "border-mx-blue/30 bg-mx-blue-soft text-mx-blue",
  doctorVerified: "border-mx-green/40 bg-mx-green-soft text-mx-green-strong",
};

const FLOW_ICONS: LucideIcon[] = [User, Bot, UserCheck];

/**
 * SECTION 4 — MEDICAL HISTORY
 * A structured-record card grid (six categories, each tagged with its
 * current status) paired with a compact flow strip showing how information
 * moves: patient → AI organization → doctor verification.
 */
export function FeaturesMedicalHistory() {
  const { t } = useTranslation();
  const home = t.features.medicalHistory;

  const categories = [
    home.categories.presentIllness,
    home.categories.pastHistory,
    home.categories.medicines,
    home.categories.allergies,
    home.categories.familyHistory,
    home.categories.surgeries,
  ];

  const statusLabel = (key: StatusKey) =>
    key === "patientProvided" ? home.statusLabels.patientProvided : key === "aiStructured" ? home.statusLabels.aiStructured : home.statusLabels.doctorVerified;

  const flowLabels = [home.flow.patient, home.flow.ai, home.flow.doctor];

  return (
    <section className="bg-mx-bg-canvas/68 py-16 sm:py-24" aria-labelledby="medical-history-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold tracking-wide text-mx-blue uppercase">{home.eyebrow}</p>
          <RevealHeading
            as="h2"
            id="medical-history-heading"
            lines={[home.heading]}
            className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
          />
          <ScrollReveal as="p" variant={SlideUp} className="mx-auto mt-4 max-w-lg text-base text-mx-ink-soft">
            {home.description}
          </ScrollReveal>
        </div>

        {/* Structured category grid */}
        <StaggerGroup className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4" stagger={0.08} amount={0.2}>
          {categories.map((label, i) => {
            const Icon = CATEGORY_ICONS[i];
            const status = CATEGORY_STATUS[i];
            return (
              <StaggerItem key={label} variant={ScaleIn}>
                <div className="group flex h-full flex-col gap-3 rounded-mx-md border border-mx-border bg-mx-surface-raised p-4 shadow-mx-sm transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-mx-border-strong hover:shadow-mx-md">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mx-surface-sunken text-mx-ink-soft transition-transform duration-200 ease-out group-hover:scale-110">
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-tight font-semibold text-mx-ink">{label}</p>
                  <span
                    className={cn(
                      "mt-auto inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap",
                      STATUS_STYLES[status]
                    )}
                  >
                    {statusLabel(status)}
                  </span>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        {/* Flow strip: patient → AI → doctor */}
        <ScrollReveal variant={SlideUp} amount={0.3} className="mt-12">
          <StaggerGroup
            as="ol"
            className="mx-auto flex max-w-xl items-center justify-center gap-2 rounded-mx-lg border border-mx-border bg-mx-surface px-4 py-5 shadow-mx-sm sm:gap-4 sm:px-8"
            stagger={0.1}
            amount={0.4}
          >
            {flowLabels.map((label, i) => {
              const Icon = FLOW_ICONS[i];
              return (
                <StaggerItem key={label} as="li" variant={ProductTransition} className="flex items-center gap-2 sm:gap-4">
                  <div className="flex flex-col items-center gap-1.5 text-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mx-surface-sunken text-mx-ink-soft">
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <p className="max-w-[5.5rem] text-[11px] leading-tight font-semibold text-mx-ink sm:text-xs">{label}</p>
                  </div>
                  {i < flowLabels.length - 1 && (
                    <ArrowRight size={16} className="shrink-0 text-mx-ink-muted" aria-hidden="true" />
                  )}
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </ScrollReveal>
      </div>
    </section>
  );
}