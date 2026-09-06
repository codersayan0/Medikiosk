import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AdminOrganizationDetailsStep } from "./AdminOrganizationDetailsStep";
import { AdminEmailVerificationStep } from "./AdminEmailVerificationStep";
import { AdminAccountCreatedStep } from "./AdminAccountCreatedStep";
import type { AdminOrganizationFormState } from "./adminRegisterTypes";
import { INITIAL_ADMIN_ORGANIZATION_FORM } from "./adminRegisterTypes";
import { register } from "../../services/authApi";

type ArrayField = "facilities" | "consultationTypes" | "accessibility" | "languages" | "specializations";

/**
 * Admin (Hospital) Registration — full front-end scaffold, following the
 * same step-owning-parent pattern as pages/doctor/DoctorRegisterPage and
 * pages/patient/PatientRegisterPage:
 *
 *   details (Admin & Organization / Hospital Details — AdminOrganizationDetailsStep)
 *     -> otp (email verification — AdminEmailVerificationStep, a
 *        dedicated step showing the full official email address)
 *     -> account-created (AdminAccountCreatedStep, hands off to the
 *        Admin Dashboard)
 *
 * All backend calls (OTP delivery, admin/hospital registration, account
 * activation) are intentionally out of scope here — every step only
 * mutates local state and calls a plain onX callback.
 */
export default function AdminRegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<AdminOrganizationFormState>(INITIAL_ADMIN_ORGANIZATION_FORM);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"details" | "otp" | "account-created">("details");
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);

  function updateField<K extends keyof AdminOrganizationFormState>(field: K, value: AdminOrganizationFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleArrayValue(field: ArrayField, value: string) {
    setForm((prev) => {
      const current = prev[field];
      const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  }

  async function handleDetailsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.adminFullName.trim() || !form.adminPhone.trim()) {
      setError("Enter the admin's full name and phone number to continue.");
      return;
    }
    if (!form.organizationName.trim() || !form.organizationType) {
      setError("Enter the organization name and type to continue.");
      return;
    }
    if (!form.officialEmail.trim() || !form.officialPhone.trim()) {
      setError("Enter the official email and phone number to continue.");
      return;
    }
    if (!form.fullAddress.trim() || !form.city.trim() || !form.state || !form.zip.trim()) {
      setError("Enter the full organization address to continue.");
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

    setError(null);
    setIsSubmitting(true);

    try {
      const user = await register({
        full_name: form.adminFullName.trim(),
        email: form.officialEmail.trim(),
        phone_number: form.adminPhone.trim(),
        password: form.password,
        role: "admin",
      });
      setRegisteredUserId(user.id);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === "otp") {
    return (
      <AdminEmailVerificationStep
        officialEmail={form.officialEmail}
        userId={registeredUserId ?? ""}
        onBack={() => setStep("details")}
        onVerified={() => setStep("account-created")}
      />
    );
  }

  if (step === "account-created") {
    return <AdminAccountCreatedStep form={form} onGoToDashboard={() => navigate("/admin/dashboard")} />;
  }

  return (
    <AdminOrganizationDetailsStep
      form={form}
      updateField={updateField}
      toggleArrayValue={toggleArrayValue}
      error={error}
      isSubmitting={isSubmitting}
      onSubmit={handleDetailsSubmit}
      onBackToLogin={() => navigate("/admin/login")}
    />
  );
}