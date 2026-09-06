from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class PatientProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )

    dob: str | None = Field(
        default=None,
        max_length=50,
    )

    gender: str | None = Field(
        default=None,
        max_length=30,
    )

    mobile: str | None = Field(
        default=None,
        max_length=30,
    )

    alternate_phone: str | None = Field(
        default=None,
        max_length=30,
    )

    country: str | None = Field(
        default=None,
        max_length=80,
    )

    state: str | None = Field(
        default=None,
        max_length=80,
    )

    district: str | None = Field(
        default=None,
        max_length=100,
    )

    zip: str | None = Field(
        default=None,
        max_length=20,
    )

    address: str | None = Field(
        default=None,
        max_length=300,
    )

    emergency_contact: str | None = Field(
        default=None,
        max_length=200,
    )


class RegistrationAIResponse(BaseModel):
    summary: str = ""

    key_findings: list[str] = Field(
        default_factory=list
    )

    abnormal_values: list[str] = Field(
        default_factory=list
    )

    possible_concerns: list[str] = Field(
        default_factory=list
    )

    recommendations: list[str] = Field(
        default_factory=list
    )

    documents_analyzed: int = 0
    data_points_extracted: int = 0
    confidence_score: int = 0

    generated_at: datetime | None = None
    updated_at: datetime | None = None

    patient_modified: bool = False


class RegistrationDocumentResponse(BaseModel):
    name: str = ""
    file_type: str = ""
    extracted_text: str = ""
    processed_at: datetime | None = None


class InterviewAnswerResponse(BaseModel):
    question_index: int = 0
    question: str = ""
    answer: str = ""


class PatientProfileDocument(BaseModel):
    user_id: str

    first_name: str = ""
    last_name: str = ""

    dob: str = ""
    gender: str = ""

    phone_number: str = ""
    alternate_phone: str = ""

    country: str = ""
    state: str = ""
    district: str = ""
    zip: str = ""

    address: str = ""
    emergency_contact: str = ""

    # Registration AI data
    registration_ai: RegistrationAIResponse | None = None

    # AI health interview
    interview_answers: list[InterviewAnswerResponse] = Field(
        default_factory=list
    )

    # Only metadata + extracted text.
    # Original image/PDF is NOT stored here.
    registration_documents: list[RegistrationDocumentResponse] = Field(
        default_factory=list
    )

    # Existing record structure
    record: dict[str, Any] = Field(
        default_factory=dict
    )

    created_at: datetime
    updated_at: datetime


class PatientRecordResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    identity: dict[str, Any]

    stats: dict[str, int]

    aiHealthSummary: list[dict[str, Any]]
    aiSummaryMeta: dict[str, Any]
    aiHealthSummaryFull: list[dict[str, Any]]

    recentLabReport: dict[str, Any]

    visits: list[dict[str, Any]]

    latestPrescription: dict[str, Any]

    notifications: list[dict[str, Any]]

    labReports: list[dict[str, Any]]

    prescriptions: list[dict[str, Any]]

    documents: list[dict[str, Any]]

    timeline: list[dict[str, Any]]

    medicalHistory: dict[str, Any]

    medicines: dict[str, Any]

    allergies: dict[str, Any]

    ayush: dict[str, Any]