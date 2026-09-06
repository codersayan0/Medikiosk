import { Users, Building2, ShieldAlert, Settings2 } from "lucide-react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Card, CardHeader, CardTitle } from "../../components/ui/Card";
import { HealthStatusCard } from "../../components/healthcare/HealthStatusCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { ADMIN_NAV } from "../../data/navigation";

export default function AdminDashboardPage() {
  return (
    <DashboardLayout navItems={ADMIN_NAV} userName="Admin" pageTitle="Dashboard">
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <HealthStatusCard icon={Users} tone="blue" title="Registered patients" value="0" />
        <HealthStatusCard icon={Building2} tone="green" title="Care centers" value="0" />
        <HealthStatusCard icon={ShieldAlert} tone="danger" title="Flagged records" value="0" />
        <HealthStatusCard icon={Settings2} tone="purple" title="Open configs" value="0" />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>System overview</CardTitle>
        </CardHeader>
        <EmptyState
          title="Admin tooling arrives in a future part"
          description="Facility management, user roles, and audit logs are out of scope for Part A."
        />
      </Card>
    </DashboardLayout>
  );
}
