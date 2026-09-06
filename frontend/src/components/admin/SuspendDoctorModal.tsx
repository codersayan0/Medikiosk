import { useState } from "react";
import { Ban, ShieldCheck } from "lucide-react";
import type { DoctorApplication } from "../../types";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Textarea } from "../ui/Textarea";

interface SuspendDoctorModalProps {
  application: DoctorApplication | null;
  mode: "suspend" | "activate" | null;
  onClose: () => void;
  onConfirmSuspend: (reason: string) => void;
  onConfirmActivate: () => void;
}

/** Confirmation modal for suspending or reactivating a verified doctor's account. */
export function SuspendDoctorModal({ application, mode, onClose, onConfirmSuspend, onConfirmActivate }: SuspendDoctorModalProps) {
  const [reason, setReason] = useState("");

  if (!application || !mode) return null;
  const isSuspend = mode === "suspend";

  const handleClose = () => {
    setReason("");
    onClose();
  };

  const handleConfirm = () => {
    if (isSuspend) {
      if (!reason.trim()) return;
      onConfirmSuspend(reason.trim());
    } else {
      onConfirmActivate();
    }
    setReason("");
  };

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title={isSuspend ? "Suspend Doctor Account?" : "Activate Doctor Account?"}
      description={
        isSuspend
          ? `${application.personal.fullName} will immediately lose access to the MediKiosk doctor portal until reactivated.`
          : `${application.personal.fullName} will regain full access to the MediKiosk doctor portal.`
      }
    >
      <div className="flex flex-col gap-4">
        {isSuspend && (
          <Textarea
            label="Reason for suspension"
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Pending review following a patient complaint"
          />
        )}
        <div className="flex justify-end gap-2.5">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant={isSuspend ? "danger" : "primary"}
            icon={isSuspend ? <Ban size={16} aria-hidden="true" /> : <ShieldCheck size={16} aria-hidden="true" />}
            onClick={handleConfirm}
            disabled={isSuspend && !reason.trim()}
          >
            {isSuspend ? "Suspend Account" : "Activate Account"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}