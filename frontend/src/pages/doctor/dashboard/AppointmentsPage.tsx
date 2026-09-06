import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { Card, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { TodaysAppointmentsTable } from "../../../components/doctor/TodaysAppointmentsTable";

/**
 * Dedicated Appointments page — a first-class sidebar item (per the
 * requirement that Appointments must not live only inside the Overview
 * body). Reuses TodaysAppointmentsTable, the same component shown as a
 * preview on Overview.
 */
export default function AppointmentsPage() {
  return (
    <div>
      <SectionHeader
        eyebrow="Doctor Dashboard"
        title="Appointments"
        description="Your full consultation schedule for the day"
      />
      <Card>
        <CardHeader className="flex-wrap">
          <div>
            <CardTitle>Monday, 24 August 2026</CardTitle>
            <p className="mt-0.5 text-xs text-mx-ink-muted">8 slots · 6 booked · 1 available · 1 break</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous day" className="rounded-mx-sm border border-mx-border p-1.5 text-mx-ink-soft transition-colors hover:bg-mx-surface-sunken">
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button type="button" aria-label="Next day" className="rounded-mx-sm border border-mx-border p-1.5 text-mx-ink-soft transition-colors hover:bg-mx-surface-sunken">
              <ChevronRight size={16} aria-hidden="true" />
            </button>
            <Button size="sm" variant="primary" icon={<CalendarPlus size={15} aria-hidden="true" />} className="h-9">
              New Appointment
            </Button>
          </div>
        </CardHeader>
        <TodaysAppointmentsTable />
      </Card>
    </div>
  );
}