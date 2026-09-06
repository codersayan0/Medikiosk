import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useTranslation } from "../../i18n";

import {
  COUNTRY_OPTIONS,
  STATE_OPTIONS_BY_COUNTRY,
} from "../../data/addressOptions";

import {
  PersonalDetailsStep,
  MONTH_OPTIONS,
  GENDER_OPTIONS,
} from "./PersonalDetailsStep";

import { PatientRegisterOtpStep } from "./PatientRegisterOtpStep";
import { AiHealthInterview } from "./AiHealthInterview";
import { DocumentUploadStep } from "./DocumentUploadStep";
import { AiAnalysisStep } from "./AiAnalysisStep";
import { HealthSummaryStep } from "./HealthSummaryStep";
import { ReviewSummaryStep } from "./ReviewSummaryStep";
import { AccountCreatedStep } from "./AccountCreatedStep";

import type {
  AnalysisFinding,
  AnalysisResult,
  HealthIdRecord,
  PatientSummary,
  UploadedDocumentRecord,
} from "../../types";

import {
  isRegistrationEmailVerified,
  registerPatient,
  login,
  clearRegistrationVerification,
} from "../../services/authApi";

import {
  analyzeRegistrationMedicalText,
  type AIAnalysis,
} from "../../services/aiApi";

import { DEFAULT_PHONE_COUNTRY_CODE } from "../../data/phoneCountryCodes";

import { useAuth } from "../../context/AuthContext";

// ======================================================
// HEALTH ID
// ======================================================

function generateHealthId(): HealthIdRecord {
  const part = () =>
    Math.floor(1000 + Math.random() * 9000);

  return {
    id: `MK-${part()}-${part()}`,
  };
}


// ======================================================
// DATE
// ======================================================

