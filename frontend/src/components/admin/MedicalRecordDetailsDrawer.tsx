import type { ReactNode } from "react";
import { Stethoscope, Building2, CalendarDays, FileText, Eye, Download, NotebookText } from "lucide-react";
import type { MedicalRecord, MedicalRecordDocument } from "../../types";
import { Avatar } from "../ui/Avatar";
import { Drawer } from "../ui/Drawer";
import { MedicalRecordStatusBadge } from "./MedicalRecordStatusBadge";
import { RECORD_TYPE_LABEL } from "../../utils/medicalRecords";

interface MedicalRecordDetailsDrawerProps {
  record: MedicalRecord | null;
  onClose: () => void;
  onPreviewDocument: (document: MedicalRecordDocument) => void;
  onDownloadDocument: (document: MedicalRecordDocument) => void;
}

/**
 * Full medical record profile drawer opened from the Medical Records table
 * (row click or "View"). Surfaces patient info, the record's clinical
 * details, and every attached document — each document's own View/Download
 * actions hand off to MedicalRecordDocumentPreviewModal, kept as a sibling
 * component in the page so the same preview UI is reachable from the
 * table's "Open Document" action too.
 */
export function MedicalRecordDetailsDrawer({ record, onClose, onPreviewDocument, onDownloadDocument }: MedicalRecordDetailsDrawerProps) {
  return (
    <Drawer isOpen={Boolean(record)} onClose={onClose} title={record ? RECORD_TYPE_LABEL[record.recordType] : ""} description={record ? `Patient UID: ${record.patientUID}` : undefined}>
      {record && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3.5 rounded-mx-lg border border-mx-border bg-mx-surface-sunken/60 p-4">
            <Avatar name={record.patientName} size={52} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-base font-bold text-mx-ink">{record.patientName}</p>
              <p className="font-mono text-xs text-mx-ink-muted">{record.patientUID}</p>
            </div>
            <MedicalRecordStatusBadge status={record.status} />
          </div>

          {/* Medical record information */}
          <Section title="Medical Record Information">
            <InfoRow icon={FileText} label="Record Type" value={RECORD_TYPE_LABEL[record.recordType]} />
            <InfoRow icon={CalendarDays} label="Record Date" value={record.dateLabel} />
            <InfoRow icon={Stethoscope} label="Doctor" value={record.doctorName} />
            <InfoRow icon={Building2} label="Department" value={record.department} />
          </Section>

          {/* Notes */}
          <Section title="Notes">
            <div className="flex items-start gap-3 rounded-mx-sm border border-mx-border bg-mx-surface p-3">
              <NotebookText size={15} className="mt-0.5 shrink-0 text-mx-ink-muted" aria-hidden="true" />
              <p className="text-sm text-mx-ink-soft">{record.notes}</p>
            </div>
          </Section>

          {/* Attached documents */}
          <Section title={`Attached Documents (${record.documents.length})`}>
            <div className="flex flex-col gap-2.5">
              {record.documents.map((doc) => (
                <div key={doc.id} className="flex items-center gap-3 rounded-mx-md border border-mx-border p-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-mx-sm bg-mx-purple-soft text-mx-purple">
                    <FileText size={16} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-mx-ink">{doc.fileName}</p>
                    <p className="text-xs text-mx-ink-muted">
                      {doc.fileType} · {doc.fileSizeLabel} · Uploaded {doc.uploadedAt}
                    </p>
                  </div>
                  <MedicalRecordStatusBadge status={doc.verificationStatus} className="hidden sm:inline-flex" />
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      aria-label={`View ${doc.fileName}`}
                      title="View"
                      onClick={() => onPreviewDocument(doc)}
                      className="flex h-8 w-8 items-center justify-center rounded-mx-sm text-mx-ink-muted transition-colors duration-150 hover:bg-mx-surface-sunken"
                    >
                      <Eye size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Download ${doc.fileName}`}
                      title="Download"
                      onClick={() => onDownloadDocument(doc)}
                      className="flex h-8 w-8 items-center justify-center rounded-mx-sm text-mx-ink-muted transition-colors duration-150 hover:bg-mx-surface-sunken"
                    >
                      <Download size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </Drawer>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-bold uppercase tracking-wide text-mx-ink-muted">{title}</p>
      {children}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Stethoscope; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-mx-sm bg-mx-surface-sunken text-mx-ink-muted">
        <Icon size={13} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-mx-ink-muted">{label}</p>
        <p className="text-sm font-semibold text-mx-ink">{value}</p>
      </div>
    </div>
  );
}