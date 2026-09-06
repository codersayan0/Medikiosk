import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FlaskConical, Download, CalendarDays, Building2, Check } from "lucide-react";
import { Card, CardTitle } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import { Modal } from "../../../../components/ui/Modal";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { SegmentedTabs } from "../../../../components/ui/SegmentedTabs";
import { MedicalIcon } from "../../../../components/healthcare/MedicalIcon";
import { usePatientRecord } from "../../../../context/PatientContext";
import { useToast } from "../../../../context/ToastContext";
import type { LabReportCategory, LabReportRecord, LabReportStatus, LabResultRow } from "../../../../data/patientRecord";
import { ErrorState } from "../../../../components/ui/ErrorState";
import { ListPageSkeleton } from "../../../../components/ui/Skeleton";
import { useSimulatedLoad } from "../../../../hooks/useSimulatedLoad";
import { fadeInUp, staggerContainer, staggerItem } from "../../../../utils/motion";

/** Rows beyond this count skip the per-row stagger and just fade in as one block — a long results table shouldn't feel sluggish to open. */
const STAGGER_ROW_LIMIT = 10;
/** How long the Download button shows a checkmark before reverting. */
const SUCCESS_STATE_MS = 1000;

const STATUS_TONE: Record<LabReportStatus, "green" | "warning" | "danger"> = {
  Normal: "green",
  Attention: "warning",
  Critical: "danger",
};

const ROW_STATUS_TONE: Record<LabResultRow["status"], "green" | "warning" | "neutral"> = {
  Normal: "green",
  Low: "warning",
  High: "warning",
  Borderline: "neutral",
};

type CategoryFilter = "All" | LabReportCategory;


