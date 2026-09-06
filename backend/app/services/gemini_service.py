from __future__ import annotations

import json
import re
from typing import Any

from google import genai

from app.config import settings


class GeminiService:
    """Small synchronous Gemini client. Call from FastAPI threadpool for async routes."""

    def __init__(self) -> None:
        api_key = (settings.gemini_api_key or "").strip()
        if not api_key or api_key.lower() in {
            "your_gemini_api_key_here",
            "replace_me",
            "changeme",
        }:
            raise RuntimeError("GEMINI_API_KEY is missing or still using the placeholder value.")

        self.client = genai.Client(api_key=api_key)
        self.model = (settings.gemini_model or "gemini-3.5-flash-lite").strip()

    def generate_text(self,prompt: str,model: str | None = None,) -> str:
       selected_model = (
           model
           or self.model
           or "gemini-3.5-flash-lite"
       )

       response = self.client.models.generate_content(
           model=selected_model,
           contents=prompt,
           config={
               "temperature": 0.2,
            "response_mime_type": "application/json",
           },
       )

       text = getattr(response, "text", None)

       if not text:
           raise RuntimeError(
               "Gemini returned an empty response."
           )

       return text

    def analyze_medical_text(self, text: str) -> dict[str, Any]:
        if not text or not text.strip():
            raise ValueError("Medical text cannot be empty.")

        prompt = f"""
You are a medical document analysis assistant for MediKiosk.

Safety rules:
- Do not provide a definitive diagnosis.
- Do not invent values or history.
- Use only facts present in the supplied text.
- Separate extracted facts from possible concerns.
- Missing information must remain empty.
- Recommendations must be general and advise professional review.
- Return ONLY valid JSON.

Return exactly:
{{
  "summary": "Short plain-language summary",
  "key_findings": [],
  "abnormal_values": [],
  "possible_concerns": [],
  "recommendations": [],
  "important_questions_for_doctor": []
}}

Medical document text:
{text}
"""

        return self._parse_json(self.generate_text(prompt))

    def generate_registration_interview(
        self,
        language: str,
        answers: list[dict[str, Any]],
        total_questions: int = 5,
    ) -> dict[str, Any]:
        answer_text = json.dumps(answers[-8:], ensure_ascii=False)
        prompt = f"""
You are MediKiosk's health-intake interviewer.
Ask concise, non-diagnostic questions that help understand a patient's current health concerns.

Rules:
- Ask exactly ONE next question.
- The interview has at most {total_questions} questions.
- Use the requested language: {language or 'English'}.
- Adapt the next question to previous answers.
- Do not diagnose, prescribe, or invent patient facts.
- If the patient has not answered any questions yet, start with the main reason for the visit/current health concern.
- Return ONLY JSON.

Previous Q&A:
{answer_text}

Return exactly:
{{
  "question": "the next question",
  "completed": false,
  "reason": "one short reason why this is the next useful question"
}}
"""

        result = self._parse_json(self.generate_text(prompt))
        question = result.get("question")
        if not isinstance(question, str) or not question.strip():
            raise RuntimeError("Gemini returned an invalid interview question.")

        return {
            "question": question.strip(),
            "completed": bool(result.get("completed", False)),
            "reason": str(result.get("reason", "")),
        }

    @staticmethod
    def _parse_json(raw_response: str) -> dict[str, Any]:
        cleaned = raw_response.strip()
        cleaned = re.sub(r"^```json\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        try:
            data = json.loads(cleaned)
        except json.JSONDecodeError as exc:
            raise RuntimeError("Gemini returned invalid JSON.") from exc
        if not isinstance(data, dict):
            raise RuntimeError("Gemini response must be a JSON object.")
        return data
