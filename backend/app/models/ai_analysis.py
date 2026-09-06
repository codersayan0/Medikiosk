from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class AIAnalysisCreate(BaseModel):
    source_text: str = Field(min_length=1)


class AIAnalysisResponse(BaseModel):
    id: str
    patient_id: str

    summary: str
    key_findings: list[str] = []
    abnormal_values: list[str] = []
    possible_concerns: list[str] = []
    recommendations: list[str] = []
    important_questions_for_doctor: list[str] = []

    created_at: datetime