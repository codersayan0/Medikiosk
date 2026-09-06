import type { ApplicationDocument, DoctorApplication, VerificationAuditEvent } from "../types";

/**
 * TODO(real-backend): frontend-only seed data for the Doctor Applications
 * feature. Shaped to match `DoctorApplication` exactly so swapping this for
 * a real `GET /admin/doctor-applications` response later is a drop-in
 * replacement — no UI changes required. See context/AdminContext.tsx for
 * how this seeds the live, mutable state.
 */

function docs(applicationId: string, overrides: Partial<Record<ApplicationDocument["type"], ApplicationDocument["verificationStatus"]>> = {}, notes: Partial<Record<ApplicationDocument["type"], string>> = {}): ApplicationDocument[] {
  const base: Array<Pick<ApplicationDocument, "type" | "name" | "fileType" | "fileSizeLabel">> = [
    { type: "medical_registration_certificate", name: "Medical Registration Certificate", fileType: "PDF", fileSizeLabel: "1.2 MB" },
    { type: "medical_degree_certificate", name: "Medical Degree Certificate", fileType: "PDF", fileSizeLabel: "2.4 MB" },
    { type: "identity_proof", name: "Identity Proof (Aadhaar)", fileType: "PDF", fileSizeLabel: "640 KB" },
    { type: "experience_certificate", name: "Experience Certificate", fileType: "PDF", fileSizeLabel: "980 KB" },
    { type: "profile_photo", name: "Profile Photo", fileType: "JPG", fileSizeLabel: "310 KB" },
  ];

  return base.map((d, i) => ({
    id: `${applicationId}-doc-${i + 1}`,
    ...d,
    uploadedAt: "18 Aug 2026",
    verificationStatus: overrides[d.type] ?? "pending",
    previewUrl: "#",
    note: notes[d.type],
  }));
}

function history(entries: Array<Omit<VerificationAuditEvent, "id">>): VerificationAuditEvent[] {
  return entries.map((e, i) => ({ id: `evt-${i}-${e.timestamp}`, ...e }));
}

