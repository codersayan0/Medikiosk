import type { PatientRecord } from "../data/patientRecord";

/**
 * MediKiosk AI Health Assistant — local response layer.
 *
 * This is a rule-based, fully offline "understanding" layer over the same
 * `PatientRecord` every other dashboard page already reads via
 * `usePatientRecord()`. It does NOT call any external AI/LLM service — see
 * the Phase 3 brief ("do not connect to OpenAI/Claude/Gemini/etc unless an
 * existing local architecture already supports them"). Nothing here is a
 * diagnosis: every branch either answers from the patient's own stored
 * data, or explicitly declines and redirects to a healthcare professional.
 *
 * Swapping this for a real local model later only means changing what
 * `generateAssistantReply` does internally — the chat UI, message shape,
 * and suggested prompts below are all already decoupled from "how the
 * answer gets produced".
 */

export interface ChatAttachment {
  id: string;
  kind: "image" | "document";
  name: string;
  size: number;
  fileType: string;
  /** Local object URL (see URL.createObjectURL) — never uploaded anywhere. */
  previewUrl: string | null;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
}

export interface SuggestedPrompt {
  id: string;
  label: string;
  query: string;
}

/** The 8 suggested prompts from the Phase 3 brief, in order. */
export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { id: "lab", label: "Explain my latest lab report", query: "Explain my latest lab report" },
  { id: "history", label: "Summarize my medical history", query: "Summarize my medical history" },
  { id: "meds", label: "What medicines are currently listed?", query: "What medicines are currently listed?" },
  { id: "visits", label: "Show my recent visits", query: "Show my recent visits" },
  { id: "summary", label: "Explain my AI health summary", query: "Explain my AI health summary" },
  { id: "docs", label: "What documents do I have?", query: "What documents do I have?" },
  { id: "abnormal", label: "Help me understand an abnormal lab value", query: "Help me understand an abnormal lab value" },
  { id: "allergies", label: "Show my allergies", query: "Show my allergies" },
];

