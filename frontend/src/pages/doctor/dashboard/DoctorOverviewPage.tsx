import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Users, Hourglass, Star, Stethoscope, Timer, ChevronLeft, ChevronRight, CalendarPlus, AlertTriangle } from "lucide-react";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { Card, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { TodaysSummaryDonut } from "../../../components/doctor/TodaysSummaryDonut";
import { DoctorStatCard } from "../../../components/doctor/DoctorStatCard";
import { PatientQueueTable } from "../../../components/doctor/PatientQueueTable";
import { TriageAlertsList } from "../../../components/doctor/TriageAlertsList";
import { TodaysAppointmentsTable } from "../../../components/doctor/TodaysAppointmentsTable";
import { QuickActionsGrid } from "../../../components/doctor/QuickActionsGrid";
import { RecentPatientsTable } from "../../../components/doctor/RecentPatientsTable";
import { RecentNotificationsList } from "../../../components/doctor/RecentNotificationsList";
import { DOCTOR_DASHBOARD_ROOT } from "../../../data/doctorDashboardNav";
import {
  DOCTOR_SUMMARY_STATS,
  TODAYS_SUMMARY_SLICES,
  TODAYS_SUMMARY_TOTAL,
  type QueueRiskTier,
} from "../../../data/mockDoctorDashboard";
import { useDoctorNotifications } from "../../../context/DoctorNotificationsContext";
import { staggerContainer } from "../../../utils/motion";

/**
 * Doctor Overview — the landing page of the Doctor Dashboard. Summary
 * cards, today's schedule, live patient queue (Normal/Priority/Emergency),
 * triage alerts, a today's-summary donut, quick actions, recent patients,
 * and recent notifications — matching the reference design end to end.
 * All data comes from data/mockDoctorDashboard.ts.
 */
export default function DoctorOverviewPage() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [queueTier, setQueueTier] = useState<QueueRiskTier>("normal");
  const { unreadCount, markAllAsRead } = useDoctorNotifications();

  return (
    <div>
      <SectionHeader
        eyebrow="Doctor Dashboard"
        title="Overview"
        description="Complete practice overview and patient insights"
      />

      {/* Summary cards */}
      <motion.div
        variants={prefersReducedMotion ? undefined : staggerContainer()}
        initial={prefersReducedMotion ? undefined : "hidden"}
        animate={prefersReducedMotion ? undefined : "show"}
        className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        <DoctorStatCard icon={Users} tone="blue" title="Total Patients" value={DOCTOR_SUMMARY_STATS.totalPatients} meta={DOCTOR_SUMMARY_STATS.totalPatientsTrend} />
        <DoctorStatCard icon={Hourglass} tone="warning" title="Waiting Patients" value={DOCTOR_SUMMARY_STATS.waitingPatients} meta="Currently in queue" />
        <DoctorStatCard icon={Star} tone="danger" title="Priority Patients" value={DOCTOR_SUMMARY_STATS.priorityPatients} meta="Need attention" />
        <DoctorStatCard
          icon={Stethoscope}
          tone="green"
          title="Today's Consultations"
          value={DOCTOR_SUMMARY_STATS.todaysConsultations}
          meta={`Completed: ${DOCTOR_SUMMARY_STATS.todaysConsultationsCompleted}`}
        />
        <DoctorStatCard icon={Timer} tone="purple" title="Avg. Consultation Time" value={`${DOCTOR_SUMMARY_STATS.avgConsultationMinutes} min`} meta="This week" />
      </motion.div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left + center column */}
        <div className="space-y-5 lg:col-span-2">
          {/* Today's Appointments */}
          <Card>
            <CardHeader className="flex-wrap">
              <div>
                <CardTitle>Today's Appointments</CardTitle>
                <p className="mt-0.5 text-xs text-mx-ink-muted">Monday, 24 August 2026</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Previous day" className="rounded-mx-sm border border-mx-border p-1.5 text-mx-ink-soft transition-colors hover:bg-mx-surface-sunken">
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <button type="button" aria-label="Next day" className="rounded-mx-sm border border-mx-border p-1.5 text-mx-ink-soft transition-colors hover:bg-mx-surface-sunken">
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<CalendarPlus size={15} aria-hidden="true" />}
                  className="h-9"
                  onClick={() => navigate(`${DOCTOR_DASHBOARD_ROOT}/appointments`)}
                >
                  New Appointment
                </Button>
              </div>
            </CardHeader>
            <TodaysAppointmentsTable limit={6} />
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => navigate(`${DOCTOR_DASHBOARD_ROOT}/appointments`)}
                className="text-sm font-semibold text-mx-green-strong hover:underline"
              >
                View Full Schedule →
              </button>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <QuickActionsGrid />
          </Card>

          {/* Recent Patients */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
              <button
                type="button"
                onClick={() => navigate(`${DOCTOR_DASHBOARD_ROOT}/queue/normal`)}
                className="text-xs font-semibold text-mx-green-strong hover:underline"
              >
                View All
              </button>
            </CardHeader>
            <RecentPatientsTable limit={5} />
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Patient Queue (Today) */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Queue (Today)</CardTitle>
              <button
                type="button"
                onClick={() => navigate(`${DOCTOR_DASHBOARD_ROOT}/queue/${queueTier}`)}
                className="text-xs font-semibold text-mx-green-strong hover:underline"
              >
                View All
              </button>
            </CardHeader>
            <PatientQueueTable activeTier={queueTier} onTierChange={setQueueTier} limit={5} />
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => navigate(`${DOCTOR_DASHBOARD_ROOT}/queue/${queueTier}`)}
                className="text-sm font-semibold text-mx-green-strong hover:underline"
              >
                View All Patients in Queue →
              </button>
            </div>
          </Card>

          {/* Triage Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-mx-danger" aria-hidden="true" />
                Triage Alerts
              </CardTitle>
              <button
                type="button"
                onClick={() => navigate(`${DOCTOR_DASHBOARD_ROOT}/triage-alerts`)}
                className="text-xs font-semibold text-mx-green-strong hover:underline"
              >
                View All
              </button>
            </CardHeader>
            <TriageAlertsList limit={3} layout="stack" />
          </Card>

          {/* Today's Summary donut */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Summary</CardTitle>
            </CardHeader>
            <TodaysSummaryDonut
              slices={TODAYS_SUMMARY_SLICES}
              total={TODAYS_SUMMARY_TOTAL}
              centerLabel="Total"
              size={168}
            />
            <p className="mt-3 text-center text-xs text-mx-ink-muted">
              {TODAYS_SUMMARY_TOTAL} patients tracked today across normal, priority, and emergency queues.
            </p>
          </Card>

          {/* Recent Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Recent Notifications
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-mx-danger px-1.5 text-[11px] font-bold text-mx-ink-inverse">
                    {unreadCount}
                  </span>
                )}
              </CardTitle>
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs font-semibold text-mx-green-strong hover:underline"
              >
                View All
              </button>
            </CardHeader>
            <RecentNotificationsList limit={4} />
          </Card>
        </div>
      </div>
    </div>
  );
}