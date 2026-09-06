import { cn } from "../../utils/cn";

type ResolvedGender = "male" | "female" | "neutral";

interface PatientAvatarProps {
  /**
   * Raw gender value/label as already stored in registration state
   * (patient.gender) — e.g. "Male", "female", "Other", "Prefer not to say",
   * or empty/undefined. Never hard-code a specific patient's avatar; this
   * is the only input that should decide which illustration renders, and
   * the same field will carry straight over once profile data comes from
   * a real backend.
   */
  gender?: string;
  size?: number;
  className?: string;
  /**
   * Optional uploaded/backend patient photo. When present it replaces the
   * illustrated silhouette entirely — this keeps the component ready for
   * a real `patient.profileImageUrl` without any shape change once the
   * backend exists.
   */
  imageUrl?: string;
}

/** Normalizes any casing/whitespace and treats "Other" / "Prefer not to
 *  say" / missing values as neutral so the UI never breaks or shows a
 *  broken image. */
function resolveGender(gender?: string): ResolvedGender {
  const value = gender?.trim().toLowerCase();
  if (value === "male") return "male";
  if (value === "female") return "female";
  return "neutral";
}

const TONE_STYLES: Record<ResolvedGender, { bg: string; fg: string }> = {
  male: { bg: "bg-mx-blue-soft", fg: "text-mx-blue" },
  female: { bg: "bg-mx-purple-soft", fg: "text-mx-purple" },
  neutral: { bg: "bg-mx-surface-sunken", fg: "text-mx-ink-soft" },
};

const LABEL: Record<ResolvedGender, string> = {
  male: "Male patient avatar",
  female: "Female patient avatar",
  neutral: "Patient avatar",
};

/**
 * Circular profile illustration for the Review Summary "Personal
 * Information" card. Picked purely from the patient's stored gender field
 * — simple flat bust silhouettes (no photographic/real-person imagery),
 * colored with the app's existing blue/purple/neutral tone tokens so it
 * matches the rest of the MediKiosk icon language instead of introducing
 * a new visual style.
 */
export function PatientAvatar({ gender, size = 56, className, imageUrl }: PatientAvatarProps) {
  const resolved = resolveGender(gender);
  const tone = TONE_STYLES[resolved];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={LABEL[resolved]}
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn("flex shrink-0 items-center justify-center overflow-hidden rounded-full", tone.bg, className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={LABEL[resolved]}
    >
      <svg viewBox="0 0 64 64" className={cn("h-[82%] w-[82%]", tone.fg)} aria-hidden="true">
        {resolved === "female" && (
          <>
            {/* Hair volume behind the head */}
            <ellipse cx="32" cy="20" rx="15.5" ry="14.5" fill="currentColor" />
            {/* Hair reaching past the shoulders on each side */}
            <rect x="15.5" y="19" width="7" height="23" rx="3.5" fill="currentColor" />
            <rect x="41.5" y="19" width="7" height="23" rx="3.5" fill="currentColor" />
          </>
        )}

        {resolved === "male" && (
          /* Short cropped hair cap — the head circle below covers its
             lower half, leaving just a cap visible above the hairline. */
          <ellipse cx="32" cy="17.5" rx="12.5" ry="8" fill="currentColor" />
        )}

        {/* Head */}
        <circle cx="32" cy="24" r="12" fill="currentColor" />

        {/* Shoulders / bust, drawn last so it cleanly closes off the
            bottom of any hair shapes at the neckline. */}
        <path d="M6 58c0-13.25 11.65-24 26-24s26 10.75 26 24z" fill="currentColor" />
      </svg>
    </div>
  );
}
