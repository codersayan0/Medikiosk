from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pymongo.errors import DuplicateKeyError

from ..database import get_database
from ..dependencies.auth import require_role
from ..models.patient import (
    PatientProfileUpdate,
    PatientRecordResponse,
)
from ..utils.phone import normalize_phone


router = APIRouter(
    prefix="/api/patient",
    tags=["Patient"],
)


def _calculate_age(dob: str) -> int:
    if not dob:
        return 0

    formats = (
        "%d %b %Y",
        "%d %B %Y",
        "%Y-%m-%d",
    )

    for fmt in formats:
        try:
            birth = datetime.strptime(
                dob,
                fmt,
            ).date()

            today = datetime.now(
                timezone.utc
            ).date()

            return (
                today.year
                - birth.year
                - (
                    (today.month, today.day)
                    < (birth.month, birth.day)
                )
            )

        except ValueError:
            continue

    return 0


def _identity_from_documents(
    user: dict,
    profile: dict | None,
) -> dict:

    profile = profile or {}

    full_name = (
        user.get("full_name", "")
        .strip()
    )

    parts = full_name.split(" ", 1)

    first_name = (
        profile.get("first_name")
        or (parts[0] if parts else "")
    )

    last_name = (
        profile.get("last_name")
        or (parts[1] if len(parts) > 1 else "")
    )

    name = (
        f"{first_name} {last_name}"
        .strip()
    )

    dob = profile.get("dob", "")

    return {
        "name": name,
        "age": _calculate_age(dob),
        "gender": profile.get(
            "gender",
            "",
        ),
        "uid": (
            user.get("patient_uid")
            or f"MK-{str(user['_id'])[-8:].upper()}"
        ),
        "verified": bool(
            user.get("email_verified")
        ),
        "dob": dob,
        "mobile": user.get(
            "phone_number",
            "",
        ),
        "email": user.get(
            "email",
            "",
        ),
        "address": profile.get(
            "address",
            "",
        ),
        "emergencyContact": profile.get(
            "emergency_contact",
            "",
        ),
    }


def _empty_record(
    identity: dict,
) -> dict:

    now = datetime.now(
        timezone.utc
    ).isoformat()

    return {
        "identity": identity,

        "stats": {
            "healthRecords": 0,
            "recentVisits": 0,
            "prescriptions": 0,
            "pendingActions": 0,
        },

        "aiHealthSummary": [],

        "aiSummaryMeta": {
            "generatedOn": now,
            "lastUpdated": now,
            "patientModified": False,
        },

        "aiHealthSummaryFull": [],

        "recentLabReport": {
            "title": "",
            "date": "",
            "rows": [],
        },

        "visits": [],

        "latestPrescription": {
            "date": "",
            "doctorName": "",
            "medicines": [],
        },

        "notifications": [],
        "labReports": [],
        "prescriptions": [],
        "documents": [],
        "timeline": [],

        "medicalHistory": {
            "pastIllnesses": [],
            "chronicConditions": [],
            "surgeries": [],
            "hospitalizations": [],
            "currentConditions": [],
            "familyHistory": [],
            "lifestyle": [],
        },

        "medicines": {
            "active": [],
            "previous": [],
        },

        "allergies": {
            "medicine": [],
            "food": [],
            "other": [],
        },

        "ayush": {
            "assessmentDate": "",
            "dashavidha": [],
            "aharaVihara": "",
            "otherParams": [],
        },
    }


