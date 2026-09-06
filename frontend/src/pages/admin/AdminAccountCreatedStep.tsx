import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Building2, Check, Copy, Download, LayoutGrid, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { AdminRegistrationProgress } from "../../components/admin/AdminRegistrationProgress";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";
import type { AdminOrganizationFormState } from "./adminRegisterTypes";

interface AdminAccountCreatedStepProps {
  form: AdminOrganizationFormState;
  onGoToDashboard: () => void;
}

/** A single labelled row in the Organization Details list, e.g. "Organization Name — City Care Hospital". */
function DetailRow({ icon: Icon, label, value }: { icon: typeof Building2; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-mx-border py-2.5 last:border-b-0">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-mx-sm bg-mx-green-soft text-mx-green-strong">
          <Icon size={15} aria-hidden="true" />
        </span>
        <span className="text-sm text-mx-ink-muted">{label}</span>
      </div>
      <span className="text-sm font-semibold text-mx-ink">{value || "—"}</span>
    </div>
  );
}

/**
 * Admin Registration — Step 3 (Account Created), the final step. Reached
 * after Email Verification (AdminEmailVerificationStep — see
 * AdminRegisterPage). Same own-header + left "Registration Progress"
 * sidebar shell as Step 1.
 *
 * Issues the organization's permanent Hospital/Organization ID
 * (HSP-XXXXX) here — this is the identifier doctors and patients later
 * use to find and link to this hospital elsewhere in the app, so it's
 * shown prominently with a copy affordance rather than buried in a
 * details list.
 */
export function AdminAccountCreatedStep({ form, onGoToDashboard }: AdminAccountCreatedStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const { setHasPageHeader } = useTheme();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHasPageHeader(true);
    return () => setHasPageHeader(false);
  }, [setHasPageHeader]);

  const fade = prefersReducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  // Demo-only identifier — a real backend issues the permanent Hospital/
  // Organization ID on account activation; kept stable for the lifetime
  // of this mount. This is the ID doctors and patients later use to find
  // and link to this hospital elsewhere in the app.
  const organizationId = useMemo(() => {
    const randomDigits = String(Math.floor(10000 + Math.random() * 90000));
    return `HSP-${randomDigits}`;
  }, []);

  function handleCopyId() {
    navigator.clipboard?.writeText(organizationId).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-mx-bg lg:h-full">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-mx-border bg-mx-surface-raised px-4 py-2.5 sm:px-6">
        <Logo size={30} withWordmark />
        <div className="flex items-center gap-2.5">
          <LanguageSelector />
          <ThemeSwitcher />
        </div>
      </header>

      <motion.div
        {...fade}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 sm:px-6 lg:py-5"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          <AdminRegistrationProgress currentStepIndex={2} className="lg:order-1" />

          <div className="flex flex-col items-center gap-4 lg:order-2">
            <Card className="w-full max-w-2xl text-center">
              <div className="flex flex-col items-center gap-3 py-2">
                {/* Celebratory check with a light confetti scatter, per spec. */}
                <div className="relative flex h-24 w-24 items-center justify-center">
                  <span className="absolute -left-2 top-1 h-1.5 w-1.5 rounded-full bg-mx-blue" aria-hidden="true" />
                  <span className="absolute right-0 top-0 h-1 w-1 rounded-full bg-mx-warning" aria-hidden="true" />
                  <span
                    className="absolute -right-3 top-6 h-2 w-2 rotate-45 rounded-[2px] bg-mx-green"
                    aria-hidden="true"
                  />
                  <span className="absolute left-1 bottom-2 h-1.5 w-1.5 rounded-full bg-mx-ink-muted/40" aria-hidden="true" />
                  <span
                    className="absolute -left-1 bottom-0 h-1.5 w-1.5 rotate-45 rounded-[2px] bg-mx-blue"
                    aria-hidden="true"
                  />
                  <span className="absolute right-2 bottom-1 h-1 w-1 rounded-full bg-mx-warning" aria-hidden="true" />
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                    <Check size={30} strokeWidth={3} aria-hidden="true" />
                  </span>
                </div>

                <h1 className="font-display text-xl font-bold text-mx-ink sm:text-2xl">
                  Account Created <span className="text-mx-green-strong">Successfully!</span>
                </h1>
                <p className="max-w-md text-sm text-mx-ink-muted">
                  Your organization account has been created and verified.
                  <br className="hidden sm:block" /> You can now access your admin dashboard.
                </p>

                <div className="mt-2 w-full rounded-mx-md border border-mx-green/25 bg-mx-green-soft px-4 py-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-mx-green-strong">
                    Your Organization ID
                  </p>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="font-display text-2xl font-bold text-mx-green-strong sm:text-3xl">
                      {organizationId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      aria-label="Copy organization ID"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-surface-raised text-mx-green-strong shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Copy size={14} aria-hidden="true" />
                    </button>
                  </div>
                  <p className={cn("mt-1 text-[11px] font-medium", copied ? "text-mx-green-strong" : "text-transparent")}>
                    Copied!
                  </p>
                  <div className="mt-1 border-t border-mx-green/20 pt-2 text-xs text-mx-ink-muted">
                    Keep this ID safe. You will need it for future reference.
                  </div>
                </div>

                <div className="mt-2 w-full text-left">
                  <h2 className="font-display text-sm font-bold text-mx-ink">Organization Details</h2>
                  <div className="mt-1.5">
                    <DetailRow icon={Building2} label="Organization Name" value={form.organizationName} />
                    <DetailRow icon={Mail} label="Official Email" value={form.officialEmail} />
                    <DetailRow icon={Phone} label="Official Phone" value={form.officialPhone} />
                    <DetailRow icon={User} label="Admin Name" value={form.adminFullName} />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  className="mt-2"
                  icon={<LayoutGrid size={16} aria-hidden="true" />}
                  onClick={onGoToDashboard}
                >
                  Go to Admin Dashboard →
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  fullWidth
                  icon={<Download size={16} aria-hidden="true" />}
                >
                  Download Confirmation
                </Button>
              </div>
            </Card>

            <div className="flex flex-col items-center gap-0.5 text-center text-xs text-mx-ink-muted">
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="shrink-0 text-mx-green" aria-hidden="true" />
                <span>Thank you for registering with MediKiosk.</span>
              </div>
              <span>We're excited to have your organization on board.</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}