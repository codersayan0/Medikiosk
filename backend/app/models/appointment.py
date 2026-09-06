from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


AppointmentStatus = Literal[
    "pending",
    "confirmed",
    "completed",
    "cancelled",
]

ConsultationType = Literal[
    "in_person",
    "video",
    "phone",
]


class AppointmentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    doctor_id: str = Field(
        min_length=1,
        max_length=100,
    )

    appointment_date: str = Field(
        min_length=10,
        max_length=10,
    )

    appointment_time: str = Field(
        min_length=4,
        max_length=20,
    )

    consultation_type: ConsultationType = "in_person"

    reason: str = Field(
        min_length=2,
        max_length=500,
    )


class AppointmentUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    appointment_date: str | None = Field(
        default=None,
        max_length=10,
    )

    appointment_time: str | None = Field(
        default=None,
        max_length=20,
    )

    consultation_type: ConsultationType | None = None

    reason: str | None = Field(
        default=None,
        max_length=500,
    )

    notes: str | None = Field(
        default=None,
        max_length=2000,
    )

    status: AppointmentStatus | None = None


class AppointmentResponse(BaseModel):
    id: str

    patient_id: str
    doctor_id: str

    patient_name: str
    patient_uid: str | None = None

    doctor_name: str
    doctor_specialization: str | None = None

    appointment_date: str
    appointment_time: str

    consultation_type: ConsultationType

    status: AppointmentStatus

    reason: str
    notes: str | None = None

    created_at: datetime
    updated_at: datetime