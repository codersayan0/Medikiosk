import { useState } from "react";
import type { ChangeEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Info,
  Clock,
  RefreshCw,
  FlaskConical,
  Pill,
  ShieldAlert,
  Users,
  Activity,
  Leaf,
  GanttChartSquare,
  Flag,
  CalendarClock,
  History,
  FileStack,
  Eye,
  Download,
  ClipboardCheck,
  ScanLine,
  FileText,
  File,
  Pencil,
  X,
  Save,
  UserCog,
} from "lucide-react";
import { Section, Prose, EntryList } from "../../../../components/healthcare/ClinicalSummarySections";
import { Card, CardTitle } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import { Modal } from "../../../../components/ui/Modal";
import { Textarea } from "../../../../components/ui/Textarea";
import { MedicalIcon } from "../../../../components/healthcare/MedicalIcon";
import { useAiHealthSummary, useClinicalSummary } from "../../../../context/PatientContext";
import { useToast } from "../../../../context/ToastContext";
import { ErrorState } from "../../../../components/ui/ErrorState";
import { SummaryPageSkeleton } from "../../../../components/ui/Skeleton";
import { useSimulatedLoad } from "../../../../hooks/useSimulatedLoad";
import type { BadgeTone } from "../../../../types";
import type { AiHealthSummaryRow, DocumentCategory, LabReportStatus, LabResultRow, VisitDetail } from "../../../../data/patientRecord";
import type { FlagSeverity } from "../../../../utils/clinicalSummary";
import { fadeInUp, staggerContainer, staggerItem } from "../../../../utils/motion";

const LAB_REPORT_STATUS_TONE: Record<LabReportStatus, BadgeTone> = {
  Normal: "green",
  Attention: "warning",
  Critical: "danger",
};

const LAB_ROW_STATUS_TONE: Record<LabResultRow["status"], BadgeTone> = {
  Normal: "green",
  Low: "warning",
  High: "warning",
  Borderline: "neutral",
};

const FLAG_TONE: Record<FlagSeverity, BadgeTone> = {
  info: "neutral",
  warning: "warning",
  critical: "danger",
};

const DOCUMENT_CATEGORY_ICON: Record<DocumentCategory, typeof FileText> = {
  Prescription: ClipboardCheck,
  "Lab Report": FlaskConical,
  "Discharge Summary": FileText,
  "X-Ray": ScanLine,
  Others: File,
};

const DOCUMENT_CATEGORY_TONE: Record<DocumentCategory, BadgeTone> = {
  Prescription: "purple",
  "Lab Report": "blue",
  "Discharge Summary": "green",
  "X-Ray": "warning",
  Others: "neutral",
};

const VISIT_STATUS_TONE: Record<VisitDetail["status"], BadgeTone> = {
  Completed: "green",
  Confirmed: "blue",
  Pending: "neutral",
};



