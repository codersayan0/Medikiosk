import { useMemo, useState } from "react";
import {
  Bell,
  BellOff,
  CheckCheck,
  FlaskConical,
  ClipboardCheck,
  FileStack,
  CalendarClock,
  UserRound,
  Settings2,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { SegmentedTabs } from "../../../components/ui/SegmentedTabs";
import { MedicalIcon } from "../../../components/healthcare/MedicalIcon";
import { useNotifications } from "../../../context/PatientContext";
import type { NotificationItem, NotificationKind } from "../../../data/patientRecord";
import type { BadgeTone } from "../../../types";
import { cn } from "../../../utils/cn";

type TabId = "All" | "Patient" | "Documents" | "Prescriptions" | "Lab Reports" | "Visits" | "System";

const KIND_TAB: Record<NotificationKind, Exclude<TabId, "All">> = {
  record: "Patient",
  document: "Documents",
  prescription: "Prescriptions",
  lab: "Lab Reports",
  visit: "Visits",
  system: "System",
};

const KIND_ICON: Record<NotificationKind, typeof Bell> = {
  record: UserRound,
  document: FileStack,
  prescription: ClipboardCheck,
  lab: FlaskConical,
  visit: CalendarClock,
  system: Settings2,
};

const KIND_TONE: Record<NotificationKind, BadgeTone> = {
  record: "blue",
  document: "green",
  prescription: "purple",
  lab: "blue",
  visit: "warning",
  system: "neutral",
};

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useNotifications();
  const [tab, setTab] = useState<TabId>("All");

  const filtered = useMemo(
    () => (tab === "All" ? notifications : notifications.filter((n) => KIND_TAB[n.kind] === tab)),
    [notifications, tab]
  );

  const tabs = useMemo(() => {
    const ids: TabId[] = ["All", "Patient", "Documents", "Prescriptions", "Lab Reports", "Visits", "System"];
    return ids.map((id) => ({
      id,
      label: id,
      count: id === "All" ? notifications.length : notifications.filter((n) => KIND_TAB[n.kind] === id).length,
    }));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

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
          onClick={markAllNotificationsRead}
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
              <NotificationRow key={n.id} notification={n} onMarkRead={markNotificationRead} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function NotificationRow({
  notification,
  onMarkRead,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
}) {
  const Icon = KIND_ICON[notification.kind];
  return (
    <li className={cn("flex items-start gap-3 p-4", !notification.read && "bg-mx-green-soft/30")}>
      <MedicalIcon icon={Icon} tone={KIND_TONE[notification.kind]} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {!notification.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mx-green" aria-hidden="true" />}
          <p className="truncate text-sm font-semibold text-mx-ink">{notification.title}</p>
        </div>
        <p className="mt-0.5 text-sm text-mx-ink-soft">{notification.description}</p>
        <p className="mt-1 text-xs text-mx-ink-muted">{notification.timestamp}</p>
      </div>
      {!notification.read && (
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
