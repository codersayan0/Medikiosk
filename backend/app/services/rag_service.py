from __future__ import annotations

from typing import Any

from app.database import db
from app.services.embedding_service import (
    EmbeddingService,
)


class RAGService:
    """
    Patient-specific retrieval service using
    MongoDB Atlas Vector Search.
    """

    def __init__(self) -> None:
        self.embedding_service: (
            EmbeddingService | None
        ) = None

    def _get_embedding_service(
        self,
    ) -> EmbeddingService:

        if self.embedding_service is None:
            self.embedding_service = (
                EmbeddingService()
            )

        return self.embedding_service

    def retrieve_patient_context(
        self,
        patient_id: str,
        query: str,
        limit: int = 5,
    ) -> list[dict[str, Any]]:

        if not patient_id:
            raise ValueError(
                "Patient ID is required."
            )

        if not query.strip():
            raise ValueError(
                "Query cannot be empty."
            )

        embedding_service = (
            self._get_embedding_service()
        )

        query_embedding = (
            embedding_service.create_embedding(
                query,
                task_type="RETRIEVAL_QUERY",
            )
        )

        pipeline = [
            {
                "$vectorSearch": {
                    "index":
                        "medical_vector_index",

                    "path":
                        "embedding",

                    "queryVector":
                        query_embedding,

                    "numCandidates":
                        max(
                            limit * 10,
                            50,
                        ),

                    "limit":
                        limit,

                    "filter": {
                        "patient_id":
                            patient_id,
                    },
                }
            },
            {
                "$project": {
                    "_id": 1,
                    "title": 1,
                    "text": 1,
                    "source_type": 1,
                    "source_id": 1,
                    "created_at": 1,
                    "score": {
                        "$meta":
                            "vectorSearchScore",
                    },
                }
            },
        ]

        results: list[
            dict[str, Any]
        ] = []

        cursor = (
            db.rag_documents.aggregate(
                pipeline
            )
        )

        for document in cursor:
            results.append(document)

        return results


rag_service = RAGService()