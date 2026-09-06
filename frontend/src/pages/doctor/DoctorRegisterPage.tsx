import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { STATE_OPTIONS_BY_COUNTRY } from "../../data/addressOptions";
import { DEFAULT_PHONE_COUNTRY_CODE } from "../../data/phoneCountryCodes";
import { DoctorDetailsStep } from "./DoctorDetailsStep";
import { PatientRegisterOtpStep } from "../patient/PatientRegisterOtpStep";
import { DoctorProfessionalInformationStep } from "./DoctorProfessionalInformationStep";
import { DoctorDocumentUploadStep } from "./DoctorDocumentUploadStep";
import { DoctorHospitalApplicationStep } from "./DoctorHospitalApplicationStep";
import { DoctorHospitalApplicationSubmittedStep } from "./DoctorHospitalApplicationSubmittedStep";
import type { SelectedHospital } from "./doctorHospitalTypes";
import { formatApplicationDate, generateApplicationId } from "./doctorHospitalTypes";
import { DoctorAccountCreatedStep } from "./DoctorAccountCreatedStep";
import type { DoctorDocumentSlot, DoctorProfessionalInfoState, DoctorRegisterFormState } from "./doctorRegisterTypes";
import { INITIAL_DOCTOR_DOCUMENT_SLOTS, INITIAL_DOCTOR_PROFESSIONAL_INFO } from "./doctorRegisterTypes";
import { register } from "../../services/authApi";

const INITIAL_FORM: DoctorRegisterFormState = {
  firstName: "",
  lastName: "",
  day: "",
  month: "",
  year: "",
  gender: "",
  photoUrl: "",
  email: "",
  phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
  phone: "",
  alternatePhone: "",
  country: "",
  state: "",
  district: "",
  zip: "",
  password: "",
  confirmPassword: "",
};

/**
 * Doctor Registration — full front-end scaffold, following the same
 * step-owning-parent pattern as pages/patient/PatientRegisterPage:
 *
 *   details (Personal + Contact + Security)
 *     -> otp (email/phone verification, reusing PatientRegisterOtpStep
 *        as-is — its copy and logic are already generic, not
 *        patient-specific — aside from the bottom security note, which
 *        we override via the `securityNote` prop to say "medical data"
 *        instead of the patient flow's "health data")
 *     -> professional (Professional Information)
 *     -> documents (Documents / License Upload)
 *     -> hospital (Hospital Application — doctor searches for and sends
 *        an application to a specific hospital; can also be skipped and
 *        completed later from the dashboard)
 *     -> review (Phase 3 — submitted application pending the hospital
 *        admin's review; DoctorHospitalApplicationSubmittedStep. Only
 *        reached after Send Your Application, not after Skip This Step)
 *     -> account-created (reachable either via admin approval — see
 *        DoctorHospitalApplicationSubmittedStep's demo-only "Simulate
 *        Admin Approval" affordance, a real deployment reaches this step
 *        via a live push while the doctor is on that page, or an
 *        email/SMS activation link otherwise — or directly via "Skip
 *        This Step" on the Hospital Application step, since no hospital
 *        admin review is pending in that case)
 *
 * All backend calls (OTP delivery, doctor registration, document upload,
 * admin verification, email approval, account activation, dashboard
 * auth) are intentionally out of scope here — every step only mutates
 * local state and calls a plain onX callback, so wiring a real API in
 * later means replacing the body of these callbacks, not reshaping the
 * components.
 */
