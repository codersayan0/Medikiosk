import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical, Eye, FileText, History, Ban, ShieldCheck } from "lucide-react";
import type { DoctorApplication } from "../../types";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { dropdownVariants } from "../../utils/motion";
import { ADMIN_DASHBOARD_ROOT } from "../../data/adminDashboardNav";
import { getDoctorDisplayStatus } from "./DoctorStatusBadge";

interface DoctorActionsMenuProps {
  application: DoctorApplication;
  onViewDocuments: () => void;
  onViewHistory: () => void;
  onSuspend: () => void;
  onActivate: () => void;
}

/** Row-level kebab menu for the Doctors table/cards: View Profile, View Documents, Verification History, Suspend/Activate. */
export function DoctorActionsMenu({ application, onViewDocuments, onViewHistory, onSuspend, onActivate }: DoctorActionsMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

  const status = getDoctorDisplayStatus(application);
  const isPending = status === "pending";

  const run = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label="More actions"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-mx-sm text-mx-ink-muted transition-colors duration-150 hover:bg-mx-surface-sunken"
      >
        <MoreVertical size={16} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial="hidden"
            animate="show"
            exit="exit"
            variants={dropdownVariants}
            role="menu"
            className="absolute right-0 top-full z-20 mt-1.5 w-56 overflow-hidden rounded-mx-md border border-mx-border bg-mx-surface-raised py-1.5 shadow-mx-lg"
          >
            <MenuItem
              icon={Eye}
              label={isPending ? "Review Application" : "View Profile"}
              onClick={() =>
                run(() =>
                  navigate(
                    isPending
                      ? `${ADMIN_DASHBOARD_ROOT}/doctor-applications/${application.id}`
                      : `${ADMIN_DASHBOARD_ROOT}/doctors/${application.id}`
                  )
                )
              }
            />
            <MenuItem icon={FileText} label="View Documents" onClick={() => run(onViewDocuments)} />
            <MenuItem icon={History} label="Verification History" onClick={() => run(onViewHistory)} />
            {!isPending &&
              (status === "suspended" ? (
                <MenuItem icon={ShieldCheck} label="Activate" tone="green" onClick={() => run(onActivate)} />
              ) : (
                <MenuItem icon={Ban} label="Suspend" tone="danger" onClick={() => run(onSuspend)} />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
  tone = "default",
}: {
  icon: typeof Eye;
  label: string;
  onClick: () => void;
  tone?: "default" | "green" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-mx-danger hover:bg-mx-danger-soft"
      : tone === "green"
        ? "text-mx-green-strong hover:bg-mx-green-soft"
        : "text-mx-ink-soft hover:bg-mx-surface-sunken";
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-semibold transition-colors duration-150 ${toneClass}`}
    >
      <Icon size={15} aria-hidden="true" />
      {label}
    </button>
  );
}