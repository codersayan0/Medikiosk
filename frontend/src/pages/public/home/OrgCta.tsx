import { Link } from "react-router-dom";
import { Building2, Stethoscope, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "./RevealHeading";
import { StaggerGroup, StaggerItem } from "./Reveal";
import { SlideUp } from "./motion";

const BUTTON_ICONS: LucideIcon[] = [User, Stethoscope, Building2];

/**
 * SECTION 27 — FINAL ORGANIZATION CTA
 * A second, distinct call to action aimed at organizations rather than
 * individual patients — three role-based entry points that route to
 * future placeholder pages.
 */
export function OrgCta() {
  const { t } = useTranslation();
  const home = t.home.phase3.orgCta;

  return (
    <section className="bg-mx-ink py-20 sm:py-28" aria-labelledby="orgcta-heading">
      <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
        <RevealHeading
          as="h2"
          id="orgcta-heading"
          lines={home.headline}
          className="font-display text-3xl leading-tight font-extrabold tracking-tight text-mx-ink-inverse sm:text-5xl"
        />

        <StaggerGroup as="div" className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row" stagger={0.1} amount={0.4}>
          {home.buttons.map((button, i) => {
            const Icon = BUTTON_ICONS[i];
            return (
              <StaggerItem key={button.label} variant={SlideUp} className="w-full sm:w-auto">
                <Link
                  to={button.to}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-mx-md border border-mx-ink-inverse/20 bg-mx-ink-soft/20 px-6 text-sm font-semibold text-mx-ink-inverse transition-colors hover:border-mx-green hover:bg-mx-green/10 sm:w-auto"
                >
                  <Icon size={16} aria-hidden="true" />
                  {button.label}
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
