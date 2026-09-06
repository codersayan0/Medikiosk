from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


RecordType = Literal[
    "lab_report",
    "prescription",
    "diagnosis",
    "visit",
    "vitals",
    "other",
]


class MedicalRecordCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    record_type: RecordType

    title: str = Field(
        min_length=2,
        max_length=150,
    )

    summary: str = Field(
        min_length=1,
        max_length=5000,
    )

    findings: list[str] = Field(
        default_factory=list,
        max_length=50,
    )

    diagnosis: list[str] = Field(
        default_factory=list,
        max_length=50,
    )

    vitals: dict[str, Any] = Field(
        default_factory=dict,
    )

    prescription: list[dict[str, Any]] = Field(
        default_factory=list,
        max_length=50,
    )

    record_date: str = Field(
        min_length=10,
        max_length=30,
    )


class MedicalRecordUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str | None = Field(
        default=None,
        max_length=150,
    )

    summary: str | None = Field(
        default=None,
        max_length=5000,
    )

    findings: list[str] | None = None

    diagnosis: list[str] | None = None

    vitals: dict[str, Any] | None = None

    prescription: list[dict[str, Any]] | None = None

    record_date: str | None = Field(
        default=None,
        max_length=30,
    )


class MedicalRecordResponse(BaseModel):
    id: str

    patient_id: str
    doctor_id: str | None = None

    record_type: RecordType

    title: str
    summary: str

    findings: list[str]
    diagnosis: list[str]

    vitals: dict[str, Any]
    prescription: list[dict[str, Any]]

    record_date: str

    created_at: datetime
    updated_at: datetime