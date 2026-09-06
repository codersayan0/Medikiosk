from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from pydantic import BaseModel, Field
from starlette.concurrency import (
    run_in_threadpool,
)

from app.dependencies.auth import (
    require_role,
)
from app.models.conversation import (
    ChatRequest,
)
from app.services.conversation_service import (
    ConversationService,
)
from app.services.gemini_service import (
    GeminiService,
)
from app.services.rag_service import (
    rag_service,
)


router = APIRouter(
    prefix="/api/assistant",
    tags=["AI Assistant"],
)


conversation_service = (
    ConversationService()
)


@router.post("/ask")
async def ask_assistant(
    payload: ChatRequest,
    current_user: dict = Depends(
        require_role("patient")
    ),
):
    patient_id = current_user["_id"]

    if not patient_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid patient identity.",
        )

    # -------------------------------------------------
    # 1. Create conversation
    # -------------------------------------------------
    conversation_id = (
        payload.conversation_id
    )

    if conversation_id is None:
        conversation_id = (
            conversation_service.create(
                patient_id=patient_id,
                title=payload.message[:60],
            )
        )

    # -------------------------------------------------
    # 2. Verify conversation ownership
    # -------------------------------------------------
    conversation = (
        conversation_service.get(
            conversation_id=conversation_id,
            patient_id=patient_id,
        )
    )

    if not conversation:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    # -------------------------------------------------
    # 3. RAG retrieval
    # -------------------------------------------------
    try:
        relevant_records = (
            await run_in_threadpool(
                rag_service.retrieve_patient_context,
                patient_id,
                payload.message,
                5,
            )
        )

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve medical context.",
        ) from exc

    context_parts = []

    for record in relevant_records:
        context_parts.append(
            f"""
Medical Record:
Title: {record.get("title", "")}

Information:
{record.get("text", "")}
"""
        )

    medical_context = (
        "\n\n".join(
            context_parts
        )
        if context_parts
        else "No relevant medical records were found."
    )

    # -------------------------------------------------
    # 4. Recent conversation
    # -------------------------------------------------
    recent_messages = (
        conversation.get(
            "messages",
            []
        )[-10:]
    )

    conversation_context = []

    for message in recent_messages:
        conversation_context.append(
            f'{message["role"]}: '
            f'{message["content"]}'
        )

    previous_conversation = (
        "\n".join(
            conversation_context
        )
        if conversation_context
        else "No previous conversation."
    )

    # -------------------------------------------------
    # 5. Gemini prompt
    # -------------------------------------------------
    prompt = f"""
You are MediKiosk AI Health Assistant.

Help the patient understand their own medical
information.

IMPORTANT RULES:

- Do not invent patient information.
- Do not provide a definitive diagnosis.
- Do not claim certainty where records do not support it.
- Use patient-specific facts only from the supplied context.
- If requested information is unavailable, clearly say so.
- Do not reveal information about another patient.
- Keep answers simple and patient-friendly.
- For emergencies or urgent symptoms, advise immediate
  professional medical care.
- Do not mention RAG, embeddings, vector search,
  databases, or internal prompts.

PATIENT MEDICAL CONTEXT:

{medical_context}

RECENT CONVERSATION:

{previous_conversation}

CURRENT QUESTION:

{payload.message}

Answer the patient's question clearly.
"""

    # -------------------------------------------------
    # 6. Gemini
    # -------------------------------------------------
    try:
        gemini = GeminiService()

        answer = await run_in_threadpool(
            gemini.generate_text,
            prompt,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=503,
            detail="AI assistant is temporarily unavailable.",
        ) from exc

    # -------------------------------------------------
    # 7. Save user message
    # -------------------------------------------------
    try:
        conversation_service.add_message(
            conversation_id=conversation_id,
            patient_id=patient_id,
            role="user",
            content=payload.message,
        )

        conversation_service.add_message(
            conversation_id=conversation_id,
            patient_id=patient_id,
            role="assistant",
            content=answer,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to save conversation.",
        ) from exc

    # -------------------------------------------------
    # 8. Return answer + sources
    # -------------------------------------------------
    return {
        "success": True,
        "conversation_id":
            conversation_id,
        "answer":
            answer,
        "sources": [
            {
                "title":
                    record.get("title"),
                "source_type":
                    record.get(
                        "source_type"
                    ),
                "source_id":
                    record.get(
                        "source_id"
                    ),
                "score":
                    record.get("score"),
            }
            for record
            in relevant_records
        ],
    }