import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { motion, useReducedMotion } from "framer-motion";
import { Download, Share2, ShieldCheck, Info, Check } from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { PatientAvatar } from "../../../components/healthcare/PatientAvatar";
import { usePatientRecord } from "../../../context/PatientContext";
import { entranceTransition } from "../../../utils/motion";

/** How long the Download button shows a checkmark before reverting — matches the pattern used for Lab Report downloads. */
const SUCCESS_STATE_MS = 1000;
/** Small deliberate delay before the QR reveals, after the patient info has settled in — this is the patient's "ID card" moment. */
const QR_REVEAL_DELAY = 0.18;

/**
 * "My Health ID" — the patient's scannable QR identity card. Authorized
 * healthcare professionals scan this to pull up the patient record
 * according to the patient's access permissions.
 */
export default function HealthIdPage() {
  const { identity } = usePatientRecord();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [downloaded, setDownloaded] = useState(false);

  const qrValue = JSON.stringify({ uid: identity.uid });

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `${identity.uid}-health-id.png`;
    link.click();
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), SUCCESS_STATE_MS);
  };

  const handleShare = async () => {
    const shareText = `${identity.name} — Patient UID: ${identity.uid}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "My MediKiosk Health ID", text: shareText });
      } catch {
        // user cancelled — no-op
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-mx-ink">My Health ID</h1>
        <p className="mt-1 text-sm text-mx-ink-muted">Show this to hospital staff to quickly identify your record.</p>
      </div>

      <Card className="flex flex-col items-center gap-4 text-center">
        {/* Patient info settles in first — this is the "ID card" moment, so it gets a slightly more deliberate reveal than the rest of the app. */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={entranceTransition}
        >
          <PatientAvatar gender={identity.gender} imageUrl={identity.photoUrl} size={80} />

          <div>
            <p className="font-display text-xl font-bold text-mx-ink">{identity.name}</p>
            <p className="text-sm text-mx-ink-muted">
              {identity.age} Years · {identity.gender}
            </p>
          </div>

          {identity.verified && (
            <Badge tone="green" icon={<ShieldCheck size={12} aria-hidden="true" />}>
              Verified
            </Badge>
          )}

          <dl className="w-full space-y-1.5 rounded-mx-md bg-mx-surface-sunken px-4 py-3 text-left text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-mx-ink-muted">Patient UID</dt>
              <dd className="font-mono font-semibold text-mx-ink">{identity.uid}</dd>
            </div>
          </dl>
        </motion.div>

        {/* QR reveals as a soft scale/fade slightly after — a deliberate beat, not everything landing at once. */}
        <motion.div
          className="w-full max-w-[220px] rounded-mx-md border border-mx-border bg-white p-4"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...entranceTransition, delay: prefersReducedMotion ? 0 : QR_REVEAL_DELAY }}
        >
          <QRCodeCanvas ref={canvasRef} value={qrValue} size={188} className="h-auto max-w-full" includeMargin={false} />
        </motion.div>

        <p className="flex items-start gap-2 text-left text-xs text-mx-ink-muted">
          <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          The QR code can be used by authorized healthcare professionals to identify your patient record according
          to your access permissions.
        </p>

        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button
            size="md"
            icon={downloaded ? <Check size={16} aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
            className="sm:flex-1"
            onClick={handleDownload}
          >
            {downloaded ? "Downloaded" : "Download QR Code"}
          </Button>
          <Button size="md" variant="outline" icon={<Share2 size={16} aria-hidden="true" />} className="sm:flex-1" onClick={handleShare}>
            Share
          </Button>
        </div>
      </Card>
    </div>
  );
}