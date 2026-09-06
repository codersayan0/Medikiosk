import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "../components/layout/PublicLayout";
import { AuthLayout } from "../components/layout/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";

import HomePage from "../pages/public/HomePage";
import HowItWorksPage from "../pages/public/HowItWorksPage";
import FeaturesPage from "../pages/public/FeaturesPage";
import RoleSelectPage from "../pages/public/RoleSelectPage";

import PatientLoginPage from "../pages/patient/PatientLoginPage";
import PatientRegisterPage from "../pages/patient/PatientRegisterPage";
import OnboardingSuccessPage from "../pages/patient/OnboardingSuccessPage";
import { PatientDashboardShell } from "../components/patient/PatientDashboardShell";
import OverviewPage from "../pages/patient/dashboard/OverviewPage";
import AiHealthAssistantPage from "../pages/patient/dashboard/AiHealthAssistantPage";
import HealthIdPage from "../pages/patient/dashboard/HealthIdPage";
import MedicalRecordsHubPage from "../pages/patient/dashboard/records/MedicalRecordsHubPage";
import LabReportsPage from "../pages/patient/dashboard/records/LabReportsPage";
import PrescriptionsPage from "../pages/patient/dashboard/records/PrescriptionsPage";
import DocumentsPage from "../pages/patient/dashboard/records/DocumentsPage";
import MedicalTimelinePage from "../pages/patient/dashboard/MedicalTimelinePage";
import VisitsPage from "../pages/patient/dashboard/VisitsPage";
import VisitDetailPage from "../pages/patient/dashboard/VisitDetailPage";
import MyHealthPage from "../pages/patient/dashboard/MyHealthPage";
import AyushHealthPage from "../pages/patient/dashboard/AyushHealthPage";
import AiHealthSummaryPage from "../pages/patient/dashboard/records/AiHealthSummaryPage";
import MedicalHistoryPage from "../pages/patient/dashboard/records/MedicalHistoryPage";
import MedicinesPage from "../pages/patient/dashboard/records/MedicinesPage";
import AllergiesPage from "../pages/patient/dashboard/records/AllergiesPage";
import ProfilePage from "../pages/patient/dashboard/ProfilePage";
import NotificationsPage from "../pages/patient/dashboard/NotificationsPage";
import SettingsPage from "../pages/patient/dashboard/SettingsPage";
import PrivacySecurityPage from "../pages/patient/dashboard/PrivacySecurityPage";

import DoctorLoginPage from "../pages/doctor/DoctorLoginPage";
import DoctorRegisterPage from "../pages/doctor/DoctorRegisterPage";
import { DoctorDashboardShell } from "../components/doctor/DoctorDashboardShell";
import DoctorOverviewPage from "../pages/doctor/dashboard/DoctorOverviewPage";
import PatientQueuePage from "../pages/doctor/dashboard/PatientQueuePage";
import DoctorAppointmentsPage from "../pages/doctor/dashboard/AppointmentsPage";
import TriageAlertsPage from "../pages/doctor/dashboard/TriageAlertsPage";
import PatientDetailsBasicProfilePage from "../pages/doctor/dashboard/PatientDetailsBasicProfilePage";
import ReviewSummaryPage from "../pages/doctor/dashboard/ReviewSummaryPage";
import PreviousVisitsPage from "../pages/doctor/dashboard/PreviousVisitsPage";
import DoctorSettingsPage from "../pages/doctor/dashboard/DoctorSettingsPage";
import { DoctorComingSoonPage } from "../components/doctor/DoctorComingSoonPage";

import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminRegisterPage from "../pages/admin/AdminRegisterPage";
import { AdminDashboardShell } from "../components/admin/AdminDashboardShell";
import AdminOverviewPage from "../pages/admin/dashboard/AdminOverviewPage";
import DoctorApplicationsPage from "../pages/admin/dashboard/DoctorApplicationsPage";
import DoctorApplicationDetailPage from "../pages/admin/dashboard/DoctorApplicationDetailPage";
import DoctorsPage from "../pages/admin/dashboard/DoctorsPage";
import PatientsPage from "../pages/admin/dashboard/PatientsPage";
import AppointmentsPage from "../pages/admin/dashboard/AppointmentsPage";
import MedicalRecordsPage from "../pages/admin/dashboard/MedicalRecordsPage";
import AdminOrganizationProfilePage from "../pages/admin/dashboard/AdminOrganizationProfilePage";
import ReportsPage from "../pages/admin/dashboard/ReportsPage";
import AdminNotificationsPage from "../pages/admin/dashboard/AdminNotificationsPage";
import AdminSettingsPage from "../pages/admin/dashboard/AdminSettingsPage";
import AdminPrivacySecurityPage from "../pages/admin/dashboard/AdminPrivacySecurityPage";

