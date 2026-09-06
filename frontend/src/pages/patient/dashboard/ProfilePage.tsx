import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Pencil, X, Save, UserRound, ShieldCheck, Camera, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { PatientAvatar } from "../../../components/healthcare/PatientAvatar";
import { usePatientProfile } from "../../../context/PatientContext";
import { useToast } from "../../../context/ToastContext";
import type { PatientIdentity } from "../../../data/patientRecord";

type EditableIdentity = Pick<
  PatientIdentity,
  "name" | "dob" | "gender" | "mobile" | "email" | "address" | "emergencyContact" | "photoUrl"
>;

/**
 * My Profile — two-column field grid per the Phase 2B spec. "Edit Profile"
 * toggles the fields into an editable state; "Save Changes" writes back
 * through `updateIdentity`, so every other page reading `usePatientRecord()`
 * (header, Overview, Health ID) reflects the change immediately since it's
 * the same underlying record. Age is derived from Date of Birth and shown
 * read-only, matching the reference field list.
 */
export default function ProfilePage() {
  const { identity, updateIdentity } = usePatientProfile();
  const { showToast } = useToast();
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<EditableIdentity>({
    name: identity.name,
    dob: identity.dob,
    gender: identity.gender,
    mobile: identity.mobile,
    email: identity.email,
    address: identity.address,
    emergencyContact: identity.emergencyContact,
    photoUrl: identity.photoUrl,
  });

  const startEdit = () => {
    setDraft({
      name: identity.name,
      dob: identity.dob,
      gender: identity.gender,
      mobile: identity.mobile,
      email: identity.email,
      address: identity.address,
      emergencyContact: identity.emergencyContact,
      photoUrl: identity.photoUrl,
    });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  useEffect(() => {
    if (!editing) {
      setDraft({
        name: identity.name,
        dob: identity.dob,
        gender: identity.gender,
        mobile: identity.mobile,
        email: identity.email,
        address: identity.address,
        emergencyContact: identity.emergencyContact,
        photoUrl: identity.photoUrl,
      });
    }
  }, [identity, editing]);

  const saveEdit = async () => {
    try {
      await updateIdentity(draft);
      setEditing(false);
      showToast({ tone: "success", title: "Profile updated", description: "Your profile changes have been saved." });
    } catch (err) {
      showToast({
        tone: "error",
        title: "Profile update failed",
        description: err instanceof Error ? err.message : "Unable to save your profile.",
      });
    }
  };

  const setField = (key: keyof Omit<EditableIdentity, "photoUrl">) => (e: ChangeEvent<HTMLInputElement>) =>
    setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  // Same frontend-only preview pattern as registration's PersonalDetailsStep
  // — no backend upload call, just an object URL held in draft until Save.
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setDraft((prev) => ({ ...prev, photoUrl: URL.createObjectURL(file) }));
  };

  const handleRemovePhoto = () => setDraft((prev) => ({ ...prev, photoUrl: undefined }));

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">My Profile</h1>
          <p className="mt-1 text-sm text-mx-ink-muted">Your personal and contact details on file at MediKiosk.</p>
        </div>
        {!editing ? (
          <Button size="sm" icon={<Pencil size={14} aria-hidden="true" />} onClick={startEdit}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" icon={<X size={14} aria-hidden="true" />} onClick={cancelEdit}>
              Cancel
            </Button>
            <Button size="sm" icon={<Save size={14} aria-hidden="true" />} onClick={saveEdit}>
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <Card className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <PatientAvatar gender={identity.gender} imageUrl={(editing ? draft.photoUrl : identity.photoUrl) ?? undefined} size={56} />
        <div>
          <p className="font-display text-lg font-bold text-mx-ink">{identity.name}</p>
          <p className="text-sm text-mx-ink-muted">
            {identity.uid} · {identity.age} Years · {identity.gender}
          </p>
          {editing && (
            <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Button
                type="button"
                size="sm"
                variant="outline"
                icon={<Camera size={14} aria-hidden="true" />}
                onClick={() => photoInputRef.current?.click()}
              >
                Change Photo
              </Button>
              {draft.photoUrl && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  icon={<Trash2 size={14} aria-hidden="true" />}
                  onClick={handleRemovePhoto}
                >
                  Remove Photo
                </Button>
              )}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          )}
        </div>
        {identity.verified && (
          <Badge tone="green" icon={<ShieldCheck size={12} aria-hidden="true" />} className="sm:ml-auto">
            Verified
          </Badge>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserRound size={16} className="text-mx-ink-muted" aria-hidden="true" />
            <CardTitle>Personal Details</CardTitle>
          </div>
        </CardHeader>

        {!editing ? (
          <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            <ProfileField label="Full Name" value={identity.name} />
            <ProfileField label="Date of Birth" value={identity.dob} />
            <ProfileField label="Age" value={`${identity.age} Years`} />
            <ProfileField label="Gender" value={identity.gender} />
            <ProfileField label="Mobile Number" value={identity.mobile} />
            <ProfileField label="Email" value={identity.email} />
            <ProfileField label="Address" value={identity.address} className="sm:col-span-2" />
            <ProfileField label="Emergency Contact" value={identity.emergencyContact} className="sm:col-span-2" />
          </dl>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Full Name" value={draft.name} onChange={setField("name")} required />
            <Input label="Date of Birth" value={draft.dob} onChange={setField("dob")} required />
            <Input label="Age" value={`${identity.age} Years`} disabled hint="Calculated from Date of Birth" />
            <Input label="Gender" value={draft.gender} onChange={setField("gender")} required />
            <Input label="Mobile Number" value={draft.mobile} onChange={setField("mobile")} required />
            <Input label="Email" type="email" value={draft.email} disabled hint="Email is your verified account identifier and cannot be changed here." />
            <div className="sm:col-span-2">
              <Input label="Address" value={draft.address} onChange={setField("address")} required />
            </div>
            <div className="sm:col-span-2">
              <Input
                label="Emergency Contact"
                value={draft.emergencyContact}
                onChange={setField("emergencyContact")}
                hint="Name, relation, and phone number"
                required
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function ProfileField({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-mx-ink-muted">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-mx-ink">{value}</dd>
    </div>
  );
}