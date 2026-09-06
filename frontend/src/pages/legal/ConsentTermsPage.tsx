import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { useTranslation, LANGUAGE_OPTIONS } from "../../i18n";
import { cn } from "../../utils/cn";

/**
 * Standalone MediKiosk Consent Terms page.
 *
 * Companion to PrivacyPolicyPage, covering the specific consents given
 * during Patient Registration (AI processing, red-flag detection,
 * medical document handling, sharing with healthcare professionals, and
 * how to withdraw consent) that go beyond the general Privacy Policy.
 *
 * Intentionally self-contained (no PublicLayout / AuthLayout wrapper):
 * it must render with NO main site Navbar, NO registration form, NO
 * login form, NO dashboard chrome, and NO "Get Started" CTA — just the
 * consent content on the existing MediKiosk design system. Opened in a
 * new tab from Patient Registration, so it also carries its own minimal
 * header (logo + language + theme) rather than relying on a parent shell.
 */
export default function ConsentTermsPage() {
  const { t, language, setLanguage } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const s = t.consentTerms.sections;

  const fade = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  const sectionList: { heading: string; body: string }[] = [
    s.aiConsent,
    s.redFlagDetection,
    s.dataConsent,
    s.healthcareSharing,
    s.consentWithdrawal,
  ];

  return (
    <div className="min-h-screen min-h-[100svh] overflow-y-auto bg-mx-bg">
      <header className="sticky top-0 z-40 border-b border-mx-border bg-mx-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4 sm:px-10">
          <Logo size={28} withWordmark />
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2.5 text-xs"
              role="group"
              aria-label={t.a11y.switchLanguage}
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => setLanguage(opt.code)}
                  aria-pressed={opt.code === language}
                  className={cn(
                    "font-medium transition-colors",
                    opt.code === language
                      ? "text-mx-green-strong font-semibold"
                      : "text-mx-ink-muted hover:text-mx-ink-soft"
                  )}
                >
                  {opt.nativeLabel}
                </button>
              ))}
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <motion.main
        {...fade}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="mx-auto max-w-3xl px-6 py-10 sm:px-10 sm:py-14"
      >
        <p className="text-xs font-semibold uppercase tracking-wide text-mx-green-strong">
          {t.consentTerms.eyebrow}
        </p>
        <h1 className="font-display mt-2 text-2xl font-bold text-mx-ink sm:text-3xl">
          {t.consentTerms.title}
        </h1>
        <p className="mt-2 text-xs text-mx-ink-muted">
          {t.consentTerms.lastUpdatedLabel}: {t.consentTerms.lastUpdatedValue}
        </p>
        <p className="mt-5 text-sm leading-relaxed text-mx-ink-soft">{t.consentTerms.intro}</p>

        <div className="mt-8 flex flex-col gap-8">
          {sectionList.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-lg font-bold text-mx-ink">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-mx-ink-soft">{section.body}</p>
            </section>
          ))}
        </div>

        <Link
          to="/patient/register"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-mx-blue transition-colors hover:text-mx-green-strong"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {t.consentTerms.backLink}
        </Link>
      </motion.main>
    </div>
  );
}
