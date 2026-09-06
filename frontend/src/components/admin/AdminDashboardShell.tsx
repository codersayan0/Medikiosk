import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AdminDashboardSidebar } from "./AdminDashboardSidebar";
import { AdminDashboardHeader } from "./AdminDashboardHeader";
import { pageTransition } from "../../utils/motion";

/**
 * Top-level route element for every `/admin/dashboard/*` page. Renders the
 * persistent sidebar + header shell around whichever admin page is active
 * (via <Outlet />). Desktop shows the full sidebar; mobile/tablet gets a
 * slide-over drawer triggered from the header's menu button — identical
 * structure to PatientDashboardShell so the admin surface feels like part
 * of the same product.
 */
export function AdminDashboardShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="flex h-screen overflow-hidden bg-mx-bg">
      <div className="hidden lg:block">
        <AdminDashboardSidebar />
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-mx-ink/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <div className="relative z-10">
            <AdminDashboardSidebar onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminDashboardHeader onOpenDrawer={() => setDrawerOpen(true)} />
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
  );
}