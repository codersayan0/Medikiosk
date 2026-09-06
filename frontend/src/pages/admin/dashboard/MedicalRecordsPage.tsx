import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Download, FileText, FolderHeart, XCircle } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ErrorState } from "../../../components/ui/ErrorState";
import { ListPageSkeleton } from "../../../components/ui/Skeleton";
import { Pagination } from "../../../components/ui/Pagination";
import { MedicalRecordStatusBadge } from "../../../components/admin/MedicalRecordStatusBadge";
import { MedicalRecordDetailsDrawer } from "../../../components/admin/MedicalRecordDetailsDrawer";
import { MedicalRecordDocumentPreviewModal } from "../../../components/admin/MedicalRecordDocumentPreviewModal";
import { MOCK_MEDICAL_RECORDS } from "../../../data/mockMedicalRecords";
import { useSimulatedLoad } from "../../../hooks/useSimulatedLoad";
import { useToast } from "../../../context/ToastContext";
import { staggerContainer, staggerItem } from "../../../utils/motion";
import { RECORD_TYPE_LABEL, getPrimaryDocument, medicalRecordMatchesQuery } from "../../../utils/medicalRecords";
import type { MedicalRecord, MedicalRecordDocument, MedicalRecordStatus, MedicalRecordType } from "../../../types";

const PAGE_SIZE = 8;
const RECORD_TYPE_OPTIONS = Object.entries(RECORD_TYPE_LABEL).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS: { value: MedicalRecordStatus; label: string }[] = [
  { value: "verified", label: "Verified" },
  { value: "pending_review", label: "Pending Review" },
  { value: "flagged", label: "Flagged" },
];

/**
 * Admin Medical Records page (replaces the "coming soon" placeholder). Same
 * search + filter + table pattern used by Patients/Appointments, extended
 * with Patient / Doctor / Record Type / Date / Status filters and a
 * document preview flow (Open Document / per-document View) alongside the
 * usual record details drawer. `patientUID` is the only patient identifier
 * shown/used — no duplicate patient ID.
 *
 * TODO(real-backend): swap MOCK_MEDICAL_RECORDS for a real
 * `GET /admin/medical-records` response (see data/mockMedicalRecords.ts) —
 * the rest of this page reads through local state only, so no other change
 * is needed.
 */