def _get_patient_record(
    db,
    user_id: str,
    user_object_id,
    identity: dict,
) -> dict:

    profile = db.patient_profiles.find_one(
        {
            "user_id": user_id,
        }
    )

    if profile and profile.get("record"):
        record = dict(
            profile["record"]
        )
    else:
        record = _empty_record(
            identity
        )
    if profile:
        registration_ai = profile.get("registration_ai") or {}

        if registration_ai:
            key_findings = [
                str(item)
                for item in (registration_ai.get("key_findings") or [])
                if str(item).strip()
            ]
            abnormal_values = [
                str(item)
                for item in (registration_ai.get("abnormal_values") or [])
                if str(item).strip()
            ]
            possible_concerns = [
                str(item)
                for item in (registration_ai.get("possible_concerns") or [])
                if str(item).strip()
            ]
            recommendations = [
                str(item)
                for item in (registration_ai.get("recommendations") or [])
                if str(item).strip()
            ]

            generated_at = registration_ai.get("generated_at")
            updated_at = (
                registration_ai.get("updated_at")
                or generated_at
            )

            record["aiSummaryMeta"] = {
                "generatedOn": _safe_datetime_value(generated_at),
                "lastUpdated": _safe_datetime_value(updated_at),
                "patientModified": bool(
                    registration_ai.get("patient_modified", False)
                ),
            }

            record["aiHealthSummaryFull"] = [
                {
                    "label": "Overall Summary",
                    "value": str(
                        registration_ai.get("summary") or ""
                    ),
                },
                {
                    "label": "Key Findings",
                    "value": ", ".join(key_findings),
                },
                {
                    "label": "Abnormal Values",
                    "value": ", ".join(abnormal_values),
                },
                {
                    "label": "Possible Concerns",
                    "value": ", ".join(possible_concerns),
                },
                {
                    "label": "Recommendations",
                    "value": ", ".join(recommendations),
                },
            ]

            record["aiHealthSummary"] = record["aiHealthSummaryFull"]

        registration_documents = profile.get("registration_documents") or []
        record["documents"] = [
            {
                "id": str(document.get("id") or index),
                "name": str(
                    document.get("name")
                    or document.get("file_name")
                    or "Medical Document"
                ),
                "fileType": str(
                    document.get("file_type")
                    or document.get("fileType")
                    or "Document"
                ),
                "extractedText": str(
                    document.get("extracted_text")
                    or document.get("extractedText")
                    or ""
                ),
                "processedAt": _safe_datetime_value(
                    document.get("processed_at")
                    or document.get("processedAt")
                ),
            }
            for index, document in enumerate(registration_documents, start=1)
            if isinstance(document, dict)
        ]

    record["identity"] = identity

    # --------------------------------------------------
    # APPOINTMENTS
    # --------------------------------------------------

    appointments = list(
        db.appointments.find(
            {
                "patient_id":
                    user_object_id,
            }
        ).sort(
            [
                (
                    "appointment_date",
                    1,
                ),
                (
                    "appointment_time",
                    1,
                ),
            ]
        )
    )

    visits = [
        _appointment_to_visit(
            appointment
        )
        for appointment in appointments
    ]

    # --------------------------------------------------
    # MEDICAL RECORDS
    # --------------------------------------------------

    medical_records = list(
        db.medical_records.find(
            {
                "patient_id":
                    user_object_id,
            }
        ).sort(
            [
                (
                    "record_date",
                    -1,
                ),
                (
                    "created_at",
                    -1,
                ),
            ]
        )
    )

    # --------------------------------------------------
    # LAB REPORTS
    # --------------------------------------------------

    lab_records = [
        record_item
        for record_item in medical_records
        if record_item.get(
            "record_type"
        ) == "lab_report"
    ]

    lab_reports = [
        _medical_record_to_lab_report(
            item
        )
        for item in lab_records
    ]

    # --------------------------------------------------
    # PRESCRIPTIONS
    # --------------------------------------------------

    prescription_records = [
        record_item
        for record_item in medical_records
        if record_item.get(
            "record_type"
        ) == "prescription"
    ]

    prescriptions = [
        _medical_record_to_prescription(
            item
        )
        for item in prescription_records
    ]

    # --------------------------------------------------
    # TIMELINE
    # --------------------------------------------------

    timeline = [
        _medical_record_to_timeline(
            item
        )
        for item in medical_records
    ]

    # Add appointments to timeline.
    for appointment in appointments:
        visits_item = _appointment_to_visit(
            appointment
        )

        timeline.append(
            {
                "id":
                    f"appointment-{visits_item['id']}",

                "date":
                    visits_item["date"],

                "time":
                    visits_item["time"],

                "title":
                    f"Appointment with {visits_item['doctorName']}",

                "description":
                    visits_item["reason"],

                "kind":
                    "visit",
            }
        )

    # Newest first.
    timeline.sort(
        key=lambda item: (
            item.get(
                "date",
                "",
            ),
            item.get(
                "time",
                "",
            ),
        ),
        reverse=True,
    )

    # --------------------------------------------------
    # RECENT LAB
    # --------------------------------------------------

    if lab_reports:
        latest_lab = lab_reports[0]

        record["recentLabReport"] = {
            "title":
                latest_lab["title"],

            "date":
                latest_lab["date"],

            "rows":
                latest_lab["rows"],
        }

    # --------------------------------------------------
    # LATEST PRESCRIPTION
    # --------------------------------------------------

    if prescriptions:
        latest_prescription = (
            prescriptions[0]
        )

        record["latestPrescription"] = {
            "date":
                latest_prescription[
                    "date"
                ],

            "doctorName":
                latest_prescription[
                    "doctorName"
                ],

            "medicines":
                latest_prescription[
                    "medicines"
                ],
        }

    # --------------------------------------------------
    # DASHBOARD DATA
    # --------------------------------------------------

    health_record_count = (
        len(medical_records)
    )

    completed_visit_count = sum(
        1
        for appointment in appointments
        if appointment.get(
            "status"
        ) == "completed"
    )

    pending_appointment_count = sum(
        1
        for appointment in appointments
        if appointment.get(
            "status"
        ) in {
            "pending",
            "confirmed",
        }
    )

    record["stats"] = {
        "healthRecords":
            health_record_count,

        "recentVisits":
            completed_visit_count,

        "prescriptions":
            len(prescriptions),

        "pendingActions":
            pending_appointment_count,
    }

    record["visits"] = visits
    record["labReports"] = lab_reports
    record["prescriptions"] = prescriptions
    record["timeline"] = timeline

    # --------------------------------------------------
    # SIMPLE NOTIFICATIONS
    # --------------------------------------------------

    notifications = []

    for lab in lab_reports[:3]:
        notifications.append(
            {
                "id":
                    f"lab-{lab['id']}",

                "title":
                    "New lab report",

                "description":
                    lab["title"],

                "timestamp":
                    lab["date"],

                "read":
                    False,

                "kind":
                    "lab",
            }
        )

    for prescription in prescriptions[:3]:
        notifications.append(
            {
                "id":
                    f"prescription-{prescription['id']}",

                "title":
                    "Prescription available",

                "description":
                    prescription[
                        "doctorName"
                    ],

                "timestamp":
                    prescription["date"],

                "read":
                    False,

                "kind":
                    "prescription",
            }
        )

    record["notifications"] = (
        notifications
    )

    return record


