import { useEffect, useState } from "react";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Droplet,
  Folder,
  Info,
  ScanSearch,
} from "lucide-react";

import {
  Logo,
} from "../../components/ui/Logo";

import {
  Button,
} from "../../components/ui/Button";

import {
  Card,
} from "../../components/ui/Card";

import {
  Badge,
} from "../../components/ui/Badge";

import {
  EmptyState,
} from "../../components/ui/EmptyState";

import {
  LanguageSelector,
} from "../../components/ui/LanguageSelector";

import {
  ThemeSwitcher,
} from "../../components/ui/ThemeSwitcher";

import {
  MedicalIcon,
} from "../../components/healthcare/MedicalIcon";

import {
  RegistrationProgressSidebar,
} from "../../components/patient/RegistrationProgressSidebar";

import {
  useTranslation,
} from "../../i18n";

import {
  useTheme,
} from "../../context/ThemeContext";

import {
  cn,
} from "../../utils/cn";

import type {
  AnalysisFinding,
  AnalysisFindingPriority,
  AnalysisResult,
  BadgeTone,
  UploadedDocumentRecord,
} from "../../types";

import {
  CATEGORY_ICON,
  CATEGORY_TONE,
} from "../../utils/documentCategories";


// ======================================================
// TYPES
// ======================================================

interface AiAnalysisStepProps {
  documents:
    UploadedDocumentRecord[];

  analysisResult:
    AnalysisResult;

  onBack:
    () => void;

  onContinue:
    () => void;
}


// ======================================================
// PRIORITY
// ======================================================

const PRIORITY_TONE:
  Record<
    AnalysisFindingPriority,
    BadgeTone
  > = {
  low: "blue",
  medium: "warning",
  high: "danger",
  critical: "danger",
};


const PRIORITY_ICON:
  Record<
    AnalysisFindingPriority,
    typeof Droplet
  > = {
  low: Info,
  medium: AlertTriangle,
  high: Droplet,
  critical: AlertCircle,
};


// ======================================================
// DATE
// ======================================================

function formatUploadedDate(
  iso: string
): string {
  const date =
    new Date(iso);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return iso;
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}


// ======================================================
// FINDING CARD
// ======================================================

