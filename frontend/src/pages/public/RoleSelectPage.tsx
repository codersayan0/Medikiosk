import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { User, Stethoscope, ShieldCheck, ArrowRight, Plus } from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { useTranslation } from "../../i18n";
import { cn } from "../../utils/cn";

type RoleAccent = "green" | "blue" | "purple";

interface RoleCardConfig {
  accent: RoleAccent;
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
}

const ACCENT_STYLES: Record<
  RoleAccent,
  { border: string; iconBg: string; iconText: string; glow: string; ring: string }
> = {
  green: {
    border: "hover:border-mx-green focus-visible:border-mx-green",
    iconBg: "bg-mx-green-soft",
    iconText: "text-mx-green-strong",
    glow: "group-hover:shadow-[0_0_0_1px_var(--mx-green),0_18px_40px_-16px_var(--mx-green)]",
    ring: "bg-mx-green text-mx-ink-inverse",
  },
  blue: {
    border: "hover:border-mx-blue focus-visible:border-mx-blue",
    iconBg: "bg-mx-blue-soft",
    iconText: "text-mx-blue",
    glow: "group-hover:shadow-[0_0_0_1px_var(--mx-blue),0_18px_40px_-16px_var(--mx-blue)]",
    ring: "bg-mx-blue text-mx-ink-inverse",
  },
  purple: {
    border: "hover:border-mx-purple focus-visible:border-mx-purple",
    iconBg: "bg-mx-purple-soft",
    iconText: "text-mx-purple",
    glow: "group-hover:shadow-[0_0_0_1px_var(--mx-purple),0_18px_40px_-16px_var(--mx-purple)]",
    ring: "bg-mx-purple text-mx-ink-inverse",
  },
};

/**
 * Role Selection gateway. Shown when the visitor clicks "Login" in the
 * Navbar — a dedicated, minimal authentication gateway (not the marketing
 * chrome) that routes to the existing Patient / Doctor / Admin login pages,
 * each opened in a new tab. No auth logic lives here; this screen only
 * decides *where* to send the person next.
 */
export default function RoleSelectPage() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();

  const roles: RoleCardConfig[] = [
    {
      accent: "green",
      href: "/patient/login",
      icon: <User size={26} aria-hidden="true" />,
      title: t.roleSelect.patientTitle,
      description: t.roleSelect.patientDescription,
    },
    {
      accent: "blue",
      href: "/doctor/login",
      icon: <Stethoscope size={26} aria-hidden="true" />,
      title: t.roleSelect.doctorTitle,
      description: t.roleSelect.doctorDescription,
    },
    {
      accent: "purple",
      href: "/admin/login",
      icon: <ShieldCheck size={26} aria-hidden="true" />,
      title: t.roleSelect.adminTitle,
      description: t.roleSelect.adminDescription,
    },
  ];

  function openRole(href: string) {
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="relative flex min-h-screen min-h-[100svh] flex-col overflow-hidden bg-mx-bg">
      {/* ============================== Decorative backdrop ============================== */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-mx-green/10 blur-3xl" />
        <div className="absolute -right-24 bottom-1/4 h-72 w-72 rounded-full bg-mx-blue/10 blur-3xl" />
        <div className="absolute right-1/3 top-0 h-56 w-56 rounded-full bg-mx-purple/10 blur-3xl" />

        <svg className="absolute left-[8%] top-[18%] hidden h-14 w-14 opacity-30 sm:block" viewBox="0 0 56 56">
          {Array.from({ length: 4 }).map((_, row) =>
            Array.from({ length: 4 }).map((_, col) => (
              <circle key={`${row}-${col}`} cx={6 + col * 15} cy={6 + row * 15} r="2" fill="var(--mx-green)" />
            ))
          )}
        </svg>

        <Plus className="absolute right-[12%] top-[16%] hidden h-6 w-6 text-mx-blue/25 lg:block" strokeWidth={3} />
        <Plus className="absolute left-[14%] bottom-[20%] hidden h-5 w-5 text-mx-purple/25 lg:block" strokeWidth={3} />

        <svg
          className="absolute top-[22%] left-0 hidden w-full opacity-[0.35] sm:block"
          height="70"
          viewBox="0 0 500 70"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 35 H140 L162 10 L186 60 L210 24 L230 35 H500"
            stroke="var(--mx-green)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <svg
          className="absolute bottom-[16%] left-0 hidden w-full opacity-[0.3] sm:block"
          height="70"
          viewBox="0 0 500 70"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 35 H260 L282 12 L306 58 L330 26 L350 35 H500"
            stroke="var(--mx-blue)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* ============================== Minimal top bar ============================== */}
      <div className="relative z-10 flex shrink-0 items-center px-5 py-5 sm:px-8 sm:py-6">
        <Link to="/" className="rounded-mx-sm transition-transform duration-200 hover:scale-[1.02]">
          <Logo size={28} withWordmark />
        </Link>
      </div>

      {/* ============================== Gateway content ============================== */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-10 pt-2 sm:px-6">
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: -10 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="mb-9 text-center sm:mb-12"
        >
          <h1 className="font-display text-2xl font-extrabold text-mx-ink sm:text-3xl">
            {t.roleSelect.title} <span className="text-[var(--mx-green-strong)]">{t.roleSelect.titleHighlight}</span>
          </h1>
          <p className="mt-2 text-sm text-mx-ink-muted sm:text-base">{t.roleSelect.subtitle}</p>
        </motion.div>

        <div className="grid w-full max-w-5xl grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
          {roles.map((role, index) => {
            const accent = ACCENT_STYLES[role.accent];
            return (
              <motion.button
                key={role.href}
                type="button"
                onClick={() => openRole(role.href)}
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: "easeOut", delay: prefersReducedMotion ? 0 : index * 0.08 }}
                whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "group flex flex-col items-center rounded-mx-lg border border-mx-border bg-mx-surface-raised px-6 py-8 text-center shadow-mx-sm transition-[box-shadow,border-color,background-color] duration-200 focus:outline-none focus-visible:outline-none",
                  accent.border,
                  accent.glow
                )}
              >
                <span
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-105",
                    accent.iconBg,
                    accent.iconText
                  )}
                >
                  {role.icon}
                </span>

                <h2 className="font-display mt-5 text-xl font-bold text-mx-ink">{role.title}</h2>
                <p className="mt-2 max-w-[220px] text-sm text-mx-ink-muted">{role.description}</p>

                <span
                  className={cn(
                    "mt-6 flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5",
                    accent.ring
                  )}
                >
                  <ArrowRight size={17} aria-hidden="true" />
                </span>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-10 flex items-center gap-2 text-xs font-medium text-mx-ink-muted sm:mt-12"
        >
          <ShieldCheck size={15} className="text-mx-green" aria-hidden="true" />
          <span>{t.roleSelect.footerNote}</span>
        </motion.div>
      </div>
    </div>
  );
}