# ======================================================
# GET PATIENT PROFILE
# ======================================================

@router.get(
    "/profile",
    response_model=PatientRecordResponse,
)
def get_patient_profile(
    user=Depends(
        require_role("patient")
    ),
):

    db = get_database()

    user_id = str(
        user["_id"]
    )

    profile = db.patient_profiles.find_one(
        {
            "user_id": user_id,
        }
    )

    identity = _identity_from_documents(
        user,
        profile,
    )

    return _get_patient_record(
     db,
     user_id,
     user["_id"],
     identity,
   )


# ======================================================
# UPDATE PATIENT PROFILE
# ======================================================

@router.patch(
    "/profile",
    response_model=PatientRecordResponse,
)
def update_patient_profile(
    payload: PatientProfileUpdate,
    user=Depends(
        require_role("patient")
    ),
):

    db = get_database()

    user_id = str(
        user["_id"]
    )

    update = payload.model_dump(
        exclude_unset=True
    )

    # --------------------------------------------------
    # MOBILE
    # --------------------------------------------------

    if (
        "mobile" in update
        and update["mobile"]
    ):

        try:
            normalized_mobile = (
                normalize_phone(
                    update["mobile"]
                )
            )

        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid mobile number.",
            )

        existing = db.users.find_one(
            {
                "phone_number": normalized_mobile,
                "_id": {
                    "$ne": user["_id"]
                },
            }
        )

        if existing:
            raise HTTPException(
                status_code=409,
                detail="This mobile number is already registered.",
            )

        db.users.update_one(
            {
                "_id": user["_id"]
            },
            {
                "$set": {
                    "phone_number": normalized_mobile
                }
            }
        )

        user["phone_number"] = (
            normalized_mobile
        )

        update["mobile"] = (
            normalized_mobile
        )

    # --------------------------------------------------
    # NAME
    # --------------------------------------------------

    if "name" in update:

        name = (
            update["name"] or ""
        ).strip()

        if name:

            parts = name.split(
                " ",
                1,
            )

            first_name = parts[0]

            last_name = (
                parts[1]
                if len(parts) > 1
                else ""
            )

            update["first_name"] = (
                first_name
            )

            update["last_name"] = (
                last_name
            )

            db.users.update_one(
                {
                    "_id": user["_id"]
                },
                {
                    "$set": {
                        "full_name": name
                    }
                }
            )

            user["full_name"] = name

        update.pop(
            "name",
            None,
        )

    # --------------------------------------------------
    # MOBILE FIELD MAPPING
    # --------------------------------------------------

    if "mobile" in update:
        update["phone_number"] = (
            update.pop("mobile")
        )

    # --------------------------------------------------
    # TIMESTAMP
    # --------------------------------------------------

    update["updated_at"] = (
        datetime.now(
            timezone.utc
        )
    )

    # --------------------------------------------------
    # UPSERT PROFILE
    # --------------------------------------------------

    try:

        db.patient_profiles.update_one(
            {
                "user_id": user_id
            },
            {
                "$set": update,
                "$setOnInsert": {
                    "user_id": user_id,
                    "created_at": datetime.now(
                        timezone.utc
                    ),
                },
            },
            upsert=True,
        )

    except DuplicateKeyError:

        raise HTTPException(
            status_code=409,
            detail="Patient profile already exists.",
        )

    # --------------------------------------------------
    # RETURN FRESH RECORD
    # --------------------------------------------------

    refreshed_profile = (
        db.patient_profiles.find_one(
            {
                "user_id": user_id
            }
        )
    )

    identity = _identity_from_documents(
        user,
        refreshed_profile,
    )

    return _get_patient_record(
     db,
     user_id,
     user["_id"],
     identity,
)
def _safe_datetime_value(value) -> str:
    if not value:
        return ""

    if isinstance(value, datetime):
        return value.isoformat()

    return str(value)


