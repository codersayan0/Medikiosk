/**
 * Mock "current organization" record for the logged-in admin's hospital,
 * shaped exactly like AdminOrganizationFormState (see
 * pages/admin/adminRegisterTypes.ts) so the same field set collected at
 * registration can be redisplayed/edited on the Organization Profile page
 * (see pages/admin/dashboard/AdminOrganizationProfilePage.tsx).
 *
 * TODO(real-backend): replace with a GET /admin/organization call. Until
 * then this seeds AdminContext's `organization` state, which mirrors itself
 * into localStorage the same way MOCK_DOCTOR_APPLICATIONS does.
 */
import type { AdminOrganizationFormState } from "../pages/admin/adminRegisterTypes";

export const MOCK_ORGANIZATION: AdminOrganizationFormState = {
  adminFullName: "Ravi Kumar",
  adminPhone: "98765 43210",
  adminPhoneCountryCode: "IN",
  password: "",
  confirmPassword: "",

  organizationName: "City Care Hospital",
  organizationType: "multi-specialty-hospital",
  organizationImageUrl: "",
  officialEmail: "admin@citycarehospital.in",
  officialPhone: "33 4022 5588",
  officialPhoneCountryCode: "IN",

  fullAddress: "142, Rashbehari Avenue, Near Deshapriya Park",
  city: "Kolkata",
  district: "South 24 Parganas",
  state: "West Bengal",
  zip: "700029",

  facilities: [
    "emergency-services",
    "24x7-emergency",
    "ambulance-service",
    "icu",
    "operation-theatre",
    "pharmacy",
    "laboratory",
    "radiology-imaging",
  ],

  consultationTypes: ["in-person", "online", "appointment-required", "walk-in"],
  appointmentContactNumber: "33 4022 5599",
  appointmentContactCountryCode: "IN",

  opdOpeningTime: "08:00",
  opdClosingTime: "20:00",
  emergencyService: "24x7",
  weeklyClosedDay: "none",

  accessibility: ["wheelchair-accessible", "lift-available", "parking-available", "accessible-washroom"],

  languages: ["english", "hindi", "bengali"],
  otherLanguage: "",

  specializations: [
    "general-medicine",
    "cardiology",
    "orthopedics",
    "pediatrics",
    "gynecology",
    "general-surgery",
    "radiology",
    "dermatology",
  ],
  otherSpecialization: "",
};
