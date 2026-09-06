import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Logo } from "../ui/Logo";
import { LanguageSelector } from "../ui/LanguageSelector";
import { useTranslation } from "../../i18n";

/**
 * SECTION 28 — FOOTER
 * The site-wide premium footer, shared by every public page (including the
 * end of the animated homepage). Built from the same phase3 translation
 * content so it stays in sync across English, Bengali, and Hindi.
 */
export function Footer() {
  const { t } = useTranslation();
  const footer = t.home.phase3.footer;

  return (
    <footer className="border-t border-mx-border bg-mx-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <Logo size={30} />
            <div className="mt-3 font-display text-sm font-bold text-mx-ink">
              {footer.brandTagline.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-mx-green-strong">
              <ShieldCheck size={14} aria-hidden="true" />
              Consent-based &middot; ABDM / ABHA integration ready
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-bold tracking-wide text-mx-ink-muted uppercase">{footer.productHeading}</p>
              <ul className="space-y-2 text-sm text-mx-ink-soft">
                {footer.productLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="hover:text-mx-green-strong">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold tracking-wide text-mx-ink-muted uppercase">{footer.companyHeading}</p>
              <ul className="space-y-2 text-sm text-mx-ink-soft">
                {footer.companyLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="hover:text-mx-green-strong">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold tracking-wide text-mx-ink-muted uppercase">{footer.trustHeading}</p>
              <ul className="space-y-2 text-sm text-mx-ink-soft">
                {footer.trustLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="hover:text-mx-green-strong">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-mx-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-mx-ink-muted">
            &copy; {new Date().getFullYear()} {footer.copyright}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-mx-ink-muted">{footer.languagesHeading}</span>
            <LanguageSelector compact />
          </div>
        </div>
      </div>
    </footer>
  );
}
