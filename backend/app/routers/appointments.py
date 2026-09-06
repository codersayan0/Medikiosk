from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from ..database import get_database
from ..dependencies.auth import require_role
from ..models.appointment import (
    AppointmentCreate,
    AppointmentResponse,
    AppointmentUpdate,
)


router = APIRouter(
    prefix="/api/appointments",
    tags=["Appointments"],
)


# =========================================================
# HELPERS
# =========================================================

def _object_id(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail="Invalid appointment or user id.",
        ) from exc


def _serialize_appointment(
    document: dict,
) -> dict:

    return {
        "id": str(document["_id"]),

        "patient_id": str(
            document["patient_id"]
        ),

        "doctor_id": str(
            document["doctor_id"]
        ),

        "patient_name":
            document.get("patient_name", ""),

        "patient_uid":
            document.get("patient_uid"),

        "doctor_name":
            document.get("doctor_name", ""),

        "doctor_specialization":
            document.get(
                "doctor_specialization"
            ),

        "appointment_date":
            document["appointment_date"],

        "appointment_time":
            document["appointment_time"],

        "consultation_type":
            document["consultation_type"],

        "status":
            document["status"],

        "reason":
            document.get("reason", ""),

        "notes":
            document.get("notes"),

        "created_at":
            document["created_at"],

        "updated_at":
            document["updated_at"],
    }


# =========================================================
# PATIENT — CREATE
# =========================================================

