import { useState } from "react";
import { FileText, Eye, Download, CheckCircle2, XCircle, Clock, RotateCcw } from "lucide-react";
import type { ApplicationDocument, DocumentVerificationStatus } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Textarea } from "../ui/Textarea";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/cn";

const STATUS_META: Record<DocumentVerificationStatus, { label: string; tone: "warning" | "green" | "danger" | "purple"; icon: typeof Clock }> = {
  pending: { label: "Pending Verification", tone: "warning", icon: Clock },
  verified: { label: "Verified", tone: "green", icon: CheckCircle2 },
  rejected: { label: "Rejected", tone: "danger", icon: XCircle },
  reupload_requested: { label: "Re-upload Requested", tone: "purple", icon: RotateCcw },
};

type InlineAction = "reject" | "reupload" | null;

interface DocumentVerificationCardProps {
  document: ApplicationDocument;
  onSetStatus: (status: DocumentVerificationStatus, note?: string) => void;
  onRequestReupload: (reason: string) => void;
}

/**
 * A single uploaded-document card in the Application Detail page's
 * "Uploaded Documents" section. Lets the admin preview the document
 * in-place (Modal, so they never leave the application), download it, and
 * take one of three actions — Verify, Reject, or Request Re-upload — each
 * feeding directly into the verification checklist's "All required
 * documents verified" condition (see utils/doctorApplications.ts).
 * Reject and Request Re-upload both require a reason; Reject is a harder
 * stop (the document is refused outright), Request Re-upload asks the
 * doctor for a better copy without closing the application out.
 */
export function DocumentVerificationCard({ document: doc, onSetStatus, onRequestReupload }: DocumentVerificationCardProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [inlineAction, setInlineAction] = useState<InlineAction>(null);
  const [note, setNote] = useState(doc.note ?? "");
  const { showToast } = useToast();
  const meta = STATUS_META[doc.verificationStatus];
  const StatusIcon = meta.icon;

  const openInline = (action: InlineAction) => {
    setNote(doc.note ?? "");
    setInlineAction((current) => (current === action ? null : action));
  };

  const submitInline = () => {
    if (!note.trim()) return;
    if (inlineAction === "reject") {
      onSetStatus("rejected", note.trim());
      showToast({ tone: "warning", title: "Document rejected", description: `${doc.name} was marked as rejected.` });
    } else if (inlineAction === "reupload") {
      onRequestReupload(note.trim());
      showToast({ tone: "info", title: "Re-upload requested", description: `${doc.name} — the doctor will be asked to resubmit.` });
    }
    setInlineAction(null);
    setNote("");
  };

  return (
    <Card interactive className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-mx-md bg-mx-blue-soft text-mx-blue">
          <FileText size={18} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-mx-ink">{doc.name}</p>
          <p className="mt-0.5 text-xs text-mx-ink-muted">
            {doc.fileType} · {doc.fileSizeLabel} · Uploaded {doc.uploadedAt}
          </p>
        </div>
      </div>

      <Badge tone={meta.tone} icon={<StatusIcon size={12} aria-hidden="true" />} className="w-fit">
        {meta.label}
      </Badge>

      {doc.note && (
        <p className="rounded-mx-sm bg-mx-surface-sunken px-3 py-2 text-xs text-mx-ink-soft">
          <span className="font-semibold text-mx-ink">Note: </span>
          {doc.note}
        </p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-mx-border pt-3">
        <Button variant="outline" size="sm" icon={<Eye size={14} aria-hidden="true" />} onClick={() => setPreviewOpen(true)}>
          View
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<Download size={14} aria-hidden="true" />}
          onClick={() => showToast({ tone: "info", title: "Download started", description: doc.name })}
        >
          Download
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={doc.verificationStatus === "verified" ? "primary" : "outline"}
          size="sm"
          icon={<CheckCircle2 size={14} aria-hidden="true" />}
          onClick={() => {
            setInlineAction(null);
            onSetStatus("verified");
          }}
        >
          Verify
        </Button>
        <Button
          variant={doc.verificationStatus === "rejected" ? "danger" : "outline"}
          size="sm"
          icon={<XCircle size={14} aria-hidden="true" />}
          onClick={() => openInline("reject")}
        >
          Reject
        </Button>
        <Button
          variant={doc.verificationStatus === "reupload_requested" ? "secondary" : "outline"}
          size="sm"
          icon={<RotateCcw size={14} aria-hidden="true" />}
          onClick={() => openInline("reupload")}
        >
          Request Re-upload
        </Button>
      </div>

      {inlineAction && (
        <div className="flex flex-col gap-2 border-t border-mx-border pt-3">
          <Textarea
            label={inlineAction === "reject" ? "Reason for rejection" : "What needs to be re-uploaded?"}
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={
              inlineAction === "reject"
                ? "e.g. Registration number could not be verified with the issuing authority"
                : "e.g. Registration certificate is unclear. Please upload a higher-quality copy."
            }
            required
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setInlineAction(null)}>
              Cancel
            </Button>
            <Button variant={inlineAction === "reject" ? "danger" : "secondary"} size="sm" onClick={submitInline} disabled={!note.trim()}>
              {inlineAction === "reject" ? "Confirm rejection" : "Send re-upload request"}
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={doc.name}
        description={`${doc.fileType} · ${doc.fileSizeLabel} · Uploaded ${doc.uploadedAt}`}
        footer={
          <>
            <Button variant="outline" size="sm" icon={<Download size={14} aria-hidden="true" />} onClick={() => showToast({ tone: "info", title: "Download started", description: doc.name })}>
              Download
            </Button>
            <Button size="sm" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
          </>
        }
      >
        <div
          className={cn(
            "flex h-72 items-center justify-center rounded-mx-md border border-dashed border-mx-border-strong bg-mx-surface-sunken text-mx-ink-muted"
          )}
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <FileText size={32} aria-hidden="true" />
            <p className="text-sm font-semibold">Document preview</p>
            <p className="max-w-[220px] text-xs">{doc.name} would render here once file storage is connected.</p>
          </div>
        </div>
      </Modal>
    </Card>
  );
}