import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { useTranslation, LANGUAGE_OPTIONS } from "../../i18n";
import { cn } from "../../utils/cn";

/**
 * Standalone MediKiosk Privacy Policy page.
 *
 * Intentionally self-contained (no PublicLayout / AuthLayout wrapper):
 * it must render with NO main site Navbar, NO registration form, NO
 * login form, NO dashboard chrome, and NO "Get Started" CTA — just the
 * policy content on the existing MediKiosk design system. Opened in a
 * new tab from Patient Registration, so it also carries its own minimal
 * header (logo + language + theme) rather than relying on a parent shell.
 */
export default function PrivacyPolicyPage() {
  const { t, language, setLanguage } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const s = t.privacyPolicy.sections;

  const fade = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  const sectionList: { heading: string; body: string }[] = [
    s.introduction,
    s.howWeUse,
    s.consent,
    s.dataSecurity,
    s.dataStorage,
    s.dataSharing,
    s.clinicalVerification,
    s.userRights,
    s.dataRetention,
    s.thirdParty,
    s.cookies,
    s.childrensPrivacy,
    s.policyUpdates,
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
          {t.privacyPolicy.eyebrow}
        </p>
        <h1 className="font-display mt-2 text-2xl font-bold text-mx-ink sm:text-3xl">
          {t.privacyPolicy.title}
        </h1>
        <p className="mt-2 text-xs text-mx-ink-muted">
          {t.privacyPolicy.lastUpdatedLabel}: {t.privacyPolicy.lastUpdatedValue}
        </p>
        <p className="mt-5 text-sm leading-relaxed text-mx-ink-soft">{t.privacyPolicy.intro}</p>

        <div className="mt-8 flex flex-col gap-8">
          {/* Introduction */}
          <section>
            <h2 className="font-display text-lg font-bold text-mx-ink">{s.introduction.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-mx-ink-soft">{s.introduction.body}</p>
          </section>

          {/* Information We Collect (with subsections) */}
          <section>
            <h2 className="font-display text-lg font-bold text-mx-ink">{s.infoCollected.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-mx-ink-soft">{s.infoCollected.intro}</p>
            <div className="mt-4 flex flex-col gap-4 border-l-2 border-mx-border pl-4">
              <div>
                <h3 className="text-sm font-semibold text-mx-ink">{s.infoCollected.accountInfo.heading}</h3>
                <p className="mt-1 text-sm leading-relaxed text-mx-ink-soft">
                  {s.infoCollected.accountInfo.body}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-mx-ink">{s.infoCollected.abdmEmail.heading}</h3>
                <p className="mt-1 text-sm leading-relaxed text-mx-ink-soft">
                  {s.infoCollected.abdmEmail.body}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-mx-ink">{s.infoCollected.healthInfo.heading}</h3>
                <p className="mt-1 text-sm leading-relaxed text-mx-ink-soft">
                  {s.infoCollected.healthInfo.body}
                </p>
              </div>
            </div>
          </section>

          {sectionList.slice(1).map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-lg font-bold text-mx-ink">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-mx-ink-soft">{section.body}</p>
            </section>
          ))}

          {/* Contact Information */}
          <section className="rounded-mx-lg border border-mx-border bg-mx-surface-raised p-5">
            <h2 className="font-display text-lg font-bold text-mx-ink">{s.contact.heading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-mx-ink-soft">{s.contact.body}</p>
            <p className="mt-2 text-sm font-medium text-mx-ink">{s.contact.email}</p>
          </section>
        </div>

        <Link
          to="/patient/register"
          className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-mx-blue transition-colors hover:text-mx-green-strong"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          {t.privacyPolicy.backLink}
        </Link>
      </motion.main>
    </div>
  );
}