@router.post(
    "",
    response_model=AppointmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_appointment(
    payload: AppointmentCreate,
    user=Depends(
        require_role("patient")
    ),
):

    db = get_database()

    patient_id = user["_id"]

    doctor_id = _object_id(
        payload.doctor_id
    )

    doctor = db.users.find_one(
        {
            "_id": doctor_id,
            "role": "doctor",
        }
    )

    if not doctor:

        raise HTTPException(
            status_code=404,
            detail="Doctor not found.",
        )

    # -----------------------------------------------------
    # PREVENT DOUBLE BOOKING
    # -----------------------------------------------------

    conflict = db.appointments.find_one(
        {
            "doctor_id": doctor_id,
            "appointment_date":
                payload.appointment_date,
            "appointment_time":
                payload.appointment_time,
            "status": {
                "$in": [
                    "pending",
                    "confirmed",
                ]
            },
        }
    )

    if conflict:

        raise HTTPException(
            status_code=409,
            detail=(
                "This appointment slot "
                "is already booked."
            ),
        )

    now = datetime.now(
        timezone.utc
    )

    patient_uid = user.get(
        "patient_uid"
    )

    document = {
        "patient_id":
            patient_id,

        "doctor_id":
            doctor_id,

        "patient_name":
            user.get(
                "full_name",
                "",
            ),

        "patient_uid":
            patient_uid,

        "doctor_name":
            doctor.get(
                "full_name",
                "",
            ),

        "doctor_specialization":
            doctor.get(
                "specialization"
            ),

        "appointment_date":
            payload.appointment_date,

        "appointment_time":
            payload.appointment_time,

        "consultation_type":
            payload.consultation_type,

        "status":
            "pending",

        "reason":
            payload.reason.strip(),

        "notes":
            None,

        "created_at":
            now,

        "updated_at":
            now,
    }

    result = db.appointments.insert_one(
        document
    )

    document["_id"] = result.inserted_id

    return _serialize_appointment(
        document
    )


# =========================================================
# LIST APPOINTMENTS
# =========================================================

@router.get(
    "",
    response_model=list[AppointmentResponse],
)
def list_appointments(
    user=Depends(
        require_role("patient")
    ),
):

    db = get_database()

    appointments = db.appointments.find(
        {
            "patient_id":
                user["_id"]
        }
    ).sort(
        [
            ("appointment_date", 1),
            ("appointment_time", 1),
        ]
    )

    return [
        _serialize_appointment(
            document
        )
        for document in appointments
    ]


# =========================================================
# GET ONE APPOINTMENT
# =========================================================

@router.get(
    "/{appointment_id}",
    response_model=AppointmentResponse,
)
def get_appointment(
    appointment_id: str,
    user=Depends(
        require_role("patient")
    ),
):

    db = get_database()

    appointment = db.appointments.find_one(
            {
                "_id":
                    _object_id(
                        appointment_id
                    ),

                "patient_id":
                    user["_id"],
            }
        )

    if not appointment:

        raise HTTPException(
            status_code=404,
            detail="Appointment not found.",
        )

    return _serialize_appointment(
        appointment
    )


# =========================================================
# UPDATE PATIENT APPOINTMENT
# =========================================================

@router.patch(
    "/{appointment_id}",
    response_model=AppointmentResponse,
)
def update_appointment(
    appointment_id: str,
    payload: AppointmentUpdate,
    user=Depends(
        require_role("patient")
    ),
):

    db = get_database()

    appointment = db.appointments.find_one(
        {
            "_id":
                _object_id(
                    appointment_id
                ),

            "patient_id":
                user["_id"],
        }
    )

    if not appointment:

        raise HTTPException(
            status_code=404,
            detail="Appointment not found.",
        )

    current_status = appointment.get(
        "status"
    )

    update = payload.model_dump(
        exclude_unset=True
    )

    # -----------------------------------------------------
    # PATIENT STATUS RULES
    # -----------------------------------------------------

    if "status" in update:

        requested_status = update["status"]

        if requested_status == "cancelled":

            if current_status not in {
                "pending",
                "confirmed",
            }:

                raise HTTPException(
                    status_code=400,
                    detail=(
                        "This appointment "
                        "cannot be cancelled."
                    ),
                )

        elif requested_status != current_status:

            raise HTTPException(
                status_code=403,
                detail=(
                    "Patient cannot set "
                    "this appointment status."
                ),
            )

    # -----------------------------------------------------
    # RESCHEDULE CONFLICT
    # -----------------------------------------------------

    new_date = update.get(
        "appointment_date",
        appointment["appointment_date"],
    )

    new_time = update.get(
        "appointment_time",
        appointment["appointment_time"],
    )

    if (
        new_date !=
        appointment["appointment_date"]
        or
        new_time !=
        appointment["appointment_time"]
    ):

        conflict = db.appointments.find_one(
            {
                "_id": {
                    "$ne":
                        appointment["_id"]
                },

                "doctor_id":
                    appointment["doctor_id"],

                "appointment_date":
                    new_date,

                "appointment_time":
                    new_time,

                "status": {
                    "$in": [
                        "pending",
                        "confirmed",
                    ]
                },
            }
        )

        if conflict:

            raise HTTPException(
                status_code=409,
                detail=(
                    "This appointment "
                    "slot is already booked."
                ),
            )

    update["updated_at"] = (
        datetime.now(timezone.utc)
    )

    db.appointments.update_one(
        {
            "_id":
                appointment["_id"]
        },
        {
            "$set": update
        },
    )

    updated = db.appointments.find_one(
        {
            "_id":
                appointment["_id"]
        }
    )

    return _serialize_appointment(
        updated
    )


# =========================================================
# DELETE / CANCEL
# =========================================================

@router.delete(
    "/{appointment_id}",
)
def cancel_appointment(
    appointment_id: str,
    user=Depends(
        require_role("patient")
    ),
):

    db = get_database()

    appointment = db.appointments.find_one(
        {
            "_id":
                _object_id(
                    appointment_id
                ),

            "patient_id":
                user["_id"],
        }
    )

    if not appointment:

        raise HTTPException(
            status_code=404,
            detail="Appointment not found.",
        )

    if appointment.get(
        "status"
    ) not in {
        "pending",
        "confirmed",
    }:

        raise HTTPException(
            status_code=400,
            detail=(
                "This appointment "
                "cannot be cancelled."
            ),
        )

    db.appointments.update_one(
        {
            "_id":
                appointment["_id"]
        },
        {
            "$set": {
                "status":
                    "cancelled",

                "updated_at":
                    datetime.now(
                        timezone.utc
                    ),
            }
        },
    )

    return {
        "success": True,
        "message":
            "Appointment cancelled successfully.",
    }