import NotFoundPage from "../pages/public/NotFoundPage";
import PrivacyPolicyPage from "../pages/legal/PrivacyPolicyPage";
import ConsentTermsPage from "../pages/legal/ConsentTermsPage";

/**
 * Route foundation for MediKiosk. Public marketing routes get the Navbar/Footer
 * shell; patient/doctor/admin dashboard routes render their own
 * DashboardLayout (sidebar) internally, so they are NOT wrapped in
 * PublicLayout here.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout><HomePage /></PublicLayout>} path="/" />
      <Route element={<PublicLayout><HowItWorksPage /></PublicLayout>} path="/how-it-works" />
      <Route element={<PublicLayout><FeaturesPage /></PublicLayout>} path="/features" />

      {/* Role Selection gateway shown when the Navbar's Login button is clicked.
          It's a dedicated, minimal authentication gateway — no marketing
          Navbar/Footer — that routes to each role's existing login page. */}
      <Route element={<RoleSelectPage />} path="/login" />

      {/* "Get Started" gateway — shown from every "Get Started" button across
          the marketing site (Navbar, Home hero/final CTA, Features hero/final
          CTA). Same dedicated screen as /login, but routes to each role's
          registration page and navigates in the same tab. */}
      <Route element={<RoleSelectPage />} path="/get-started" />

      <Route element={<AuthLayout><PatientLoginPage /></AuthLayout>} path="/patient/login" />
      <Route element={<AuthLayout><PatientRegisterPage /></AuthLayout>} path="/patient/register" />

      {/* Standalone Privacy Policy — opened in a new tab from Patient
          Registration. No Navbar/Footer, no auth forms, no dashboard
          chrome: it renders fully on its own (see PrivacyPolicyPage). */}
      <Route element={<PrivacyPolicyPage />} path="/privacy-policy" />

      {/* Standalone Consent Terms — companion to the Privacy Policy,
          opened in a new tab from Patient Registration. Same
          no-chrome, self-contained pattern (see ConsentTermsPage). */}
      <Route element={<ConsentTermsPage />} path="/consent-terms" />
      <Route element={<PublicLayout><OnboardingSuccessPage /></PublicLayout>} path="/patient/onboarding-success" />

      {/* Patient Dashboard — nested under one persistent shell (sidebar +
          header + shared patient state, see PatientDashboardShell). Phase 1A
          built Overview and QR / Patient ID; Phase 1B added the Medical
          Records hub, Lab Reports, Prescriptions, Documents, Medical
          Timeline, My Visits, and Previous Visit Details; Phase 2A added
          My Health, AI Health Summary, Medical History, Medicines,
          Allergies, and AYUSH Health. Phase 2B closes out the app with
          My Profile, Notifications, Settings, and Privacy & Security — no
          "Coming soon" placeholders remain anywhere in this tree (see
          PATIENT_DASHBOARD_NAV in data/patientDashboardNav.ts, which this
          route tree mirrors). */}
      <Route
        element={
          <ProtectedRoute role="patient">
            <PatientDashboardShell />
          </ProtectedRoute>
        }
        path="/patient/dashboard"
      >
        <Route index element={<OverviewPage />} />
        <Route path="ai-assistant" element={<AiHealthAssistantPage />} />
        <Route path="my-health" element={<MyHealthPage />} />
        <Route path="records" element={<MedicalRecordsHubPage />} />
        <Route path="records/ai-summary" element={<AiHealthSummaryPage />} />
        <Route path="records/history" element={<MedicalHistoryPage />} />
        <Route path="records/medicines" element={<MedicinesPage />} />
        <Route path="records/allergies" element={<AllergiesPage />} />
        <Route path="records/lab-reports" element={<LabReportsPage />} />
        <Route path="records/prescriptions" element={<PrescriptionsPage />} />
        <Route path="records/documents" element={<DocumentsPage />} />
        <Route path="timeline" element={<MedicalTimelinePage />} />
        <Route path="ayush" element={<AyushHealthPage />} />
        <Route path="visits" element={<VisitsPage />} />
        <Route path="visits/:visitId" element={<VisitDetailPage />} />
        <Route path="health-id" element={<HealthIdPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="privacy" element={<PrivacySecurityPage />} />
      </Route>

      <Route element={<AuthLayout><DoctorLoginPage /></AuthLayout>} path="/doctor/login" />
      <Route element={<AuthLayout><DoctorRegisterPage /></AuthLayout>} path="/doctor/register" />

      {/* Doctor Dashboard — nested under one persistent shell (sidebar +
          header, see DoctorDashboardShell), same pattern as
          PatientDashboardShell / AdminDashboardShell above. Overview,
          Patient Queue (Normal/Priority/Emergency), Appointments (a
          dedicated top-level sidebar item, not nested inside Overview),
          Triage Alerts, Patient Details → Basic Profile, Review Summary,
          Previous Visits, and Settings are all built. The remaining
          Patient Details sub-sections (AI Clinical Summary, AYUSH History,
          Documents, Medical Timeline, Safety Flags, Full Interview
          Answers) route to the shared DoctorComingSoonPage until a
          single-patient record model exists — every item in
          DOCTOR_DASHBOARD_NAV still routes to a real page from day one
          (see isBuilt in data/doctorDashboardNav.ts, which this route
          tree mirrors). */}
      <Route
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboardShell />
          </ProtectedRoute>
        }
        path="/doctor/dashboard"
      >
        <Route index element={<DoctorOverviewPage />} />

        <Route path="queue/:tab" element={<PatientQueuePage />} />

        <Route path="appointments" element={<DoctorAppointmentsPage />} />

        <Route path="triage-alerts" element={<TriageAlertsPage />} />

        <Route path="patient-details/basic-profile" element={<PatientDetailsBasicProfilePage />} />
        <Route path="patient-details/ai-summary" element={<DoctorComingSoonPage title="AI Clinical Summary" />} />
        <Route path="patient-details/ayush-history" element={<DoctorComingSoonPage title="AYUSH History" />} />
        <Route path="patient-details/documents" element={<DoctorComingSoonPage title="Documents" />} />
        <Route path="patient-details/timeline" element={<DoctorComingSoonPage title="Medical Timeline" />} />
        <Route path="patient-details/safety-flags" element={<DoctorComingSoonPage title="Safety Flags" />} />
        <Route path="patient-details/interview-answers" element={<DoctorComingSoonPage title="Full Interview Answers" />} />

        <Route path="review-summary" element={<ReviewSummaryPage />} />
        <Route path="previous-visits" element={<PreviousVisitsPage />} />
        <Route path="settings" element={<DoctorSettingsPage />} />
      </Route>

      <Route element={<AuthLayout><AdminLoginPage /></AuthLayout>} path="/admin/login" />
      <Route element={<AuthLayout><AdminRegisterPage /></AuthLayout>} path="/admin/register" />

      {/* Admin Dashboard — nested under one persistent shell (sidebar +
          header, see AdminDashboardShell), same pattern as
          PatientDashboardShell above. Overview, Doctor Applications
          (list + detail/verification), Doctors, Patients, Appointments,
          Medical Records, Organization Profile, Reports & Analytics,
          Notifications, Settings, and Privacy & Security are all built —
          every item in ADMIN_DASHBOARD_NAV routes to a real page, no
          "Coming soon" placeholders remain anywhere in this tree (see
          isBuilt in data/adminDashboardNav.ts, which this route tree
          mirrors). */}
      <Route
        element={
          <ProtectedRoute role="admin">
            <AdminDashboardShell />
          </ProtectedRoute>
        }
        path="/admin/dashboard"
      >
        <Route index element={<AdminOverviewPage />} />
        <Route path="doctor-applications" element={<DoctorApplicationsPage />} />
        <Route path="doctor-applications/:applicationId" element={<DoctorApplicationDetailPage />} />
        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="doctors/:applicationId" element={<DoctorsPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="medical-records" element={<MedicalRecordsPage />} />
        <Route path="organization" element={<AdminOrganizationProfilePage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<AdminNotificationsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="privacy" element={<AdminPrivacySecurityPage />} />
      </Route>

      <Route element={<PublicLayout><NotFoundPage /></PublicLayout>} path="*" />
    </Routes>
  );
}