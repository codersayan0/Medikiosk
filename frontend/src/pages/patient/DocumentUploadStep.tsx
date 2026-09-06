import { useEffect, useRef, useState } from "react";
import type {
  ChangeEvent,
  DragEvent,
  Dispatch,
  SetStateAction,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CloudUpload,
  Eye,
  Folder,
  Lightbulb,
  ShieldCheck,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { Logo } from "../../components/ui/Logo";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { LanguageSelector } from "../../components/ui/LanguageSelector";
import { ThemeSwitcher } from "../../components/ui/ThemeSwitcher";
import { MedicalIcon } from "../../components/healthcare/MedicalIcon";
import { RegistrationProgressSidebar } from "../../components/patient/RegistrationProgressSidebar";

import { useTranslation } from "../../i18n";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../utils/cn";

import type {
  DocumentCategoryId,
  UploadedDocumentRecord,
} from "../../types";

import {
  CATEGORY_ICON,
  CATEGORY_ORDER,
  CATEGORY_TONE,
  MAX_FILE_SIZE_BYTES,
  countDocumentsByCategory,
  fileExtensionLabel,
  formatFileSize,
  guessCategory,
  isAcceptedFile,
} from "../../utils/documentCategories";

import { processDocument } from "../../services/documentsApi";


interface DocumentUploadStepProps {
  /**
   * Uploaded-document state, lifted to the parent registration flow so the
   * same data can carry through to Review Summary and Account Created.
   */
  documents: UploadedDocumentRecord[];

  setDocuments: Dispatch<
    SetStateAction<UploadedDocumentRecord[]>
  >;

  /**
   * Called when the patient continues past this step, whether or not
   * any documents were uploaded.
   */
  onContinue: () => void;

  /**
   * Called when the patient explicitly skips the step from the
   * top-level "Skip for now" action.
   */
  onSkip: () => void;
}


/**
 * Document Upload step.
 *
 * Files are selected in the browser and then sent to the backend
 * document-processing endpoint.
 *
 * The backend temporarily processes the file and returns extracted
 * text. The original file is not persisted by this component.
 */
export function DocumentUploadStep({
  documents,
  setDocuments,
  onContinue,
  onSkip,
}: DocumentUploadStepProps) {
  const prefersReducedMotion = useReducedMotion();

  const { t } = useTranslation();
  const du = t.documentUpload;

  const { showToast } = useToast();
  const { setHasPageHeader } = useTheme();

  // This page renders its own header (Logo + LanguageSelector + ThemeSwitcher)
  // below, so tell AuthLayout to hide its floating stand-in ThemeSwitcher
  // while this step is mounted — otherwise the two overlap into what looks
  // like a duplicate green box behind the theme controls.
  useEffect(() => {
    setHasPageHeader(true);

    return () => {
      setHasPageHeader(false);
    };
  }, [setHasPageHeader]);


  const [isDragActive, setIsDragActive] =
    useState(false);

  const [isProcessingDocuments, setIsProcessingDocuments] =
    useState(false);

  const fileInputRef =
    useRef<HTMLInputElement>(null);


  const categoryCounts =
    countDocumentsByCategory(documents);


  async function addFiles(
    fileList: FileList | File[]
  ) {
    const files = Array.from(fileList);

    if (files.length === 0) {
      return;
    }

    const accepted: UploadedDocumentRecord[] = [];


    for (const file of files) {
      if (!isAcceptedFile(file)) {
        showToast({
          tone: "error",
          title:
            du.unsupportedFormatError.replace(
              "{fileName}",
              file.name
            ),
        });

        continue;
      }


      if (
        file.size >
        MAX_FILE_SIZE_BYTES
      ) {
        showToast({
          tone: "error",
          title:
            du.fileTooLargeError.replace(
              "{fileName}",
              file.name
            ),
        });

        continue;
      }


      const id =
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 9)}`;


      const previewUrl =
        file.type.startsWith("image/") ||
        file.type === "application/pdf"
          ? URL.createObjectURL(file)
          : null;


      accepted.push({
        id,
        file,
        fileName: file.name,
        fileType: fileExtensionLabel(file),
        fileSize: file.size,
        category: guessCategory(file.name),
        status: "uploading",
        previewUrl,
        uploadedAt:
          new Date().toISOString(),
      });
    }


    if (accepted.length === 0) {
      return;
    }


    /*
     * Immediately add selected files to the UI so that the patient
     * can see which documents are currently being processed.
     */
    setDocuments((prev) => [
      ...prev,
      ...accepted,
    ]);


    /*
     * Real backend document processing.
     *
     * Each file is sent to:
     *
     * POST /api/documents/process
     *
     * The backend extracts text and returns it to the frontend.
     */
    setIsProcessingDocuments(true);


    try {
      await Promise.all(
        accepted.map(
          async (doc) => {
            try {
              const response =
                await processDocument(
                  doc.file,
                  doc.category
                );


              setDocuments((prev) =>
                prev.map((item) =>
                  item.id === doc.id
                    ? {
                        ...item,

                        /*
                         * Existing UI uses "uploaded" to
                         * display the completed state.
                         */
                        status: "uploaded",

                        /*
                         * Text extracted by the backend.
                         * This will be used by the next
                         * Gemini analysis stage.
                         */
                        extractedText:
                          response.extracted_text,

                        /*
                         * Backend processing identifier.
                         */
                        processingId:
                          response.document_id,
                      }
                    : item
                )
              );

            } catch (error) {
              console.error(
                "Document processing failed:",
                error
              );


              /*
               * Remove failed documents from the
               * registration document list.
               */
              setDocuments((prev) =>
                prev.filter(
                  (item) =>
                    item.id !== doc.id
                )
              );


              if (doc.previewUrl) {
                URL.revokeObjectURL(
                  doc.previewUrl
                );
              }


              showToast({
                tone: "error",
                title:
                  error instanceof Error
                    ? error.message
                    : `Unable to process ${doc.file.name}.`,
              });
            }
          }
        )
      );

    } finally {
      /*
       * Unlock Continue after every selected
       * file has finished processing.
       */
      setIsProcessingDocuments(false);
    }
  }


  function handleInputChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    if (event.target.files) {
      void addFiles(
        event.target.files
      );
    }

    // Allow selecting the same file again.
    event.target.value = "";
  }


  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setIsDragActive(false);

    if (event.dataTransfer.files) {
      void addFiles(
        event.dataTransfer.files
      );
    }
  }


  function handleRemove(
    id: string
  ) {
    setDocuments((prev) => {
      const target =
        prev.find(
          (doc) => doc.id === id
        );

      if (target?.previewUrl) {
        URL.revokeObjectURL(
          target.previewUrl
        );
      }

      return prev.filter(
        (doc) => doc.id !== id
      );
    });
  }


  function handleView(
    doc: UploadedDocumentRecord
  ) {
    if (doc.previewUrl) {
      window.open(
        doc.previewUrl,
        "_blank",
        "noopener,noreferrer"
      );
    }
  }


  function handleChangeCategory(
    id: string,
    category: DocumentCategoryId
  ) {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              category,
            }
          : doc
      )
    );
  }


  const fade = prefersReducedMotion
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

          {/* Left: Registration Progress sidebar */}
          <RegistrationProgressSidebar
            currentStepIndex={3}
            className="lg:order-1"
          />


          {/* Main column */}
          <div className="flex flex-col gap-4 lg:order-2">

            <div>
              <h1 className="font-display text-lg font-bold text-mx-ink sm:text-xl">
                {du.pageTitle}
              </h1>

              <p className="mt-1 max-w-xl text-xs leading-snug text-mx-ink-muted sm:text-sm">
                {du.pageSubtitle}
              </p>
            </div>


            <div className="flex items-start gap-2.5 rounded-mx-md border border-mx-blue/25 bg-mx-blue-soft px-3.5 py-2.5 text-xs font-medium leading-relaxed text-mx-blue sm:text-sm">

              <ShieldCheck
                size={16}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />

              <span>
                {du.infoBanner}
              </span>

            </div>


            {/* Dropzone */}
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragActive(true);
              }}
              onDragLeave={() =>
                setIsDragActive(false)
              }
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center gap-2.5 rounded-mx-lg border-2 border-dashed bg-mx-surface-raised px-5 py-6 text-center transition-colors",

                isDragActive
                  ? "border-mx-green bg-mx-green-soft"
                  : "border-mx-border-strong"
              )}
            >

              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-mx-green-soft text-mx-green-strong">
                <UploadCloud
                  size={22}
                  aria-hidden="true"
                />
              </span>


              <p className="font-display text-sm font-bold text-mx-ink sm:text-base">
                {du.dropzone.dragText}
              </p>


              <span className="text-xs font-semibold text-mx-ink-muted">
                {du.dropzone.orLabel}
              </span>


              <Button
                type="button"
                variant="primary"
                size="md"
                icon={
                  <CloudUpload
                    size={16}
                    aria-hidden="true"
                  />
                }
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  isProcessingDocuments
                }
              >
                {isProcessingDocuments
                  ? "Processing..."
                  : du.dropzone.browseButton}
              </Button>


              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                className="hidden"
                onChange={
                  handleInputChange
                }
              />


              <p className="text-xs text-mx-ink-muted">
                {du.dropzone.supportedFormats}
              </p>

            </div>


            {/* Categories */}
            <div>

              <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">
                {du.categoriesTitle}
              </h2>


              <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">

                {CATEGORY_ORDER.map(
                  (id) => {
                    const Icon =
                      CATEGORY_ICON[id];

                    const cat =
                      du.categories[id];

                    return (
                      <div
                        key={id}
                        className="flex flex-col gap-2 rounded-mx-md border border-mx-border bg-mx-surface-raised p-3"
                      >

                        <div className="flex items-start justify-between gap-2">

                          <MedicalIcon
                            icon={Icon}
                            tone={
                              CATEGORY_TONE[id]
                            }
                            size={17}
                            className="h-9 w-9"
                          />

                        </div>


                        <div>

                          <p className="text-sm font-semibold text-mx-ink">
                            {cat.title}
                          </p>

                          <p className="mt-0.5 text-xs leading-relaxed text-mx-ink-muted">
                            {cat.description}
                          </p>

                        </div>


                        <Badge
                          tone="neutral"
                          className="self-end"
                        >
                          {du.filesCountLabel.replace(
                            "{count}",
                            String(
                              categoryCounts[id]
                            )
                          )}
                        </Badge>

                      </div>
                    );
                  }
                )}

              </div>
            </div>


            {/* Uploaded documents */}
            <div className="rounded-mx-lg border border-mx-border bg-mx-surface-raised p-4 shadow-mx-sm sm:p-5">

              <div className="flex items-center justify-between gap-3">

                <h2 className="font-display text-sm font-bold text-mx-ink sm:text-base">
                  {du.uploadedTitle} ({documents.length})
                </h2>

              </div>


              {documents.length === 0 ? (

                <div className="mt-3.5">

                  <EmptyState
                    icon={
                      <Folder
                        size={22}
                        aria-hidden="true"
                      />
                    }
                    title={du.emptyTitle}
                    description={
                      du.emptyDescription
                    }
                  />

                </div>

              ) : (

                <>

                  {/* Table — desktop / tablet */}
                  <div className="mx-scrollbar mt-3.5 hidden max-h-[22rem] overflow-y-auto overflow-x-auto sm:block">

                    <table className="w-full min-w-[720px] border-collapse text-left text-sm">

                      <thead className="sticky top-0 z-10 bg-mx-surface-raised">

                        <tr className="border-b border-mx-border text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">

                          <th className="py-2 pr-3 font-semibold">
                            {du.columnFileName}
                          </th>

                          <th className="px-3 py-2 font-semibold">
                            {du.columnType}
                          </th>

                          <th className="px-3 py-2 font-semibold">
                            {du.columnSize}
                          </th>

                          <th className="px-3 py-2 font-semibold">
                            {du.columnCategory}
                          </th>

                          <th className="px-3 py-2 font-semibold">
                            {du.columnStatus}
                          </th>

                          <th className="py-2 pl-3 text-right font-semibold">
                            {du.columnActions}
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {documents.map(
                          (doc) => {
                            const Icon =
                              CATEGORY_ICON[
                                doc.category
                              ];

                            return (
                              <tr
                                key={doc.id}
                                className="border-b border-mx-border last:border-b-0"
                              >

                                <td className="py-2.5 pr-3">

                                  <div className="flex min-w-0 items-center gap-2.5">

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

                                    <span className="truncate font-medium text-mx-ink">
                                      {doc.file.name}
                                    </span>

                                  </div>

                                </td>


                                <td className="px-3 py-2.5 text-mx-ink-soft">
                                  {fileExtensionLabel(
                                    doc.file
                                  )}
                                </td>


                                <td className="px-3 py-2.5 text-mx-ink-soft">
                                  {formatFileSize(
                                    doc.file.size
                                  )}
                                </td>


                                <td className="px-3 py-2.5">

                                  <div className="relative inline-block">

                                    <select
                                      aria-label={
                                        du.changeCategoryButton
                                      }
                                      value={
                                        doc.category
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        handleChangeCategory(
                                          doc.id,
                                          event.target
                                            .value as DocumentCategoryId
                                        )
                                      }
                                      className="h-9 min-w-[180px] appearance-none rounded-mx-sm border border-mx-border-strong bg-mx-surface py-1.5 pl-3 pr-8 text-xs font-medium text-mx-ink focus:border-mx-blue"
                                    >

                                      {CATEGORY_ORDER.map(
                                        (id) => (
                                          <option
                                            key={id}
                                            value={id}
                                          >
                                            {
                                              du.categories[
                                                id
                                              ].title
                                            }
                                          </option>
                                        )
                                      )}

                                    </select>


                                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-mx-ink-muted">
                                      ▾
                                    </span>

                                  </div>

                                </td>


                                <td className="px-3 py-2.5">

                                  {doc.status ===
                                  "uploading" ? (

                                    <Badge tone="neutral">
                                      {
                                        du.statusUploading
                                      }
                                    </Badge>

                                  ) : (

                                    <Badge
                                      tone="green"
                                      icon={
                                        <span className="h-1.5 w-1.5 rounded-full bg-mx-green-strong" />
                                      }
                                    >
                                      {
                                        du.statusUploaded
                                      }
                                    </Badge>

                                  )}

                                </td>


                                <td className="py-2.5 pl-3">

                                  <div className="flex items-center justify-end gap-2">

                                    {doc.previewUrl && (

                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        icon={
                                          <Eye
                                            size={13}
                                            aria-hidden="true"
                                          />
                                        }
                                        onClick={() =>
                                          handleView(
                                            doc
                                          )
                                        }
                                      >
                                        {du.viewButton}
                                      </Button>

                                    )}


                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      icon={
                                        <Trash2
                                          size={13}
                                          aria-hidden="true"
                                        />
                                      }
                                      onClick={() =>
                                        handleRemove(
                                          doc.id
                                        )
                                      }
                                      className="text-mx-danger hover:bg-mx-danger-soft"
                                    >
                                      {
                                        du.removeButton
                                      }
                                    </Button>

                                  </div>

                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                    </table>

                  </div>


                  {/* Cards — mobile */}
                  <ul className="mx-scrollbar mt-3.5 flex max-h-[24rem] flex-col gap-2.5 overflow-y-auto sm:hidden">

                    {documents.map(
                      (doc) => {
                        const Icon =
                          CATEGORY_ICON[
                            doc.category
                          ];

                        return (
                          <li
                            key={doc.id}
                            className="flex flex-col gap-3 rounded-mx-md border border-mx-border bg-mx-surface p-3.5"
                          >

                            <div className="flex min-w-0 items-start gap-3">

                              <MedicalIcon
                                icon={Icon}
                                tone={
                                  CATEGORY_TONE[
                                    doc.category
                                  ]
                                }
                                size={17}
                                className="h-10 w-10 shrink-0"
                              />


                              <div className="min-w-0 flex-1">

                                <p className="truncate text-sm font-semibold text-mx-ink">
                                  {doc.file.name}
                                </p>


                                <p className="mt-0.5 text-xs text-mx-ink-muted">
                                  {fileExtensionLabel(
                                    doc.file
                                  )}{" "}
                                  ·{" "}
                                  {formatFileSize(
                                    doc.file.size
                                  )}
                                </p>


                                <div className="mt-1.5">

                                  {doc.status ===
                                  "uploading" ? (

                                    <Badge tone="neutral">
                                      {
                                        du.statusUploading
                                      }
                                    </Badge>

                                  ) : (

                                    <Badge
                                      tone="green"
                                      icon={
                                        <span className="h-1.5 w-1.5 rounded-full bg-mx-green-strong" />
                                      }
                                    >
                                      {
                                        du.statusUploaded
                                      }
                                    </Badge>

                                  )}

                                </div>

                              </div>

                            </div>


                            <div className="relative">

                              <select
                                aria-label={
                                  du.changeCategoryButton
                                }
                                value={
                                  doc.category
                                }
                                onChange={(
                                  event
                                ) =>
                                  handleChangeCategory(
                                    doc.id,
                                    event.target
                                      .value as DocumentCategoryId
                                  )
                                }
                                className="h-10 w-full appearance-none rounded-mx-sm border border-mx-border-strong bg-mx-surface px-3 pr-8 text-xs font-medium text-mx-ink focus:border-mx-blue"
                              >

                                {CATEGORY_ORDER.map(
                                  (id) => (
                                    <option
                                      key={id}
                                      value={id}
                                    >
                                      {
                                        du.categories[
                                          id
                                        ].title
                                      }
                                    </option>
                                  )
                                )}

                              </select>


                              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-mx-ink-muted">
                                ▾
                              </span>

                            </div>


                            <div className="flex items-center gap-2">

                              {doc.previewUrl && (

                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  icon={
                                    <Eye
                                      size={13}
                                      aria-hidden="true"
                                    />
                                  }
                                  onClick={() =>
                                    handleView(
                                      doc
                                    )
                                  }
                                  className="flex-1"
                                >
                                  {du.viewButton}
                                </Button>

                              )}


                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                icon={
                                  <Trash2
                                    size={13}
                                    aria-hidden="true"
                                  />
                                }
                                onClick={() =>
                                  handleRemove(
                                    doc.id
                                  )
                                }
                                className="flex-1 text-mx-danger hover:bg-mx-danger-soft"
                              >
                                {
                                  du.removeButton
                                }
                              </Button>

                            </div>

                          </li>
                        );
                      }
                    )}

                  </ul>

                </>
              )}

            </div>


            {/* Footer actions */}
            <div className="flex flex-col-reverse items-center justify-between gap-3 rounded-mx-lg border border-mx-border bg-mx-surface-raised p-3.5 shadow-mx-sm sm:flex-row sm:p-4">

              <div className="text-center sm:text-left">

                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={onSkip}
                  disabled={
                    isProcessingDocuments
                  }
                >
                  {du.skipButton}
                </Button>

                <p className="mt-1.5 text-xs text-mx-ink-muted">
                  {du.skipHint}
                </p>

              </div>


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
                  disabled={
                    isProcessingDocuments
                  }
                  className="shadow-mx-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-mx-md active:translate-y-0"
                >
                  {isProcessingDocuments
                    ? "Processing..."
                    : du.continueButton}
                </Button>

                <p className="mt-1.5 text-xs text-mx-ink-muted">
                  {isProcessingDocuments
                    ? "Please wait while your documents are being processed."
                    : du.continueHint}
                </p>

              </div>

            </div>

          </div>


          {/* Right: Tips / Help sidebar */}
          <div className="flex flex-col gap-4 lg:order-3">

            <Card>

              <div className="flex items-center gap-2">

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-mx-warning-soft text-mx-warning">

                  <Lightbulb
                    size={15}
                    aria-hidden="true"
                  />

                </span>


                <h3 className="font-display text-sm font-bold text-mx-ink">
                  {du.tipsTitle}
                </h3>

              </div>


              <ul className="mt-2.5 flex flex-col gap-1.5">

                {du.tips.map(
                  (tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-xs leading-relaxed text-mx-ink-soft"
                    >

                      <Check
                        size={13}
                        className="mt-0.5 shrink-0 text-mx-green"
                        aria-hidden="true"
                      />

                      <span>
                        {tip}
                      </span>

                    </li>
                  )
                )}

              </ul>

            </Card>

          </div>

        </div>

      </motion.div>

    </div>
  );
}