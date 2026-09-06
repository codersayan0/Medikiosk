import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { MedicalIcon } from "../healthcare/MedicalIcon";

interface DoctorComingSoonPageProps {
  title: string;
  icon?: LucideIcon;
}

/**
 * Placeholder for doctor sidebar destinations not yet built in this phase
 * (the Patient Details sub-sections beyond Basic Profile). Same pattern as
 * PatientComingSoonPage so the sidebar is fully clickable from day one —
 * a later phase swaps this out per-route without touching the sidebar.
 */
export function DoctorComingSoonPage({ title, icon = Construction }: DoctorComingSoonPageProps) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <MedicalIcon icon={icon} tone="purple" size={22} className="h-12 w-12" />
      <h1 className="font-display text-xl font-bold text-mx-ink">{title}</h1>
      <Badge tone="purple">This section is being built</Badge>
      <p className="max-w-sm text-sm text-mx-ink-muted">
        We're still putting this page together. Check back soon — everything else in your dashboard is ready to use.
      </p>
    </Card>
  );
}