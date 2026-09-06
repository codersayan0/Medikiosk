import type { AnalysisFinding, AnalysisFindingPriority, AnalysisResult, AnalysisStatus } from "../types";

/**
 * Frontend-only stand-in for the future OCR + AI red-flag detection
 * service (see AiAnalysisStep). Structured so a real backend call can
 * replace just `generateMockAnalysisResult`'s body later — every consumer
 * of this module only ever touches the `AnalysisResult` / `AnalysisFinding`
 * shape, never these mock internals directly.
 */

const MOCK_FINDINGS_BY_STATUS: Record<AnalysisStatus, AnalysisFinding[]> = {
  clear: [],
  attention: [
    {
      id: "finding-elevated-bp",
      title: "Elevated Blood Pressure Reading",
      description:
        "Some readings indicate higher than normal blood pressure. Please monitor and discuss this with your doctor.",
      priority: "medium",
    },
  ],
  critical: [
    {
      id: "finding-high-blood-sugar",
      title: "High Blood Sugar Detected",
      description:
        "Your blood test report shows elevated fasting blood sugar levels that may indicate diabetes or poor glucose control.",
      priority: "high",
    },
    {
      id: "finding-elevated-bp",
      title: "Elevated Blood Pressure Reading",
      description: "Some readings indicate higher than normal blood pressure. Please monitor and consult your doctor.",
      priority: "medium",
    },
  ],
};

/**
 * Always derived from `findings`, never stored redundantly — a "Potential
 * Concerns" count that could drift from the list it summarizes would be
 * worse than not showing one at all.
 */
export function countPotentialConcerns(findings: AnalysisFinding[]): number {
  return findings.filter((f) => f.priority === "high" || f.priority === "critical").length;
}

const PRIORITY_RANK: Record<AnalysisFindingPriority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

/** Highest-urgency findings first, so the most important concerns surface at the top of the list. */
export function sortFindingsByPriority(findings: AnalysisFinding[]): AnalysisFinding[] {
  return [...findings].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}

/**
 * Builds a realistic AnalysisResult for the frontend demo. `documentCount`
 * is read from the patient's real uploaded documents where available
 * (falling back to a representative mock count only when nothing was
 * uploaded), so the metric cards reflect real registration data whenever
 * possible. `status` defaults to "critical" to match the approved
 * reference screenshot — pass a different status to preview the
 * "clear"/"attention" treatments.
 */
export function generateMockAnalysisResult(documentCount: number, status: AnalysisStatus = "critical"): AnalysisResult {
  return {
    status,
    documentsAnalyzed: documentCount > 0 ? documentCount : 4,
    dataPointsExtracted: 26,
    confidenceScore: 93,
    findings: MOCK_FINDINGS_BY_STATUS[status],
  };
}