function FindingCard({
  finding,
  label,
}: {
  finding:
    AnalysisFinding;

  label:
    string;
}) {
  const [
    expanded,
    setExpanded,
  ] = useState(true);


  const Icon =
    PRIORITY_ICON[
      finding.priority
    ];


  const tone =
    PRIORITY_TONE[
      finding.priority
    ];


  return (
    <div className="rounded-mx-md border border-mx-border bg-mx-surface p-3.5 sm:p-4">

      <div className="flex items-start gap-3">

        <MedicalIcon
          icon={Icon}
          tone={tone}
          className="h-11 w-11 shrink-0"
        />


        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-start justify-between gap-2">

            <p className="text-sm font-bold text-mx-ink sm:text-base">
              {finding.title}
            </p>


            <div className="flex shrink-0 items-center gap-2">

              <Badge
                tone={tone}
              >
                {label}
              </Badge>


              <button
                type="button"
                onClick={() =>
                  setExpanded(
                    (value) =>
                      !value
                  )
                }
                aria-expanded={
                  expanded
                }
                aria-label={
                  finding.title
                }
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-mx-sm border border-mx-border-strong text-mx-ink-muted transition-colors hover:bg-mx-surface-sunken"
              >
                <ChevronDown
                  size={14}
                  className={cn(
                    "transition-transform",
                    expanded &&
                      "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>

            </div>

          </div>


          {expanded && (
            <p className="mt-1.5 text-xs leading-relaxed text-mx-ink-soft sm:text-sm">
              {
                finding.description
              }
            </p>
          )}

        </div>

      </div>

    </div>
  );
}


// ======================================================
// PAGE
// ======================================================

export function AiAnalysisStep({
  documents,
  analysisResult,
  onBack,
  onContinue,
}: AiAnalysisStepProps) {
  const prefersReducedMotion =
    useReducedMotion();


  const { t } =
    useTranslation();

  const aa =
    t.aiAnalysis;


  const {
    setHasPageHeader,
  } = useTheme();


  useEffect(() => {
    setHasPageHeader(
      true
    );

    return () => {
      setHasPageHeader(
        false
      );
    };
  }, [
    setHasPageHeader,
  ]);


  // ====================================================
  // RESULT
  // ====================================================

  const {
    status,
    findings,
  } = analysisResult;


  // ====================================================
  // FINDINGS
  // ====================================================

  const sortedFindings =
    [...findings].sort(
      (a, b) => {

        const weight: Record<
          AnalysisFindingPriority,
          number
        > = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
        };


        return (
          weight[
            b.priority
          ] -
          weight[
            a.priority
          ]
        );
      }
    );


  const potentialConcerns =
    findings.filter(
      (finding) =>
        finding.priority ===
          "high" ||
        finding.priority ===
          "critical"
    ).length;


  const [
    showAllFindings,
    setShowAllFindings,
  ] = useState(false);


  const visibleFindings =
    showAllFindings
      ? sortedFindings
      : sortedFindings.slice(
          0,
          4
        );


  // ====================================================
  // DOCUMENTS
  // ====================================================

  const [
    showAllDocuments,
    setShowAllDocuments,
  ] = useState(false);


  const visibleDocuments =
    showAllDocuments
      ? documents
      : documents.slice(
          0,
          4
        );


  // ====================================================
  // ANIMATION
  // ====================================================

  const fade =
    prefersReducedMotion
      ? {}
      : {
          initial: {
            opacity: 0,
            y: 10,
          },

          animate: {
            opacity: 1,
            y: 0,
          },
        };


  // ====================================================
  // STATUS
  // ====================================================

  const STATUS_TONE:
    Record<
      typeof status,
      {
        icon:
          typeof CheckCircle2;

        badgeTone:
          BadgeTone;

        wrap:
          string;

        iconWrap:
          string;
      }
    > = {
    clear: {
      icon:
        CheckCircle2,

      badgeTone:
        "green",

      wrap:
        "border-mx-green/25 bg-mx-green-soft",

      iconWrap:
        "bg-mx-surface text-mx-green-strong",
    },

    attention: {
      icon:
        AlertTriangle,

      badgeTone:
        "warning",

      wrap:
        "border-mx-warning/25 bg-mx-warning-soft",

      iconWrap:
        "bg-mx-surface text-mx-warning",
    },

    critical: {
      icon:
        AlertTriangle,

      badgeTone:
        "danger",

      wrap:
        "border-mx-danger/25 bg-mx-danger-soft",

      iconWrap:
        "bg-mx-surface text-mx-danger",
    },
  };


  const statusConfig =
    STATUS_TONE[
      status
    ];


  const StatusIcon =
    statusConfig.icon;


  const headingToneClass =
    status === "clear"
      ? "text-mx-green-strong"
      : status ===
          "attention"
        ? "text-mx-warning"
        : "text-mx-danger";


  // ====================================================
  // METRICS
  // ====================================================

  const metrics = [
    {
      icon:
        ClipboardList,

      tone:
        "green" as BadgeTone,

      value:
        String(
          analysisResult.documentsAnalyzed
        ),

      label:
        aa.metrics
          .documentsAnalyzed,

      caption:
        aa.metrics
          .documentsAnalyzedCaption,
    },

    {
      icon:
        ScanSearch,

      tone:
        "blue" as BadgeTone,

      value:
        String(
          analysisResult.dataPointsExtracted
        ),

      label:
        aa.metrics
          .dataPointsExtracted,

      caption:
        aa.metrics
          .dataPointsExtractedCaption,
    },

    {
      icon:
        AlertCircle,

      tone:
        "purple" as BadgeTone,

      value:
        String(
          potentialConcerns
        ),

      label:
        aa.metrics
          .potentialConcerns,

      caption:
        aa.metrics
          .potentialConcernsCaption,
    },

    {
      icon:
        CheckCircle2,

      tone:
        "green" as BadgeTone,

      value:
        `${analysisResult.confidenceScore}%`,

      label:
        aa.metrics
          .confidenceScore,

      caption:
        aa.metrics
          .confidenceScoreCaption,
    },
  ];


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="flex min-h-full flex-col overflow-y-auto bg-mx-bg lg:h-full">

      {/* Header */}
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

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[240px_minmax(0,1fr)_280px] xl:grid-cols-[260px_minmax(0,1fr)_300px]">

          {/* Left */}
          <RegistrationProgressSidebar
            currentStepIndex={
              4
            }
            className="lg:order-1"
          />


          {/* Main */}
          <div className="flex flex-col gap-4 lg:order-2">

            <div>

              <h1 className="font-display text-lg font-bold text-mx-ink sm:text-xl">
                {aa.pageTitle}
              </h1>

              <p className="mt-1 max-w-xl text-xs leading-snug text-mx-ink-muted sm:text-sm">
                {aa.pageSubtitle}
              </p>

            </div>


            {/* Status */}
            <div
              className={cn(
                "flex flex-col gap-4 rounded-mx-lg border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
                statusConfig.wrap
              )}
            >

              <div className="flex items-start gap-3.5">

                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                    statusConfig.iconWrap
                  )}
                >
                  <StatusIcon
                    size={22}
                    aria-hidden="true"
                  />
                </span>


                <div>

                  <p
                    className={cn(
                      "font-display text-base font-bold sm:text-lg",
                      headingToneClass
                    )}
                  >
                    {
                      aa.statusHeading[
                        status
                      ]
                    }
                  </p>


                  <p className="mt-1 max-w-xl text-xs leading-relaxed text-mx-ink-soft sm:text-sm">
                    {
                      aa.statusBody[
                        status
                      ]
                    }
                  </p>

                </div>

              </div>


              {status !==
                "clear" && (
                <div
                  className={cn(
                    "flex shrink-0 flex-col items-center justify-center gap-0.5 self-center rounded-mx-md px-5 py-3 text-center",

                    status ===
                      "critical"
                      ? "bg-mx-danger text-mx-ink-inverse"
                      : "bg-mx-warning text-mx-ink-inverse"
                  )}
                >

                  <span className="font-display text-2xl font-bold leading-none">
                    {
                      potentialConcerns
                    }
                  </span>

                  <span className="text-[11px] font-semibold leading-tight">
                    {
                      aa.concernBadgeLabel
                    }
                  </span>

                </div>
              )}

            </div>


            {/* Findings */}
            {sortedFindings.length >
              0 && (
              <Card>

                <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">
                  {
                    aa.detectedConcernsTitle
                  }
                </h2>


                <div className="mt-3.5 flex flex-col gap-3">

                  {visibleFindings.map(
                    (finding) => (
                      <FindingCard
                        key={
                          finding.id
                        }
                        finding={
                          finding
                        }
                        label={
                          aa.priorityLabel[
                            finding.priority
                          ]
                        }
                      />
                    )
                  )}

                </div>


                {sortedFindings.length >
                  4 && (
                  <div className="mt-3.5 flex justify-center">

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      icon={
                        <ChevronDown
                          size={14}
                          aria-hidden="true"
                        />
                      }
                      iconPosition="right"
                      onClick={() =>
                        setShowAllFindings(
                          (value) =>
                            !value
                        )
                      }
                    >
                      {
                        aa.viewAllDetailsButton
                      }
                    </Button>

                  </div>
                )}

              </Card>
            )}


            {/* No findings */}
            {sortedFindings.length ===
              0 && (
              <Card>

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                    <CheckCircle2
                      size={20}
                      aria-hidden="true"
                    />
                  </div>


                  <div>

                    <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">
                      No specific concerns were identified
                    </h2>

                    <p className="mt-1 text-xs leading-relaxed text-mx-ink-soft sm:text-sm">
                      The AI analysis did not
                      identify structured
                      findings requiring
                      attention in the
                      available document
                      text.
                    </p>

                  </div>

                </div>

              </Card>
            )}


            {/* Analysis Summary */}
            <Card>

              <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">
                {aa.summaryTitle}
              </h2>


              <div className="mt-3.5 grid grid-cols-2 gap-3 lg:grid-cols-4">

                {metrics.map(
                  (metric) => (
                    <div
                      key={
                        metric.label
                      }
                      className="flex flex-col items-center gap-2 rounded-mx-md border border-mx-border bg-mx-surface p-3.5 text-center"
                    >

                      <MedicalIcon
                        icon={
                          metric.icon
                        }
                        tone={
                          metric.tone
                        }
                      />

                      <p className="font-display text-xl font-bold text-mx-ink sm:text-2xl">
                        {
                          metric.value
                        }
                      </p>

                      <p className="text-xs font-semibold leading-tight text-mx-ink-soft">
                        {
                          metric.label
                        }
                      </p>

                      <p className="text-[11px] leading-tight text-mx-ink-muted">
                        {
                          metric.caption
                        }
                      </p>

                    </div>
                  )
                )}

              </div>


              <div className="mt-4 flex items-start gap-2.5 rounded-mx-md border border-mx-blue/25 bg-mx-blue-soft px-3.5 py-2.5 text-xs font-medium leading-relaxed text-mx-blue sm:text-sm">

                <Info
                  size={16}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />

                <span>
                  {
                    aa.disclaimer
                  }
                </span>

              </div>

            </Card>


            {/* Footer */}
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
                onClick={
                  onBack
                }
              >
                {
                  aa.backButton
                }
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
                  onClick={
                    onContinue
                  }
                  className="shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0"
                >
                  {
                    aa.continueButton
                  }
                </Button>


                <p className="mt-1.5 text-xs text-mx-ink-muted">
                  {
                    aa.continueHint
                  }
                </p>

              </div>

            </div>

          </div>


          {/* Right */}
          <div className="flex flex-col gap-4 lg:order-3">

            <Card>

              <div className="flex items-center gap-2">

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-purple-soft text-mx-purple">
                  <Bot
                    size={15}
                    aria-hidden="true"
                  />
                </span>

                <h3 className="font-display text-sm font-bold text-mx-ink">
                  {
                    aa.howItWorksTitle
                  }
                </h3>

              </div>


              <ul className="mt-2.5 flex flex-col gap-1.5">

                {aa.howItWorks.map(
                  (
                    line,
                    index
                  ) => (
                    <li
                      key={
                        index
                      }
                      className="flex items-start gap-2 text-xs leading-relaxed text-mx-ink-soft"
                    >

                      <Check
                        size={13}
                        className="mt-0.5 shrink-0 text-mx-green"
                        aria-hidden="true"
                      />

                      <span>
                        {line}
                      </span>

                    </li>
                  )
                )}

              </ul>

            </Card>


            <Card>

              <div className="flex items-center justify-between gap-2">

                <h3 className="font-display text-sm font-bold text-mx-ink">
                  {
                    aa.uploadedDocumentsTitle
                  }
                </h3>


                <Badge
                  tone="blue"
                >
                  {
                    aa.documentsCountBadge.replace(
                      "{count}",
                      String(
                        documents.length
                      )
                    )
                  }
                </Badge>

              </div>


              {documents.length ===
              0 ? (

                <div className="mt-3">

                  <EmptyState
                    compact
                    icon={
                      <Folder
                        size={20}
                        aria-hidden="true"
                      />
                    }
                    title={
                      aa.noDocumentsTitle
                    }
                    description={
                      aa.noDocumentsDescription
                    }
                  />

                </div>

              ) : (

                <ul className="mx-scrollbar mt-3 flex max-h-[22rem] flex-col gap-2.5 overflow-y-auto">

                  {visibleDocuments.map(
                    (doc) => {

                      const Icon =
                        CATEGORY_ICON[
                          doc.category
                        ];


                      return (
                        <li
                          key={
                            doc.id
                          }
                          className="flex items-start gap-2.5"
                        >

                          <MedicalIcon
                            icon={Icon}
                            tone={
                              CATEGORY_TONE[
                                doc.category
                              ]
                            }
                            size={15}
                            className="h-9 w-9 shrink-0"
                          />


                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-mx-ink">
                              {
                                doc.file.name
                              }
                            </p>


                            <p className="mt-0.5 text-xs text-mx-ink-muted">
                              {
                                aa.uploadedOnLabel.replace(
                                  "{date}",
                                  formatUploadedDate(
                                    doc.uploadedAt
                                  )
                                )
                              }
                            </p>

                          </div>

                        </li>
                      );
                    }
                  )}

                </ul>
              )}


              {documents.length >
                4 && (

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  fullWidth
                  icon={
                    <Folder
                      size={14}
                      aria-hidden="true"
                    />
                  }
                  onClick={() =>
                    setShowAllDocuments(
                      (value) =>
                        !value
                    )
                  }
                  className="mt-3.5"
                >
                  {
                    aa.viewAllDocumentsButton
                  }
                </Button>

              )}

            </Card>

          </div>

        </div>

      </motion.div>

    </div>
  );
}