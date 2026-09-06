import { FileText, FlaskConical, Pill, ScanLine } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BadgeTone, DocumentCategoryId, UploadedDocumentRecord } from "../types";

/** Fixed display order for the four document categories, used everywhere they're listed. */
export const CATEGORY_ORDER: DocumentCategoryId[] = ["lab", "medical", "prescriptions", "imaging"];

export const CATEGORY_ICON: Record<DocumentCategoryId, LucideIcon> = {
  lab: FlaskConical,
  medical: FileText,
  prescriptions: Pill,
  imaging: ScanLine,
};

export const CATEGORY_TONE: Record<DocumentCategoryId, BadgeTone> = {
  lab: "green",
  medical: "blue",
  prescriptions: "purple",
  imaging: "warning",
};

export const ACCEPTED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function fileExtensionLabel(file: { name: string; type: string }): string {
  const parts = file.name.split(".");
  if (parts.length > 1) return parts[parts.length - 1].toUpperCase();
  return file.type.split("/")[1]?.toUpperCase() ?? "FILE";
}

/**
 * Frontend-only keyword heuristic that stands in for the real AI document
 * detection service. Structured so a future backend integration can
 * replace just this function's body with an API call returning
 * { category, confidence, extractedMetadata } without touching the rest
 * of the upload flow.
 */
export function guessCategory(fileName: string): DocumentCategoryId {
  const name = fileName.toLowerCase();
  if (/(mri|x-?ray|xray|ct[\s_-]?scan|ultrasound|scan|sonograph)/.test(name)) return "imaging";
  if (/(prescription|rx|medicine|dosage|dose|medication)/.test(name)) return "prescriptions";
  if (/(blood|urine|cbc|lab|test|ecg|panel|glucose|lipid)/.test(name)) return "lab";
  return "medical";
}

export function isAcceptedFile(file: File): boolean {
  if (ACCEPTED_MIME_TYPES.includes(file.type)) return true;
  // Fall back to extension check — some OSes/browsers don't set a MIME
  // type for every file (e.g. certain scanners' PDF exports).
  return /\.(pdf|jpe?g|png)$/i.test(file.name);
}

/**
 * Counts uploaded documents per category. Always derived live from the
 * current document array — never cached or hard-coded — so every card
 * (Document Upload categories, Uploaded Documents total, Account Created
 * summary) reflects the real, current state as documents are added,
 * removed, or recategorized.
 */
export function countDocumentsByCategory(
  documents: UploadedDocumentRecord[]
): Record<DocumentCategoryId, number> {
  return CATEGORY_ORDER.reduce<Record<DocumentCategoryId, number>>(
    (acc, id) => {
      acc[id] = documents.filter((doc) => doc.category === id).length;
      return acc;
    },
    { lab: 0, medical: 0, prescriptions: 0, imaging: 0 }
  );
}
