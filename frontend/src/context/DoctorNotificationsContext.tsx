import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { DOCTOR_NOTIFICATIONS, type DoctorNotification } from "../data/mockDoctorDashboard";

interface DoctorNotificationsContextValue {
  notifications: DoctorNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const DoctorNotificationsContext = createContext<DoctorNotificationsContextValue | null>(null);

/**
 * Single source of truth for the Doctor Dashboard's notification data —
 * seeded from the existing DOCTOR_NOTIFICATIONS mock (data/mockDoctorDashboard.ts),
 * the same data both DoctorDashboardHeader (bell icon + dropdown) and the
 * Overview page's "Recent Notifications" card already rendered from
 * independently. Lifting the read/unread state up here (instead of each
 * place holding its own copy) is what actually connects the two existing
 * surfaces of one notification system, rather than bolting on a second,
 * unrelated one.
 *
 * Mounted once in DoctorDashboardShell, above both the header and the
 * routed page content, so every `/doctor/dashboard/*` page shares it.
 */
export function DoctorNotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<DoctorNotification[]>(DOCTOR_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications]);

  const value = useMemo(
    () => ({ notifications, unreadCount, markAsRead, markAllAsRead }),
    [notifications, unreadCount]
  );

  return <DoctorNotificationsContext.Provider value={value}>{children}</DoctorNotificationsContext.Provider>;
}

export function useDoctorNotifications() {
  const ctx = useContext(DoctorNotificationsContext);
  if (!ctx) {
    throw new Error("useDoctorNotifications must be used within a DoctorNotificationsProvider");
  }
  return ctx;
}