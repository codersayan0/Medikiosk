import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Hash,
  Hospital,
  Info,
  Loader2,
  Lock,
  Search,
  Send,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "../../components/ui/Logo";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { DoctorRegistrationProgress } from "../../components/doctor/DoctorRegistrationProgress";
import { DoctorHospitalApplicationSidebar } from "../../components/doctor/DoctorHospitalApplicationSidebar";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";
import { cn } from "../../utils/cn";
import { findHospital } from "./doctorHospitalTypes";
import type { SelectedHospital } from "./doctorHospitalTypes";

type HospitalSearchMode = "id" | "name";

interface DoctorHospitalApplicationStepProps {
  onBack: () => void;
  /** Doctor sent the application to the selected hospital. */
  onSendApplication: (hospital: SelectedHospital) => void;
  /** Doctor chose to complete this step later from their dashboard. */
  onSkip: () => void;
}

/**
 * Doctor Registration — Step 5 (Hospital Application), shown right after
 * Documents / License Upload and before Account Created. The doctor
 * searches for and sends a professional application to a specific
 * hospital (by Hospital ID or Hospital Name) rather than waiting on a
 * generic platform-level admin review. Default state has no hospital
 * searched or selected yet, and "Send Your Application" stays disabled
 * until one is found. Same header/3-column/card shell as every other
 * full-page step, with a step-specific right sidebar
 * (DoctorHospitalApplicationSidebar) instead of the generic Why Join /
 * Registration Tips stack.
 *
 * Once sent, the doctor moves to
 * DoctorHospitalApplicationSubmittedStep — the submitted/pending-review
 * state — which reuses the exact same `SelectedHospital` record produced
 * here (see doctorHospitalTypes) so hospital details never drift between
 * the two screens.
 */
