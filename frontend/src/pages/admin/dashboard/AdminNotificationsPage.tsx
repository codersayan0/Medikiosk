import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellOff,
  CheckCheck,
  UserPlus,
  FileStack,
  Stethoscope,
  Megaphone,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SegmentedTabs } from "../../../components/ui/SegmentedTabs";
import { MedicalIcon } from "../../../components/healthcare/MedicalIcon";
import { useAdmin } from "../../../context/AdminContext";
import { ADMIN_DASHBOARD_ROOT } from "../../../data/adminDashboardNav";
import type { VerificationAuditEventType } from "../../../types";
import type { BadgeTone } from "../../../types";
import { cn } from "../../../utils/cn";

type NotificationKind = "application" | "document" | "doctor" | "system";
type TabId = "All" | "Applications" | "Documents" | "Doctors" | "System";

const EVENT_KIND: Record<VerificationAuditEventType, NotificationKind> = {
  application_submitted: "application",
  application_approved: "application",
  application_rejected: "application",
  correction_requested: "application",
  document_verified: "document",
  document_rejected: "document",
  document_reupload_requested: "document",
  checklist_item_verified: "document",
  doctor_suspended: "doctor",
  doctor_activated: "doctor",
};

const KIND_TAB: Record<NotificationKind, Exclude<TabId, "All">> = {
  application: "Applications",
  document: "Documents",
  doctor: "Doctors",
  system: "System",
};

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  application: UserPlus,
  document: FileStack,
  doctor: Stethoscope,
  system: Megaphone,
};

const KIND_TONE: Record<NotificationKind, BadgeTone> = {
  application: "blue",
  document: "green",
  doctor: "purple",
  system: "neutral",
};

interface AdminNotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  kind: NotificationKind;
  applicationId?: string;
}

// Frontend-only "system" notices — stand in for real platform-level alerts
// (report generation, scheduled maintenance) until a backend feed exists.
const SYSTEM_NOTIFICATIONS: AdminNotificationItem[] = [
  {
    id: "system-reports-ready",
    title: "Monthly report ready",
    description: "Your Reports & Analytics summary for this month has been generated.",
    timestamp: "28 Aug 2026, 08:00 AM",
    kind: "system",
  },
  {
    id: "system-maintenance",
    title: "Scheduled maintenance completed",
    description: "MediKiosk platform maintenance finished with no disruption to your organization.",
    timestamp: "22 Aug 2026, 02:00 AM",
    kind: "system",
  },
];

export default function AdminNotificationsPage() {
  const { applications } = useAdmin();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabId>("All");
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notifications = useMemo(() => {
    const fromApplications: AdminNotificationItem[] = applications.flatMap((app) =>
      app.auditHistory.map((event) => ({
        id: `${app.id}-${event.id}`,
        title: event.label,
        description: event.detail ?? `${app.personal.fullName} · ${app.professional.specialization}`,
        timestamp: event.timestamp,
        kind: EVENT_KIND[event.type],
        applicationId: app.id,
      }))
    );

    return [...fromApplications, ...SYSTEM_NOTIFICATIONS].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [applications]);

  const filtered = useMemo(
    () => (tab === "All" ? notifications : notifications.filter((n) => KIND_TAB[n.kind] === tab)),
    [notifications, tab]
  );

  const tabs = useMemo(() => {
    const ids: TabId[] = ["All", "Applications", "Documents", "Doctors", "System"];
    return ids.map((id) => ({
      id,
      label: id,
      count: id === "All" ? notifications.length : notifications.filter((n) => KIND_TAB[n.kind] === id).length,
    }));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  const markRead = (id: string) => setReadIds((prev) => new Set(prev).add(id));
  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.id)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">Notifications</h1>
          <p className="mt-1 text-sm text-mx-ink-muted">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.` : "You're all caught up."}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          icon={<CheckCheck size={14} aria-hidden="true" />}
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          Mark All as Read
        </Button>
      </div>

      <SegmentedTabs tabs={tabs} active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BellOff size={22} aria-hidden="true" />}
          title="No Notifications"
          description="You have no notifications in this category yet."
        />
      ) : (
        <Card padded={false} className="overflow-hidden">
          <ul className="divide-y divide-mx-border">
            {filtered.map((n) => (
              <NotificationRow
                key={n.id}
                notification={n}
                unread={!readIds.has(n.id)}
                onMarkRead={markRead}
                onOpen={() =>
                  n.applicationId && navigate(`${ADMIN_DASHBOARD_ROOT}/doctor-applications/${n.applicationId}`)
                }
              />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function NotificationRow({
  notification,
  unread,
  onMarkRead,
  onOpen,
}: {
  notification: AdminNotificationItem;
  unread: boolean;
  onMarkRead: (id: string) => void;
  onOpen: () => void;
}) {
  const Icon = KIND_ICON[notification.kind];
  return (
    <li className={cn("flex items-start gap-3 p-4", unread && "bg-mx-green-soft/30")}>
      <button
        type="button"
        onClick={onOpen}
        disabled={!notification.applicationId}
        className={cn("flex flex-1 items-start gap-3 text-left", notification.applicationId && "cursor-pointer")}
      >
        <MedicalIcon icon={Icon} tone={KIND_TONE[notification.kind]} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mx-green" aria-hidden="true" />}
            <p className="truncate text-sm font-semibold text-mx-ink">{notification.title}</p>
          </div>
          <p className="mt-0.5 text-sm text-mx-ink-soft">{notification.description}</p>
          <p className="mt-1 text-xs text-mx-ink-muted">{notification.timestamp}</p>
        </div>
      </button>
      {unread && (
        <button
          type="button"
          onClick={() => onMarkRead(notification.id)}
          className="shrink-0 rounded-mx-sm px-2.5 py-1.5 text-xs font-semibold text-mx-green-strong hover:bg-mx-surface-sunken"
        >
          Mark as Read
        </button>
      )}
    </li>
  );
}