export default function LabReportsPage() {
  const patient = usePatientRecord();
  const { showToast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const [filter, setFilter] = useState<CategoryFilter>("All");
  const [activeReport, setActiveReport] = useState<LabReportRecord | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(patient.labReports.map((r) => r.category));
    return Array.from(set);
  }, [patient.labReports]);

  const filtered = filter === "All" ? patient.labReports : patient.labReports.filter((r) => r.category === filter);

  const handleDownload = (report: LabReportRecord) => {
    showToast({ tone: "success", title: "Report downloading", description: `${report.title} is being saved to your device.` });
    setDownloadedId(report.id);
    window.setTimeout(() => setDownloadedId((current) => (current === report.id ? null : current)), SUCCESS_STATE_MS);
  };

  const { loading, failed, retry } = useSimulatedLoad();
  if (loading) return <ListPageSkeleton />;
  if (failed) {
    return (
      <ErrorState
        title="Unable to load this page."
        description="We couldn't fetch this data. Please try again."
        onRetry={retry}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">Lab Reports</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">All your lab test results in one place, from blood work to imaging.</p>
      </div>

      <SegmentedTabs
        tabs={[
          { id: "All", label: "All", count: patient.labReports.length },
          ...categories.map((c) => ({ id: c, label: c, count: patient.labReports.filter((r) => r.category === c).length })),
        ]}
        active={filter}
        onChange={setFilter}
      />

      {filtered.length === 0 ? (
        <EmptyState icon={<FlaskConical size={22} aria-hidden="true" />} title="No lab reports here" description="No reports match this filter yet." />
      ) : (
        <motion.div
          key={filter}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          initial={prefersReducedMotion ? false : "hidden"}
          animate="show"
          variants={prefersReducedMotion ? undefined : staggerContainer()}
        >
          {filtered.map((report) => {
            const justDownloaded = downloadedId === report.id;
            return (
              <motion.div key={report.id} variants={prefersReducedMotion ? undefined : staggerItem}>
                <Card className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <MedicalIcon icon={FlaskConical} tone="blue" />
                      <div className="min-w-0">
                        <CardTitle className="truncate">{report.title}</CardTitle>
                        <p className="text-xs text-mx-ink-muted">{report.category}</p>
                      </div>
                    </div>
                    <Badge tone={STATUS_TONE[report.status]} className="shrink-0">
                      {report.status}
                    </Badge>
                  </div>

                  <dl className="space-y-1 text-xs text-mx-ink-muted">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={13} aria-hidden="true" />
                      <span>{report.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 size={13} aria-hidden="true" />
                      <span className="truncate">{report.labName}</span>
                    </div>
                  </dl>
                  <p className="text-xs text-mx-ink-muted">Ordered by {report.orderedBy}</p>

                  <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <Button size="sm" variant="outline" className="sm:flex-1" onClick={() => setActiveReport(report)}>
                      View Report
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={justDownloaded ? <Check size={14} aria-hidden="true" /> : <Download size={14} aria-hidden="true" />}
                      className="sm:flex-1"
                      onClick={() => handleDownload(report)}
                    >
                      {justDownloaded ? "Downloaded" : "Download"}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <Modal
        isOpen={activeReport !== null}
        onClose={() => setActiveReport(null)}
        title={activeReport?.title ?? ""}
        description={activeReport ? `${activeReport.date} · ${activeReport.labName} · Ordered by ${activeReport.orderedBy}` : undefined}
        footer={
          activeReport && (
            <>
              <Button variant="outline" size="sm" onClick={() => setActiveReport(null)}>
                Close
              </Button>
              <Button
                size="sm"
                icon={downloadedId === activeReport.id ? <Check size={14} aria-hidden="true" /> : <Download size={14} aria-hidden="true" />}
                onClick={() => handleDownload(activeReport)}
              >
                {downloadedId === activeReport.id ? "Downloaded" : "Download"}
              </Button>
            </>
          )
        }
      >
        {activeReport && (() => {
          // Long tables (>10 rows) skip the per-row stagger and fade in as a single block so opening a big report doesn't feel sluggish.
          const useRowStagger = !prefersReducedMotion && activeReport.rows.length <= STAGGER_ROW_LIMIT;
          const tableVariants = prefersReducedMotion ? undefined : useRowStagger ? staggerContainer(0.018) : fadeInUp;
          const rowVariants = prefersReducedMotion ? undefined : useRowStagger ? staggerItem : undefined;
          return (
            <div className="space-y-3">
              <motion.div
                key={activeReport.id}
                className="hidden overflow-x-auto sm:block"
                initial={prefersReducedMotion ? false : "hidden"}
                animate="show"
                variants={tableVariants}
              >
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wide text-mx-ink-muted">
                      <th className="pb-2 pr-2">Test</th>
                      <th className="pb-2 pr-2">Result</th>
                      <th className="pb-2 pr-2">Reference Range</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <motion.tbody variants={useRowStagger ? staggerContainer(0.018) : undefined}>
                    {activeReport.rows.map((row) => (
                      <motion.tr key={row.test} variants={rowVariants} className="border-t border-mx-border transition-colors duration-150 hover:bg-mx-surface-sunken">
                        <td className="py-2 pr-2 font-semibold text-mx-ink">{row.test}</td>
                        <td className="py-2 pr-2 text-mx-ink">{row.result}</td>
                        <td className="py-2 pr-2 text-mx-ink-muted">{row.referenceRange}</td>
                        <td className="py-2">
                          <Badge tone={ROW_STATUS_TONE[row.status]}>{row.status}</Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </motion.div>

              <motion.div
                key={`${activeReport.id}-mobile`}
                className="space-y-2 sm:hidden"
                initial={prefersReducedMotion ? false : "hidden"}
                animate="show"
                variants={useRowStagger ? staggerContainer(0.018) : tableVariants}
              >
                {activeReport.rows.map((row) => (
                  <motion.div key={row.test} variants={rowVariants} className="rounded-mx-md border border-mx-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-mx-ink">{row.test}</p>
                      <Badge tone={ROW_STATUS_TONE[row.status]}>{row.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-mx-ink">{row.result}</p>
                    <p className="text-xs text-mx-ink-muted">Ref: {row.referenceRange}</p>
                  </motion.div>
                ))}
              </motion.div>

              {activeReport.notes && (
                <p className="rounded-mx-md bg-mx-surface-sunken px-3 py-2.5 text-xs text-mx-ink-soft">
                  <span className="font-semibold text-mx-ink">Note: </span>
                  {activeReport.notes}
                </p>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