export default function MedicalRecordsPage() {
  const { loading, failed, retry } = useSimulatedLoad();
  const { showToast } = useToast();
  const [records] = useState<MedicalRecord[]>(MOCK_MEDICAL_RECORDS);

  const [query, setQuery] = useState("");
  const [patientFilter, setPatientFilter] = useState("all");
  const [doctorFilter, setDoctorFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | MedicalRecordType>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MedicalRecordStatus>("all");
  const [page, setPage] = useState(1);

  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ document: MedicalRecordDocument; patientName: string } | null>(null);

  const patientOptions = useMemo(() => {
    const unique = Array.from(new Set(records.map((r) => r.patientName)));
    return [{ value: "all", label: "All Patients" }, ...unique.map((p) => ({ value: p, label: p }))];
  }, [records]);

  const doctorOptions = useMemo(() => {
    const unique = Array.from(new Set(records.map((r) => r.doctorName)));
    return [{ value: "all", label: "All Doctors" }, ...unique.map((d) => ({ value: d, label: d }))];
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter(
      (r) =>
        (patientFilter === "all" || r.patientName === patientFilter) &&
        (doctorFilter === "all" || r.doctorName === doctorFilter) &&
        (typeFilter === "all" || r.recordType === typeFilter) &&
        (statusFilter === "all" || r.status === statusFilter) &&
        (!dateFilter || r.date === dateFilter) &&
        medicalRecordMatchesQuery(r, query)
    );
  }, [records, patientFilter, doctorFilter, typeFilter, statusFilter, dateFilter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasActiveFilters = query !== "" || patientFilter !== "all" || doctorFilter !== "all" || typeFilter !== "all" || dateFilter !== "" || statusFilter !== "all";

  const updateFilter = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const clearFilters = () =>
    updateFilter(() => {
      setQuery("");
      setPatientFilter("all");
      setDoctorFilter("all");
      setTypeFilter("all");
      setDateFilter("");
      setStatusFilter("all");
    });

  const openDocument = (record: MedicalRecord) => setPreviewDoc({ document: getPrimaryDocument(record), patientName: record.patientName });

  const previewFromDrawer = (document: MedicalRecordDocument) => {
    if (!selectedRecord) return;
    setPreviewDoc({ document, patientName: selectedRecord.patientName });
  };

  const handleDownload = (document: MedicalRecordDocument) => {
    showToast({ tone: "info", title: "Download started", description: document.fileName });
  };

  if (loading) return <ListPageSkeleton rows={6} />;
  if (failed) return <ErrorState title="Unable to load medical records." description="Something went wrong while fetching this data. Please try again." onRetry={retry} />;

  return (
    <div>
      <div className="mb-5">
        <h1 className="font-display text-xl font-bold text-mx-ink">Medical Records</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">Manage and review patient medical records securely.</p>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-mx-border p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input
              label="Search records"
              hideLabel
              placeholder="Search by patient, UID, doctor, or document"
              icon={<Search size={16} aria-hidden="true" />}
              value={query}
              onChange={(e) => updateFilter(() => setQuery(e.target.value))}
            />
            <Select label="Filter by patient" hideLabel options={patientOptions} value={patientFilter} onChange={(e) => updateFilter(() => setPatientFilter(e.target.value))} />
            <Select label="Filter by doctor" hideLabel options={doctorOptions} value={doctorFilter} onChange={(e) => updateFilter(() => setDoctorFilter(e.target.value))} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select
              label="Filter by record type"
              hideLabel
              options={[{ value: "all", label: "All Record Types" }, ...RECORD_TYPE_OPTIONS]}
              value={typeFilter}
              onChange={(e) => updateFilter(() => setTypeFilter(e.target.value as "all" | MedicalRecordType))}
            />
            <Input label="Filter by date" hideLabel type="date" value={dateFilter} onChange={(e) => updateFilter(() => setDateFilter(e.target.value))} />
            <Select
              label="Filter by status"
              hideLabel
              options={[{ value: "all", label: "All Statuses" }, ...STATUS_OPTIONS]}
              value={statusFilter}
              onChange={(e) => updateFilter(() => setStatusFilter(e.target.value as "all" | MedicalRecordStatus))}
            />
          </div>
          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" icon={<XCircle size={14} aria-hidden="true" />} onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {records.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={<FolderHeart size={22} aria-hidden="true" />} title="No medical records yet" description="Records will appear here once patients' documents are uploaded and processed." />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<Search size={22} aria-hidden="true" />}
              title="No matching records"
              description="Try adjusting your search or filters."
              action={
                hasActiveFilters ? (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="mx-scrollbar hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[1120px] text-left text-sm">
                <thead>
                  <tr className="border-y border-mx-border bg-mx-surface-sunken text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">
                    <th className="px-5 py-3 font-semibold">Patient</th>
                    <th className="px-3 py-3 font-semibold">Patient UID</th>
                    <th className="px-3 py-3 font-semibold">Record Type</th>
                    <th className="px-3 py-3 font-semibold">Doctor</th>
                    <th className="px-3 py-3 font-semibold">Date</th>
                    <th className="px-3 py-3 font-semibold">Document</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <motion.tbody
                  key={`${patientFilter}-${doctorFilter}-${typeFilter}-${statusFilter}-${dateFilter}-${query}-${currentPage}`}
                  variants={staggerContainer(0.035)}
                  initial="hidden"
                  animate="show"
                >
                  {paged.map((record) => {
                    const primaryDoc = getPrimaryDocument(record);
                    return (
                      <motion.tr
                        key={record.id}
                        variants={staggerItem}
                        onClick={() => setSelectedRecord(record)}
                        className="cursor-pointer border-b border-mx-border transition-colors duration-150 last:border-b-0 hover:bg-mx-surface-sunken"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={record.patientName} size={34} />
                            <p className="truncate font-semibold text-mx-ink">{record.patientName}</p>
                          </div>
                        </td>
                        <td className="px-3 py-3 font-mono text-xs text-mx-ink-soft">{record.patientUID}</td>
                        <td className="px-3 py-3 text-mx-ink-soft">{RECORD_TYPE_LABEL[record.recordType]}</td>
                        <td className="px-3 py-3 text-mx-ink-soft">{record.doctorName}</td>
                        <td className="px-3 py-3 text-mx-ink-soft">{record.dateLabel}</td>
                        <td className="px-3 py-3">
                          <div className="flex min-w-0 items-center gap-1.5 text-mx-ink-soft">
                            <FileText size={13} className="shrink-0" aria-hidden="true" />
                            <span className="truncate">{primaryDoc.fileName}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <MedicalRecordStatusBadge status={record.status} />
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <IconAction label="View" onClick={() => setSelectedRecord(record)}>
                              <Eye size={14} aria-hidden="true" />
                            </IconAction>
                            <IconAction label="Open Document" onClick={() => openDocument(record)}>
                              <FileText size={14} aria-hidden="true" />
                            </IconAction>
                            <IconAction label="Download" onClick={() => handleDownload(primaryDoc)}>
                              <Download size={14} aria-hidden="true" />
                            </IconAction>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </motion.tbody>
              </table>
            </div>

            {/* Mobile stacked cards */}
            <motion.div
              key={`m-${patientFilter}-${doctorFilter}-${typeFilter}-${statusFilter}-${dateFilter}-${query}-${currentPage}`}
              variants={staggerContainer(0.035)}
              initial="hidden"
              animate="show"
              className="flex flex-col gap-3 p-4 sm:hidden"
            >
              {paged.map((record) => {
                const primaryDoc = getPrimaryDocument(record);
                return (
                  <motion.div key={record.id} variants={staggerItem}>
                    <Card interactive onClick={() => setSelectedRecord(record)} className="flex flex-col gap-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <Avatar name={record.patientName} size={36} />
                          <div>
                            <p className="font-semibold text-mx-ink">{record.patientName}</p>
                            <p className="font-mono text-xs text-mx-ink-muted">{record.patientUID}</p>
                          </div>
                        </div>
                        <MedicalRecordStatusBadge status={record.status} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-mx-ink-muted">
                        <span>{RECORD_TYPE_LABEL[record.recordType]}</span>
                        <span>{record.dateLabel}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-mx-ink-soft">
                        <FileText size={12} className="shrink-0" aria-hidden="true" />
                        <span className="truncate">{primaryDoc.fileName}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 border-t border-mx-border pt-2.5" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" icon={<Eye size={13} aria-hidden="true" />} onClick={() => setSelectedRecord(record)}>
                          View
                        </Button>
                        <Button variant="outline" size="sm" icon={<FileText size={13} aria-hidden="true" />} onClick={() => openDocument(record)}>
                          Open Document
                        </Button>
                        <Button variant="outline" size="sm" icon={<Download size={13} aria-hidden="true" />} onClick={() => handleDownload(primaryDoc)}>
                          Download
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>

            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onChange={setPage}
              summary={`Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)} of ${filtered.length} records`}
            />
          </>
        )}
      </Card>

      <MedicalRecordDetailsDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onPreviewDocument={previewFromDrawer}
        onDownloadDocument={handleDownload}
      />

      <MedicalRecordDocumentPreviewModal
        document={previewDoc?.document ?? null}
        patientName={previewDoc?.patientName}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownload}
      />
    </div>
  );
}

function IconAction({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-mx-sm text-mx-ink-soft transition-colors duration-150 hover:bg-mx-surface-sunken"
    >
      {children}
    </button>
  );
}