export default function AiHealthSummaryPage() {
  const summary = useClinicalSummary();
  const { rows, meta, updateSummary } = useAiHealthSummary();
  const { showToast } = useToast();
  const prefersReducedMotion = useReducedMotion();

  // Edit / Modify AI Health Summary — a modal listing every row so the
  // patient can correct or add detail. Saving writes back through
  // `updateSummary`, which is the same shared record `useClinicalSummary()`
  // derives from above, so every section that reads from these rows
  // (Chief Complaint, HPI, Review of Systems) reflects the edit immediately.
  const [editing, setEditing] = useState(false);
  const [draftRows, setDraftRows] = useState<AiHealthSummaryRow[]>(rows);

  const { loading, failed, retry } = useSimulatedLoad();
  if (loading) return <SummaryPageSkeleton />;
  if (failed) {
    return (
      <ErrorState
        title="Unable to load this page."
        description="We couldn't fetch this data. Please try again."
        onRetry={retry}
      />
    );
  }

  const startEdit = () => {
    setDraftRows(rows);
    setEditing(true);
  };
  const cancelEdit = () => setEditing(false);
  const saveEdit = () => {
    updateSummary(draftRows);
    setEditing(false);
    showToast({
      tone: "success",
      title: "AI Health Summary updated",
      description: "Your changes have been saved to your health summary.",
    });
  };
  const setRowValue = (label: string) => (e: ChangeEvent<HTMLTextAreaElement>) =>
    setDraftRows((prev) => prev.map((row) => (row.label === label ? { ...row, value: e.target.value } : row)));

  const viewDocument = (name: string) =>
    showToast({ tone: "info", title: "Opening document", description: `${name} would open in a new tab.` });
  const downloadDocument = (name: string) =>
    showToast({ tone: "success", title: "Document downloading", description: `${name} is being saved to your device.` });

  const mostRecentLabReport = summary.labReports[0];
  const otherLabReports = summary.labReports.slice(1);

  const renderVisitRow = (visit: VisitDetail) => (
    <div key={visit.id} className="grid grid-cols-1 gap-1 border-b border-mx-border py-3 last:border-b-0 sm:grid-cols-4 sm:items-center sm:gap-3">
      <span className="text-sm font-semibold text-mx-ink">{visit.date}</span>
      <span className="text-sm text-mx-ink-soft">{visit.doctorName}</span>
      <span className="text-sm text-mx-ink-soft">{visit.reason}</span>
      <Badge tone={VISIT_STATUS_TONE[visit.status]} className="w-fit sm:justify-self-end">
        {visit.status}
      </Badge>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={prefersReducedMotion ? false : "hidden"}
        animate="show"
        variants={prefersReducedMotion ? undefined : fadeInUp}
      >
        <Card className="mx-ambient-card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">AI Health Summary</h1>
                <Badge tone="purple" icon={<Sparkles size={12} aria-hidden="true" />}>
                  AI-generated / Informational
                </Badge>
                {meta.patientModified && (
                  <Badge tone="blue" icon={<UserCog size={12} aria-hidden="true" />}>
                    Patient-modified
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-mx-ink-muted">
                A detailed, document-style overview of your health drawn from your interviews, visits, and uploaded documents.
              </p>
            </div>
            <Button size="sm" variant="outline" icon={<Pencil size={14} aria-hidden="true" />} onClick={startEdit}>
              Edit Summary
            </Button>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-mx-border pt-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-mx-ink-muted">Patient</dt>
              <dd className="font-semibold text-mx-ink">{summary.patientName}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-mx-ink-muted">Patient ID</dt>
              <dd className="font-mono font-semibold text-mx-ink">{summary.patientId}</dd>
            </div>
            <div className="col-span-2 sm:col-span-2">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-mx-ink-muted">Generated</dt>
              <dd className="flex flex-wrap items-center gap-x-4 gap-y-1 text-mx-ink-soft">
                <span className="flex items-center gap-1.5">
                  <Sparkles size={12} aria-hidden="true" /> {summary.generatedOn}
                </span>
                <span className="flex items-center gap-1.5">
                  <RefreshCw size={12} aria-hidden="true" /> Updated {summary.lastUpdated}
                </span>
              </dd>
            </div>
          </dl>
        </Card>
      </motion.div>

      <motion.div
        initial={prefersReducedMotion ? false : "hidden"}
        animate="show"
        variants={prefersReducedMotion ? undefined : fadeInUp}
      >
        <Card className="flex items-start gap-3 border-mx-warning/40 bg-mx-warning-soft">
          <MedicalIcon icon={Info} tone="warning" size={16} className="h-9 w-9" />
          <p className="text-sm font-semibold text-mx-warning">
            This AI-generated summary is for information purposes only and does not replace professional medical advice or
            diagnosis. Clinical decisions remain with a qualified healthcare professional.
          </p>
        </Card>
      </motion.div>

      <motion.div
        className="space-y-5"
        initial={prefersReducedMotion ? "show" : "hidden"}
        animate="show"
        variants={prefersReducedMotion ? undefined : staggerContainer(0.05)}
      >
        {/* 1. Overall Health Summary */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={1} title="Overall Health Summary" icon={Activity}>
            <Prose>{summary.overallSummary}</Prose>
          </Section>
        </motion.div>

        {/* 2. Chief Complaint */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={2} title="Chief Complaint" icon={Info}>
            <p className="text-sm leading-relaxed text-mx-ink">
              <strong>{summary.chiefComplaint}</strong>
            </p>
          </Section>
        </motion.div>

        {/* 3. History of Present Illness */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={3} title="History of Present Illness (HPI)" icon={History}>
            <Prose>{summary.historyOfPresentIllness}</Prose>
          </Section>
        </motion.div>

        {/* 4. Past Medical History */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={4} title="Past Medical History" icon={History}>
            <EntryList entries={summary.pastMedicalHistory} emptyText="No known chronic illness or past medical history on record." />
          </Section>
        </motion.div>

        {/* 5. Surgery History */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={5} title="Surgery History" icon={ClipboardCheck}>
            <EntryList entries={summary.surgeryHistory} emptyText="No previous surgeries on record." />
          </Section>
        </motion.div>

        {/* 6. Current Medications */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={6} title="Current Medications" icon={Pill}>
            {summary.currentMedications.length === 0 ? (
              <p className="text-sm text-mx-ink-muted">No active medications on record.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-mx-border text-[11px] font-semibold uppercase tracking-wide text-mx-ink-muted">
                      <th className="py-2 pr-3">Medicine</th>
                      <th className="py-2 pr-3">Dosage</th>
                      <th className="py-2 pr-3">Frequency</th>
                      <th className="py-2 pr-3">Duration</th>
                      <th className="py-2">Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.currentMedications.map((m) => (
                      <tr key={m.id} className="border-b border-mx-border last:border-b-0">
                        <td className="py-2.5 pr-3 font-semibold text-mx-ink">{m.name}</td>
                        <td className="py-2.5 pr-3 text-mx-ink-soft">{m.dosage}</td>
                        <td className="py-2.5 pr-3 text-mx-ink-soft">{m.frequency}</td>
                        <td className="py-2.5 pr-3 text-mx-ink-soft">{m.duration}</td>
                        <td className="py-2.5 text-mx-ink-soft">{m.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </motion.div>

        {/* 7. Allergies */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={7} title="Allergies" icon={ShieldAlert}>
            {summary.allergies.length === 0 ? (
              <p className="text-sm text-mx-ink-muted">No known allergies on record.</p>
            ) : (
              <ul className="space-y-2.5">
                {summary.allergies.map((a, i) => (
                  <li key={`${a.allergen}-${i}`} className="flex flex-wrap items-center gap-2 text-sm">
                    <strong className="text-mx-ink">{a.allergen}</strong>
                    <span className="text-mx-ink-soft">— {a.reaction}</span>
                    <Badge tone={a.severity === "Severe" ? "danger" : a.severity === "Moderate" ? "warning" : "neutral"}>
                      {a.severity}
                    </Badge>
                    <span className="text-xs text-mx-ink-muted">{a.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </motion.div>

        {/* 8. Family History */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={8} title="Family History" icon={Users}>
            <EntryList entries={summary.familyHistory} emptyText="No significant family history on record." />
          </Section>
        </motion.div>

        {/* 9. Review of Systems */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={9} title="Review of Systems" icon={Activity}>
            <Prose>{summary.reviewOfSystems}</Prose>
          </Section>
        </motion.div>

        {/* 10. Lab / Investigation Summary */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={10} title="Lab / Investigation Summary" icon={FlaskConical}>
            <div className="space-y-5">
              {mostRecentLabReport && (
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-mx-ink">
                      {mostRecentLabReport.title} <span className="font-normal text-mx-ink-muted">— {mostRecentLabReport.date}</span>
                    </p>
                    <Badge tone={LAB_REPORT_STATUS_TONE[mostRecentLabReport.status]}>{mostRecentLabReport.status}</Badge>
                  </div>
                  <div className="overflow-x-auto rounded-mx-sm border border-mx-border">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-mx-border bg-mx-surface-sunken text-[11px] font-semibold uppercase tracking-wide text-mx-ink-muted">
                          <th className="px-3 py-2">Test</th>
                          <th className="px-3 py-2">Result</th>
                          <th className="px-3 py-2">Reference Range</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mostRecentLabReport.rows.map((row) => (
                          <tr key={row.test} className="border-b border-mx-border last:border-b-0">
                            <td className="px-3 py-2.5 font-semibold text-mx-ink">{row.test}</td>
                            <td className="px-3 py-2.5">
                              <span className={row.status !== "Normal" ? "font-bold text-mx-warning" : "text-mx-ink-soft"}>
                                {row.result}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-mx-ink-muted">{row.referenceRange}</td>
                            <td className="px-3 py-2.5">
                              <Badge tone={LAB_ROW_STATUS_TONE[row.status]}>{row.status}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {mostRecentLabReport.notes && (
                    <p className="mt-2 text-xs text-mx-ink-muted">Note: {mostRecentLabReport.notes}</p>
                  )}
                </div>
              )}

              {otherLabReports.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-mx-ink">Other Reports on Record</p>
                  <ul className="divide-y divide-mx-border">
                    {otherLabReports.map((report) => (
                      <li key={report.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                        <span className="text-mx-ink-soft">
                          {report.title} <span className="text-mx-ink-muted">— {report.date}</span>
                        </span>
                        <Badge tone={LAB_REPORT_STATUS_TONE[report.status]}>{report.status}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {summary.abnormalLabValues.length > 0 && (
                <p className="rounded-mx-sm bg-mx-warning-soft px-3 py-2.5 text-xs font-semibold text-mx-warning">
                  {summary.abnormalLabValues.length} value{summary.abnormalLabValues.length > 1 ? "s are" : " is"} outside the
                  normal reference range across your records — see Current Flags below.
                </p>
              )}
            </div>
          </Section>
        </motion.div>

        {/* 11. Medical Documents */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={11} title="Medical Documents" icon={FileStack}>
            {summary.documents.length === 0 ? (
              <p className="text-sm text-mx-ink-muted">No documents uploaded yet.</p>
            ) : (
              <ul className="divide-y divide-mx-border">
                {summary.documents.map((doc) => {
                  const Icon = DOCUMENT_CATEGORY_ICON[doc.category];
                  return (
                    <li key={doc.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <MedicalIcon icon={Icon} tone={DOCUMENT_CATEGORY_TONE[doc.category]} size={14} className="h-8 w-8" />
                        <div>
                          <p className="text-sm font-semibold text-mx-ink">{doc.name}</p>
                          <p className="text-xs text-mx-ink-muted">{doc.uploadedDate}</p>
                        </div>
                      </div>
                      <Badge tone={DOCUMENT_CATEGORY_TONE[doc.category]}>{doc.category}</Badge>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </motion.div>

        {/* 12. Medical Timeline Summary */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={12} title="Medical Timeline Summary" icon={GanttChartSquare}>
            <ol className="space-y-3">
              {summary.timeline.slice(0, 8).map((event) => (
                <li key={event.id} className="flex gap-3 text-sm">
                  <span className="w-24 shrink-0 text-xs text-mx-ink-muted">
                    {event.date}
                    <br />
                    {event.time}
                  </span>
                  <div>
                    <p className="font-semibold text-mx-ink">{event.title}</p>
                    <p className="text-mx-ink-soft">{event.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </motion.div>

        {/* 13. AYUSH Health */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={13} title="AYUSH Health" icon={Leaf}>
            <p className="mb-3 text-xs text-mx-ink-muted">Assessment dated {summary.ayushSummary.assessmentDate}</p>
            <p className="mb-2 text-sm font-semibold text-mx-ink">Dashavidha Pariksha</p>
            <div className="mb-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-5">
              {summary.ayushSummary.dashavidha.map((d) => (
                <div key={d.label}>
                  <p className="text-[11px] text-mx-ink-muted">{d.label}</p>
                  <p className="text-sm font-semibold text-mx-ink">{d.value}</p>
                </div>
              ))}
            </div>
            <p className="mb-1 text-sm font-semibold text-mx-ink">Ahara-Vihara</p>
            <Prose>{summary.ayushSummary.aharaVihara}</Prose>
            {summary.ayushSummary.otherParams.length > 0 && (
              <>
                <p className="mb-2 mt-4 text-sm font-semibold text-mx-ink">Other Parameters</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
                  {summary.ayushSummary.otherParams.map((p) => (
                    <div key={p.label}>
                      <p className="text-[11px] text-mx-ink-muted">{p.label}</p>
                      <p className="text-sm font-semibold text-mx-ink">{p.value}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Section>
        </motion.div>

        {/* 14. Current Flags / Important Information */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={14} title="Current Flags / Important Information" icon={Flag}>
            <ul className="space-y-2.5">
              {summary.flags.map((flag) => (
                <li key={flag.id} className="flex flex-wrap items-start gap-2">
                  <Badge tone={FLAG_TONE[flag.severity]} className="mt-0.5 shrink-0">
                    {flag.severity === "critical" ? "Critical" : flag.severity === "warning" ? "Attention" : "Info"}
                  </Badge>
                  <div className="text-sm">
                    <span className="font-semibold text-mx-ink">{flag.label}</span>
                    <span className="text-mx-ink-soft"> — {flag.detail}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </motion.div>

        {/* 15. Recent Visits */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={15} title="Recent Visits" icon={CalendarClock}>
            {summary.recentVisits.length === 0 ? (
              <p className="text-sm text-mx-ink-muted">No recent visits on record.</p>
            ) : (
              <div>{summary.recentVisits.map(renderVisitRow)}</div>
            )}
          </Section>
        </motion.div>

        {/* 16. Previous Visits */}
        <motion.div variants={prefersReducedMotion ? undefined : staggerItem}>
          <Section number={16} title="Previous Visits" icon={History}>
            {summary.previousVisits.length === 0 ? (
              <p className="text-sm text-mx-ink-muted">No earlier visit history on record.</p>
            ) : (
              <div>{summary.previousVisits.map(renderVisitRow)}</div>
            )}
          </Section>
        </motion.div>
      </motion.div>

      {/* Attached Documents */}
      <motion.div
        initial={prefersReducedMotion ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        variants={prefersReducedMotion ? undefined : fadeInUp}
      >
        <Card>
          <CardTitle className="mb-4">Attached Documents</CardTitle>
          {summary.documents.length === 0 ? (
            <p className="text-sm text-mx-ink-muted">No documents attached to this summary yet.</p>
          ) : (
            <div className="divide-y divide-mx-border">
              {summary.documents.map((doc) => {
                const Icon = DOCUMENT_CATEGORY_ICON[doc.category];
                return (
                  <div key={doc.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <MedicalIcon icon={Icon} tone={DOCUMENT_CATEGORY_TONE[doc.category]} size={14} className="h-9 w-9" />
                      <div>
                        <p className="text-sm font-semibold text-mx-ink">{doc.name}</p>
                        <p className="text-xs text-mx-ink-muted">
                          {doc.category} · {doc.uploadedDate} · {doc.uploadedBy}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => viewDocument(doc.name)}
                        aria-label={`View ${doc.name}`}
                        className="rounded-mx-sm p-2 text-mx-ink-muted hover:bg-mx-surface-sunken hover:text-mx-ink"
                      >
                        <Eye size={16} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadDocument(doc.name)}
                        aria-label={`Download ${doc.name}`}
                        className="rounded-mx-sm p-2 text-mx-ink-muted hover:bg-mx-surface-sunken hover:text-mx-ink"
                      >
                        <Download size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>

      <p className="flex items-center gap-1.5 text-xs text-mx-ink-muted">
        <Clock size={12} aria-hidden="true" />
        This summary is refreshed automatically as new visits, prescriptions, and reports are added to your record.
      </p>

      <Modal
        isOpen={editing}
        onClose={cancelEdit}
        title="Edit AI Health Summary"
        description="Review and correct any field. Saving updates this summary immediately, including the sections it feeds below."
        footer={
          <>
            <Button variant="outline" icon={<X size={14} aria-hidden="true" />} onClick={cancelEdit}>
              Cancel
            </Button>
            <Button icon={<Save size={14} aria-hidden="true" />} onClick={saveEdit}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {draftRows.map((row) => (
            <Textarea
              key={row.label}
              label={row.label}
              value={row.value}
              onChange={setRowValue(row.label)}
              rows={row.label === "Chief Complaint" ? 2 : 3}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}