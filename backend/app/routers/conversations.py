from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from app.database import db
from app.dependencies.auth import (
    require_role,
)
from app.models.conversation import (
    ConversationCreate,
)
from app.services.conversation_service import (
    ConversationService,
)


router = APIRouter(
    prefix="/api/conversations",
    tags=["Conversations"],
)


conversation_service = (
    ConversationService()
)


@router.post("")
async def create_conversation(
    payload: ConversationCreate,
    current_user: dict = Depends(
        require_role("patient")
    ),
):
    patient_id = current_user["_id"]

    try:
        conversation_id = (
            conversation_service.create(
                patient_id=patient_id,
                title=
                    payload.title
                    or "New Health Chat",
            )
        )

        return {
            "success": True,
            "conversation_id":
                conversation_id,
        }

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to create conversation.",
        ) from exc


@router.get("")
async def get_conversations(
    current_user: dict = Depends(
        require_role("patient")
    ),
):
    patient_id = current_user["_id"]

    cursor = (
        db.conversations.find(
            {
                "patient_id":
                    patient_id,
            }
        )
        .sort(
            "updated_at",
            -1,
        )
    )

    conversations = []

    for item in cursor:
        conversations.append(
            {
                "id":
                    str(item["_id"]),

                "title":
                    item.get(
                        "title",
                        "New Health Chat",
                    ),

                "created_at":
                    item[
                        "created_at"
                    ],

                "updated_at":
                    item[
                        "updated_at"
                    ],
            }
        )

    return {
        "success": True,
        "conversations":
            conversations,
    }