export const MOCK_DOCTOR_APPLICATIONS: DoctorApplication[] = [
  {
    id: "APP-1042",
    applicationDate: "24 Aug 2026",
    status: "pending",
    personal: {
      fullName: "Dr. Rahul Das",
      dateOfBirth: "12 Mar 1988",
      gender: "Male",
      phone: "+91 98765 43210",
      email: "rahul.das@example.com",
      address: "14 Park Circus, Kolkata, West Bengal, 700017",
    },
    professional: {
      medicalDegree: "MBBS, MD (Cardiology)",
      institution: "Institute of Post Graduate Medical Education, Kolkata",
      specialization: "Cardiology",
      experienceYears: 9,
      registrationNumber: "WB-CARD-88452",
      registrationAuthority: "West Bengal Medical Council",
      registrationValidity: "Valid till 31 Dec 2028",
      currentPosition: "Senior Consultant, Cardiology",
    },
    organization: {
      organizationName: "City Care Hospital",
      department: "Cardiology",
      designation: "Senior Consultant",
      joiningInfo: "Requested joining: 01 Sep 2026",
    },
    documents: docs("APP-1042"),
    verification: {
      personalInfoVerified: false,
      identityVerified: false,
      degreeVerified: false,
      registrationVerified: false,
      experienceVerified: false,
      organizationVerified: false,
      notes: [],
    },
    auditHistory: history([
      { type: "application_submitted", label: "Application submitted", actor: "Dr. Rahul Das", timestamp: "24 Aug 2026, 09:02 AM" },
    ]),
  },
  {
    id: "APP-1041",
    applicationDate: "23 Aug 2026",
    status: "under_review",
    personal: {
      fullName: "Dr. Priya Mehta",
      dateOfBirth: "05 Jul 1991",
      gender: "Female",
      phone: "+91 91234 56780",
      email: "priya.mehta@example.com",
      address: "22 Salt Lake Sector V, Kolkata, West Bengal, 700091",
    },
    professional: {
      medicalDegree: "MBBS, MD (General Medicine)",
      institution: "R.G. Kar Medical College",
      specialization: "General Physician",
      experienceYears: 6,
      registrationNumber: "WB-GEN-77213",
      registrationAuthority: "West Bengal Medical Council",
      registrationValidity: "Valid till 30 Jun 2027",
      currentPosition: "General Physician",
    },
    organization: {
      organizationName: "City Care Hospital",
      department: "General Medicine",
      designation: "General Physician",
      joiningInfo: "Requested joining: 05 Sep 2026",
    },
    documents: docs("APP-1041", {
      medical_registration_certificate: "verified",
      identity_proof: "verified",
      profile_photo: "verified",
    }),
    verification: {
      personalInfoVerified: true,
      identityVerified: true,
      degreeVerified: false,
      registrationVerified: true,
      experienceVerified: false,
      organizationVerified: true,
      notes: [
        { id: "n1", author: "Admin (Ravi Kumar)", text: "Degree certificate under review with the university registrar.", timestamp: "24 Aug 2026, 10:12 AM" },
      ],
    },
    auditHistory: history([
      { type: "application_submitted", label: "Application submitted", actor: "Dr. Priya Mehta", timestamp: "23 Aug 2026, 11:20 AM" },
      { type: "document_verified", label: "Medical Registration Certificate verified", actor: "Admin (Ravi Kumar)", timestamp: "23 Aug 2026, 03:10 PM" },
      { type: "document_verified", label: "Identity Proof (Aadhaar) verified", actor: "Admin (Ravi Kumar)", timestamp: "23 Aug 2026, 03:12 PM" },
      { type: "checklist_item_verified", label: "Organization information verified", actor: "Admin (Ravi Kumar)", timestamp: "24 Aug 2026, 10:10 AM" },
    ]),
  },
  {
    id: "APP-1040",
    applicationDate: "22 Aug 2026",
    status: "under_review",
    personal: {
      fullName: "Dr. Amit Sharma",
      dateOfBirth: "19 Nov 1985",
      gender: "Male",
      phone: "+91 90000 11223",
      email: "amit.sharma@example.com",
      address: "8 Ballygunge Place, Kolkata, West Bengal, 700019",
    },
    professional: {
      medicalDegree: "MBBS, MS (Orthopedics)",
      institution: "NRS Medical College",
      specialization: "Orthopedics",
      experienceYears: 11,
      registrationNumber: "WB-ORTHO-65310",
      registrationAuthority: "West Bengal Medical Council",
      registrationValidity: "Valid till 15 Mar 2029",
      currentPosition: "Consultant Orthopedic Surgeon",
    },
    organization: {
      organizationName: "City Care Hospital",
      department: "Orthopedics",
      designation: "Consultant",
      joiningInfo: "Requested joining: 10 Sep 2026",
    },
    documents: docs("APP-1040", {
      medical_registration_certificate: "verified",
      medical_degree_certificate: "verified",
      identity_proof: "verified",
      experience_certificate: "verified",
      profile_photo: "verified",
    }),
    verification: {
      personalInfoVerified: true,
      identityVerified: true,
      degreeVerified: true,
      registrationVerified: true,
      experienceVerified: true,
      organizationVerified: false,
      notes: [],
    },
    auditHistory: history([
      { type: "application_submitted", label: "Application submitted", actor: "Dr. Amit Sharma", timestamp: "22 Aug 2026, 02:00 PM" },
      { type: "document_verified", label: "Medical Degree Certificate verified", actor: "Admin (Ravi Kumar)", timestamp: "22 Aug 2026, 05:40 PM" },
      { type: "document_verified", label: "Experience Certificate verified", actor: "Admin (Ravi Kumar)", timestamp: "22 Aug 2026, 05:42 PM" },
    ]),
  },
  {
    id: "APP-1039b",
    applicationDate: "23 Aug 2026",
    status: "verification_required",
    personal: {
      fullName: "Dr. Ananya Roy",
      dateOfBirth: "14 Jan 1993",
      gender: "Female",
      phone: "+91 90876 54321",
      email: "ananya.roy@example.com",
      address: "9 Southern Avenue, Kolkata, West Bengal, 700026",
    },
    professional: {
      medicalDegree: "MBBS, MD (Dermatology)",
      institution: "Medical College Kolkata",
      specialization: "Dermatology",
      experienceYears: 5,
      registrationNumber: "WB-DERM-41207",
      registrationAuthority: "West Bengal Medical Council",
      registrationValidity: "Valid till 10 Oct 2027",
      currentPosition: "Consultant Dermatologist",
    },
    organization: {
      organizationName: "City Care Hospital",
      department: "Dermatology",
      designation: "Consultant",
      joiningInfo: "Requested joining: 08 Sep 2026",
    },
    documents: docs(
      "APP-1039b",
      {
        medical_degree_certificate: "verified",
        identity_proof: "verified",
        profile_photo: "verified",
        medical_registration_certificate: "reupload_requested",
      },
      { medical_registration_certificate: "Registration certificate is unclear. Please upload a higher-quality copy." }
    ),
    verification: {
      personalInfoVerified: true,
      identityVerified: true,
      degreeVerified: true,
      registrationVerified: false,
      experienceVerified: true,
      organizationVerified: true,
      notes: [],
    },
    auditHistory: history([
      { type: "application_submitted", label: "Application submitted", actor: "Dr. Ananya Roy", timestamp: "23 Aug 2026, 09:15 AM" },
      { type: "document_verified", label: "Medical Degree Certificate verified", actor: "Admin (Ravi Kumar)", timestamp: "23 Aug 2026, 04:00 PM" },
      {
        type: "document_reupload_requested",
        label: "Re-upload requested — Medical Registration Certificate",
        actor: "Admin (Ravi Kumar)",
        timestamp: "24 Aug 2026, 09:30 AM",
        detail: "Registration certificate is unclear. Please upload a higher-quality copy.",
      },
    ]),
  },
  {
    id: "APP-1039",
    applicationDate: "20 Aug 2026",
    status: "verified",
    personal: {
      fullName: "Dr. Neha Gupta",
      dateOfBirth: "02 Feb 1990",
      gender: "Female",
      phone: "+91 98111 22334",
      email: "neha.gupta@example.com",
      address: "56 Gariahat Road, Kolkata, West Bengal, 700029",
    },
    professional: {
      medicalDegree: "MBBS, DGO (Gynecology)",
      institution: "Calcutta National Medical College",
      specialization: "Gynecology",
      experienceYears: 7,
      registrationNumber: "WB-GYN-55021",
      registrationAuthority: "West Bengal Medical Council",
      registrationValidity: "Valid till 20 Jan 2030",
      currentPosition: "Consultant Gynecologist",
    },
    organization: {
      organizationName: "City Care Hospital",
      department: "Gynecology",
      designation: "Consultant",
      joiningInfo: "Joined: 15 Aug 2026",
    },
    documents: docs("APP-1039", {
      medical_registration_certificate: "verified",
      medical_degree_certificate: "verified",
      identity_proof: "verified",
      experience_certificate: "verified",
      profile_photo: "verified",
    }),
    verification: {
      personalInfoVerified: true,
      identityVerified: true,
      degreeVerified: true,
      registrationVerified: true,
      experienceVerified: true,
      organizationVerified: true,
      notes: [{ id: "n1", author: "Admin (Ravi Kumar)", text: "All documents verified. Approved for onboarding.", timestamp: "21 Aug 2026, 04:40 PM" }],
    },
    auditHistory: history([
      { type: "application_submitted", label: "Application submitted", actor: "Dr. Neha Gupta", timestamp: "20 Aug 2026, 10:00 AM" },
      { type: "document_verified", label: "Medical Degree Certificate verified", actor: "Admin (Ravi Kumar)", timestamp: "21 Aug 2026, 02:15 PM" },
      { type: "document_verified", label: "Medical Registration Certificate verified", actor: "Admin (Ravi Kumar)", timestamp: "21 Aug 2026, 02:20 PM" },
      { type: "correction_requested", label: "Correction requested", actor: "Admin (Ravi Kumar)", timestamp: "21 Aug 2026, 02:30 PM", detail: "Document unclear" },
      { type: "application_approved", label: "Doctor application approved", actor: "Ravi Kumar (Administrator)", timestamp: "21 Aug 2026, 04:41 PM", detail: "Dr. Neha Gupta verified and added to City Care Hospital." },
    ]),
    verifiedBy: "Ravi Kumar (Administrator)",
    verifiedAt: "21 Aug 2026, 04:41 PM",
    doctorId: "DOC-1039",
  },
  {
    id: "APP-1038",
    applicationDate: "18 Aug 2026",
    status: "rejected",
    personal: {
      fullName: "Dr. Sanjay Verma",
      dateOfBirth: "27 Sep 1983",
      gender: "Male",
      phone: "+91 97654 32109",
      email: "sanjay.verma@example.com",
      address: "3 Elgin Road, Kolkata, West Bengal, 700020",
    },
    professional: {
      medicalDegree: "MBBS",
      institution: "Unverified institution",
      specialization: "General Physician",
      experienceYears: 3,
      registrationNumber: "WB-GEN-00998",
      registrationAuthority: "West Bengal Medical Council",
      registrationValidity: "Expired 30 Apr 2025",
      currentPosition: "General Physician",
    },
    organization: {
      organizationName: "City Care Hospital",
      department: "General Medicine",
      designation: "General Physician",
      joiningInfo: "Requested joining: 25 Aug 2026",
    },
    documents: docs("APP-1038", {
      identity_proof: "verified",
      profile_photo: "verified",
      medical_registration_certificate: "rejected",
    }),
    verification: {
      personalInfoVerified: true,
      identityVerified: true,
      degreeVerified: false,
      registrationVerified: false,
      experienceVerified: false,
      organizationVerified: false,
      notes: [{ id: "n1", author: "Admin (Ravi Kumar)", text: "Medical registration certificate has expired. Requested re-upload; no response after 7 days.", timestamp: "19 Aug 2026, 11:05 AM" }],
    },
    auditHistory: history([
      { type: "application_submitted", label: "Application submitted", actor: "Dr. Sanjay Verma", timestamp: "18 Aug 2026, 01:30 PM" },
      { type: "document_rejected", label: "Medical Registration Certificate rejected", actor: "Admin (Ravi Kumar)", timestamp: "19 Aug 2026, 11:00 AM", detail: "Registration certificate has expired." },
      { type: "application_rejected", label: "Application rejected", actor: "Admin (Ravi Kumar)", timestamp: "26 Aug 2026, 09:15 AM", detail: "Medical registration certificate has expired and was never renewed." },
    ]),
  },
];