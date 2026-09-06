import json
import logging
import re
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from app.config import settings
from app.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)

gemini_service = GeminiService()
router = APIRouter(prefix="/api/registration-ai", tags=["Registration AI"])

def clean_json_response(text: str) -> dict[str, Any]:
    cleaned = text.strip()

    # Remove markdown code fences
    cleaned = re.sub(
        r"^```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )
    cleaned = re.sub(
        r"\s*```$",
        "",
        cleaned,
        flags=re.IGNORECASE,
    )

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "Gemini returned invalid JSON."
        ) from exc

    if not isinstance(data, dict):
        raise RuntimeError(
            "Gemini returned an invalid response structure."
        )

    return data


class RegistrationAIRequest(BaseModel):
    source_text: str = Field(min_length=1, max_length=30000)


class InterviewAnswer(BaseModel):
    question_index: int = Field(ge=0, le=20)
    question: str = Field(min_length=1, max_length=2000)
    answer: str = Field(min_length=1, max_length=5000)


class RegistrationInterviewRequest(BaseModel):
    language: str = Field(default="en", max_length=30)
    answers: list[InterviewAnswer] = Field(default_factory=list, max_length=5)


@router.post("/analyze")
async def analyze_registration_document(payload: RegistrationAIRequest):
    try:
        analysis = await run_in_threadpool(gemini_service.analyze_medical_text,payload.source_text,)
        return {"success": True, "analysis": analysis}
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Registration AI analysis failed.") from exc


@router.post("/interview")
async def registration_interview(
    payload: RegistrationInterviewRequest,
):
    answers = payload.answers or []

    if len(answers) >= 5:
        return {
            "success": True,
            "question_index": len(answers),
            "question": "",
            "acknowledgement": (
                "Thank you. The interview is complete."
            ),
            "completed": True,
            "is_complete": True,
            "answers_count": len(answers),
        }

    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=503,
            detail="Gemini API key is not configured.",
        )

    history = "\n".join(
        [
            f"Q{item.question_index + 1}: {item.question}\n"
            f"A: {item.answer}"
            for item in answers
        ]
    )

    prompt = f"""
You are MediKiosk's clinical intake assistant.

Generate exactly ONE next health-history question.

Rules:
- Ask exactly one question.
- Use the previous answers to make it relevant.
- Do not diagnose.
- Do not prescribe medicines.
- Do not recommend treatment.
- Keep the question short and patient-friendly.
- This is a registration health-history interview.
- After the fifth answer, the interview is complete.
- Return ONLY valid JSON.
- No markdown.
- No code fences.

Language:
{payload.language}

Previous conversation:
{history if history else "No previous answers. Start with the first question."}

Current number of answered questions:
{len(answers)}

Return exactly this structure:
{{
  "question": "one next question",
  "acknowledgement": "brief acknowledgement"
}}
"""

    try:
        result = await run_in_threadpool(
            gemini_service.generate_text,
            prompt,
            model=(
                settings.gemini_model
                or "gemini-3.5-flash-lite"
            ),
        )

        data = clean_json_response(result)

        question = str(
            data.get("question", "")
        ).strip()

        acknowledgement = str(
            data.get(
                "acknowledgement",
                "Thank you for sharing that.",
            )
        ).strip()

        if not question:
            raise RuntimeError(
                "Gemini did not return a question."
            )

        return {
            "success": True,
            "question_index": len(answers),
            "question": question,
            "acknowledgement": acknowledgement,
            "completed": False,
            "is_complete": False,
            "answers_count": len(answers),
        }

    except HTTPException:
        raise

    except Exception as exc:
        logger.exception(
            "Registration interview Gemini error"
        )

        raise HTTPException(
            status_code=503,
            detail=(
                "Gemini interview unavailable: "
                f"{str(exc)}"
            ),
        ) from exc