export default function DoctorRegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<DoctorRegisterFormState>(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  const [professionalInfo, setProfessionalInfo] = useState<DoctorProfessionalInfoState>(INITIAL_DOCTOR_PROFESSIONAL_INFO);
  const [professionalError, setProfessionalError] = useState<string | null>(null);
  const [isSubmittingProfessional, setIsSubmittingProfessional] = useState(false);

  const [documentSlots, setDocumentSlots] = useState<DoctorDocumentSlot[]>(INITIAL_DOCTOR_DOCUMENT_SLOTS);
  const [documentError, setDocumentError] = useState<string | null>(null);
  const [isSubmittingDocuments, setIsSubmittingDocuments] = useState(false);

  const [selectedHospital, setSelectedHospital] = useState<SelectedHospital | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [applicationDate, setApplicationDate] = useState<string | null>(null);

  const [step, setStep] = useState<
    "details" | "otp" | "professional" | "documents" | "hospital" | "review" | "account-created"
  >("details");

  const stateOptions = form.country ? STATE_OPTIONS_BY_COUNTRY[form.country] ?? [] : [];

  function updateField<K extends keyof DoctorRegisterFormState>(field: K, value: DoctorRegisterFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateCountry(value: string) {
    setForm((prev) => ({ ...prev, country: value, state: "" }));
  }

  function updateProfessionalField<K extends keyof DoctorProfessionalInfoState>(
    field: K,
    value: DoctorProfessionalInfoState[K]
  ) {
    setProfessionalInfo((prev) => ({ ...prev, [field]: value }));
  }

  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Enter your first and last name to continue.");
      return;
    }
    if (!form.day || !form.month || !form.year) {
      setError("Enter your full date of birth to continue.");
      return;
    }
    if (!form.gender) {
      setError("Select your gender to continue.");
      return;
    }
    if (!form.email.trim()) {
      setError("Enter your email address to continue.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Enter your phone number to continue.");
      return;
    }
    if (!form.country || !form.state || !form.district.trim() || !form.zip.trim()) {
      setError("Enter your full address to continue.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (form.confirmPassword !== form.password) {
      setError("Passwords do not match.");
      return;
    }
    if (!consentAccepted) {
      setConsentError("Please accept the Privacy Policy and Consent Terms to continue.");
      return;
    }

    setError(null);
    setConsentError(null);
    setIsSubmitting(true);

    try {
      const user = await register({
        full_name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email.trim(),
        phone_number: form.phone.trim(),
        password: form.password,
        role: "doctor",
      });
      setRegisteredUserId(user.id);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleProfessionalSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !professionalInfo.registrationNumber.trim() ||
      !professionalInfo.registrationAuthority.trim() ||
      !professionalInfo.yearOfRegistration ||
      !professionalInfo.specialization.trim() ||
      !professionalInfo.qualification.trim() ||
      !professionalInfo.yearsOfExperience.trim() ||
      !professionalInfo.hospitalName.trim() ||
      !professionalInfo.designation.trim()
    ) {
      setProfessionalError("Fill in all required fields to continue.");
      return;
    }
    if (!professionalInfo.consultationType) {
      setProfessionalError("Select a consultation type to continue.");
      return;
    }

    setProfessionalError(null);
    setIsSubmittingProfessional(true);
    window.setTimeout(() => {
      setIsSubmittingProfessional(false);
      setStep("documents");
    }, 500);
  }

  function handleDocumentsContinue() {
    const missingRequired = documentSlots.some((slot) => slot.required && !slot.file);
    if (missingRequired) {
      setDocumentError("Upload all required documents to continue.");
      return;
    }

    setDocumentError(null);
    setIsSubmittingDocuments(true);
    window.setTimeout(() => {
      setIsSubmittingDocuments(false);
      setStep("hospital");
    }, 500);
  }

  function handleSendHospitalApplication(hospital: SelectedHospital) {
    setSelectedHospital(hospital);
    setApplicationId(generateApplicationId());
    setApplicationDate(formatApplicationDate(new Date()));
    setStep("review");
  }

  if (step === "otp") {
    return (
      <PatientRegisterOtpStep
        identifier={form.email}
        phone={form.phone}
        userId={registeredUserId ?? ""}
        email={form.email}
        securityNote="Your medical data is secure with us. We follow highest security standards."
        onBack={() => setStep("details")}
        onVerified={() => setStep("professional")}
      />
    );
  }

  if (step === "professional") {
    return (
      <DoctorProfessionalInformationStep
        form={professionalInfo}
        updateField={updateProfessionalField}
        error={professionalError}
        isSubmitting={isSubmittingProfessional}
        onSubmit={handleProfessionalSubmit}
        onBack={() => setStep("otp")}
      />
    );
  }

  if (step === "documents") {
    return (
      <DoctorDocumentUploadStep
        slots={documentSlots}
        setSlots={setDocumentSlots}
        error={documentError}
        isSubmitting={isSubmittingDocuments}
        onContinue={handleDocumentsContinue}
        onBack={() => setStep("professional")}
      />
    );
  }

  if (step === "hospital") {
    return (
      <DoctorHospitalApplicationStep
        onBack={() => setStep("documents")}
        onSendApplication={handleSendHospitalApplication}
        onSkip={() => setStep("account-created")}
      />
    );
  }

  if (step === "review" && selectedHospital && applicationId && applicationDate) {
    return (
      <DoctorHospitalApplicationSubmittedStep
        hospital={selectedHospital}
        applicationId={applicationId}
        applicationDate={applicationDate}
        documentsUploadedCount={documentSlots.filter((slot) => slot.file).length}
        onBack={() => setStep("hospital")}
        onGoHome={() => navigate("/")}
        onSimulateAdminApproval={() => setStep("account-created")}
      />
    );
  }

  if (step === "account-created") {
    return (
      <DoctorAccountCreatedStep
        form={form}
        hospital={selectedHospital}
        onGoToDashboard={() => navigate("/doctor/dashboard")}
      />
    );
  }

  return (
    <DoctorDetailsStep
      form={form}
      updateField={updateField}
      updateCountry={updateCountry}
      stateOptions={stateOptions}
      showPassword={showPassword}
      setShowPassword={setShowPassword}
      showConfirmPassword={showConfirmPassword}
      setShowConfirmPassword={setShowConfirmPassword}
      consentAccepted={consentAccepted}
      setConsentAccepted={setConsentAccepted}
      consentError={consentError}
      setConsentError={setConsentError}
      error={error}
      isSubmitting={isSubmitting}
      onSubmit={handleDetailsSubmit}
      onBackToLogin={() => navigate("/doctor/login")}
    />
  );
}