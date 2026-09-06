import { cn } from "../../utils/cn";
import logoMark from "../../assets/mediKiosk-logo-mark.png";

interface LogoProps {
  /** Pixel size of the icon mark. Wordmark text scales relative to this. */
  size?: number;
  /** Show "MediKiosk" wordmark next to the mark. */
  withWordmark?: boolean;
  /** Show the tagline under the wordmark (requires withWordmark). */
  withTagline?: boolean;
  className?: string;
}

/**
 * The MediKiosk brand mark. Renders the provided logo image asset at the
 * requested pixel size, preserving aspect ratio (source is a 1:1 square
 * transparent PNG, so it never stretches or crops). Same hover interaction
 * as before. This is the single shared branding component — every screen
 * that shows the MediKiosk mark renders it through here.
 */
export function Logo({ size = 36, withWordmark = true, withTagline = false, className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={logoMark}
        width={size}
        height={size}
        alt="MediKiosk logo"
        className="shrink-0 select-none object-contain transition-[transform,filter] duration-300 ease-out hover:scale-105 hover:drop-shadow-[0_0_5px_var(--mx-green)] motion-reduce:hover:scale-100 motion-reduce:hover:drop-shadow-none"
        style={{ width: size, height: size }}
        draggable={false}
      />
      {withWordmark && (
        <div className="leading-tight">
          <span className="font-display block text-[1.35em] font-extrabold tracking-tight text-mx-ink">
            Medi<span className="text-[var(--mx-green-strong)]">Kiosk</span>
          </span>
          {withTagline && (
            <span className="block text-xs font-medium text-mx-ink-muted">
              Your Health. Your History. Your Care.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
