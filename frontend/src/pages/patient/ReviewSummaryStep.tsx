import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  FileText,
  User,
} from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { MedicalIcon } from "../../components/healthcare/MedicalIcon";
import { RegistrationProgressSidebar } from "../../components/patient/RegistrationProgressSidebar";
import { useTranslation } from "../../i18n";
import { useTheme } from "../../context/ThemeContext";
import { useEffect } from "react";
import type { PatientSummary, UploadedDocumentRecord } from "../../types";
import { CATEGORY_ICON, CATEGORY_ORDER, CATEGORY_TONE, countDocumentsByCategory } from "../../utils/documentCategories";

interface ReviewSummaryStepProps {
  patient: PatientSummary;
  documents: UploadedDocumentRecord[];
  /** Whether the AI Health Interview step was completed or skipped — drives the small status line only, no fabricated answers are shown. */
  interviewCompleted: boolean;
  onBack: () => void;
  onCreateAccount: () => void;
}

/**
 * Review Summary — shown after Document Upload, right before the account
 * is actually created. Reads the same registration form data and
 * UploadedDocumentRecord[] the earlier steps produced; nothing here is
 * hard-coded. "Create Account" is the moment the frontend treats
 * registration as final and moves to Account Created — a real backend
 * would issue the actual account/API call at this point.
 */
export function ReviewSummaryStep({ patient, documents, interviewCompleted, onBack, onCreateAccount }: ReviewSummaryStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation();
  const { setHasPageHeader } = useTheme();

  // This step renders its own LanguageSelector + ThemeSwitcher below, so
  // hide AuthLayout's floating stand-in ThemeSwitcher while mounted to avoid
  // a duplicate/overlapping green control.
  useEffect(() => {
    setHasPageHeader(true);
    return () => setHasPageHeader(false);
  }, [setHasPageHeader]);
  const rs = t.reviewSummary;
  const du = t.documentUpload;

  const categoryCounts = countDocumentsByCategory(documents);
  const fade = prefersReducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  const fieldRows: Array<{ label: string; value: string }> = [
    { label: rs.fields.name, value: patient.fullName },
    { label: rs.fields.dob, value: patient.dateOfBirth },
    { label: rs.fields.gender, value: patient.gender },
    { label: rs.fields.contact, value: patient.contact },
    { label: rs.fields.location, value: patient.location },
  ];

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-mx-bg lg:h-full">
      {/* Header */}
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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
          {/* Left: Registration Progress sidebar */}
          <RegistrationProgressSidebar currentStepIndex={6} className="lg:order-1" />

          {/* Main column */}
          <div className="flex flex-col gap-4 lg:order-2">
            <div>
              <h1 className="font-display text-lg font-bold text-mx-ink sm:text-xl">{rs.pageTitle}</h1>
              <p className="mt-1 max-w-xl text-xs leading-snug text-mx-ink-muted sm:text-sm">{rs.pageSubtitle}</p>
            </div>

            {/* Personal information */}
            <Card>
              <div className="flex items-center gap-2.5">
                <MedicalIcon icon={User} tone="blue" size={17} className="h-9 w-9" />
                <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">{rs.personalInfoTitle}</h2>
              </div>
              <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                {fieldRows.map((row) => (
                  <div key={row.label} className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">{row.label}</dt>
                    <dd className="mt-0.5 truncate text-sm font-medium text-mx-ink">{row.value || "—"}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            {/* AI Health Interview status */}
            <Card>
              <div className="flex items-center gap-2.5">
                <MedicalIcon icon={Brain} tone="purple" size={17} className="h-9 w-9" />
                <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">{rs.aiInterviewTitle}</h2>
              </div>
              <p className="mt-2.5 flex items-start gap-2 text-sm leading-relaxed text-mx-ink-soft">
                <Check size={15} className="mt-0.5 shrink-0 text-mx-green" aria-hidden="true" />
                <span>{interviewCompleted ? rs.aiInterviewCompleted : rs.aiInterviewSkipped}</span>
              </p>
            </Card>

            {/* Uploaded documents summary */}
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <MedicalIcon icon={FileText} tone="green" size={17} className="h-9 w-9" />
                  <div>
                    <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">{rs.documentsTitle}</h2>
                    <p className="text-xs text-mx-ink-muted">{rs.documentsSubtitle}</p>
                  </div>
                </div>
                {documents.length > 0 && (
                  <Badge tone="green">{rs.documentsUploadedLabel.replace("{count}", String(documents.length))}</Badge>
                )}
              </div>

              {documents.length === 0 ? (
                <div className="mt-3.5">
                  <EmptyState icon={<FileText size={22} aria-hidden="true" />} title={rs.noDocumentsUploaded} compact />
                </div>
              ) : (
                <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                  {CATEGORY_ORDER.map((id) => {
                    const Icon = CATEGORY_ICON[id];
                    return (
                      <div key={id} className="flex flex-col gap-1.5 rounded-mx-md border border-mx-border bg-mx-surface p-2.5">
                        <MedicalIcon icon={Icon} tone={CATEGORY_TONE[id]} size={15} className="h-8 w-8" />
                        <p className="text-xs font-semibold text-mx-ink">{du.categories[id].title}</p>
                        <Badge tone="neutral" className="self-start">
                          {du.filesCountLabel.replace("{count}", String(categoryCounts[id]))}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Footer actions */}
            <div className="flex flex-col-reverse items-center justify-between gap-3 rounded-mx-lg border border-mx-border bg-mx-surface-raised p-3.5 shadow-mx-sm sm:flex-row sm:p-4">
              <Button type="button" variant="outline" size="md" icon={<ArrowLeft size={16} aria-hidden="true" />} onClick={onBack}>
                {rs.backButton}
              </Button>
              <div className="text-center sm:text-right">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  icon={<ArrowRight size={16} aria-hidden="true" />}
                  iconPosition="right"
                  onClick={onCreateAccount}
                  className="shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0"
                >
                  {rs.createAccountButton}
                </Button>
                <p className="mt-1.5 text-xs text-mx-ink-muted">{rs.createAccountHint}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
