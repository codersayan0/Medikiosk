import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DoctorDashboardSidebar } from "./DoctorDashboardSidebar";
import { DoctorDashboardHeader } from "./DoctorDashboardHeader";
import { DoctorNotificationsProvider } from "../../context/DoctorNotificationsContext";
import { pageTransition } from "../../utils/motion";

export function DoctorDashboardShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <DoctorNotificationsProvider>
      <div className="flex h-screen overflow-hidden bg-mx-bg">
        <div className="hidden lg:block">
          <DoctorDashboardSidebar />
        </div>

        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-mx-ink/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            <div className="relative z-10">
              <DoctorDashboardSidebar onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <DoctorDashboardHeader onOpenDrawer={() => setDrawerOpen(true)} />
          <main className="mx-scrollbar flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={prefersReducedMotion ? false : "initial"}
                animate="animate"
                exit={prefersReducedMotion ? undefined : "exit"}
                variants={prefersReducedMotion ? undefined : pageTransition}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </DoctorNotificationsProvider>
  );
}