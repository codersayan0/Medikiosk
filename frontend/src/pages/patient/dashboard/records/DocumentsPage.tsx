import { useMemo, useState } from "react";
import { FileStack, Download, Eye, Upload, FileText, FlaskConical, ClipboardCheck, ScanLine, File } from "lucide-react";
import { Card } from "../../../../components/ui/Card";
import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import { EmptyState } from "../../../../components/ui/EmptyState";
import { SegmentedTabs } from "../../../../components/ui/SegmentedTabs";
import { MedicalIcon } from "../../../../components/healthcare/MedicalIcon";
import { usePatientRecord } from "../../../../context/PatientContext";
import { useToast } from "../../../../context/ToastContext";
import type { BadgeTone } from "../../../../types";
import type { DocumentCategory, DocumentRecord } from "../../../../data/patientRecord";
import { ErrorState } from "../../../../components/ui/ErrorState";
import { ListPageSkeleton } from "../../../../components/ui/Skeleton";
import { useSimulatedLoad } from "../../../../hooks/useSimulatedLoad";

type CategoryFilter = "All" | DocumentCategory;

const CATEGORY_ICON: Record<DocumentCategory, typeof FileText> = {
  Prescription: ClipboardCheck,
  "Lab Report": FlaskConical,
  "Discharge Summary": FileText,
  "X-Ray": ScanLine,
  Others: File,
};

const CATEGORY_TONE: Record<DocumentCategory, BadgeTone> = {
  Prescription: "purple",
  "Lab Report": "blue",
  "Discharge Summary": "green",
  "X-Ray": "warning",
  Others: "neutral",
};


export default function DocumentsPage() {
  const patient = usePatientRecord();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<CategoryFilter>("All");

  const filtered = filter === "All" ? patient.documents : patient.documents.filter((d) => d.category === filter);

  const tabs = useMemo(() => {
    const categories: DocumentCategory[] = ["Prescription", "Lab Report", "Discharge Summary", "X-Ray", "Others"];
    return [
      { id: "All" as CategoryFilter, label: "All", count: patient.documents.length },
      ...categories.map((c) => ({ id: c as CategoryFilter, label: c, count: patient.documents.filter((d) => d.category === c).length })),
    ];
  }, [patient.documents]);

  const view = (doc: DocumentRecord) =>
    showToast({ tone: "info", title: "Opening document", description: `${doc.name} would open in a new tab.` });
  const download = (doc: DocumentRecord) =>
    showToast({ tone: "success", title: "Document downloading", description: `${doc.name} is being saved to your device.` });
  const upload = () =>
    showToast({ tone: "info", title: "Upload coming soon", description: "Uploading new documents will be available shortly." });

  const { loading, failed, retry } = useSimulatedLoad();
  if (loading) return <ListPageSkeleton />;
  if (failed) {
    return (
      <ErrorState
        title="Unable to load this page."
        description="We couldn't fetch this data. Please try again."
        onRetry={retry}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">Documents</h1>
          <p className="mt-1 text-sm text-mx-ink-muted">Uploaded reports, scans, and discharge summaries.</p>
        </div>
        <Button size="sm" icon={<Upload size={15} aria-hidden="true" />} onClick={upload}>
          Upload New Document
        </Button>
      </div>

      <SegmentedTabs tabs={tabs} active={filter} onChange={setFilter} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileStack size={22} aria-hidden="true" />}
          title="No documents here"
          description="No documents match this filter yet."
          action={
            <Button size="sm" variant="outline" icon={<Upload size={14} aria-hidden="true" />} onClick={upload}>
              Upload New Document
            </Button>
          }
        />
      ) : (
        <Card padded={false} className="overflow-hidden">
          {/* Table on larger screens */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-mx-border text-[11px] font-semibold uppercase tracking-wide text-mx-ink-muted">
                  <th className="px-4 py-3">Document Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Uploaded Date</th>
                  <th className="px-4 py-3">Uploaded By</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((doc) => {
                  const Icon = CATEGORY_ICON[doc.category];
                  return (
                    <tr
                      key={doc.id}
                      className="border-b border-mx-border transition-colors duration-150 last:border-b-0 hover:bg-mx-surface-sunken/60"
                    >
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <MedicalIcon icon={Icon} tone={CATEGORY_TONE[doc.category]} size={15} className="h-8 w-8 shrink-0" />
                          <span className="truncate font-semibold text-mx-ink">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={CATEGORY_TONE[doc.category]}>{doc.category}</Badge>
                      </td>
                      <td className="px-4 py-3 text-mx-ink-muted">{doc.uploadedDate}</td>
                      <td className="px-4 py-3 text-mx-ink-muted">{doc.uploadedBy}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => view(doc)}
                            aria-label={`View ${doc.name}`}
                            className="rounded-mx-sm p-2 text-mx-ink-muted hover:bg-mx-surface-sunken hover:text-mx-ink"
                          >
                            <Eye size={16} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => download(doc)}
                            aria-label={`Download ${doc.name}`}
                            className="rounded-mx-sm p-2 text-mx-ink-muted hover:bg-mx-surface-sunken hover:text-mx-ink"
                          >
                            <Download size={16} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Stacked cards on mobile */}
          <div className="divide-y divide-mx-border sm:hidden">
            {filtered.map((doc) => {
              const Icon = CATEGORY_ICON[doc.category];
              return (
                <div
                  key={doc.id}
                  className="flex items-start gap-3 p-4 transition-colors duration-150 hover:bg-mx-surface-sunken/60"
                >
                  <MedicalIcon icon={Icon} tone={CATEGORY_TONE[doc.category]} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-mx-ink">{doc.name}</p>
                    <p className="text-xs text-mx-ink-muted">
                      {doc.uploadedDate} · {doc.uploadedBy}
                    </p>
                    <Badge tone={CATEGORY_TONE[doc.category]} className="mt-1.5">
                      {doc.category}
                    </Badge>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button type="button" onClick={() => view(doc)} aria-label={`View ${doc.name}`} className="rounded-mx-sm p-2 text-mx-ink-muted hover:bg-mx-surface-sunken">
                      <Eye size={16} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => download(doc)} aria-label={`Download ${doc.name}`} className="rounded-mx-sm p-2 text-mx-ink-muted hover:bg-mx-surface-sunken">
                      <Download size={16} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
