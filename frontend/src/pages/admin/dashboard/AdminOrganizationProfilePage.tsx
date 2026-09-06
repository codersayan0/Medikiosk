import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Clock,
  User,
  CalendarClock,
  Accessibility,
  Languages,
  Stethoscope,
  Activity,
  ImagePlus,
  Pencil,
  X,
  Check,
  Siren,
  Truck,
  BedDouble,
  Baby,
  Scissors,
  Pill,
  FlaskConical,
  Droplet,
  ScanLine,
  Waves,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../../components/ui/Card";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import { Badge } from "../../../components/ui/Badge";
import { useAdmin } from "../../../context/AdminContext";
import { useToast } from "../../../context/ToastContext";
import { PHONE_COUNTRY_CODE_OPTIONS } from "../../../data/phoneCountryCodes";
import { STATE_OPTIONS_BY_COUNTRY } from "../../../data/addressOptions";
import { cn } from "../../../utils/cn";
import type { AdminOrganizationFormState } from "../adminRegisterTypes";
import {
  ORGANIZATION_TYPE_OPTIONS,
  EMERGENCY_SERVICE_OPTIONS,
  WEEKLY_CLOSED_DAY_OPTIONS,
  FACILITY_OPTIONS,
  CONSULTATION_TYPE_OPTIONS,
  ACCESSIBILITY_OPTIONS,
  LANGUAGE_CHIP_OPTIONS,
  SPECIALIZATION_OPTIONS,
  type ChipOption,
} from "../adminRegisterTypes";

const IN_STATE_OPTIONS = STATE_OPTIONS_BY_COUNTRY.IN ?? [];
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

const FACILITY_ICONS: Record<string, typeof Siren> = {
  "emergency-services": Siren,
  "24x7-emergency": Clock,
  "ambulance-service": Truck,
  icu: BedDouble,
  nicu: Baby,
  "operation-theatre": Scissors,
  pharmacy: Pill,
  laboratory: FlaskConical,
  "blood-bank": Droplet,
  "radiology-imaging": ScanLine,
  dialysis: Waves,
  "physiotherapy-facility": Activity,
};

type ArrayField = "facilities" | "consultationTypes" | "accessibility" | "languages" | "specializations";

function labelFor(options: ChipOption[], value: string): string {
  return options.find((opt) => opt.value === value)?.label ?? value;
}

/** Read-only "label above value" cell used throughout the view mode. */
function InfoField({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof User }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">
        {Icon && <Icon size={13} aria-hidden="true" />}
        {label}
      </span>
      <span className="text-sm font-medium text-mx-ink">{value || <span className="text-mx-ink-muted">—</span>}</span>
    </div>
  );
}

