import { apiRequest } from "./api";
import { sendOtpEmail } from "./emailservice";

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;
  role: "patient" | "doctor" | "admin";
}

export interface RegistrationAI {
  summary: string;
  key_findings: string[];
  abnormal_values: string[];
  possible_concerns: string[];
  recommendations: string[];

  documents_analyzed: number;
  data_points_extracted: number;
  confidence_score: number;

  generated_at?: string | null;
  updated_at?: string | null;
  patient_modified?: boolean;
}

export interface RegistrationDocument {
  name: string;
  file_type: string;
  extracted_text: string;
  processed_at?: string | null;
}

export interface InterviewAnswer {
  question_index: number;
  question: string;
  answer: string;
}

export interface PatientRegisterRequest {
  full_name: string;
  email: string;
  phone_number: string;
  password: string;

  dob: string;
  gender: string;

  alternate_phone: string;

  country: string;
  state: string;
  district: string;
  zip: string;

  address: string;
  emergency_contact: string;

  role: "patient";

  registration_ai?: RegistrationAI | null;
  interview_answers?: InterviewAnswer[];
  registration_documents?: RegistrationDocument[];
}

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  created_at: string;
  patient_uid?: string | null;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface OtpSendResponse {
  success: boolean;
  message: string;
  otp: string;
  email: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function register(data: RegisterRequest): Promise<User> {
  return apiRequest<User>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function registerPatient(
  data: PatientRegisterRequest
): Promise<User> {
  return apiRequest<User>("/api/auth/patient-register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Patient EmailJS OTP. OTP state remains client-side for the current lightweight implementation.
export async function sendOtp(
  email: string,
  name?: string
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) {
    throw new Error("Email address is required.");
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await sendOtpEmail(normalizedEmail, otp, name);

  sessionStorage.setItem("registration_otp", otp);
  sessionStorage.setItem("registration_email", normalizedEmail);
  sessionStorage.setItem(
    "registration_otp_expires",
    String(Date.now() + 10 * 60 * 1000)
  );
  sessionStorage.removeItem("registration_email_verified");

  return {
    success: true,
    message: "OTP sent successfully to your email.",
  };
}

export async function verifyOtp(
  email: string,
  otp: string
): Promise<boolean> {
  const savedOtp = sessionStorage.getItem("registration_otp");
  const savedEmail = sessionStorage.getItem("registration_email");
  const expiresAt = sessionStorage.getItem("registration_otp_expires");

  if (!savedOtp || !savedEmail || !expiresAt) {
    throw new Error("OTP has expired. Please request a new OTP.");
  }

  if (Date.now() > Number(expiresAt)) {
    clearRegistrationOtp();
    throw new Error("OTP has expired. Please request a new OTP.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (savedEmail !== normalizedEmail) {
    throw new Error("Email does not match.");
  }

  if (savedOtp !== otp.trim()) {
    throw new Error("Invalid OTP.");
  }

  // Keep registration_email so isRegistrationEmailVerified(email) can
  // validate both the verified flag and the email identity until the final
  // account-creation step clears registration state.
  sessionStorage.removeItem("registration_otp");
  sessionStorage.removeItem("registration_otp_expires");
  sessionStorage.setItem("registration_email_verified", "true");
  return true;
}

export function clearRegistrationOtp(): void {
  sessionStorage.removeItem("registration_otp");
  sessionStorage.removeItem("registration_email");
  sessionStorage.removeItem("registration_otp_expires");
}

export function clearRegistrationVerification(): void {
  clearRegistrationOtp();
  sessionStorage.removeItem("registration_email_verified");
}

export function isRegistrationEmailVerified(email: string): boolean {
  return (
    sessionStorage.getItem("registration_email_verified") === "true" &&
    sessionStorage.getItem("registration_email") ===
      email.trim().toLowerCase()
  );
}

// Legacy OTP API retained for Admin registration until that flow is migrated.
export async function sendLegacyOtp(
  userId: string
): Promise<OtpSendResponse> {
  return apiRequest<OtpSendResponse>("/api/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function verifyLegacyOtp(
  userId: string,
  otp: string
): Promise<User> {
  return apiRequest<User>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, otp }),
  });
}

// Backwards-compatible aliases for existing Admin flow.
export const sendOtpForPendingUser = sendLegacyOtp;
export const verifyOtpForPendingUser = verifyLegacyOtp;
