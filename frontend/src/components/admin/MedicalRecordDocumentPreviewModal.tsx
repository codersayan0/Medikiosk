import { FileText, Download } from "lucide-react";
import type { MedicalRecordDocument } from "../../types";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { MedicalRecordStatusBadge } from "./MedicalRecordStatusBadge";

interface MedicalRecordDocumentPreviewModalProps {
  document: MedicalRecordDocument | null;
  /** Patient name shown in the modal description for context, since a document can be opened straight from the table. */
  patientName?: string;
  onClose: () => void;
  onDownload: (document: MedicalRecordDocument) => void;
}

/**
 * Document preview interface for a single attached document — reachable via
 * the table's "Open Document" row action or the "View" action on a document
 * row inside MedicalRecordDetailsDrawer. Mirrors the preview pattern already
 * used for doctor verification documents (see DocumentVerificationCard) so
 * the same visual language covers every document viewer in the admin app.
 */
export function MedicalRecordDocumentPreviewModal({ document: doc, patientName, onClose, onDownload }: MedicalRecordDocumentPreviewModalProps) {
  return (
    <Modal
      isOpen={Boolean(doc)}
      onClose={onClose}
      title={doc?.fileName ?? ""}
      description={doc ? `${doc.fileType} · ${doc.fileSizeLabel} · Uploaded ${doc.uploadedAt}${patientName ? ` · ${patientName}` : ""}` : undefined}
      footer={
        doc && (
          <>
            <Button variant="outline" size="sm" icon={<Download size={14} aria-hidden="true" />} onClick={() => onDownload(doc)}>
              Download
            </Button>
            <Button size="sm" onClick={onClose}>
              Close
            </Button>
          </>
        )
      }
    >
      {doc && (
        <div className="flex flex-col gap-3">
          <MedicalRecordStatusBadge status={doc.verificationStatus} className="w-fit" />
          <div className="flex h-72 items-center justify-center rounded-mx-md border border-dashed border-mx-border-strong bg-mx-surface-sunken text-mx-ink-muted">
            <div className="flex flex-col items-center gap-2 text-center">
              <FileText size={32} aria-hidden="true" />
              <p className="text-sm font-semibold">Document preview</p>
              <p className="max-w-[240px] text-xs">{doc.fileName} would render here once file storage is connected.</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}