export function DoctorHospitalApplicationStep({ onBack, onSendApplication, onSkip }: DoctorHospitalApplicationStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const { setHasPageHeader } = useTheme();
  const { showToast } = useToast();

  const [searchMode, setSearchMode] = useState<HospitalSearchMode>("id");
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<SelectedHospital | null>(null);

  useEffect(() => {
    setHasPageHeader(true);
    return () => setHasPageHeader(false);
  }, [setHasPageHeader]);

  const fade = prefersReducedMotion ? {} : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } };

  function handleModeChange(mode: HospitalSearchMode) {
    setSearchMode(mode);
    setQuery("");
    setSearchError(null);
  }

  function handleSearch() {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchError(searchMode === "id" ? "Enter a Hospital ID to search." : "Enter a Hospital Name to search.");
      return;
    }

    setSearchError(null);
    setIsSearching(true);
    setSelectedHospital(null);

    // Demo-only simulated lookup — a real backend calls a hospital directory API here.
    window.setTimeout(() => {
      setIsSearching(false);
      const match = findHospital(searchMode, trimmed);

      if (match) {
        setSelectedHospital(match);
      } else {
        setSearchError(
          searchMode === "id"
            ? "No hospital found with that Hospital ID. Double-check and try again."
            : "No hospital found with that name. Try the Hospital ID instead."
        );
      }
    }, 600);
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSearch();
    }
  }

  function handleSendApplication() {
    if (!selectedHospital) return;
    onSendApplication(selectedHospital);
    showToast({
      tone: "success",
      title: "Application sent",
      description: `Your application was sent to ${selectedHospital.name}.`,
    });
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
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)_280px] xl:grid-cols-[260px_minmax(0,1fr)_300px]">
          <DoctorRegistrationProgress currentStepIndex={4} className="lg:order-1" />

          <div className="flex flex-col gap-4 lg:order-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span className="inline-flex items-center rounded-full bg-mx-green-soft px-2.5 py-1 text-xs font-semibold text-mx-green-strong">
                  Step 5 of 6
                </span>
                <h1 className="mt-2 font-display text-lg font-bold text-mx-ink sm:text-xl">Hospital Application</h1>
                <p className="mt-1 max-w-xl text-xs leading-snug text-mx-ink-muted sm:text-sm">
                  Select a hospital and send your professional application for review. The hospital admin will
                  review your details and documents.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                icon={<ChevronRight size={15} aria-hidden="true" />}
                iconPosition="right"
                className="shrink-0"
                onClick={onSkip}
              >
                Skip This Step
              </Button>
            </div>

            <div className="flex items-start gap-2.5 rounded-mx-lg border border-mx-blue/20 bg-mx-blue-soft px-3.5 py-3 text-mx-blue">
              <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">Want to complete registration later?</p>
                <p className="mt-0.5 text-xs leading-relaxed">
                  You can skip this step now and apply to a hospital from your dashboard later.
                </p>
              </div>
            </div>

            <Card>
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-mx-ink-soft" aria-hidden="true" />
                <h2 className="font-display text-sm font-bold text-mx-ink">Search Hospital</h2>
              </div>

              <div className="mt-3 flex items-center gap-5 border-b border-mx-border">
                <button
                  type="button"
                  onClick={() => handleModeChange("id")}
                  className={cn(
                    "-mb-px border-b-2 pb-2 text-sm font-semibold transition-colors",
                    searchMode === "id"
                      ? "border-mx-green text-mx-green-strong"
                      : "border-transparent text-mx-ink-muted hover:text-mx-ink-soft"
                  )}
                >
                  Search by Hospital ID
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("name")}
                  className={cn(
                    "-mb-px border-b-2 pb-2 text-sm font-semibold transition-colors",
                    searchMode === "name"
                      ? "border-mx-green text-mx-green-strong"
                      : "border-transparent text-mx-ink-muted hover:text-mx-ink-soft"
                  )}
                >
                  Search by Hospital Name
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-mx-ink-muted">
                    {searchMode === "id" ? <Hash size={16} aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
                  </span>
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder={searchMode === "id" ? "Enter Hospital ID (e.g. HSP-10245)" : "Enter Hospital Name"}
                    aria-label={searchMode === "id" ? "Hospital ID" : "Hospital Name"}
                    className="h-11 w-full rounded-mx-sm border border-mx-border-strong bg-mx-surface pl-10 pr-3.5 text-sm text-mx-ink placeholder:text-mx-ink-muted focus:border-mx-blue"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  isLoading={isSearching}
                  onClick={handleSearch}
                  className="shrink-0 border-mx-green text-mx-green-strong hover:bg-mx-green-soft"
                >
                  Search Hospital
                </Button>
              </div>

              {searchError && (
                <p role="alert" className="mt-2.5 text-xs font-medium text-mx-danger">
                  {searchError}
                </p>
              )}

              <div className="my-4 flex items-center gap-3 text-xs font-medium text-mx-ink-muted">
                <span className="h-px flex-1 bg-mx-border" aria-hidden="true" />
                OR
                <span className="h-px flex-1 bg-mx-border" aria-hidden="true" />
              </div>

              {isSearching ? (
                <div className="flex flex-col items-center justify-center gap-3 rounded-mx-lg border border-dashed border-mx-border-strong bg-mx-surface-sunken/60 px-6 py-10 text-center">
                  <Loader2 size={22} className="animate-spin text-mx-ink-muted" aria-hidden="true" />
                  <p className="text-sm font-medium text-mx-ink-muted">Searching for the hospital…</p>
                </div>
              ) : selectedHospital ? (
                <div className="flex flex-col items-start gap-3 rounded-mx-lg border border-mx-green/30 bg-mx-green-soft px-5 py-5 sm:flex-row sm:items-center">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-mx-surface-raised text-mx-green-strong">
                    <Hospital size={22} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-sm font-bold text-mx-ink">{selectedHospital.name}</p>
                      {selectedHospital.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-mx-surface-raised px-2 py-0.5 text-[11px] font-semibold text-mx-green-strong">
                          <ShieldCheck size={11} aria-hidden="true" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-mx-ink-soft">
                      {selectedHospital.city}, {selectedHospital.state}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-mx-green-strong">Hospital ID: {selectedHospital.id}</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedHospital(null)}>
                    Change
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 rounded-mx-lg border border-dashed border-mx-border-strong bg-mx-surface-sunken/60 px-6 py-10 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-mx-surface text-mx-ink-muted">
                    <Hospital size={26} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display text-sm font-bold text-mx-ink">Search for a Hospital</p>
                    <p className="mt-1 max-w-xs text-sm text-mx-ink-muted">
                      Enter a Hospital ID or Hospital Name to view hospital details and send your application.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-start gap-2.5 rounded-mx-lg border border-mx-blue/20 bg-mx-blue-soft px-3.5 py-3 text-xs font-medium leading-relaxed text-mx-blue">
                <Info size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>You can apply to only one hospital at a time.</span>
              </div>
            </Card>

            <div className="flex flex-col-reverse items-center justify-between gap-3 pt-1 sm:flex-row">
              <Button type="button" variant="outline" size="md" icon={<ArrowLeft size={16} aria-hidden="true" />} onClick={onBack}>
                Back
              </Button>
              <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                <Button type="button" variant="ghost" size="md" onClick={onSkip}>
                  Skip This Step
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={!selectedHospital}
                  icon={<Send size={16} aria-hidden="true" />}
                  iconPosition="right"
                  onClick={handleSendApplication}
                  className="shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0 disabled:translate-y-0 disabled:shadow-none"
                >
                  Send Your Application
                </Button>
              </div>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-center text-xs text-mx-ink-muted">
              <Lock size={12} className="shrink-0" aria-hidden="true" />
              You can edit your details before final submission.
            </p>
          </div>

          <DoctorHospitalApplicationSidebar className="lg:order-3" />
        </div>
      </motion.div>
    </div>
  );
}
