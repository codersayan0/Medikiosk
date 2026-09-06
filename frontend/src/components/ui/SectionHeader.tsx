import type { ReactNode } from "react";
import { cn } from "../../utils/cn";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ eyebrow, title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-mx-green-strong">{eyebrow}</p>
        )}
        <h2 className="font-display text-xl font-bold text-mx-ink sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-mx-ink-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
