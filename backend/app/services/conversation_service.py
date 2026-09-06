from __future__ import annotations

from datetime import datetime, timezone

from bson import ObjectId

from app.database import db


class ConversationService:
    """Handles patient-scoped AI conversations."""

    def create(
        self,
        patient_id: str,
        title: str = "New Health Chat",
    ) -> str:
        now = datetime.now(timezone.utc)

        document = {
            "patient_id": patient_id,
            "title": title,
            "messages": [],
            "created_at": now,
            "updated_at": now,
        }

        result = db.conversations.insert_one(
            document
        )

        return str(result.inserted_id)

    def get(
        self,
        conversation_id: str,
        patient_id: str,
    ):
        if not ObjectId.is_valid(
            conversation_id
        ):
            return None

        return db.conversations.find_one(
            {
                "_id": ObjectId(
                    conversation_id
                ),
                "patient_id": patient_id,
            }
        )

    def add_message(
        self,
        conversation_id: str,
        patient_id: str,
        role: str,
        content: str,
    ) -> None:
        if not ObjectId.is_valid(
            conversation_id
        ):
            raise ValueError(
                "Invalid conversation ID."
            )

        now = datetime.now(timezone.utc)

        result = db.conversations.update_one(
            {
                "_id": ObjectId(
                    conversation_id
                ),
                "patient_id": patient_id,
            },
            {
                "$push": {
                    "messages": {
                        "role": role,
                        "content": content,
                        "created_at": now,
                    }
                },
                "$set": {
                    "updated_at": now,
                },
            },
        )

        if result.matched_count == 0:
            raise ValueError(
                "Conversation not found."
            )