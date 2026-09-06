import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoreVertical, Eye, CalendarClock, XCircle } from "lucide-react";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { dropdownVariants } from "../../utils/motion";

interface AppointmentRowMenuProps {
  onView: () => void;
  patientName: string;
}

/** Row-level kebab menu for appointment rows: View Details, Reschedule, Cancel. */
export function AppointmentRowMenu({ onView, patientName }: AppointmentRowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false));

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
        aria-label={`More actions for ${patientName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-mx-sm text-mx-ink-muted transition-colors duration-150 hover:bg-mx-surface-sunken"
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
            className="absolute right-0 top-full z-20 mt-1.5 w-48 overflow-hidden rounded-mx-md border border-mx-border bg-mx-surface-raised py-1.5 shadow-mx-lg"
          >
            <MenuItem icon={Eye} label="View Details" onClick={() => run(onView)} />
            <MenuItem icon={CalendarClock} label="Reschedule" onClick={() => run(() => {})} />
            <MenuItem icon={XCircle} label="Cancel Appointment" tone="danger" onClick={() => run(() => {})} />
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
  tone?: "default" | "danger";
}) {
  const toneClass = tone === "danger" ? "text-mx-danger hover:bg-mx-danger-soft" : "text-mx-ink-soft hover:bg-mx-surface-sunken";
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