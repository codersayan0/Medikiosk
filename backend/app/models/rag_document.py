from datetime import datetime
from pydantic import BaseModel, Field


class RAGDocument(BaseModel):
    patient_id: str
    source_type: str
    source_id: str | None = None
    title: str
    text: str = Field(min_length=1)
    embedding: list[float]
    created_at: datetime