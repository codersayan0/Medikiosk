import { NavLink } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import { Logo } from "../ui/Logo";
import { useTranslation } from "../../i18n";
import type { SidebarNavItem } from "../../data/navigation";
import { cn } from "../../utils/cn";

interface DashboardSidebarProps {
  navItems: SidebarNavItem[];
  onNavigate?: () => void;
}

export function DashboardSidebar({ navItems, onNavigate }: DashboardSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-mx-border bg-mx-surface">
      <div className="flex h-16 items-center border-b border-mx-border px-5">
        <Logo size={28} />
      </div>

      <nav className="mx-scrollbar flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={`${item.labelKey}-${item.path}`}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-mx-sm px-3 py-2.5 text-sm font-semibold text-mx-ink-soft hover:bg-mx-surface-sunken",
                  isActive && "bg-mx-green-soft text-mx-green-strong"
                )
              }
            >
              <Icon size={18} aria-hidden="true" />
              {t.nav[item.labelKey]}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-mx-border p-3">
        <div className="flex items-center gap-2 rounded-mx-sm bg-mx-green-soft px-3 py-2.5 text-xs font-semibold text-mx-green-strong">
          <ShieldCheck size={15} aria-hidden="true" />
          {t.common.secureEnvironment}
        </div>
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-mx-sm px-3 py-2.5 text-sm font-semibold text-mx-ink-soft hover:bg-mx-surface-sunken"
        >
          <LogOut size={18} aria-hidden="true" />
          {t.nav.logout}
        </button>
      </div>
    </aside>
  );
}
