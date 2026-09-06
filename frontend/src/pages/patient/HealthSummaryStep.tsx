import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  History,
  Info,
  Pencil,
  ScanSearch,
  ShieldAlert,
  ShieldCheck as ConfidenceIcon,
  Sparkles,
} from "lucide-react";

import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { SegmentedTabs } from "../../components/ui/SegmentedTabs";
import type { SegmentedTab } from "../../components/ui/SegmentedTabs";
import { MedicalIcon } from "../../components/healthcare/MedicalIcon";
import { Section, Prose } from "../../components/healthcare/ClinicalSummarySections";
import { RegistrationProgressSidebar } from "../../components/patient/RegistrationProgressSidebar";

import { useTranslation } from "../../i18n";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../context/ToastContext";

import type {
  AnalysisResult,
  BadgeTone,
} from "../../types";

interface HealthSummaryStepProps {
  analysisResult: AnalysisResult;

  onBack: () => void;
  onContinue: () => void;

  /*
   * Real Gemini analysis data.
   * These values come from the registration AI response,
   * not from MOCK_PATIENT_RECORD.
   */
  analysisSummary?: string;
  keyFindings?: string[];
  abnormalValues?: string[];
  possibleConcerns?: string[];
  recommendations?: string[];

  generatedOn?: string;
  lastUpdated?: string;

  /*
   * Called when patient edits and saves the AI summary.
   * The registration parent keeps the edited value and sends it
   * to the backend during final account creation.
   */
  onEditSummary?: (value: string) => void;
}

type SummaryTabId =
  | "summary"
  | "keyFindings"
  | "labHighlights"
  | "timeline"
  | "lifestyleAyush";

const EMPTY_TEXT = "No information available from the current AI analysis.";

