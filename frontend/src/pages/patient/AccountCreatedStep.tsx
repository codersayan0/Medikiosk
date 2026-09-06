import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  KeyRound,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { MedicalIcon } from "../../components/healthcare/MedicalIcon";
import { PatientAvatar } from "../../components/healthcare/PatientAvatar";
import { RegistrationProgressSidebar } from "../../components/patient/RegistrationProgressSidebar";
import { useTranslation } from "../../i18n";
import { useTheme } from "../../context/ThemeContext";
import type { HealthIdRecord, PatientSummary, UploadedDocumentRecord } from "../../types";
import { CATEGORY_ICON, CATEGORY_ORDER, CATEGORY_TONE, countDocumentsByCategory } from "../../utils/documentCategories";

interface AccountCreatedStepProps {
  patient: PatientSummary;
  documents: UploadedDocumentRecord[];
  healthId: HealthIdRecord;
  onGoToDashboard: () => void;
}

/**
 * Account Created — the final step of patient registration. Reads the
 * same PatientSummary and UploadedDocumentRecord[] that flowed through
 * Document Upload and Review Summary; nothing here is hard-coded. The
 * Health ID is a frontend-generated placeholder (see
 * PatientRegisterPage.generateHealthId) — a real backend will issue the
 * permanent one later without changing this component's shape.
 */
export function AccountCreatedStep({ patient, documents, healthId, onGoToDashboard }: AccountCreatedStepProps) {
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
  const ac = t.accountCreated;
  const du = t.documentUpload;
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const categoryCounts = countDocumentsByCategory(documents);
  const fade = prefersReducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  const fieldRows: Array<{ label: string; value: string }> = [
    { label: ac.fields.name, value: patient.fullName },
    { label: ac.fields.dob, value: patient.dateOfBirth },
    { label: ac.fields.gender, value: patient.gender },
    { label: ac.fields.contact, value: patient.contact },
    { label: ac.fields.location, value: patient.location },
    { label: ac.fields.registeredOn, value: patient.registeredOn },
  ];

  function handleDownloadQr() {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${healthId.id}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)_300px] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
          {/* Left: Registration Progress sidebar */}
          <RegistrationProgressSidebar currentStepIndex={7} className="lg:order-1" />

          {/* Main column */}
          <div className="flex flex-col gap-4 lg:order-2">
            {/* Success card */}
            <Card padded={false}>
              <div className="flex items-center gap-3.5 p-4 sm:p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                  <CheckCircle2 size={24} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h1 className="font-display text-lg font-bold text-mx-ink sm:text-xl">{ac.successTitle}</h1>
                  <p className="mt-0.5 text-xs leading-snug text-mx-ink-muted sm:text-sm">{ac.successSubtitle}</p>
                  <p className="mt-0.5 text-xs leading-snug text-mx-ink-muted">{ac.successNote}</p>
                </div>
              </div>
            </Card>

            {/* Patient summary */}
            <Card>
              <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                <PatientAvatar
                  gender={patient.gender}
                  imageUrl={patient.profileImageUrl}
                  size={112}
                  className="sm:h-[120px] sm:w-[120px]"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">{ac.patientSummaryTitle}</h2>
                  <p className="text-xs text-mx-ink-muted">{ac.patientSummarySubtitle}</p>
                  <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                    {fieldRows.map((row) => (
                      <div key={row.label} className="min-w-0">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">{row.label}</dt>
                        <dd className="mt-0.5 truncate text-sm font-medium text-mx-ink">{row.value || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </Card>

            {/* Uploaded documents summary */}
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <MedicalIcon icon={FileText} tone="green" size={17} className="h-9 w-9" />
                  <div>
                    <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">{ac.documentsTitle}</h2>
                    <p className="text-xs text-mx-ink-muted">{ac.documentsSavedNote}</p>
                  </div>
                </div>
                {documents.length > 0 && (
                  <Badge tone="green">{ac.documentsCountLabel.replace("{count}", String(documents.length))}</Badge>
                )}
              </div>

              {documents.length === 0 ? (
                <p className="mt-3.5 text-sm text-mx-ink-muted">{ac.noDocumentsNote}</p>
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

            {/* Final CTA */}
            <div className="flex flex-col items-center gap-3 rounded-mx-lg border border-mx-green/25 bg-mx-green-soft p-4 text-center shadow-mx-sm sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="hidden shrink-0 text-mx-green-strong sm:block" aria-hidden="true" />
                <div>
                  <h2 className="font-display text-base font-bold text-mx-ink">{ac.finalCtaTitle}</h2>
                  <p className="mt-0.5 max-w-md text-xs leading-snug text-mx-ink-soft sm:text-sm">{ac.finalCtaDescription}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="primary"
                size="lg"
                icon={<ArrowRight size={17} aria-hidden="true" />}
                iconPosition="right"
                onClick={onGoToDashboard}
                className="w-full shrink-0 shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0 sm:w-auto"
              >
                {ac.dashboardButton}
              </Button>
            </div>
          </div>

          {/* Right: Health ID / QR / What's Next */}
          <div className="flex flex-col gap-4 lg:order-3">
            <Card>
              <div className="flex items-center gap-2.5">
                <MedicalIcon icon={KeyRound} tone="blue" size={17} className="h-9 w-9" />
                <div>
                  <h3 className="font-display text-sm font-bold text-mx-ink">{ac.healthIdTitle}</h3>
                </div>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-mx-ink-muted">{ac.healthIdSubtitle}</p>

              <div className="mt-3 flex flex-col items-center gap-2.5 rounded-mx-md border border-mx-border bg-mx-surface p-3">
                <div className="rounded-mx-sm bg-white p-2">
                  <QRCodeCanvas ref={qrCanvasRef} value={healthId.id} size={120} level="M" />
                </div>
                <p className="font-display text-sm font-bold tracking-wide text-mx-ink">{healthId.id}</p>
              </div>

              <div className="mt-3 flex items-start gap-2 rounded-mx-md bg-mx-surface-sunken px-3 py-2 text-xs leading-relaxed text-mx-ink-soft">
                <ShieldCheck size={14} className="mt-0.5 shrink-0 text-mx-green" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-mx-ink">{ac.keepSafeTitle}</p>
                  <p className="mt-0.5">{ac.keepSafeDescription}</p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<Download size={14} aria-hidden="true" />}
                onClick={handleDownloadQr}
                className="mt-3 w-full"
              >
                {ac.downloadQrButton}
              </Button>
            </Card>

            <Card>
              <h3 className="font-display text-sm font-bold text-mx-ink">{ac.whatsNextTitle}</h3>
              <ul className="mt-2.5 flex flex-col gap-1.5">
                {ac.whatsNextItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-mx-ink-soft">
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-mx-green" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
