import { SectionHeader } from "../../../components/ui/SectionHeader";
import { Card, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { Badge } from "../../../components/ui/Badge";
import { QUEUE_PATIENTS } from "../../../data/mockDoctorDashboard";

/**
 * Patient Details → Basic Profile. Landing page for the "Patient Details"
 * sidebar group. The other Patient Details sub-sections (AI Clinical
 * Summary, AYUSH History, Documents, Medical Timeline, Safety Flags, Full
 * Interview Answers) route to DoctorComingSoonPage until a real
 * single-patient record model exists — see data/doctorDashboardNav.ts.
 */
export default function PatientDetailsBasicProfilePage() {
  return (
    <div>
      <SectionHeader
        eyebrow="Doctor Dashboard"
        title="Patient Details"
        description="Basic profile information for patients in today's queue"
      />
      <Card padded={false}>
        <div className="p-4 sm:p-5">
          <CardHeader>
            <CardTitle>Today's Patients</CardTitle>
          </CardHeader>
        </div>
        <ul className="divide-y divide-mx-border">
          {QUEUE_PATIENTS.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-mx-surface-sunken sm:px-5">
              <Avatar name={p.name} size={40} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-mx-ink">{p.name}</p>
                <p className="text-xs text-mx-ink-muted">{p.age} / {p.sex} · {p.id}</p>
              </div>
              <p className="text-sm text-mx-ink-soft">{p.complaint}</p>
              <Badge tone={p.tier === "emergency" ? "danger" : p.tier === "priority" ? "warning" : "blue"}>
                {p.tier === "normal" ? "Normal" : p.tier === "priority" ? "Priority" : "Emergency"}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}