import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Cake,
  User,
  GraduationCap,
  Building2,
  BadgeCheck,
  CalendarClock,
  Briefcase,
  Landmark,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { EmptyState } from "../../../components/ui/EmptyState";
import { ApplicationStatusBadge } from "../../../components/admin/ApplicationStatusBadge";
import { DocumentVerificationCard } from "../../../components/admin/DocumentVerificationCard";
import { VerificationChecklist } from "../../../components/admin/VerificationChecklist";
import { VerificationAuditHistory } from "../../../components/admin/VerificationAuditHistory";
import { ApproveDoctorModal } from "../../../components/admin/ApproveDoctorModal";
import { useAdmin } from "../../../context/AdminContext";
import { useToast } from "../../../context/ToastContext";
import { ADMIN_DASHBOARD_ROOT } from "../../../data/adminDashboardNav";
import { isReadyForApproval } from "../../../utils/doctorApplications";

/** A label + value pair used across the Personal / Professional / Organization info blocks. */
function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-mx-sm bg-mx-surface-sunken text-mx-ink-muted">
        <Icon size={15} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-mx-ink-muted">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-mx-ink">{value}</p>
      </div>
    </div>
  );
}

/**
 * Full doctor Application Detail page. Sections, in order: A. Personal
 * Information, B. Professional Information, C. Hospital/Organization
 * Information, D. Uploaded Documents (each with in-app preview + per-doc
 * verify/reject), then the Verification & Approval area (checklist +
 * final actions). This is the page opened from "View Application" on the
 * Doctor Applications list.
 */
export default function DoctorApplicationDetailPage() {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const { getApplication, setDocumentStatus, requestDocumentReupload, toggleChecklistItem, approveApplication, requestCorrection, rejectApplication } = useAdmin();
  const { showToast } = useToast();

  const application = applicationId ? getApplication(applicationId) : undefined;

  if (!application) {
    return (
      <div>
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} aria-hidden="true" />} onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/doctor-applications`)}>
          Back to Doctor Applications
        </Button>
        <Card className="mt-4">
          <EmptyState title="Application not found" description="This application may have been removed or the link is incorrect." />
        </Card>
      </div>
    );
  }

  const ready = isReadyForApproval(application);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={14} aria-hidden="true" />} onClick={() => navigate(`${ADMIN_DASHBOARD_ROOT}/doctor-applications`)} className="mb-2 -ml-2">
            Back to Doctor Applications
          </Button>
          <div className="flex items-center gap-3">
            <Avatar name={application.personal.fullName} size={48} />
            <div>
              <h1 className="font-display text-xl font-bold text-mx-ink">{application.personal.fullName}</h1>
              <p className="text-sm text-mx-ink-muted">{application.professional.specialization} · Applied {application.applicationDate}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <ApplicationStatusBadge status={application.status} />
          {application.status === "verified" && application.verifiedBy && (
            <p className="text-xs text-mx-ink-muted">Verified by {application.verifiedBy} · {application.verifiedAt}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* A. Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow icon={Cake} label="Date of birth" value={application.personal.dateOfBirth} />
              <InfoRow icon={User} label="Gender" value={application.personal.gender} />
              <InfoRow icon={Phone} label="Phone" value={application.personal.phone} />
              <InfoRow icon={Mail} label="Email" value={application.personal.email} />
              <InfoRow icon={MapPin} label="Address" value={application.personal.address} />
            </div>
          </Card>

          {/* B. Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Professional information</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow icon={GraduationCap} label="Medical degree" value={application.professional.medicalDegree} />
              <InfoRow icon={Landmark} label="University / Institution" value={application.professional.institution} />
              <InfoRow icon={Briefcase} label="Specialization" value={application.professional.specialization} />
              <InfoRow icon={CalendarClock} label="Experience" value={`${application.professional.experienceYears} years`} />
              <InfoRow icon={BadgeCheck} label="Registration number" value={application.professional.registrationNumber} />
              <InfoRow icon={Landmark} label="Registration authority" value={application.professional.registrationAuthority} />
              <InfoRow icon={CalendarClock} label="Registration validity" value={application.professional.registrationValidity} />
              <InfoRow icon={Briefcase} label="Current position" value={application.professional.currentPosition} />
            </div>
          </Card>

          {/* C. Hospital / Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle>Hospital / organization information</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow icon={Building2} label="Hospital / organization" value={application.organization.organizationName} />
              <InfoRow icon={Briefcase} label="Department" value={application.organization.department} />
              <InfoRow icon={BadgeCheck} label="Designation" value={application.organization.designation} />
              <InfoRow icon={CalendarClock} label="Joining information" value={application.organization.joiningInfo} />
            </div>
          </Card>

          {/* D. Uploaded Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Uploaded documents</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {application.documents.map((doc) => (
                <DocumentVerificationCard
                  key={doc.id}
                  document={doc}
                  onSetStatus={(status, note) => {
                    setDocumentStatus(application.id, doc.id, status, note);
                    if (status === "verified") {
                      showToast({ tone: "success", title: "Document verified", description: doc.name });
                    }
                  }}
                  onRequestReupload={(reason) => requestDocumentReupload(application.id, doc.id, reason)}
                />
              ))}
            </div>
          </Card>

          {application.verification.notes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Verification notes</CardTitle>
              </CardHeader>
              <ul className="flex flex-col gap-3">
                {application.verification.notes.map((note) => (
                  <li key={note.id} className="rounded-mx-sm bg-mx-surface-sunken px-3.5 py-3">
                    <p className="text-sm text-mx-ink">{note.text}</p>
                    <p className="mt-1 text-xs text-mx-ink-muted">{note.author} · {note.timestamp}</p>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <VerificationAuditHistory events={application.auditHistory} />
        </div>

        {/* Verification & Approval sidebar */}
        <div className="flex flex-col gap-4">
          <VerificationChecklist
            application={application}
            onToggle={(key, value) => toggleChecklistItem(application.id, key, value)}
          />
          <ApproveDoctorModal
            application={application}
            ready={ready}
            onApprove={() => {
              approveApplication(application.id);
              showToast({
                tone: "success",
                title: "Doctor verified",
                description: `${application.personal.fullName} can now access the MediKiosk doctor portal.`,
              });
            }}
            onRequestCorrection={(reason) => {
              requestCorrection(application.id, reason);
              showToast({ tone: "info", title: "Correction requested", description: reason });
            }}
            onReject={(reason) => {
              rejectApplication(application.id, reason);
              showToast({ tone: "warning", title: "Application rejected", description: reason });
            }}
          />
        </div>
      </div>
    </div>
  );
}