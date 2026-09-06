from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException

from app.database import db
from app.dependencies.auth import require_role
from app.services.gemini_service import GeminiService
from app.models.ai_analysis import AIAnalysisCreate


router = APIRouter(
    prefix="/api/ai",
    tags=["AI"],
)


@router.post("/analyze")
async def analyze_medical_text(
    payload: AIAnalysisCreate,
    current_user: dict = Depends(require_role("patient")),
):
    try:
        user_id = current_user["_id"]

        if not ObjectId.is_valid(user_id):
            raise HTTPException(
                status_code=401,
                detail="Invalid user identity.",
            )

        patient = await db.patient_profiles.find_one(
            {
                "user_id": ObjectId(user_id)
            }
        )

        if not patient:
            raise HTTPException(
                status_code=404,
                detail="Patient profile not found.",
            )

        service = GeminiService()

        analysis = service.analyze_medical_text(
            payload.source_text
        )

        document = {
            "patient_id": ObjectId(user_id),
            "source_type": "medical_text",
            "summary": analysis.get("summary", ""),
            "key_findings": analysis.get(
                "key_findings",
                [],
            ),
            "abnormal_values": analysis.get(
                "abnormal_values",
                [],
            ),
            "possible_concerns": analysis.get(
                "possible_concerns",
                [],
            ),
            "recommendations": analysis.get(
                "recommendations",
                [],
            ),
            "important_questions_for_doctor": analysis.get(
                "important_questions_for_doctor",
                [],
            ),
            "created_at": datetime.now(timezone.utc),
        }

        result = await db.ai_analyses.insert_one(
            document
        )

        return {
            "success": True,
            "analysis_id": str(result.inserted_id),
            "analysis": analysis,
        }

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except RuntimeError as exc:
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="AI analysis failed.",
        ) from exc