/** Formats a short, current-feeling timestamp for a new chat message. */
export function nowTimestamp(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Shown once, persistently, under the chat composer — not tied to any single reply. */
export const ASSISTANT_FOOTER_DISCLAIMER =
  "For informational purposes only. Consult a qualified healthcare professional for diagnosis or treatment decisions.";

const DISCLAIMER =
  "⚠️ I can't diagnose a condition. I can help you review the health information and reports currently stored in your MediKiosk record, and you can discuss any concerns with a qualified healthcare professional.";

const EMERGENCY_MESSAGE =
  "⚠️ This sounds like it could be a medical emergency. Please contact your local emergency services or go to the nearest emergency room right away. This assistant can't provide emergency care — if you're with someone else, ask them to help you get to care immediately.";

/** Phrases that should always short-circuit to emergency guidance, regardless of anything else in the message. */
const EMERGENCY_PATTERNS = [
  /chest pain/i,
  /can'?t breathe/i,
  /difficulty breathing/i,
  /shortness of breath/i,
  /severe bleeding/i,
  /heavy bleeding/i,
  /unconscious/i,
  /not breathing/i,
  /suicidal|suicide|kill myself|end my life/i,
  /heart attack/i,
  /stroke/i,
  /seizure/i,
  /severe allergic reaction|anaphylaxis/i,
  /overdose/i,
  /poison/i,
];

/** Phrases that ask the assistant to diagnose, predict, or confirm a condition. */
const DIAGNOSIS_PATTERNS = [
  /do i have/i,
  /am i having/i,
  /is this cancer/i,
  /is it cancer/i,
  /diagnos/i,
  /what('?s| is) wrong with me/i,
  /am i (dying|going to die)/i,
  /how serious is/i,
  /is (this|it) serious/i,
  /should i be worried/i,
];

function formatList(items: string[], emptyMessage: string): string {
  if (items.length === 0) return emptyMessage;
  return items.map((item) => `• ${item}`).join("\n");
}

function matches(query: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(query));
}

/** Any of these words appearing lets a query match a topic even without an exact suggested-prompt phrase. */
function includesAny(query: string, keywords: string[]): boolean {
  const q = query.toLowerCase();
  return keywords.some((k) => q.includes(k));
}

function answerLatestLabReport(patient: PatientRecord): string {
  const report = patient.recentLabReport;
  const lines = report.rows.map(
    (row) => `• ${row.test}: **${row.result}** (reference ${row.referenceRange}) — ${row.status}`
  );
  const abnormal = report.rows.filter((r) => r.status !== "Normal");
  const abnormalNote =
    abnormal.length > 0
      ? `\n\n${abnormal.length} value${abnormal.length > 1 ? "s are" : " is"} outside the reference range — worth discussing with your doctor at your next visit.`
      : "\n\nAll values are within the normal reference range.";
  return `Your most recent lab report is **${report.title}** (${report.date}):\n\n${lines.join("\n")}${abnormalNote}`;
}

function answerAbnormalLabValue(patient: PatientRecord): string {
  const abnormalRows = patient.labReports.flatMap((report) =>
    report.rows.filter((r) => r.status !== "Normal").map((row) => ({ report, row }))
  );
  if (abnormalRows.length === 0) {
    return "I don't see any lab values flagged as outside the normal range in your current records. All stored results are within their reference ranges.";
  }
  const lines = abnormalRows
    .slice(0, 6)
    .map(
      ({ report, row }) =>
        `• **${row.test}** — ${row.result} (reference ${row.referenceRange}), flagged **${row.status}** in your ${report.title} from ${report.date}`
    );
  return `Here are the lab values in your record currently flagged outside the normal range:\n\n${lines.join(
    "\n"
  )}\n\nA flagged value doesn't confirm a diagnosis on its own — it's a signal to review with your doctor, who can interpret it alongside the rest of your history.`;
}

function answerMedicalHistory(patient: PatientRecord): string {
  const h = patient.medicalHistory;
  const parts: string[] = [];
  if (h.pastIllnesses.length) {
    parts.push(`**Past illnesses:**\n${formatList(h.pastIllnesses.map((e) => `${e.label}${e.date ? ` (${e.date})` : ""} — ${e.detail}`), "None on record")}`);
  }
  if (h.chronicConditions.length) {
    parts.push(`**Chronic conditions:**\n${formatList(h.chronicConditions.map((e) => `${e.label} — ${e.detail}`), "None on record")}`);
  }
  if (h.surgeries.length) {
    parts.push(`**Surgeries:**\n${formatList(h.surgeries.map((e) => `${e.label}${e.date ? ` (${e.date})` : ""} — ${e.detail}`), "None on record")}`);
  }
  if (h.familyHistory.length) {
    parts.push(`**Family history:**\n${formatList(h.familyHistory.map((e) => `${e.label} — ${e.detail}`), "None on record")}`);
  }
  if (h.lifestyle.length) {
    parts.push(`**Lifestyle notes:**\n${formatList(h.lifestyle.map((e) => `${e.label}: ${e.detail}`), "None on record")}`);
  }
  if (parts.length === 0) {
    return "Your medical history section doesn't have any entries yet.";
  }
  return `Here's a summary of your medical history:\n\n${parts.join("\n\n")}`;
}

function answerMedicines(patient: PatientRecord): string {
  const { active, previous } = patient.medicines;
  const activeLines = formatList(
    active.map((m) => `**${m.name}** — ${m.dosage}, ${m.frequency}, for ${m.duration} (prescribed by ${m.prescribedBy}, ${m.date})`),
    "No currently active medicines on record."
  );
  const previousNote = previous.length > 0 ? `\n\nYou also have ${previous.length} completed/previous medicine${previous.length > 1 ? "s" : ""} in your history — see the Medicines page for the full list.` : "";
  return `Your currently active medicines:\n\n${activeLines}${previousNote}`;
}

function answerAllergies(patient: PatientRecord): string {
  const { medicine, food, other } = patient.allergies;
  const all = [...medicine, ...food, ...other];
  if (all.length === 0) {
    return "You don't have any allergies recorded in MediKiosk right now.";
  }
  const lines = all.map((a) => `• **${a.allergen}** — ${a.reaction} (${a.severity} severity, ${a.date})`);
  return `Here are the allergies on your record:\n\n${lines.join("\n")}\n\nAlways mention these to any doctor or pharmacist treating you.`;
}

function answerVisits(patient: PatientRecord): string {
  const lines = patient.visits
    .slice(0, 4)
    .map((v) => `• **${v.date}** (${v.time}) — ${v.reason} with ${v.doctorName} — ${v.status}`);
  return `Here are your most recent visits:\n\n${lines.join("\n")}`;
}

function answerLastDoctor(patient: PatientRecord): string {
  const completed = patient.visits.find((v) => v.status === "Completed");
  if (!completed) return "I don't see a completed visit on your record yet.";
  return `Your last completed visit was with **${completed.doctorName}** on ${completed.date} for "${completed.reason}".`;
}

function answerLastVisitDate(patient: PatientRecord): string {
  const completed = patient.visits.find((v) => v.status === "Completed");
  if (!completed) return "I don't see a completed visit on your record yet.";
  return `Your most recent completed visit was on **${completed.date}** at ${completed.time}, with ${completed.doctorName} — reason: ${completed.reason}.`;
}

function answerDocuments(patient: PatientRecord): string {
  const byCategory = new Map<string, number>();
  for (const doc of patient.documents) {
    byCategory.set(doc.category, (byCategory.get(doc.category) ?? 0) + 1);
  }
  const summary = Array.from(byCategory.entries())
    .map(([category, count]) => `• ${category}: ${count}`)
    .join("\n");
  return `You have **${patient.documents.length}** documents stored:\n\n${summary}\n\nYou can view or download any of them from Medical Records → Documents.`;
}

function answerPrescriptions(patient: PatientRecord): string {
  const lines = patient.prescriptions
    .slice(0, 3)
    .map(
      (rx) =>
        `• **${rx.date}** — ${rx.doctorName} (${rx.diagnosis}): ${rx.medicines.map((m) => m.name).join(", ")}`
    );
  return `Here are your most recent prescriptions:\n\n${lines.join("\n")}`;
}

function answerAiSummary(patient: PatientRecord): string {
  const rows = patient.aiHealthSummary.slice(0, 5);
  const lines = rows.map((r) => `• **${r.label}:** ${r.value}`);
  return `Here's a quick look at your AI Health Summary (generated ${patient.aiSummaryMeta.generatedOn}):\n\n${lines.join(
    "\n"
  )}\n\nOpen the full AI Health Summary page for the complete clinical-style breakdown, including lab values, documents, and your timeline.`;
}

function answerOverallHealth(patient: PatientRecord): string {
  const cc = patient.aiHealthSummary.find((r) => r.label === "Chief Complaint")?.value;
  const meds = patient.medicines.active.length;
  const allergyCount = patient.allergies.medicine.length + patient.allergies.food.length + patient.allergies.other.length;
  return (
    `Here's a brief overview based on your stored records:\n\n` +
    `• Current focus: ${cc ?? "No active complaint on record"}\n` +
    `• Active medicines: ${meds}\n` +
    `• Recorded allergies: ${allergyCount}\n` +
    `• Completed visits on file: ${patient.visits.filter((v) => v.status === "Completed").length}\n\n` +
    `For the full clinical-style breakdown, open your AI Health Summary page.`
  );
}

function answerAyush(patient: PatientRecord): string {
  const { assessmentDate, dashavidha, aharaVihara } = patient.ayush;
  const lines = dashavidha.slice(0, 5).map((d) => `• ${d.label}: ${d.value}`);
  return `Your AYUSH assessment (${assessmentDate}) includes Dashavidha Pariksha parameters such as:\n\n${lines.join(
    "\n"
  )}\n\nAhara-Vihara notes: ${aharaVihara}\n\nSee the AYUSH Health page for the complete assessment.`;
}

/**
 * Main entry point. Deterministic, offline, and reads only from the
 * supplied PatientRecord. Order matters: emergency detection and the
 * diagnosis guardrail both run before any data-lookup branch so they can
 * never be bypassed by also mentioning a suggested-prompt keyword.
 */
export function generateAssistantReply(rawQuery: string, patient: PatientRecord): string {
  const query = rawQuery.trim();
  if (!query) {
    return "I didn't catch a question there — try asking about a report, medicine, visit, or record, or tap one of the suggestions above.";
  }

  if (matches(query, EMERGENCY_PATTERNS)) {
    return EMERGENCY_MESSAGE;
  }

  if (matches(query, DIAGNOSIS_PATTERNS)) {
    return DISCLAIMER;
  }

  if (includesAny(query, ["hemoglobin", "cbc", "blood count"])) {
    const row = patient.recentLabReport.rows.find((r) => r.test.toLowerCase().includes("hemoglobin"));
    if (row) {
      return `Your most recent hemoglobin result (${patient.recentLabReport.date}) was **${row.result}** — reference range ${row.referenceRange}, flagged **${row.status}**. ${
        row.status !== "Normal"
          ? "This is outside the typical range — your doctor may want to discuss dietary or follow-up steps."
          : "This is within the normal range."
      }`;
    }
    return answerLatestLabReport(patient);
  }

  if (includesAny(query, ["abnormal", "flagged", "out of range"])) {
    return answerAbnormalLabValue(patient);
  }

  if (includesAny(query, ["latest lab", "lab report", "lab result", "cbc report", "recent lab"])) {
    return answerLatestLabReport(patient);
  }

  if (includesAny(query, ["medical history", "past illness", "chronic condition", "surgery history", "surgeries"])) {
    return answerMedicalHistory(patient);
  }

  if (includesAny(query, ["allerg"])) {
    return answerAllergies(patient);
  }

  if (includesAny(query, ["medicine", "medication", "prescription currently", "what am i taking", "drugs"])) {
    if (includesAny(query, ["prescription"]) && !includesAny(query, ["currently listed", "taking"])) {
      return answerPrescriptions(patient);
    }
    return answerMedicines(patient);
  }

  if (includesAny(query, ["last doctor", "which doctor", "who was my"])) {
    return answerLastDoctor(patient);
  }

  if (includesAny(query, ["previous visit", "last visit", "when was my"])) {
    return answerLastVisitDate(patient);
  }

  if (includesAny(query, ["visit", "appointment"])) {
    return answerVisits(patient);
  }

  if (includesAny(query, ["document", "file", "upload"])) {
    return answerDocuments(patient);
  }

  if (includesAny(query, ["ai health summary", "ai summary", "health summary"])) {
    return answerAiSummary(patient);
  }

  if (includesAny(query, ["ayush", "dashavidha", "prakriti"])) {
    return answerAyush(patient);
  }

  if (includesAny(query, ["summarize my health", "overall health", "how am i doing", "summarize health"])) {
    return answerOverallHealth(patient);
  }

  return (
    "I can help you review information already stored in your MediKiosk record — lab reports, medicines, visits, documents, allergies, and your AI Health Summary. " +
    "Try asking something like \"Explain my latest lab report\" or \"What medicines are currently listed?\", or tap one of the suggestions above."
  );
}