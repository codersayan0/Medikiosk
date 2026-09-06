import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck } from "lucide-react";
import { useTranslation } from "../../../i18n";
import { RevealHeading } from "../home/RevealHeading";
import { ScrollReveal } from "../home/Reveal";
import { ScaleIn, SlideUp } from "../home/motion";

// A real, scannable QR code — rendered client-side as crisp vector SVG (never
// a blurry raster image) so it looks sharp at any size. It intentionally
// encodes only a harmless, static demo string, never real patient/medical
// data, and exists purely to illustrate the "Secure Health ID" concept.
const DEMO_QR_VALUE = "MEDIKIOSK-DEMO-HEALTH-ID://sample-card";

type HealthIdCopy = {
  cardBrand: string;
  idLabel: string;
  idNumber: string;
  nameLabel: string;
  patientName: string;
  statusLabel: string;
  qrPlaceholderNote: string;
  qrCaption: string;
  secureCodeLabel: string;
  demoNote: string;
};

const TILT_MAX_DEG = 4;

/**
 * The Health ID card itself, isolated so it can own pointer state. On
 * devices with real hover + a fine pointer (desktop), the card tilts
 * gently toward the cursor and the secure-seal mark gets a soft glow. Touch
 * devices and reduced-motion users get a static card — no tilt, no
 * pointer tracking, content unchanged either way.
 */
function HealthIdCard({ home }: { home: HealthIdCopy }) {
  const prefersReducedMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);
  const canTilt =
    !prefersReducedMotion &&
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canTilt || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cardRef.current.style.setProperty("--tilt-x", `${(-py * TILT_MAX_DEG).toFixed(2)}deg`);
    cardRef.current.style.setProperty("--tilt-y", `${(px * TILT_MAX_DEG).toFixed(2)}deg`);
  };

  const handlePointerLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.setProperty("--tilt-x", "0deg");
    cardRef.current.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div className="mx-auto w-full max-w-sm [perspective:1000px]">
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        whileHover={canTilt ? { y: -4 } : undefined}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          transformStyle: "preserve-3d",
          // @ts-expect-error custom properties for the CSS-driven tilt
          "--tilt-x": "0deg",
          "--tilt-y": "0deg",
          transform: canTilt ? "rotateX(var(--tilt-x)) rotateY(var(--tilt-y))" : undefined,
          transition: "transform 250ms ease-out",
        }}
        className="group relative overflow-hidden rounded-mx-xl border border-mx-border bg-gradient-to-br from-mx-ink to-mx-ink-soft p-6 text-mx-ink-inverse shadow-mx-lg transition-shadow duration-200 ease-out hover:shadow-mx-xl"
      >
        <div className="flex items-center justify-between">
          <p className="font-display text-base font-extrabold tracking-tight">{home.cardBrand}</p>
          <ShieldCheck size={18} aria-hidden="true" />
        </div>

        <div className="mt-8 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-wide text-mx-ink-inverse/70 uppercase">{home.idLabel}</p>
            <p className="font-mono mt-1 text-lg font-bold tracking-wide">{home.idNumber}</p>

            <p className="mt-4 text-[10px] font-bold tracking-wide text-mx-ink-inverse/70 uppercase">{home.nameLabel}</p>
            <p className="mt-1 truncate text-sm font-semibold">{home.patientName}</p>

            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-mx-green/20 px-2.5 py-1 text-[10px] font-bold text-mx-green">
              <ShieldCheck size={11} aria-hidden="true" />
              {home.statusLabel}
            </span>
          </div>

          {/* Real, crisp QR code — same size/position as before, still framed in the
              brand gradient tile. Encodes only the harmless demo string above, never
              real patient data. */}
          <div
            className="relative flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-mx-md bg-gradient-to-br from-mx-green-strong to-mx-blue p-[3px] shadow-[0_0_0_1px_rgba(255,255,255,0.15)] transition-shadow duration-200 ease-out group-hover:shadow-[0_0_16px_2px_rgba(74,222,128,0.4)]"
            role="img"
            aria-label={home.qrPlaceholderNote}
          >
            <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-white p-[6px]">
              <QRCodeSVG
                value={DEMO_QR_VALUE}
                size={64}
                level="M"
                marginSize={0}
                bgColor="#FFFFFF"
                fgColor="#0E2233"
                className="h-full w-full"
              />
            </div>
          </div>
        </div>

        {/* Secure code strip — abstract, non-scannable stand-in for a serial/verification code */}
        <div className="mt-6 flex items-center gap-2 border-t border-white/10 pt-4">
          <div className="flex gap-[3px]" aria-hidden="true">
            {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2].map((h, i) => (
              <span
                key={i}
                className="w-[2.5px] rounded-full bg-mx-ink-inverse/40"
                style={{ height: `${h * 3 + 4}px` }}
              />
            ))}
          </div>
          <p className="font-mono ml-auto text-[10px] tracking-widest text-mx-ink-inverse/60 uppercase">
            {home.secureCodeLabel}
          </p>
        </div>
      </motion.div>

      <p className="mt-4 text-center text-xs text-mx-ink-muted">{home.qrCaption}</p>
      <p className="mt-1 text-center text-[11px] text-mx-ink-muted/80">{home.demoNote}</p>
    </div>
  );
}

/**
 * SECTION 11 — SECURE HEALTH ID
 * A premium digital-card mockup. The circular mark is a static, decorative
 * "secure seal" (ring + shield icon) — not a QR code, not qrcode.react, and
 * it deliberately does not encode any real data, per the spec's requirement
 * that this stay a visual placeholder only and never look like a
 * functional/scannable code.
 */
export function FeaturesHealthId() {
  const { t } = useTranslation();
  const home = t.features.healthId;

  return (
    <section className="bg-mx-bg/68 py-16 sm:py-24" aria-labelledby="healthid-features-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <p className="mb-2.5 text-xs font-bold tracking-wide text-mx-green-strong uppercase">{home.eyebrow}</p>
            <RevealHeading
              as="h2"
              id="healthid-features-heading"
              lines={[home.heading]}
              className="font-display max-w-md text-3xl leading-tight font-extrabold tracking-tight text-mx-ink sm:text-4xl"
            />
            <ScrollReveal as="p" variant={SlideUp} className="mt-4 max-w-md text-base text-mx-ink-soft">
              {home.description}
            </ScrollReveal>
          </div>

          <ScrollReveal variant={ScaleIn} amount={0.3}>
            <HealthIdCard home={home} />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}