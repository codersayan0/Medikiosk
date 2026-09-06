import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useTranslation } from "../../i18n";
import { microTransition, smallTransition } from "../../utils/motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Dialog rendered via portal. Locks background scroll, closes on Escape,
 * and returns focus behavior is left to the trigger via onClose.
 */
export function Modal({ isOpen, onClose, title, description, children, footer }: ModalProps) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4">
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
            ref={dialogRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mx-modal-title"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            transition={smallTransition}
            className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-mx-xl border border-mx-border bg-mx-surface-raised p-5 shadow-mx-lg sm:rounded-mx-xl sm:p-6"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 id="mx-modal-title" className="font-display text-lg font-bold text-mx-ink">
                  {title}
                </h2>
                {description && <p className="mt-1 text-sm text-mx-ink-muted">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t.a11y.closeDialog}
                className="shrink-0 rounded-full p-2 text-mx-ink-muted hover:bg-mx-surface-sunken"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div>{children}</div>
            {footer && <div className="mt-5 flex justify-end gap-2.5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
