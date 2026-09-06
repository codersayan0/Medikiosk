import { useState } from "react";
import type { ReactNode } from "react";
import { Menu, PhoneCall } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import { LanguageSelector } from "../ui/LanguageSelector";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import { Avatar } from "../ui/Avatar";
import { Button } from "../ui/Button";
import { useTranslation } from "../../i18n";
import type { SidebarNavItem } from "../../data/navigation";

interface DashboardLayoutProps {
  navItems: SidebarNavItem[];
  userName: string;
  pageTitle: string;
  children: ReactNode;
}

/**
 * Shared shell for every role dashboard (patient / doctor / admin). A fixed
 * sidebar on desktop collapses into a slide-over drawer on mobile so
 * patient-facing screens stay usable on small phones.
 */
export function DashboardLayout({ navItems, userName, pageTitle, children }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-mx-bg">
      <div className="hidden lg:block">
        <DashboardSidebar navItems={navItems} />
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-mx-ink/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <div className="relative z-10">
            <DashboardSidebar navItems={navItems} onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-mx-border bg-mx-surface px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="rounded-mx-sm p-2 text-mx-ink lg:hidden"
              onClick={() => setDrawerOpen(true)}
              aria-label={t.a11y.openMenu}
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <h1 className="font-display truncate text-lg font-bold text-mx-ink">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="danger" size="sm" icon={<PhoneCall size={14} aria-hidden="true" />} className="hidden sm:inline-flex">
              {t.nav.emergency}
            </Button>
            <div className="hidden sm:block">
              <LanguageSelector compact />
            </div>
            <div className="hidden sm:block">
              <ThemeSwitcher />
            </div>
            <Avatar name={userName} size={36} />
          </div>
        </header>

        <main className="mx-scrollbar flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">{children}</main>
      </div>
    </div>
  );
}
