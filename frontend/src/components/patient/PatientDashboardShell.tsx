import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PatientDashboardSidebar } from "./PatientDashboardSidebar";
import { PatientDashboardHeader } from "./PatientDashboardHeader";
import { pageTransition } from "../../utils/motion";
import { ErrorState } from "../ui/ErrorState";
import { DashboardSkeleton } from "../ui/Skeleton";
import { usePatientDataState } from "../../context/PatientContext";

/**
 * Top-level route element for every `/patient/dashboard/*` page. Renders
 * the persistent sidebar + header shell around whichever page is active
 * (via <Outlet />), and provides the shared patient record to the whole
 * subtree. Desktop shows the full sidebar; mobile/tablet gets a slide-over
 * drawer triggered from the header's menu button.
 */
export function PatientDashboardShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const { loading, error, refreshPatient } = usePatientDataState();

return (
  <div className="flex h-screen overflow-hidden bg-mx-bg">
        <div className="hidden lg:block">
          <PatientDashboardSidebar />
        </div>

        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="absolute inset-0 bg-mx-ink/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
            <div className="relative z-10">
              <PatientDashboardSidebar onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <PatientDashboardHeader onOpenDrawer={() => setDrawerOpen(true)} />
          <main className="mx-scrollbar mx-ambient-layer flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            <AnimatePresence mode="wait" initial={false}>
              {loading ? (
                <DashboardSkeleton />
              ) : error ? (
                <ErrorState
                  title="Unable to load your patient data."
                  description="Your live patient record could not be loaded. Your dashboard will not fall back to demo data."
                  onRetry={() => void refreshPatient()}
                />
              ) : (
                <motion.div
                  key={location.pathname}
                  initial={prefersReducedMotion ? false : "initial"}
                  animate="animate"
                  exit={prefersReducedMotion ? undefined : "exit"}
                  variants={prefersReducedMotion ? undefined : pageTransition}
                >
                  <Outlet />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
   
  );
}