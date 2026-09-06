from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone_number: str = Field(min_length=10, max_length=20)
    password: str = Field(min_length=8, max_length=72)
    role: str = "patient"


class RegistrationAI(BaseModel):
    summary: str = ""
    key_findings: list[str] = Field(default_factory=list)
    abnormal_values: list[str] = Field(default_factory=list)
    possible_concerns: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)

    documents_analyzed: int = 0
    data_points_extracted: int = 0
    confidence_score: int = 0

    generated_at: datetime | None = None
    updated_at: datetime | None = None
    patient_modified: bool = False


class RegistrationDocument(BaseModel):
    name: str = ""
    file_type: str = ""
    extracted_text: str = ""
    processed_at: datetime | None = None


class InterviewAnswer(BaseModel):
    question_index: int = Field(ge=0, le=50)
    question: str = Field(default="", max_length=2000)
    answer: str = Field(default="", max_length=5000)


class PatientRegisterRequest(UserCreate):

    dob: str = Field(default="", max_length=50)
    gender: str = Field(default="", max_length=30)
    alternate_phone: str = Field(default="", max_length=30)
    country: str = Field(default="", max_length=80)
    state: str = Field(default="", max_length=80)
    district: str = Field(default="", max_length=100)
    zip: str = Field(default="", max_length=20)
    address: str = Field(default="", max_length=300)
    emergency_contact: str = Field(default="", max_length=200)

    registration_ai: RegistrationAI | None = None
    interview_answers: list[InterviewAnswer] = Field(
        default_factory=list
    )
    registration_documents: list[RegistrationDocument] = Field(
        default_factory=list
    )


class UserLogin(BaseModel):
    identifier: str = Field(min_length=3, max_length=100)
    password: str


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone_number: str
    role: str
    created_at: datetime
    patient_uid: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class OtpRequest(BaseModel):
    user_id: str


class OtpVerify(BaseModel):
    user_id: str
    otp: str = Field(min_length=6, max_length=6)


class OtpSendResponse(BaseModel):
    success: bool
    message: str
    otp: str
    email: str
