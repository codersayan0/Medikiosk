import type { ReactNode } from "react";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import { useTheme } from "../../context/ThemeContext";

/**
 * Used by standalone, full-screen auth pages (patient/doctor/admin login).
 * These are dedicated authentication gateways, not marketing pages — they
 * render edge-to-edge with NO site Navbar/Footer, filling exactly the
 * viewport height (100vh/100svh) so the page never scrolls on desktop.
 * The floating theme toggle in the top-right corner is only a stand-in for
 * screens that have no header of their own (Login, Register, OTP). Some
 * steps rendered inside this layout (Document Upload, AI Health Interview,
 * Review Summary, Account Created) have their own full header with a
 * LanguageSelector + ThemeSwitcher already built in — those set
 * `hasPageHeader` via useTheme() while mounted, so this floating one hides
 * instead of doubling up behind/over the page's own controls.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  const { hasPageHeader } = useTheme();

  return (
    <div className="relative flex min-h-screen min-h-[100svh] flex-col bg-mx-bg lg:h-screen lg:overflow-hidden">
      {!hasPageHeader && (
        <div className="absolute right-4 top-4 z-50 sm:right-6 sm:top-6">
          <ThemeSwitcher />
        </div>
      )}
      <main className="min-h-0 flex-1 lg:overflow-hidden">{children}</main>
    </div>
  );
}
