import { AlertOctagon, FileText, UserPlus, ClipboardList } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { MedicalIcon } from "../healthcare/MedicalIcon";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import { cn } from "../../utils/cn";
import { staggerContainer, staggerItem } from "../../utils/motion";
import { useDoctorNotifications } from "../../context/DoctorNotificationsContext";
import type { BadgeTone } from "../../types";
import type { DoctorNotificationKind } from "../../data/mockDoctorDashboard";

const NOTIF_ICON: Record<DoctorNotificationKind, typeof AlertOctagon> = {
  alert: AlertOctagon,
  document: FileText,
  patient: UserPlus,
  prescription: ClipboardList,
};

/** Same tone language as QuickActionsGrid (blue = patient, warning = document,
 * purple = prescription) plus danger for clinical alerts, so a notification's
 * color always matches the same action elsewhere in the dashboard. */
const NOTIF_TONE: Record<DoctorNotificationKind, BadgeTone> = {
  alert: "danger",
  document: "warning",
  patient: "blue",
  prescription: "purple",
};

interface RecentNotificationsListProps {
  /** Caps the number of notifications shown. */
  limit?: number;
}

/**
 * Recent Notifications list for the Overview page. Reads from
 * DoctorNotificationsContext — the same shared state the header's bell
 * dropdown uses — so marking a notification read here also clears it (and
 * updates the unread badge) up in the header, and vice versa.
 */
export function RecentNotificationsList({ limit }: RecentNotificationsListProps) {
  const prefersReducedMotion = useReducedMotion();
  const { notifications, markAsRead } = useDoctorNotifications();

  const rows = limit ? notifications.slice(0, limit) : notifications;

  if (rows.length === 0) {
    return (
      <EmptyState
        compact
        icon={<ClipboardList size={22} aria-hidden="true" />}
        title="No notifications"
        description="Lab results, document uploads, and other activity will show up here."
      />
    );
  }

  return (
    <motion.ul
      className="space-y-1"
      variants={prefersReducedMotion ? undefined : staggerContainer(0.06)}
      initial={prefersReducedMotion ? undefined : "hidden"}
      animate={prefersReducedMotion ? undefined : "show"}
    >
      {rows.map((n) => {
        const Icon = NOTIF_ICON[n.kind];
        return (
          <motion.li key={n.id} variants={prefersReducedMotion ? undefined : staggerItem}>
            <button
              type="button"
              onClick={() => markAsRead(n.id)}
              aria-label={`${n.title}, ${n.patientName}, ${n.time}${n.unread ? ", unread" : ""}`}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-mx-sm px-1.5 py-2 text-left transition-colors duration-150 hover:bg-mx-surface-sunken focus:outline-none focus-visible:ring-2 focus-visible:ring-mx-blue",
                n.unread && "bg-mx-blue-soft/30"
              )}
            >
              <MedicalIcon icon={Icon} tone={NOTIF_TONE[n.kind]} size={16} className="h-9 w-9" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className={cn("text-sm", n.unread ? "font-bold text-mx-ink" : "font-semibold text-mx-ink-soft")}>{n.title}</p>
                  {n.priority === "high" && (
                    <Badge tone="danger" className="px-1.5 py-0 text-[10px]">
                      High priority
                    </Badge>
                  )}
                </div>
                <p className="truncate text-xs text-mx-ink-muted">{n.patientName}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1 pt-0.5">
                <span className="text-[11px] text-mx-ink-muted">{n.time}</span>
                {n.unread && <span className="h-1.5 w-1.5 rounded-full bg-mx-blue" aria-hidden="true" />}
              </div>
            </button>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}