def _format_record_date(value) -> str:
    if not value:
        return ""

    if isinstance(value, datetime):
        return value.strftime("%d %b %Y")

    text = str(value)

    try:
        parsed = datetime.fromisoformat(
            text.replace("Z", "+00:00")
        )
        return parsed.strftime("%d %b %Y")
    except ValueError:
        return text


def _appointment_to_visit(
    appointment: dict,
) -> dict:
    status_map = {
        "completed": "Completed",
        "confirmed": "Confirmed",
        "pending": "Pending",
    }

    return {
        "id": str(
            appointment.get("_id", "")
        ),

        "date": appointment.get(
            "appointment_date",
            "",
        ),

        "reason": appointment.get(
            "reason",
            "",
        ),

        "doctorName": appointment.get(
            "doctor_name",
            "",
        ),

        "department": appointment.get(
            "doctor_specialization",
            "",
        ),

        "time": appointment.get(
            "appointment_time",
            "",
        ),

        "status": status_map.get(
            appointment.get("status"),
            "Pending",
        ),

        "complaint": appointment.get(
            "reason",
            "",
        ),

        "diagnosis": "",

        "notes": appointment.get(
            "notes",
        ),
    }


def _medical_record_to_lab_report(
    record: dict,
) -> dict:
    rows = []

    for finding in record.get(
        "findings",
        [],
    ):
        if isinstance(finding, dict):
            rows.append(
                {
                    "test": finding.get(
                        "test",
                        finding.get(
                            "name",
                            "Result",
                        ),
                    ),
                    "result": str(
                        finding.get(
                            "result",
                            "",
                        )
                    ),
                    "referenceRange": str(
                        finding.get(
                            "referenceRange",
                            "",
                        )
                    ),
                    "status": finding.get(
                        "status",
                        "Normal",
                    ),
                }
            )
        else:
            rows.append(
                {
                    "test": "Finding",
                    "result": str(
                        finding
                    ),
                    "referenceRange": "",
                    "status": "Normal",
                }
            )

    return {
        "id": str(
            record.get("_id", "")
        ),

        "title": record.get(
            "title",
            "Lab Report",
        ),

        "date": _format_record_date(
            record.get(
                "record_date",
                "",
            )
        ),

        "labName": record.get(
            "lab_name",
            "",
        ),

        "orderedBy": record.get(
            "doctor_name",
            "",
        ),

        "category": "Other",

        "status": "Normal",

        "rows": rows,

        "notes": record.get(
            "summary",
            "",
        ),
    }


def _medical_record_to_prescription(
    record: dict,
) -> dict:
    medicines = []

    for medicine in record.get(
        "prescription",
        [],
    ):
        if not isinstance(
            medicine,
            dict,
        ):
            continue

        medicines.append(
            {
                "name": str(
                    medicine.get(
                        "name",
                        "",
                    )
                ),

                "dosage": str(
                    medicine.get(
                        "dosage",
                        "",
                    )
                ),

                "duration": str(
                    medicine.get(
                        "duration",
                        "",
                    )
                ),
            }
        )

    return {
        "id": str(
            record.get("_id", "")
        ),

        "date": _format_record_date(
            record.get(
                "record_date",
                "",
            )
        ),

        "doctorName": record.get(
            "doctor_name",
            "",
        ),

        "department": record.get(
            "doctor_specialization",
            "",
        ),

        "diagnosis": ", ".join(
            str(item)
            for item in record.get(
                "diagnosis",
                [],
            )
        ),

        "medicines": medicines,

        "notes": record.get(
            "summary",
            "",
        ),
    }


def _medical_record_to_timeline(
    record: dict,
) -> dict:
    record_type = record.get(
        "record_type",
        "other",
    )

    kind_map = {
        "lab_report": "lab",
        "prescription": "prescription",
        "diagnosis": "consultation",
        "visit": "visit",
        "vitals": "consultation",
        "other": "document",
    }

    return {
        "id": str(
            record.get("_id", "")
        ),

        "date": _format_record_date(
            record.get(
                "record_date",
                "",
            )
        ),

        "time": "",

        "title": record.get(
            "title",
            "Medical Record",
        ),

        "description": record.get(
            "summary",
            "",
        ),

        "kind": kind_map.get(
            record_type,
            "document",
        ),
    }