from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from ..database import get_database
from ..dependencies.auth import require_role
from ..models.medical_record import (
    MedicalRecordCreate,
    MedicalRecordResponse,
    MedicalRecordUpdate,
)


router = APIRouter(
    prefix="/api/medical-records",
    tags=["Medical Records"],
)


def _object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Invalid record id.",
        ) from exc


def _serialize(document: dict) -> dict:
    return {
        "id": str(document["_id"]),
        "patient_id": str(
            document["patient_id"]
        ),
        "doctor_id": (
            str(document["doctor_id"])
            if document.get("doctor_id")
            else None
        ),
        "record_type": document["record_type"],
        "title": document["title"],
        "summary": document["summary"],
        "findings": document.get(
            "findings",
            [],
        ),
        "diagnosis": document.get(
            "diagnosis",
            [],
        ),
        "vitals": document.get(
            "vitals",
            {},
        ),
        "prescription": document.get(
            "prescription",
            [],
        ),
        "record_date": document["record_date"],
        "created_at": document["created_at"],
        "updated_at": document["updated_at"],
    }


# ======================================================
# PATIENT — LIST OWN RECORDS
# ======================================================

@router.get(
    "",
    response_model=list[MedicalRecordResponse],
)
def list_medical_records(
    user=Depends(
        require_role("patient")
    ),
):
    db = get_database()

    records = db.medical_records.find(
        {
            "patient_id": user["_id"],
        }
    ).sort(
        [
            ("record_date", -1),
            ("created_at", -1),
        ]
    )

    return [
        _serialize(record)
        for record in records
    ]


# ======================================================
# PATIENT — GET ONE OWN RECORD
# ======================================================

@router.get(
    "/{record_id}",
    response_model=MedicalRecordResponse,
)
def get_medical_record(
    record_id: str,
    user=Depends(
        require_role("patient")
    ),
):
    db = get_database()

    record = db.medical_records.find_one(
        {
            "_id": _object_id(record_id),
            "patient_id": user["_id"],
        }
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Medical record not found.",
        )

    return _serialize(record)


# ======================================================
# DOCTOR — CREATE RECORD
# ======================================================

@router.post(
    "/doctor",
    response_model=MedicalRecordResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_medical_record(
    payload: MedicalRecordCreate,
    patient_id: str,
    user=Depends(
        require_role("doctor")
    ),
):
    db = get_database()

    patient_object_id = _object_id(
        patient_id
    )

    patient = db.users.find_one(
        {
            "_id": patient_object_id,
            "role": "patient",
        }
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found.",
        )

    now = datetime.now(
        timezone.utc
    )

    document = {
        "patient_id":
            patient_object_id,

        "doctor_id":
            user["_id"],

        "record_type":
            payload.record_type,

        "title":
            payload.title.strip(),

        "summary":
            payload.summary.strip(),

        "findings":
            payload.findings,

        "diagnosis":
            payload.diagnosis,

        "vitals":
            payload.vitals,

        "prescription":
            payload.prescription,

        "record_date":
            payload.record_date,

        "created_at":
            now,

        "updated_at":
            now,
    }

    result = db.medical_records.insert_one(
        document
    )

    document["_id"] = result.inserted_id

    return _serialize(document)


# ======================================================
# DOCTOR — VIEW PATIENT RECORDS
# ======================================================

@router.get(
    "/doctor/{patient_id}",
    response_model=list[MedicalRecordResponse],
)
def doctor_patient_records(
    patient_id: str,
    user=Depends(
        require_role("doctor")
    ),
):
    db = get_database()

    patient_object_id = _object_id(
        patient_id
    )

    records = db.medical_records.find(
        {
            "patient_id":
                patient_object_id,

            "doctor_id":
                user["_id"],
        }
    ).sort(
        [
            ("record_date", -1),
            ("created_at", -1),
        ]
    )

    return [
        _serialize(record)
        for record in records
    ]


# ======================================================
# DOCTOR — UPDATE RECORD
# ======================================================

@router.patch(
    "/doctor/{record_id}",
    response_model=MedicalRecordResponse,
)
def update_medical_record(
    record_id: str,
    payload: MedicalRecordUpdate,
    user=Depends(
        require_role("doctor")
    ),
):
    db = get_database()

    record = db.medical_records.find_one(
        {
            "_id": _object_id(record_id),
            "doctor_id": user["_id"],
        }
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Medical record not found.",
        )

    update = payload.model_dump(
        exclude_unset=True
    )

    if not update:
        raise HTTPException(
            status_code=400,
            detail="No changes provided.",
        )

    update["updated_at"] = (
        datetime.now(timezone.utc)
    )

    db.medical_records.update_one(
        {
            "_id": record["_id"],
        },
        {
            "$set": update,
        },
    )

    updated = db.medical_records.find_one(
        {
            "_id": record["_id"],
        }
    )

    return _serialize(updated)