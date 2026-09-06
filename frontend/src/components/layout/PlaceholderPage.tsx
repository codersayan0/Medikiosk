import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";
import { Logo } from "../ui/Logo";
import { Badge } from "../ui/Badge";
import { useTranslation } from "../../i18n";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  partLabel?: string;
}

/**
 * Foundation placeholder for pages explicitly out of scope for Part A
 * (landing, how-it-works, features, all auth screens, registration, all
 * dashboards' real content). Confirms routing + layout + theme + i18n
 * all work end-to-end without building the actual feature yet.
 */
export function PlaceholderPage({ title, description, icon: Icon = Construction, partLabel }: PlaceholderPageProps) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <Logo size={40} withWordmark={false} />
      <Badge tone="purple" icon={<Icon size={13} aria-hidden="true" />} className="mt-5">
        {partLabel ?? t.common.comingInPartB}
      </Badge>
      <h1 className="font-display mt-4 max-w-lg text-2xl font-bold text-mx-ink sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-md text-sm text-mx-ink-muted">{description}</p>
    </div>
  );
}
