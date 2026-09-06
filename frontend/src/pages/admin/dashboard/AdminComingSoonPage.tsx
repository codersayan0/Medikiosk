import { Construction } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";

interface AdminComingSoonPageProps {
  title: string;
}

/**
 * Shared placeholder for admin sidebar sections that are routed (so the
 * sidebar is fully clickable from day one) but not yet built out — Doctors,
 * Patients, Appointments, Medical Records, Organization Profile, Reports &
 * Analytics, Notifications, Settings, Privacy & Security. Swap the
 * corresponding route in routes/index.tsx for a real page as each section
 * ships; the sidebar itself never needs to change (see isBuilt flag in
 * data/adminDashboardNav.ts).
 */
export default function AdminComingSoonPage({ title }: AdminComingSoonPageProps) {
  return (
    <div>
      <h1 className="font-display mb-5 text-xl font-bold text-mx-ink">{title}</h1>
      <Card>
        <EmptyState
          icon={<Construction size={22} aria-hidden="true" />}
          title={`${title} is coming soon`}
          description="This section of the admin dashboard is planned for a future update."
        />
      </Card>
    </div>
  );
}