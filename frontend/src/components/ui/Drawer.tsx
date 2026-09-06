import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "../../i18n";
import { microTransition, entranceTransition } from "../../utils/motion";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  headerExtra?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Slide-in detail panel — the "drawer" counterpart to Modal.tsx, used for
 * richer record views (Patient profile, Appointment detail) that need more
 * room than a centered dialog: full height, anchored to the right on
 * desktop, a bottom sheet on mobile. Shares Modal's portal/scroll-lock/Esc
 * behavior and color tokens so it reads as the same design system, just a
 * different shape for a different amount of content.
 */
export function Drawer({ isOpen, onClose, title, description, headerExtra, children, footer }: DrawerProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-end sm:items-stretch">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={microTransition}
            className="absolute inset-0 bg-mx-ink/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mx-drawer-title"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
            transition={entranceTransition}
            className="relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-mx-xl border border-mx-border bg-mx-surface-raised shadow-mx-lg sm:max-h-screen sm:w-full sm:max-w-md sm:rounded-none sm:rounded-l-mx-xl md:max-w-lg"
          >
            <div className="flex items-start justify-between gap-4 border-b border-mx-border p-5">
              <div className="min-w-0">
                <h2 id="mx-drawer-title" className="font-display truncate text-lg font-bold text-mx-ink">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm text-mx-ink-muted">{description}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {headerExtra}
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={t.a11y.closeDialog}
                  className="rounded-full p-2 text-mx-ink-muted hover:bg-mx-surface-sunken"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mx-scrollbar flex-1 overflow-y-auto p-5">{children}</div>

            {footer && <div className="flex flex-wrap justify-end gap-2.5 border-t border-mx-border p-4 sm:p-5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
