import { ShieldCheck } from "lucide-react";
import { useTranslation } from "../../i18n";
import { cn } from "../../utils/cn";

interface SecureBadgeProps {
  label?: string;
  className?: string;
}

/** Reassures patients their data is protected — appears on sensitive screens (uploads, records, consent). */
export function SecureBadge({ label, className }: SecureBadgeProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-mx-md border border-mx-green/20 bg-mx-green-soft px-3.5 py-2.5 text-xs font-semibold text-mx-green-strong",
        className
      )}
    >
      <ShieldCheck size={16} aria-hidden="true" />
      {label ?? t.common.secureEnvironment}
    </div>
  );
}