export function HealthSummaryStep({
  analysisResult,
  onBack,
  onContinue,
  analysisSummary = "",
  keyFindings = [],
  abnormalValues = [],
  possibleConcerns = [],
  recommendations = [],
  generatedOn = "",
  lastUpdated = "",
  onEditSummary,
}: HealthSummaryStepProps) {
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation();
  const hs = t.healthSummary;
  const { setHasPageHeader } = useTheme();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] =
    useState<SummaryTabId>("summary");

  const [isEditing, setIsEditing] =
    useState(false);

  const [editedSummary, setEditedSummary] =
    useState(analysisSummary);

  useEffect(() => {
    setEditedSummary(analysisSummary);
  }, [analysisSummary]);

  useEffect(() => {
    setHasPageHeader(true);

    return () => {
      setHasPageHeader(false);
    };
  }, [setHasPageHeader]);

  const findingConcerns = useMemo(
    () =>
      analysisResult.findings.filter(
        (finding) =>
          finding.priority === "high" ||
          finding.priority === "critical"
      ).length,
    [analysisResult.findings]
  );

  const potentialConcerns =
    possibleConcerns.length > 0
      ? possibleConcerns.length
      : findingConcerns;

  const fade = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      };

  const tabs: SegmentedTab<SummaryTabId>[] = [
    {
      id: "summary",
      label: hs.tabs.summary,
    },
    {
      id: "keyFindings",
      label: hs.tabs.keyFindings,
    },
    {
      id: "labHighlights",
      label: hs.tabs.labHighlights,
    },
    {
      id: "timeline",
      label: hs.tabs.timeline,
    },
    {
      id: "lifestyleAyush",
      label: hs.tabs.lifestyleAyush,
    },
  ];

  const metrics: {
    icon: LucideIcon;
    tone: BadgeTone;
    value: string;
    label: string;
  }[] = [
    {
      icon: ClipboardList,
      tone: "green",
      value: String(
        analysisResult.documentsAnalyzed
      ),
      label: hs.metrics.documentsAnalyzed,
    },
    {
      icon: ScanSearch,
      tone: "blue",
      value: String(
        analysisResult.dataPointsExtracted
      ),
      label: hs.metrics.dataPointsExtracted,
    },
    {
      icon: AlertCircle,
      tone: "purple",
      value: String(potentialConcerns),
      label: hs.metrics.potentialConcerns,
    },
    {
      icon: ConfidenceIcon,
      tone: "green",
      value: `${analysisResult.confidenceScore}%`,
      label: hs.metrics.confidenceScore,
    },
  ];

  const handleSaveSummary = () => {
    const value = editedSummary.trim();

    if (!value) {
      showToast({
        tone: "warning",
        title: "Summary cannot be empty",
        description:
          "Please enter a summary before saving.",
      });
      return;
    }

    onEditSummary?.(value);

    setEditedSummary(value);
    setIsEditing(false);

    showToast({
      tone: "success",
      title: "Summary updated",
      description:
        "Your summary changes have been applied.",
    });
  };

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-mx-bg lg:h-full">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-mx-border bg-mx-surface-raised px-4 py-2.5 sm:px-6">
        <Logo
          size={30}
          withWordmark
        />

        <div className="flex items-center gap-2.5">
          <LanguageSelector />
          <ThemeSwitcher />
        </div>
      </header>

      <motion.div
        {...fade}
        transition={{
          duration: 0.4,
          ease: "easeOut",
        }}
        className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-4 sm:px-6 lg:py-5"
      >
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)]">
          <RegistrationProgressSidebar
            currentStepIndex={5}
            className="lg:order-1"
          />

          <div className="flex flex-col gap-4 lg:order-2">
            {/* =========================================
                HEADER
            ========================================== */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-lg font-bold text-mx-ink sm:text-xl">
                  {hs.pageTitle}
                </h1>

                <p className="mt-1 max-w-xl text-xs leading-snug text-mx-ink-muted sm:text-sm">
                  {hs.pageSubtitle}
                </p>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="flex flex-wrap items-start justify-end gap-3 sm:gap-4">
                  <div className="text-right">
                    <Badge
                      tone="purple"
                      icon={
                        <Sparkles
                          size={12}
                          aria-hidden="true"
                        />
                      }
                    >
                      {hs.aiBadge}
                    </Badge>

                    {generatedOn && (
                      <p className="mt-1.5 text-xs text-mx-ink-muted">
                        {hs.generatedLabel}:{" "}
                        {generatedOn}
                      </p>
                    )}

                    {lastUpdated && (
                      <p className="text-xs text-mx-ink-muted">
                        {hs.lastUpdatedLabel}:{" "}
                        {lastUpdated}
                      </p>
                    )}
                  </div>

                  {!isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={
                        <Pencil
                          size={14}
                          aria-hidden="true"
                        />
                      }
                      onClick={() => {
                        setEditedSummary(
                          analysisSummary
                        );
                        setIsEditing(true);
                      }}
                    >
                      {hs.editButton}
                    </Button>
                  )}
                </div>

                {/* =====================================
                    EDITOR
                ====================================== */}
                {isEditing && (
                  <Card className="w-full min-w-[320px] max-w-2xl">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-display text-sm font-bold text-mx-ink">
                          Edit AI Health Summary
                        </h3>

                        <p className="mt-1 text-xs text-mx-ink-muted">
                          Update the informational summary
                          before continuing.
                        </p>
                      </div>

                      <Pencil
                        size={16}
                        className="text-mx-ink-muted"
                        aria-hidden="true"
                      />
                    </div>

                    <textarea
                      value={editedSummary}
                      onChange={(event) =>
                        setEditedSummary(
                          event.target.value
                        )
                      }
                      rows={7}
                      className="mt-3 w-full resize-y rounded-mx-sm border border-mx-border bg-mx-surface-raised px-3 py-2.5 text-sm leading-relaxed text-mx-ink outline-none transition-colors focus:border-mx-green"
                      placeholder="Enter the AI-generated health summary..."
                    />

                    <div className="mt-3 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditedSummary(
                            analysisSummary
                          );
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>

                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleSaveSummary}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>

            {/* =========================================
                METRICS
            ========================================== */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {metrics.map((metric) => (
                <Card
                  key={metric.label}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <MedicalIcon
                    icon={metric.icon}
                    tone={metric.tone}
                  />

                  <p className="font-display text-xl font-bold text-mx-ink sm:text-2xl">
                    {metric.value}
                  </p>

                  <p className="text-xs font-semibold leading-tight text-mx-ink-soft">
                    {metric.label}
                  </p>
                </Card>
              ))}
            </div>

            {/* =========================================
                TABS
            ========================================== */}
            <SegmentedTabs
              tabs={tabs}
              active={activeTab}
              onChange={setActiveTab}
              layoutGroupId="health-summary-tabs"
            />

            {/* =========================================
                TAB CONTENT
            ========================================== */}

            {activeTab === "summary" && (
              <motion.div
                key="summary"
                className="flex flex-col gap-4"
                initial={
                  prefersReducedMotion
                    ? false
                    : { opacity: 0, y: 8 }
                }
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.3,
                  ease: "easeOut",
                }}
              >
                {/* 1. Overall Summary */}
                <Section
                  number={1}
                  title={
                    hs.sections
                      .overallSummaryTitle
                  }
                  icon={Activity}
                >
                  <Prose>
                    {editedSummary.trim() ||
                      EMPTY_TEXT}
                  </Prose>

                  <p className="mt-3 text-xs font-semibold text-mx-ink-muted">
                    {hs.sections.keyHighlightsLabel}
                  </p>

                  <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-mx-ink-soft">
                    <li>
                      {hs.sections.documentsOnFileBullet.replace(
                        "{count}",
                        String(
                          analysisResult.documentsAnalyzed
                        )
                      )}
                    </li>

                    <li>
                      {hs.sections.abnormalLabValuesBullet.replace(
                        "{count}",
                        String(
                          abnormalValues.length
                        )
                      )}
                    </li>

                    <li>
                      {`${potentialConcerns} potential concern(s) identified`}
                    </li>
                  </ul>
                </Section>

                {/* 2. Key Findings */}
                <Section
                  number={2}
                  title={
                    hs.sections
                      .chiefComplaintTitle
                  }
                  icon={Info}
                >
                  {keyFindings.length > 0 ? (
                    <ul className="space-y-2 pl-5 text-sm leading-relaxed text-mx-ink-soft">
                      {keyFindings.map((item, index) => (
                        <li
                          key={`summary-key-finding-${index}`}
                          className="list-disc"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-mx-ink-muted">
                      {EMPTY_TEXT}
                    </p>
                  )}
                </Section>

                {/* 3. Abnormal Values */}
                <Section
                  number={3}
                  title="Abnormal / Notable Values"
                  icon={History}
                >
                  {abnormalValues.length >
                  0 ? (
                    <ul className="space-y-2 pl-5 text-sm leading-relaxed text-mx-ink-soft">
                      {abnormalValues.map(
                        (item, index) => (
                          <li
                            key={`abnormal-${index}`}
                            className="list-disc"
                          >
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-mx-green"
                        aria-hidden="true"
                      />

                      <p className="text-sm text-mx-ink-soft">
                        No abnormal values were
                        returned by the current
                        analysis.
                      </p>
                    </div>
                  )}
                </Section>

                {/* 4. Possible Concerns */}
                <Section
                  number={4}
                  title="Possible Concerns"
                  icon={ShieldAlert}
                >
                  {possibleConcerns.length >
                  0 ? (
                    <ul className="space-y-2 pl-5 text-sm leading-relaxed text-mx-ink-soft">
                      {possibleConcerns.map(
                        (item, index) => (
                          <li
                            key={`concern-${index}`}
                            className="list-disc"
                          >
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-mx-ink-muted">
                      No potential concerns were
                      returned by the current AI
                      analysis.
                    </p>
                  )}
                </Section>

                {/* 5. Recommendations */}
                <Section
                  number={5}
                  title="Recommendations"
                  icon={ClipboardCheck}
                >
                  {recommendations.length >
                  0 ? (
                    <ul className="space-y-2 pl-5 text-sm leading-relaxed text-mx-ink-soft">
                      {recommendations.map(
                        (item, index) => (
                          <li
                            key={`recommendation-${index}`}
                            className="list-disc"
                          >
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-mx-ink-muted">
                      No recommendations were
                      returned by the current AI
                      analysis.
                    </p>
                  )}
                </Section>
              </motion.div>
            )}

            {activeTab === "keyFindings" && (
              <Card>
                <div className="flex items-center gap-3">
                  <MedicalIcon
                    icon={ClipboardCheck}
                    tone="green"
                  />

                  <div>
                    <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">
                      Key Findings
                    </h2>

                    <p className="mt-1 text-xs text-mx-ink-muted">
                      Findings extracted from the
                      current AI analysis.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {keyFindings.length > 0 ? (
                    <ul className="space-y-3 pl-5 text-sm leading-relaxed text-mx-ink-soft">
                      {keyFindings.map(
                        (item, index) => (
                          <li
                            key={`key-finding-${index}`}
                            className="list-disc"
                          >
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-mx-ink-muted">
                      {EMPTY_TEXT}
                    </p>
                  )}
                </div>
              </Card>
            )}

            {activeTab === "labHighlights" && (
              <Card>
                <div className="flex items-center gap-3">
                  <MedicalIcon
                    icon={ScanSearch}
                    tone="blue"
                  />

                  <div>
                    <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">
                      Lab Highlights
                    </h2>

                    <p className="mt-1 text-xs text-mx-ink-muted">
                      Abnormal or notable values found
                      in the analysed text.
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  {abnormalValues.length >
                  0 ? (
                    <ul className="space-y-3 pl-5 text-sm leading-relaxed text-mx-ink-soft">
                      {abnormalValues.map(
                        (item, index) => (
                          <li
                            key={`lab-${index}`}
                            className="list-disc"
                          >
                            {item}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm text-mx-ink-muted">
                      No abnormal laboratory values
                      were identified.
                    </p>
                  )}
                </div>
              </Card>
            )}

            {activeTab === "timeline" && (
              <Card className="flex flex-col items-center gap-2 py-10 text-center">
                <MedicalIcon
                  icon={History}
                  tone="neutral"
                />

                <p className="font-display text-sm font-bold text-mx-ink">
                  Timeline
                </p>

                <p className="max-w-sm text-xs text-mx-ink-muted">
                  No historical timeline data is
                  generated during this registration
                  analysis.
                </p>
              </Card>
            )}

            {activeTab === "lifestyleAyush" && (
              <Card className="flex flex-col items-center gap-2 py-10 text-center">
                <MedicalIcon
                  icon={Info}
                  tone="neutral"
                />

                <p className="font-display text-sm font-bold text-mx-ink">
                  Lifestyle & AYUSH
                </p>

                <p className="max-w-sm text-xs text-mx-ink-muted">
                  No structured lifestyle or AYUSH
                  information was returned by the
                  current document analysis.
                </p>
              </Card>
            )}

            {/* =========================================
                DISCLAIMER
            ========================================== */}
            <Card className="flex items-start gap-3 border-mx-warning/40 bg-mx-warning-soft">
              <MedicalIcon
                icon={Info}
                tone="warning"
                size={16}
                className="h-9 w-9"
              />

              <p className="text-sm font-semibold text-mx-warning">
                {hs.disclaimer}
              </p>
            </Card>

            {/* =========================================
                FOOTER
            ========================================== */}
            <div className="flex flex-col-reverse items-center justify-between gap-3 rounded-mx-lg border border-mx-border bg-mx-surface-raised p-3.5 shadow-mx-sm sm:flex-row sm:p-4">
              <Button
                type="button"
                variant="outline"
                size="md"
                icon={
                  <ArrowLeft
                    size={16}
                    aria-hidden="true"
                  />
                }
                onClick={onBack}
              >
                {hs.backButton}
              </Button>

              <div className="text-center sm:text-right">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  icon={
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                    />
                  }
                  iconPosition="right"
                  onClick={onContinue}
                  className="shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0"
                >
                  {hs.continueButton}
                </Button>

                <p className="mt-1.5 text-xs text-mx-ink-muted">
                  {hs.continueHint}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}