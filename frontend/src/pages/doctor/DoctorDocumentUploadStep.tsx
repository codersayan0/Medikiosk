import { useEffect, useRef } from "react";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, FileText, Trash2, UploadCloud } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { DoctorRegistrationProgress } from "../../components/doctor/DoctorRegistrationProgress";
import { DoctorRegistrationSupportSidebar } from "../../components/doctor/DoctorRegistrationSupportSidebar";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/cn";
import type { DoctorDocumentSlot } from "./doctorRegisterTypes";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

interface DoctorDocumentUploadStepProps {
  slots: DoctorDocumentSlot[];
  setSlots: Dispatch<SetStateAction<DoctorDocumentSlot[]>>;
  error: string | null;
  isSubmitting: boolean;
  onContinue: () => void;
  onBack: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Doctor Registration — Step 4 (Documents / License Upload), shown after
 * Professional Information. Four dedicated upload slots (three required,
 * one optional) rather than the patient flow's free-form
 * drag-and-drop-into-categories uploader — professional credentialing
 * needs a specific, known document per slot, not an AI-guessed category.
 * Same header/3-column/card shell as every other full-page step.
 */
export function DoctorDocumentUploadStep({ slots, setSlots, error, isSubmitting, onContinue, onBack }: DoctorDocumentUploadStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const { setHasPageHeader } = useTheme();
  const { showToast } = useToast();
  const fileInputRefs = useRef<Map<string, HTMLInputElement | null>>(new Map());

  useEffect(() => {
    setHasPageHeader(true);
    return () => setHasPageHeader(false);
  }, [setHasPageHeader]);

  function handleFileChange(slotId: DoctorDocumentSlot["id"], event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      showToast({ tone: "error", title: `${file.name} is larger than 5 MB.` });
      return;
    }

    setSlots((prev) => prev.map((slot) => (slot.id === slotId ? { ...slot, file } : slot)));
  }

  function handleRemove(slotId: DoctorDocumentSlot["id"]) {
    setSlots((prev) => prev.map((slot) => (slot.id === slotId ? { ...slot, file: null } : slot)));
  }

  const fade = prefersReducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-mx-bg lg:h-full">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-mx-border bg-mx-surface-raised px-4 py-2.5 sm:px-6">
        <Logo size={30} withWordmark />
        <div className="flex items-center gap-2.5">
          <LanguageSelector />
          <ThemeSwitcher />
        </div>
      </header>

      <motion.div
        {...fade}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 sm:px-6 lg:py-5"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)_280px] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
          <DoctorRegistrationProgress currentStepIndex={3} className="lg:order-1" />

          <div className="flex flex-col gap-4 lg:order-2">
            <div>
              <h1 className="font-display text-lg font-bold text-mx-ink sm:text-xl">Documents / License Upload</h1>
              <p className="mt-1 max-w-xl text-xs leading-snug text-mx-ink-muted sm:text-sm">
                Upload your professional documents for verification.
              </p>
            </div>

            <Card>
              <div className="flex flex-col gap-4">
                {slots.map((slot) => (
                  <div key={slot.id} className="rounded-mx-lg border border-mx-border bg-mx-surface p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-mx-md bg-mx-green-soft text-mx-green-strong">
                          <FileText size={16} aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-mx-ink">
                            {slot.label} {slot.required && <span className="text-mx-danger">*</span>}
                          </p>
                          <p className="text-xs text-mx-ink-muted">{slot.hint}</p>
                        </div>
                      </div>
                      {slot.file && (
                        <Badge tone="green" icon={<Check size={12} aria-hidden="true" />}>
                          Uploaded
                        </Badge>
                      )}
                    </div>

                    <div className="mt-3">
                      {slot.file ? (
                        <div className="flex items-center justify-between gap-3 rounded-mx-md border border-mx-border bg-mx-surface-raised px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-mx-ink">{slot.file.name}</p>
                            <p className="text-xs text-mx-ink-muted">{formatFileSize(slot.file.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(slot.id)}
                            aria-label={`Remove ${slot.label}`}
                            className="shrink-0 rounded-mx-sm p-1.5 text-mx-ink-muted transition-colors hover:bg-mx-danger-soft hover:text-mx-danger"
                          >
                            <Trash2 size={15} aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <input
                            ref={(el) => {
                              fileInputRefs.current.set(slot.id, el);
                            }}
                            type="file"
                            accept="image/png,image/jpeg,application/pdf"
                            className="hidden"
                            onChange={(event) => handleFileChange(slot.id, event)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            icon={<UploadCloud size={14} aria-hidden="true" />}
                            onClick={() => fileInputRefs.current.get(slot.id)?.click()}
                          >
                            Upload File
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <p role="alert" className="mt-4 text-xs font-medium text-mx-danger">
                  {error}
                </p>
              )}

              <div className="mt-5 flex flex-col-reverse items-center justify-between gap-3 border-t border-mx-border pt-4 sm:flex-row">
                <Button type="button" variant="outline" size="md" icon={<ArrowLeft size={16} aria-hidden="true" />} onClick={onBack}>
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  icon={<ArrowRight size={16} aria-hidden="true" />}
                  iconPosition="right"
                  onClick={onContinue}
                  className={cn("shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0")}
                >
                  Continue
                </Button>
              </div>
            </Card>
          </div>

          <DoctorRegistrationSupportSidebar className="lg:order-3" />
        </div>
      </motion.div>
    </div>
  );
}
