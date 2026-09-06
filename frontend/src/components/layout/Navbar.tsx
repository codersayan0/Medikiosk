import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { Logo } from "../ui/Logo";
import { LanguageSelector } from "../ui/LanguageSelector";
import { ThemeSwitcher } from "../ui/ThemeSwitcher";
import { useTranslation } from "../../i18n";
import { cn } from "../../utils/cn";

const LINKS = [
  { to: "/", key: "home" as const },
  { to: "/features", key: "features" as const },
  { to: "/#for-patients", key: "forPatients" as const },
  { to: "/#for-doctors", key: "forDoctors" as const },
  { to: "/#how-it-works", key: "howItWorks" as const },
  { to: "/#about", key: "about" as const },
];

/** Anchor-only links (a hash on the homepage) never get the "active" pill —
 *  only real, distinct pages do. Keeps the nav from lighting up two items
 *  at once (e.g. Home + How It Works) while sitting on the homepage. */
const isAnchorLink = (to: string) => to.includes("#");

/**
 * Public marketing navigation. Grows subtler as the page scrolls — a
 * shorter bar, a slightly smaller mark, a touch more blur — so it stays out
 * of the way of the cinematic homepage without ever hiding. Patient/doctor
 * dashboards use their own sidebar layout instead of this navbar.
 */
export function Navbar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route change so it never lingers open.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // "Home" always lands at the very top. If we're already on the homepage,
  // there's no route/hash change for React Router to react to, so we
  // smooth-scroll manually instead of relying on navigation.
  const handleHomeClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-mx-border bg-mx-surface/90 backdrop-blur transition-[height,box-shadow] duration-300",
        scrolled ? "shadow-mx-sm" : "shadow-none"
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 transition-[height] duration-300 sm:px-6",
          scrolled ? "h-14" : "h-16"
        )}
      >
        <Link
          to="/"
          className={cn(
            "shrink-0 origin-left rounded-mx-sm transition-transform duration-300",
            scrolled && "scale-90"
          )}
        >
          <Logo size={30} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={link.key === "home" ? handleHomeClick : undefined}
              className={({ isActive }) =>
                cn(
                  "group relative rounded-mx-sm px-3.5 py-2 text-sm font-semibold text-mx-ink-soft transition-colors duration-200 hover:bg-mx-surface-sunken hover:text-mx-ink",
                  isActive && !isAnchorLink(link.to) && "bg-mx-green-soft text-mx-green-strong"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {t.nav[link.key]}
                  {/* Smooth hover underline — grows from center, independent of the active pill */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-center scale-x-0 rounded-full bg-mx-green transition-transform duration-300 ease-out group-hover:scale-x-100",
                      isActive && !isAnchorLink(link.to) && "scale-x-100 bg-mx-green-strong"
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <LanguageSelector />
          <ThemeSwitcher />
          <motion.div whileHover={prefersReducedMotion ? undefined : { y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/login"
              className="inline-flex h-9 items-center justify-center rounded-mx-sm border border-mx-border-strong px-3.5 text-sm font-semibold text-mx-ink transition-[background-color,box-shadow] duration-200 hover:bg-mx-surface-sunken hover:shadow-mx-sm"
            >
              {t.nav.login}
            </Link>
          </motion.div>
          <motion.div whileHover={prefersReducedMotion ? undefined : { y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/get-started"
              className="group inline-flex h-9 items-center justify-center gap-1.5 rounded-mx-sm bg-mx-green px-4 text-sm font-semibold text-mx-ink-inverse transition-[background-color,box-shadow] duration-200 hover:bg-mx-green-strong hover:shadow-mx-sm"
            >
              {t.nav.getStarted}
              <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>

        <button
          type="button"
          className="rounded-mx-sm p-2 text-mx-ink lg:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={t.a11y.openMenu}
        >
          {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-mx-border bg-mx-surface lg:hidden"
          >
            <motion.div
              initial={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="px-4 py-4"
            >
              <nav className="flex flex-col gap-1" aria-label="Primary mobile">
                {LINKS.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={prefersReducedMotion ? undefined : { opacity: 0, x: -12 }}
                    animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.06 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <NavLink
                      to={link.to}
                      end={link.to === "/"}
                      onClick={(e) => {
                        if (link.key === "home") handleHomeClick(e);
                        setMobileOpen(false);
                      }}
                      className={({ isActive }) =>
                        cn(
                          "block rounded-mx-sm px-3.5 py-2.5 text-sm font-semibold text-mx-ink-soft transition-colors hover:bg-mx-surface-sunken",
                          isActive && !isAnchorLink(link.to) && "bg-mx-green-soft text-mx-green-strong"
                        )
                      }
                    >
                      {t.nav[link.key]}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-3 flex items-center gap-2">
                <LanguageSelector compact />
                <ThemeSwitcher />
              </div>
              <div className="mt-3 flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-mx-sm border border-mx-border-strong text-sm font-semibold text-mx-ink transition-colors active:scale-[0.97]"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/get-started"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-mx-sm bg-mx-green text-sm font-semibold text-mx-ink-inverse transition-colors active:scale-[0.97]"
                >
                  {t.nav.getStarted}
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