function formatRegisteredOnDate(
  date: Date
): string {
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
// FORM STATE
// ======================================================

export interface RegisterFormState {
  firstName: string;
  lastName: string;

  day: string;
  month: string;
  year: string;

  gender: string;

  photoUrl: string;

  country: string;
  state: string;
  district: string;
  zip: string;

  identifier: string;

  phoneCountryCode: string;
  phone: string;
  alternatePhone: string;

  password: string;
  confirmPassword: string;
}


// ======================================================
// INITIAL FORM
// ======================================================

const INITIAL_FORM: RegisterFormState = {
  firstName: "",
  lastName: "",

  day: "",
  month: "",
  year: "",

  gender: "",

  photoUrl: "",

  country: "",
  state: "",
  district: "",
  zip: "",

  identifier: "",

  phoneCountryCode:
    DEFAULT_PHONE_COUNTRY_CODE,

  phone: "",
  alternatePhone: "",

  password: "",
  confirmPassword: "",
};


// ======================================================
// GEMINI → EXISTING UI RESULT
// ======================================================

function convertGeminiAnalysisToUIResult(
  analysis: AIAnalysis,
  documents: UploadedDocumentRecord[]
): AnalysisResult {
  const findings: AnalysisFinding[] = [];

  let findingIndex = 1;


  for (
    const item of analysis.key_findings
  ) {
    findings.push({
      id: `key-${findingIndex++}`,
      title: "Key Finding",
      description: item,
      priority: "medium",
    });
  }


  for (
    const item of analysis.abnormal_values
  ) {
    findings.push({
      id: `abnormal-${findingIndex++}`,
      title: "Abnormal Value",
      description: item,
      priority: "high",
    });
  }


  for (
    const item of analysis.possible_concerns
  ) {
    findings.push({
      id: `concern-${findingIndex++}`,
      title: "Possible Concern",
      description: item,
      priority: "high",
    });
  }


  let status:
    AnalysisResult["status"] =
      "clear";

  if (
    analysis.possible_concerns
      .length > 0
  ) {
    status = "attention";
  }


  const criticalKeywords = [
    "urgent",
    "critical",
    "immediate",
    "emergency",
  ];


  const hasCriticalConcern =
    analysis.possible_concerns.some(
      (item) =>
        criticalKeywords.some(
          (keyword) =>
            item
              .toLowerCase()
              .includes(keyword)
        )
    );


  if (hasCriticalConcern) {
    status = "critical";
  }


  const dataPointsExtracted =
    analysis.key_findings.length +
    analysis.abnormal_values.length +
    analysis.possible_concerns.length;


  /*
   * This value represents successful structured
   * analysis completeness, not medical certainty.
   */
  const confidenceScore =
    dataPointsExtracted === 0
      ? 70
      : Math.min(
          95,
          70 +
            dataPointsExtracted * 5
        );


  return {
    status,

    documentsAnalyzed:
      documents.length,

    dataPointsExtracted,

    confidenceScore,

    findings,
  };
}


// ======================================================
// PAGE
// ======================================================

export default function PatientRegisterPage() {
  const navigate = useNavigate();

  const { t } =
    useTranslation();

  const {
    setSession,
  } = useAuth();


  // ----------------------------------------------------
  // FORM
  // ----------------------------------------------------

  const [
    form,
    setForm,
  ] = useState<RegisterFormState>(
    INITIAL_FORM
  );


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);


  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  const [
    consentAccepted,
    setConsentAccepted,
  ] = useState(false);


  const [
    consentError,
    setConsentError,
  ] = useState<string | null>(
    null
  );


  // ----------------------------------------------------
  // FLOW
  // ----------------------------------------------------

  const [
    interviewCompleted,
    setInterviewCompleted,
  ] = useState(false);


  const [
    documents,
    setDocuments,
  ] = useState<UploadedDocumentRecord[]>([]);


  const [
    step,
    setStep,
  ] = useState<
    | "details"
    | "otp"
    | "interview"
    | "documents"
    | "ai-analysis"
    | "health-summary"
    | "review"
    | "account-created"
  >("details");


  // ----------------------------------------------------
  // AI ANALYSIS
  // ----------------------------------------------------

  const [
    analysisResult,
    setAnalysisResult,
  ] = useState<AnalysisResult | null>(
    null
  );

  // Keep the original structured Gemini response so the same
  // medical summary can be persisted during final registration.
  const [
    registrationAnalysis,
    setRegistrationAnalysis,
  ] = useState<AIAnalysis | null>(
    null
  );


  const [
    isAnalyzingDocuments,
    setIsAnalyzingDocuments,
  ] = useState(false);


  const [
    analysisError,
    setAnalysisError,
  ] = useState<string | null>(
    null
  );


  // ----------------------------------------------------
  // INTERVIEW ANSWERS
  // ----------------------------------------------------

  const [interviewAnswers, setInterviewAnswers] =
    useState<Array<{
      question_index: number;
      question: string;
      answer: string;
    }>>([]);


  // ----------------------------------------------------
  // HEALTH ID
  // ----------------------------------------------------

  const healthIdRef =
    useRef<HealthIdRecord | null>(
      null
    );


  const registeredOnRef =
    useRef<string | null>(
      null
    );


  // ----------------------------------------------------
  // LOCATION
  // ----------------------------------------------------

  const stateOptions =
    form.country
      ? STATE_OPTIONS_BY_COUNTRY[
          form.country
        ] ?? []
      : [];


  // ====================================================
  // FIELD UPDATE
  // ====================================================

  function updateField<K extends keyof RegisterFormState>(
    field: K,
    value: RegisterFormState[K]
  ) {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  }


  // ====================================================
  // COUNTRY
  // ====================================================

  function updateCountry(
    value: string
  ) {
    setForm(
      (previous) => ({
        ...previous,
        country: value,
        state: "",
      })
    );
  }


  // ====================================================
  // STEP 1
  // ====================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();


    if (
      !form.firstName.trim() ||
      !form.lastName.trim()
    ) {
      setError(
        "Enter your first and last name to continue."
      );
      return;
    }


    if (
      !form.day ||
      !form.month ||
      !form.year
    ) {
      setError(
        "Enter your full date of birth to continue."
      );
      return;
    }


    if (!form.gender) {
      setError(
        "Select your gender to continue."
      );
      return;
    }


    if (
      !form.country ||
      !form.state ||
      !form.district.trim() ||
      !form.zip.trim()
    ) {
      setError(
        "Enter your full address to continue."
      );
      return;
    }


    const email =
      form.identifier
        .trim()
        .toLowerCase();


    if (!email) {
      setError(
        "Enter your email address to continue."
      );
      return;
    }


    if (!email.includes("@")) {
      setError(
        "Please enter a valid email address to continue."
      );
      return;
    }


    if (!form.phone.trim()) {
      setError(
        t.personalDetailsStep.phoneRequiredError
      );
      return;
    }


    if (form.password.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }


    if (
      form.confirmPassword !==
      form.password
    ) {
      setError(
        t.personalDetailsStep
          .passwordMismatchError
      );
      return;
    }


    if (!consentAccepted) {
      setConsentError(
        t.patientRegisterConsent.error
      );
      return;
    }


    setError(null);
    setConsentError(null);
    setIsSubmitting(true);


    try {
      /*
       * Account creation must happen only after
       * OTP → Interview → Documents → AI → Review.
       *
       * PatientRegisterOtpStep sends the OTP.
       */
      setStep("otp");

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to continue registration."
      );
    } finally {
      setIsSubmitting(false);
    }
  }


  // ====================================================
  // GEMINI ANALYSIS
  // ====================================================

  async function runDocumentAIAnalysis() {
    if (analysisResult) {
      return analysisResult;
    }


    const extractedText =
      documents
        .map(
          (document) =>
            document.extractedText?.trim() ||
            ""
        )
        .filter(Boolean)
        .join("\n\n");


    /*
     * No readable document text:
     * continue with an empty analysis result
     * rather than inventing medical data.
     */
    if (!extractedText) {
      const emptyResult: AnalysisResult = {
        status: "clear",
        documentsAnalyzed:
          documents.length,
        dataPointsExtracted: 0,
        confidenceScore: 0,
        findings: [],
      };

      setRegistrationAnalysis(null);

      setAnalysisResult(
        emptyResult
      );

      return emptyResult;
    }


    setIsAnalyzingDocuments(true);
    setAnalysisError(null);


    try {
      const response =
        await analyzeRegistrationMedicalText(
          extractedText
        );


      const converted =
        convertGeminiAnalysisToUIResult(
          response.analysis,
          documents
        );

      setRegistrationAnalysis(response.analysis);

      setAnalysisResult(
        converted
      );


      return converted;

    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to analyze your documents.";

      setAnalysisError(message);

      throw err;

    } finally {
      setIsAnalyzingDocuments(false);
    }
  }


  // ====================================================
  // SUMMARY
  // ====================================================

  function buildPatientSummary():
    PatientSummary {
    const fullName =
      `${form.firstName} ${form.lastName}`
        .trim();


    const monthLabel =
      MONTH_OPTIONS.find(
        (month) =>
          month.value ===
          form.month
      )?.label ?? "";


    const dateOfBirth =
      form.day &&
      monthLabel &&
      form.year
        ? `${form.day} ${monthLabel} ${form.year}`
        : "";


    const genderLabel =
      GENDER_OPTIONS.find(
        (gender) =>
          gender.value ===
          form.gender
      )?.label ?? "";


    const stateLabel =
      stateOptions.find(
        (state) =>
          state.value ===
          form.state
      )?.label ?? "";


    const countryLabel =
      COUNTRY_OPTIONS.find(
        (country) =>
          country.value ===
          form.country
      )?.label ?? "";


    const locationParts = [
      form.district.trim(),
      stateLabel,
      countryLabel,
    ].filter(Boolean);


    return {
      fullName,

      dateOfBirth,

      gender: genderLabel,

      contact: form.identifier,

      location:
        locationParts.join(", "),

      registeredOn:
        registeredOnRef.current ??
        "",

      profileImageUrl:
        form.photoUrl ||
        undefined,
    };
  }


  // ====================================================
  // ACCOUNT CREATION
  // ====================================================

  async function handleCreateAccount() {
    setError(null);
    setIsSubmitting(true);


    try {
      const email =
        form.identifier
          .trim()
          .toLowerCase();


      if (
        !isRegistrationEmailVerified(
          email
        )
      ) {
        throw new Error(
          "Please verify your email before creating the account."
        );
      }


      const dob =
        form.day &&
        form.month &&
        form.year
          ? `${form.year}-${String(
              form.month
            ).padStart(
              2,
              "0"
            )}-${String(
              form.day
            ).padStart(
              2,
              "0"
            )}`
          : "";


      const gender =
        GENDER_OPTIONS.find(
          (g) =>
            g.value ===
            form.gender
        )?.label ??
        form.gender;


      const stateLabel =
        stateOptions.find(
          (state) =>
            state.value ===
            form.state
        )?.label ??
        form.state;


      const countryLabel =
        COUNTRY_OPTIONS.find(
          (country) =>
            country.value ===
            form.country
        )?.label ??
        form.country;


      const address = [
        form.district.trim(),
        stateLabel,
        countryLabel,
        form.zip.trim(),
      ]
        .filter(Boolean)
        .join(", ");


      const user =
        await registerPatient({
          full_name:
            `${form.firstName} ${form.lastName}`.trim(),

          email,

          phone_number:
            form.phone.trim(),

          password:
            form.password,

          role: "patient",

          dob,

          gender,

          alternate_phone:
            form.alternatePhone.trim(),

          country:
            countryLabel,

          state:
            stateLabel,

          district:
            form.district.trim(),

          zip:
            form.zip.trim(),

          address,

          emergency_contact:
            "",

          registration_ai: registrationAnalysis
            ? {
                summary: registrationAnalysis.summary || "",
                key_findings: Array.isArray(registrationAnalysis.key_findings)
                  ? registrationAnalysis.key_findings
                  : [],
                abnormal_values: Array.isArray(registrationAnalysis.abnormal_values)
                  ? registrationAnalysis.abnormal_values
                  : [],
                possible_concerns: Array.isArray(registrationAnalysis.possible_concerns)
                  ? registrationAnalysis.possible_concerns
                  : [],
                recommendations: Array.isArray(registrationAnalysis.recommendations)
                  ? registrationAnalysis.recommendations
                  : [],
                documents_analyzed: analysisResult?.documentsAnalyzed ?? documents.length,
                data_points_extracted: analysisResult?.dataPointsExtracted ?? 0,
                confidence_score: analysisResult?.confidenceScore ?? 0,
                generated_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                patient_modified: false,
              }
            : null,

          interview_answers: interviewAnswers,

          registration_documents: documents
            .filter((document) => document.extractedText?.trim())
            .map((document) => ({
              name: document.fileName,
              file_type: document.fileType,
              extracted_text: document.extractedText?.trim() || "",
              processed_at: document.uploadedAt || new Date().toISOString(),
            })),
        });


      if (!user) {
        throw new Error(
          "Account creation failed."
        );
      }


      const auth =
        await login({
          identifier: email,
          password:
            form.password,
        });


      if (
        auth.user.role !==
        "patient"
      ) {
        throw new Error(
          "The created account is not a patient account."
        );
      }


      setSession(
        auth.access_token,
        auth.user
      );


      if (!healthIdRef.current) {
        healthIdRef.current = {
          id:
            auth.user.patient_uid ||
            generateHealthId().id,
        };
      }


      if (
        !registeredOnRef.current
      ) {
        registeredOnRef.current =
          formatRegisteredOnDate(
            new Date()
          );
      }


      // Registration profile, interview answers, extracted document text,
      // and structured AI analysis are persisted by
      // POST /api/auth/patient-register. Do not PATCH
      // /api/patient/profile during registration.


      clearRegistrationVerification();


      setStep(
        "account-created"
      );

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Account creation failed. Please try again."
      );

    } finally {
      setIsSubmitting(false);
    }
  }


  // ====================================================
  // OTP
  // ====================================================

  if (step === "otp") {
    return (
      <PatientRegisterOtpStep
        email={
          form.identifier
            .trim()
            .toLowerCase()
        }

        name={
          `${form.firstName} ${form.lastName}`
            .trim()
        }

        onBack={() => {
          setError(null);
          setStep("details");
        }}

        onVerified={() => {
          setError(null);
          setStep("interview");
        }}
      />
    );
  }


  // ====================================================
  // INTERVIEW
  // ====================================================

  if (step === "interview") {
    return (
      <AiHealthInterview
        onComplete={(answers) => {
          setInterviewAnswers(answers);
          setInterviewCompleted(true);
          setStep("documents");
        }}
        onSkip={() => {
          setInterviewAnswers([]);
          setInterviewCompleted(false);
         setStep("documents");
        }}
      />
    );
  }


  // ====================================================
  // DOCUMENTS
  // ====================================================

  if (step === "documents") {
    return (
      <DocumentUploadStep
        documents={
          documents
        }

        setDocuments={
          setDocuments
        }

                onContinue={async () => {
          if (documents.length === 0) {
            const emptyResult: AnalysisResult = {
              status: "clear",
              documentsAnalyzed: 0,
              dataPointsExtracted: 0,
              confidenceScore: 0,
              findings: [],
            };

            setAnalysisResult(emptyResult);
            setStep("ai-analysis");

            return;
          }

          const hasPendingDocument = documents.some(
            (document) => document.status === "uploading"
          );

          if (hasPendingDocument) {
            setError(
              "Please wait until all documents finish processing."
            );

            return;
          }

          try {
            const result = await runDocumentAIAnalysis();

            setAnalysisResult(result);
            setStep("ai-analysis");
          } catch (err) {
            console.error("Document AI analysis failed:", err);

            // Never fabricate or silently replace failed Gemini analysis
            // with a "clear" result. The AI Analysis screen will show the
            // real error and allow the patient to return to Documents.
            setAnalysisResult(null);
            setRegistrationAnalysis(null);

            setAnalysisError(
              err instanceof Error
                ? err.message
                : "AI analysis is currently unavailable."
            );

            setStep("ai-analysis");
          }
        }}

        onSkip={() => {
          const emptyResult: AnalysisResult = {
            status: "clear",
            documentsAnalyzed: 0,
            dataPointsExtracted: 0,
            confidenceScore: 0,
            findings: [],
          };

          setAnalysisResult(emptyResult);
          setStep("ai-analysis");
        }}
      />
    );
  }


  // ====================================================
  // AI ANALYSIS
  // ====================================================

  if (
    step === "ai-analysis"
  ) {
    if (
      isAnalyzingDocuments
    ) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-mx-bg px-6">
          <div className="rounded-mx-lg border border-mx-border bg-mx-surface-raised p-8 text-center shadow-mx-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-mx-border border-t-mx-green" />

            <h2 className="mt-4 font-display text-lg font-bold text-mx-ink">
              Analyzing your medical documents...
            </h2>

            <p className="mt-2 max-w-md text-sm text-mx-ink-muted">
              MediKiosk is reviewing the
              extracted document text with
              its AI analysis service.
            </p>
          </div>
        </div>
      );
    }


    if (!analysisResult) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-mx-bg px-6">
          <div className="text-center">
            <p className="text-sm text-mx-danger">
              {analysisError ||
                "Unable to prepare the AI analysis."}
            </p>

            <button
              type="button"
              className="mt-4 rounded-mx-sm border border-mx-border-strong px-4 py-2 text-sm"
              onClick={() =>
                setStep(
                  "documents"
                )
              }
            >
              Back to documents
            </button>
          </div>
        </div>
      );
    }


    return (
      <AiAnalysisStep
        documents={
          documents
        }

        analysisResult={
          analysisResult
        }

        onBack={() => {
          setStep(
            "documents"
          );
        }}

        onContinue={() => {
          setStep(
            "health-summary"
          );
        }}
      />
    );
  }


  // ====================================================
  // HEALTH SUMMARY
  // ====================================================

  if (
    step === "health-summary"
  ) {
    if (!analysisResult) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-mx-bg px-6">
          <div className="text-center">
            <p className="text-sm text-mx-danger">
              {analysisError || "Unable to prepare the health summary."}
            </p>
            <button
              type="button"
              className="mt-4 rounded-mx-sm border border-mx-border-strong px-4 py-2 text-sm"
              onClick={() => setStep("ai-analysis")}
            >
              Back to AI analysis
            </button>
          </div>
        </div>
      );
    }


    return (
      <HealthSummaryStep
        analysisResult={
          analysisResult
        }

        analysisSummary={
          registrationAnalysis?.summary || ""
        }

        keyFindings={
          registrationAnalysis?.key_findings || []
        }

        abnormalValues={
          registrationAnalysis?.abnormal_values || []
        }

        possibleConcerns={
          registrationAnalysis?.possible_concerns || []
        }

        recommendations={
          registrationAnalysis?.recommendations || []
        }

        onEditSummary={(value) => {
          setRegistrationAnalysis((previous) =>
            previous
              ? {
                  ...previous,
                  summary: value,
                }
              : previous
          );
        }}

        onBack={() => {
          setStep(
            "ai-analysis"
          );
        }}

        onContinue={() => {
          setStep(
            "review"
          );
        }}
      />
    );
  }


  // ====================================================
  // REVIEW
  // ====================================================

  if (step === "review") {
    return (
      <ReviewSummaryStep
        patient={
          buildPatientSummary()
        }

        documents={
          documents
        }

        interviewCompleted={
          interviewCompleted
        }

        onBack={() => {
          setStep(
            "health-summary"
          );
        }}

        onCreateAccount={
          handleCreateAccount
        }
      />
    );
  }


  // ====================================================
  // ACCOUNT CREATED
  // ====================================================

  if (
    step ===
    "account-created"
  ) {
    return (
      <AccountCreatedStep
        patient={
          buildPatientSummary()
        }

        documents={
          documents
        }

        healthId={
          healthIdRef.current ??
          generateHealthId()
        }

        onGoToDashboard={() =>
          navigate(
            "/patient/dashboard"
          )
        }
      />
    );
  }


  // ====================================================
  // DETAILS
  // ====================================================

  return (
    <PersonalDetailsStep
      form={form}

      updateField={
        updateField
      }

      updateCountry={
        updateCountry
      }

      stateOptions={
        stateOptions
      }

      showPassword={
        showPassword
      }

      setShowPassword={
        setShowPassword
      }

      showConfirmPassword={
        showConfirmPassword
      }

      setShowConfirmPassword={
        setShowConfirmPassword
      }

      consentAccepted={
        consentAccepted
      }

      setConsentAccepted={
        setConsentAccepted
      }

      consentError={
        consentError
      }

      setConsentError={
        setConsentError
      }

      error={error}

      isSubmitting={
        isSubmitting
      }

      onSubmit={
        handleSubmit
      }

      onBackToLogin={() =>
        navigate(
          "/patient/login"
        )
      }
    />
  );
}