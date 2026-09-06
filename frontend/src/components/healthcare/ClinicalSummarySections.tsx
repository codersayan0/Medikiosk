import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardTitle } from "../ui/Card";
import { MedicalIcon } from "./MedicalIcon";

/**
 * Small presentational building blocks shared by every "document-style"
 * clinical summary surface in MediKiosk — the dashboard's full-page AI
 * Health Summary (pages/patient/dashboard/records/AiHealthSummaryPage) and
 * the registration flow's Health Summary step (pages/patient/HealthSummaryStep).
 * Pulled out here so both render identical numbered-section / prose /
 * entry-list markup instead of keeping two copies that could drift apart.
 */

/** Numbered heading + generous whitespace wrapper for one summary section. */
export function Section({
  number,
  title,
  icon,
  children,
}: {
  number: number;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  const Icon = icon;
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2.5">
        <MedicalIcon icon={Icon} tone="purple" size={16} className="h-9 w-9" />
        <CardTitle className="text-base">
          <span className="mr-1.5 text-mx-ink-muted">{number}.</span>
          {title}
        </CardTitle>
      </div>
      {children}
    </Card>
  );
}

/** Plain descriptive paragraph for free-text fields (Overall Summary, HPI, Review of Systems, etc). */
export function Prose({ children }: { children: string }) {
  return <p className="text-sm leading-relaxed text-mx-ink-soft">{children}</p>;
}

/** label / detail (/ date) rows used for Past Medical History, Surgery History, Family History, etc. */
export function EntryList({
  entries,
  emptyText,
}: {
  entries: { label: string; detail: string; date?: string }[];
  emptyText: string;
}) {
  if (entries.length === 0) return <p className="text-sm text-mx-ink-muted">{emptyText}</p>;
  return (
    <ul className="space-y-2.5">
      {entries.map((e, i) => (
        <li key={`${e.label}-${i}`} className="text-sm leading-relaxed">
          <span className="font-semibold text-mx-ink">{e.label}</span>
          {e.date && <span className="text-mx-ink-muted"> ({e.date})</span>}
          <span className="text-mx-ink-soft"> — {e.detail}</span>
        </li>
      ))}
    </ul>
  );
}