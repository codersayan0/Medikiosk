import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, RotateCcw, ShieldCheck, XCircle, User, Building2, Stethoscope, FileCheck2, Fingerprint } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { DoctorApplication } from "../../types";
import { Card, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Textarea } from "../ui/Textarea";
import { smallTransition } from "../../utils/motion";
import { approvalBlockedReason, countDocumentsVerified } from "../../utils/doctorApplications";
import { ADMIN_DASHBOARD_ROOT } from "../../data/adminDashboardNav";

interface ApproveDoctorModalProps {
  application: DoctorApplication;
  ready: boolean;
  onApprove: () => void;
  onRequestCorrection: (reason: string) => void;
  onReject: (reason: string) => void;
}

type InlineForm = "correction" | "reject" | null;

const ADMIN_NAME = "Ravi Kumar (Administrator)";

/** One label + value row used in both the pre-approval summary and the success screen. */
function SummaryRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-mx-sm bg-mx-surface-sunken text-mx-ink-muted">
        <Icon size={14} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-mx-ink-muted">{label}</p>
        <p className="truncate text-sm font-semibold text-mx-ink">{value}</p>
      </div>
    </div>
  );
}

/**
 * Verification & Approval final actions. "Approve & Verify Doctor" is
 * disabled until every checklist condition is met (see
 * VerificationChecklist / isReadyForApproval), and opens a confirmation
 * modal that shows exactly what's about to happen — doctor name,
 * organization, specialization, documents verified, and the approving
 * admin — before committing. Approving updates the application's status to
 * VERIFIED, assigns a doctor ID, stores verifiedBy/verifiedAt, and shows a
 * success screen with links into the rest of the admin dashboard.
 * "Request Correction" and "Reject Application" each require a short
 * reason, captured inline rather than via a second modal to keep the flow
 * on one screen.
 */
export function ApproveDoctorModal({ application, ready, onApprove, onRequestCorrection, onReject }: ApproveDoctorModalProps) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [approved, setApproved] = useState(false);
  const [inlineForm, setInlineForm] = useState<InlineForm>(null);
  const [reason, setReason] = useState("");

  const alreadyVerified = application.status === "verified";
  const alreadyRejected = application.status === "rejected";
  const blockedReason = approvalBlockedReason(application);
  const docCount = countDocumentsVerified(application);

  const handleConfirmApprove = () => {
    onApprove();
    setApproved(true);
  };

  const closeAndReset = () => {
    setConfirmOpen(false);
    setApproved(false);
  };

  const submitInline = () => {
    if (!reason.trim()) return;
    if (inlineForm === "correction") onRequestCorrection(reason.trim());
    if (inlineForm === "reject") onReject(reason.trim());
    setReason("");
    setInlineForm(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Final actions</CardTitle>
      </CardHeader>

      <div className="flex flex-wrap gap-2.5">
        <Button
          variant="primary"
          disabled={!ready || alreadyVerified}
          icon={<ShieldCheck size={16} aria-hidden="true" />}
          onClick={() => setConfirmOpen(true)}
        >
          {alreadyVerified ? "Doctor verified" : "Approve & Verify Doctor"}
        </Button>
        <Button
          variant="outline"
          disabled={alreadyVerified}
          icon={<RotateCcw size={16} aria-hidden="true" />}
          onClick={() => setInlineForm(inlineForm === "correction" ? null : "correction")}
        >
          Request Correction
        </Button>
        <Button
          variant="danger"
          disabled={alreadyRejected}
          icon={<XCircle size={16} aria-hidden="true" />}
          onClick={() => setInlineForm(inlineForm === "reject" ? null : "reject")}
        >
          Reject Application
        </Button>
      </div>

      {!ready && !alreadyVerified && blockedReason && (
        <p className="mt-3 rounded-mx-sm bg-mx-warning-soft px-3 py-2 text-xs font-semibold text-mx-warning">{blockedReason}</p>
      )}

      <AnimatePresence>
        {inlineForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={smallTransition}
            className="overflow-hidden"
          >
            <div className="mt-4 flex flex-col gap-2 border-t border-mx-border pt-4">
              <Textarea
                label={inlineForm === "correction" ? "What needs to be corrected?" : "Reason for rejection"}
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={
                  inlineForm === "correction"
                    ? "e.g. Registration certificate is unclear. Please upload a higher-quality copy."
                    : "e.g. Registration number could not be verified with the issuing authority"
                }
                required
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setInlineForm(null)}>
                  Cancel
                </Button>
                <Button variant={inlineForm === "reject" ? "danger" : "secondary"} size="sm" onClick={submitInline} disabled={!reason.trim()}>
                  {inlineForm === "correction" ? "Send correction request" : "Confirm rejection"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        isOpen={confirmOpen}
        onClose={() => !approved && closeAndReset()}
        title={approved ? "Doctor Verified Successfully" : "Verify Doctor Application?"}
        description={
          approved
            ? undefined
            : "Once verified, this doctor will become an approved member of your organization and can access the MediKiosk doctor portal."
        }
      >
        {approved ? (
          <div className="flex flex-col gap-4 py-1">
            <div className="flex flex-col items-center gap-2 pb-1 text-center">
              <motion.span
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={smallTransition}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong"
              >
                <CheckCircle2 size={30} aria-hidden="true" />
              </motion.span>
              <p className="text-sm text-mx-ink-soft">
                <span className="font-bold text-mx-ink">{application.personal.fullName}</span> is now an approved doctor of{" "}
                <span className="font-semibold text-mx-ink">{application.organization.organizationName}</span>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-mx-md bg-mx-surface-sunken p-3.5">
              <SummaryRow icon={Fingerprint} label="Doctor ID" value={application.doctorId ?? "—"} />
              <SummaryRow icon={User} label="Doctor name" value={application.personal.fullName} />
              <SummaryRow icon={Building2} label="Organization" value={application.organization.organizationName} />
              <SummaryRow icon={Stethoscope} label="Specialization" value={application.professional.specialization} />
              <SummaryRow icon={ShieldCheck} label="Verified on" value={application.verifiedAt ?? "—"} />
              <SummaryRow icon={FileCheck2} label="Verified by" value={application.verifiedBy ?? ADMIN_NAME} />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  closeAndReset();
                  navigate(`${ADMIN_DASHBOARD_ROOT}/doctor-applications`);
                }}
              >
                Back to Applications
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  closeAndReset();
                  navigate(`${ADMIN_DASHBOARD_ROOT}/doctors`);
                }}
              >
                Go to Doctors
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  closeAndReset();
                  navigate(`${ADMIN_DASHBOARD_ROOT}/doctors/${application.id}`);
                }}
              >
                View Doctor Profile
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 rounded-mx-md bg-mx-surface-sunken p-3.5">
              <SummaryRow icon={User} label="Doctor name" value={application.personal.fullName} />
              <SummaryRow icon={Building2} label="Organization" value={application.organization.organizationName} />
              <SummaryRow icon={Stethoscope} label="Specialization" value={application.professional.specialization} />
              <SummaryRow icon={FileCheck2} label="Documents verified" value={`${docCount.verified}/${docCount.total}`} />
              <SummaryRow icon={ShieldCheck} label="Approving admin" value={ADMIN_NAME} />
            </div>
            <div className="flex justify-end gap-2.5">
              <Button variant="outline" onClick={closeAndReset}>
                Cancel
              </Button>
              <Button variant="primary" icon={<ShieldCheck size={16} aria-hidden="true" />} onClick={handleConfirmApprove}>
                Approve &amp; Verify
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
}