/** Chip list rendered as badges in view mode, or as toggleable checkboxes in edit mode. */
function ChipGroup({
  options,
  values,
  editing,
  onToggle,
  withIcons = false,
}: {
  options: ChipOption[];
  values: string[];
  editing: boolean;
  onToggle?: (value: string) => void;
  withIcons?: boolean;
}) {
  if (!editing) {
    const selected = options.filter((opt) => values.includes(opt.value));
    if (selected.length === 0) return <p className="text-sm text-mx-ink-muted">None selected</p>;
    return (
      <div className="flex flex-wrap gap-2">
        {selected.map((opt) => {
          const Icon = withIcons ? FACILITY_ICONS[opt.value] : undefined;
          return (
            <Badge key={opt.value} tone="green" icon={Icon ? <Icon size={12} aria-hidden="true" /> : undefined}>
              {opt.label}
            </Badge>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((opt) => {
        const isSelected = values.includes(opt.value);
        const Icon = withIcons ? FACILITY_ICONS[opt.value] : undefined;
        return (
          <button
            key={opt.value}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            onClick={() => onToggle?.(opt.value)}
            className={cn(
              "flex items-center gap-2 rounded-mx-sm border px-3 py-2 text-left text-xs font-medium transition-colors sm:text-sm",
              isSelected
                ? "border-mx-green bg-mx-green-soft text-mx-green-strong"
                : "border-mx-border-strong bg-mx-surface text-mx-ink hover:bg-mx-surface-sunken"
            )}
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border",
                isSelected ? "border-mx-green bg-mx-green text-mx-ink-inverse" : "border-mx-border-strong bg-mx-surface"
              )}
              aria-hidden="true"
            >
              {isSelected && <Check size={11} strokeWidth={3} />}
            </span>
            {Icon && <Icon size={15} className="shrink-0" aria-hidden="true" />}
            <span className="truncate">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function PhoneEditField({
  id,
  label,
  countryCode,
  onCountryCodeChange,
  value,
  onChange,
}: {
  id: string;
  label: string;
  countryCode: string;
  onCountryCodeChange: (value: string) => void;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-mx-ink">
        {label}
      </label>
      <div className="flex h-11 items-stretch overflow-hidden rounded-mx-sm border border-mx-border-strong bg-mx-surface focus-within:border-mx-blue">
        <div className="relative border-r border-mx-border-strong">
          <select
            aria-label={`${label} country code`}
            value={countryCode}
            onChange={(event) => onCountryCodeChange(event.target.value)}
            className="h-full w-[4.75rem] appearance-none bg-transparent pl-2.5 pr-5 text-sm text-mx-ink"
          >
            {PHONE_COUNTRY_CODE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.flag} {opt.label}
              </option>
            ))}
          </select>
        </div>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          placeholder="Enter phone number"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-full w-full bg-transparent px-3 text-sm text-mx-ink placeholder:text-mx-ink-muted focus:outline-none"
        />
      </div>
    </div>
  );
}

/**
 * Organization Profile — the hospital/admin's own profile, shown read-only
 * with an Edit toggle. Field set mirrors the Admin & Organization / Hospital
 * Details registration step 1-for-1 (see AdminOrganizationDetailsStep +
 * adminRegisterTypes.ts) so nothing collected at sign-up is unreachable
 * afterward. Backed by AdminContext's organization/updateOrganization
 * (frontend-only persistence, same pattern as doctor applications).
 */
export default function AdminOrganizationProfilePage() {
  const { organization, updateOrganization } = useAdmin();
  const { showToast } = useToast();
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<AdminOrganizationFormState>(organization);

  function updateField<K extends keyof AdminOrganizationFormState>(field: K, value: AdminOrganizationFormState[K]) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function toggleArrayValue(field: ArrayField, value: string) {
    setDraft((prev) => {
      const current = prev[field];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [field]: next };
    });
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      showToast({ tone: "error", title: "Image too large", description: "Please choose a file under 2MB." });
      return;
    }
    updateField("organizationImageUrl", URL.createObjectURL(file));
  }

  function startEditing() {
    setDraft(organization);
    setIsEditing(true);
  }

  function cancelEditing() {
    setDraft(organization);
    setIsEditing(false);
  }

  function saveChanges() {
    updateOrganization(draft);
    setIsEditing(false);
    showToast({
      tone: "success",
      title: "Organization profile updated",
      description: `${draft.organizationName || "Your organization"}'s details have been saved.`,
    });
  }

  const org = isEditing ? draft : organization;

  return (
    <div>
      <SectionHeader
        title="Organization Profile"
        description="Your hospital / organization's public details, facilities, and settings."
        action={
          isEditing ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" icon={<X size={15} aria-hidden="true" />} onClick={cancelEditing}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" icon={<Check size={15} aria-hidden="true" />} onClick={saveChanges}>
                Save Changes
              </Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" icon={<Pencil size={15} aria-hidden="true" />} onClick={startEditing}>
              Edit Profile
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-5">
        {/* Identity header card */}
        <Card>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {isEditing ? (
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-mx-md border-2 border-dashed border-mx-border-strong bg-mx-surface text-center transition-colors hover:border-mx-blue"
              >
                {draft.organizationImageUrl ? (
                  <img src={draft.organizationImageUrl} alt="Organization" className="h-full w-full rounded-mx-md object-cover" />
                ) : (
                  <>
                    <ImagePlus size={20} className="text-mx-ink-muted" aria-hidden="true" />
                    <span className="text-[10px] font-semibold text-mx-ink">Upload</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-mx-md bg-mx-green-soft">
                {organization.organizationImageUrl ? (
                  <img src={organization.organizationImageUrl} alt="Organization" className="h-full w-full object-cover" />
                ) : (
                  <Building2 size={30} className="text-mx-green-strong" aria-hidden="true" />
                )}
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />

            <div className="flex-1">
              {isEditing ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    label="Hospital / Organization Name"
                    type="text"
                    icon={<Building2 size={17} aria-hidden="true" />}
                    value={draft.organizationName}
                    onChange={(event) => updateField("organizationName", event.target.value)}
                  />
                  <Select
                    label="Organization Type"
                    placeholder="Select organization type"
                    options={ORGANIZATION_TYPE_OPTIONS}
                    value={draft.organizationType}
                    onChange={(event) => updateField("organizationType", event.target.value)}
                  />
                </div>
              ) : (
                <>
                  <h1 className="font-display text-xl font-bold text-mx-ink sm:text-2xl">{organization.organizationName}</h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Badge tone="green" icon={<ShieldCheck size={12} aria-hidden="true" />}>
                      Verified
                    </Badge>
                    <Badge tone="blue">{labelFor(ORGANIZATION_TYPE_OPTIONS, organization.organizationType)}</Badge>
                    <span className="flex items-center gap-1 text-xs text-mx-ink-muted">
                      <MapPin size={12} aria-hidden="true" />
                      {organization.city}, {organization.state}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Admin Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <User size={16} className="text-mx-green-strong" aria-hidden="true" />
                  Admin Information
                </span>
              </CardTitle>
            </CardHeader>
            {isEditing ? (
              <div className="flex flex-col gap-4">
                <Input
                  label="Admin Full Name"
                  type="text"
                  icon={<User size={17} aria-hidden="true" />}
                  value={draft.adminFullName}
                  onChange={(event) => updateField("adminFullName", event.target.value)}
                />
                <PhoneEditField
                  id="org-profile-admin-phone"
                  label="Admin Phone Number"
                  countryCode={draft.adminPhoneCountryCode}
                  onCountryCodeChange={(value) => updateField("adminPhoneCountryCode", value)}
                  value={draft.adminPhone}
                  onChange={(value) => updateField("adminPhone", value)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoField label="Admin Full Name" value={org.adminFullName} icon={User} />
                <InfoField label="Admin Phone Number" value={org.adminPhone ? `+91 ${org.adminPhone}` : ""} icon={Phone} />
              </div>
            )}
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Mail size={16} className="text-mx-green-strong" aria-hidden="true" />
                  Official Contact
                </span>
              </CardTitle>
            </CardHeader>
            {isEditing ? (
              <div className="flex flex-col gap-4">
                <Input
                  label="Official Email"
                  type="email"
                  icon={<Mail size={17} aria-hidden="true" />}
                  value={draft.officialEmail}
                  onChange={(event) => updateField("officialEmail", event.target.value)}
                />
                <PhoneEditField
                  id="org-profile-official-phone"
                  label="Official Phone"
                  countryCode={draft.officialPhoneCountryCode}
                  onCountryCodeChange={(value) => updateField("officialPhoneCountryCode", value)}
                  value={draft.officialPhone}
                  onChange={(value) => updateField("officialPhone", value)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoField label="Official Email" value={org.officialEmail} icon={Mail} />
                <InfoField label="Official Phone" value={org.officialPhone ? `+91 ${org.officialPhone}` : ""} icon={Phone} />
              </div>
            )}
          </Card>
        </div>

        {/* Location / Address */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <MapPin size={16} className="text-mx-green-strong" aria-hidden="true" />
                Location / Address
              </span>
            </CardTitle>
          </CardHeader>
          {isEditing ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Full Address"
                type="text"
                icon={<MapPin size={17} aria-hidden="true" />}
                value={draft.fullAddress}
                onChange={(event) => updateField("fullAddress", event.target.value)}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Input label="City" type="text" value={draft.city} onChange={(event) => updateField("city", event.target.value)} />
                <Input
                  label="District"
                  type="text"
                  value={draft.district}
                  onChange={(event) => updateField("district", event.target.value)}
                />
                <Select
                  label="State"
                  placeholder="Select state"
                  options={IN_STATE_OPTIONS}
                  value={draft.state}
                  onChange={(event) => updateField("state", event.target.value)}
                />
                <Input
                  label="PIN / ZIP Code"
                  type="text"
                  inputMode="numeric"
                  value={draft.zip}
                  onChange={(event) => updateField("zip", event.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2 lg:col-span-4">
                <InfoField label="Full Address" value={org.fullAddress} icon={MapPin} />
              </div>
              <InfoField label="City" value={org.city} />
              <InfoField label="District" value={org.district} />
              <InfoField label="State" value={org.state} />
              <InfoField label="PIN / ZIP Code" value={org.zip} />
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Facilities & Services */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Activity size={16} className="text-mx-green-strong" aria-hidden="true" />
                  Facilities & Services
                </span>
              </CardTitle>
            </CardHeader>
            <ChipGroup
              options={FACILITY_OPTIONS}
              values={isEditing ? draft.facilities : organization.facilities}
              editing={isEditing}
              onToggle={(value) => toggleArrayValue("facilities", value)}
              withIcons
            />
          </Card>

          {/* Consultation & Appointment */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <CalendarClock size={16} className="text-mx-green-strong" aria-hidden="true" />
                  Consultation & Appointment
                </span>
              </CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-3">
              <ChipGroup
                options={CONSULTATION_TYPE_OPTIONS}
                values={isEditing ? draft.consultationTypes : organization.consultationTypes}
                editing={isEditing}
                onToggle={(value) => toggleArrayValue("consultationTypes", value)}
              />
              {isEditing ? (
                <PhoneEditField
                  id="org-profile-appointment-phone"
                  label="Appointment Contact Number"
                  countryCode={draft.appointmentContactCountryCode}
                  onCountryCodeChange={(value) => updateField("appointmentContactCountryCode", value)}
                  value={draft.appointmentContactNumber}
                  onChange={(value) => updateField("appointmentContactNumber", value)}
                />
              ) : (
                <InfoField
                  label="Appointment Contact Number"
                  value={org.appointmentContactNumber ? `+91 ${org.appointmentContactNumber}` : ""}
                  icon={Phone}
                />
              )}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Hospital Timing */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Clock size={16} className="text-mx-green-strong" aria-hidden="true" />
                  Hospital Timing
                </span>
              </CardTitle>
            </CardHeader>
            {isEditing ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="OPD Opening Time"
                    type="time"
                    value={draft.opdOpeningTime}
                    onChange={(event) => updateField("opdOpeningTime", event.target.value)}
                  />
                  <Input
                    label="OPD Closing Time"
                    type="time"
                    value={draft.opdClosingTime}
                    onChange={(event) => updateField("opdClosingTime", event.target.value)}
                  />
                </div>
                <Select
                  label="Emergency Service"
                  placeholder="Select availability"
                  options={EMERGENCY_SERVICE_OPTIONS}
                  value={draft.emergencyService}
                  onChange={(event) => updateField("emergencyService", event.target.value)}
                />
                <Select
                  label="Weekly Closed Day"
                  placeholder="Select day"
                  options={WEEKLY_CLOSED_DAY_OPTIONS}
                  value={draft.weeklyClosedDay}
                  onChange={(event) => updateField("weeklyClosedDay", event.target.value)}
                />
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <InfoField label="OPD Hours" value={org.opdOpeningTime && org.opdClosingTime ? `${org.opdOpeningTime} – ${org.opdClosingTime}` : ""} icon={Clock} />
                <InfoField label="Emergency Service" value={labelFor(EMERGENCY_SERVICE_OPTIONS, org.emergencyService)} />
                <InfoField label="Weekly Closed Day" value={labelFor(WEEKLY_CLOSED_DAY_OPTIONS, org.weeklyClosedDay)} />
              </div>
            )}
          </Card>

          {/* Patient Accessibility */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Accessibility size={16} className="text-mx-green-strong" aria-hidden="true" />
                  Patient Accessibility
                </span>
              </CardTitle>
            </CardHeader>
            <ChipGroup
              options={ACCESSIBILITY_OPTIONS}
              values={isEditing ? draft.accessibility : organization.accessibility}
              editing={isEditing}
              onToggle={(value) => toggleArrayValue("accessibility", value)}
            />
          </Card>

          {/* Languages Supported */}
          <Card>
            <CardHeader>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <Languages size={16} className="text-mx-green-strong" aria-hidden="true" />
                  Languages Supported
                </span>
              </CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-3">
              <ChipGroup
                options={LANGUAGE_CHIP_OPTIONS}
                values={isEditing ? draft.languages : organization.languages}
                editing={isEditing}
                onToggle={(value) => toggleArrayValue("languages", value)}
              />
              {(isEditing ? draft.languages : organization.languages).includes("other") &&
                (isEditing ? (
                  <Input
                    label="Other Language"
                    type="text"
                    value={draft.otherLanguage}
                    onChange={(event) => updateField("otherLanguage", event.target.value)}
                  />
                ) : (
                  <InfoField label="Other Language" value={org.otherLanguage} />
                ))}
            </div>
          </Card>
        </div>

        {/* Specializations / Departments */}
        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Stethoscope size={16} className="text-mx-green-strong" aria-hidden="true" />
                Specializations / Departments
              </span>
            </CardTitle>
          </CardHeader>
          <div className="flex flex-col gap-3">
            <ChipGroup
              options={SPECIALIZATION_OPTIONS}
              values={isEditing ? draft.specializations : organization.specializations}
              editing={isEditing}
              onToggle={(value) => toggleArrayValue("specializations", value)}
            />
            {(isEditing ? draft.specializations : organization.specializations).includes("other") &&
              (isEditing ? (
                <div className="sm:max-w-xs">
                  <Input
                    label="Other Specialization"
                    type="text"
                    value={draft.otherSpecialization}
                    onChange={(event) => updateField("otherSpecialization", event.target.value)}
                  />
                </div>
              ) : (
                <InfoField label="Other Specialization" value={org.otherSpecialization} />
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
