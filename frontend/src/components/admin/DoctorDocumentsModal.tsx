import { CheckCircle2, Clock, Download, Eye, FileText, RotateCcw, XCircle } from "lucide-react";
import type { ApplicationDocument, DocumentVerificationStatus } from "../../types";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";

const STATUS_META: Record<DocumentVerificationStatus, { label: string; tone: "warning" | "green" | "danger" | "purple"; icon: typeof Clock }> = {
  pending: { label: "Pending", tone: "warning", icon: Clock },
  verified: { label: "Verified", tone: "green", icon: CheckCircle2 },
  rejected: { label: "Rejected", tone: "danger", icon: XCircle },
  reupload_requested: { label: "Re-upload Requested", tone: "purple", icon: RotateCcw },
};

interface DoctorDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctorName: string;
  documents: ApplicationDocument[];
}

/**
 * Read-only document list for the Doctors page's "View Documents" action.
 * Verifying/rejecting a document is intentionally NOT possible here — that
 * workflow belongs to the Doctor Applications review flow only.
 */
export function DoctorDocumentsModal({ isOpen, onClose, doctorName, documents }: DoctorDocumentsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Uploaded Documents" description={`${doctorName}'s submitted verification documents.`}>
      <div className="flex flex-col gap-2.5">
        {documents.map((doc) => {
          const meta = STATUS_META[doc.verificationStatus];
          const Icon = meta.icon;
          return (
            <div key={doc.id} className="flex items-center gap-3 rounded-mx-md border border-mx-border p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-mx-sm bg-mx-surface-sunken text-mx-ink-muted">
                <FileText size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-mx-ink">{doc.name}</p>
                <p className="text-xs text-mx-ink-muted">
                  {doc.fileType} · {doc.fileSizeLabel} · Uploaded {doc.uploadedAt}
                </p>
              </div>
              <Badge tone={meta.tone} icon={<Icon size={11} aria-hidden="true" />}>
                {meta.label}
              </Badge>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  aria-label={`Preview ${doc.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-mx-sm text-mx-ink-muted transition-colors duration-150 hover:bg-mx-surface-sunken"
                >
                  <Eye size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={`Download ${doc.name}`}
                  className="flex h-8 w-8 items-center justify-center rounded-mx-sm text-mx-ink-muted transition-colors duration-150 hover:bg-mx-surface-sunken"
                >
                  <Download size={14} aria-hidden="true" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}