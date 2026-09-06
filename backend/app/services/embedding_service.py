from __future__ import annotations

from google import genai

from app.config import settings


class EmbeddingService:
    """
    Creates text embeddings for the MediKiosk RAG pipeline.
    """

    def __init__(self) -> None:
        api_key = settings.gemini_api_key

        if not api_key:
            raise RuntimeError(
                "GEMINI_API_KEY is not configured."
            )

        self.client = genai.Client(
            api_key=api_key
        )

        self.model = (
            settings.gemini_embedding_model
        )

    def create_embedding(
        self,
        text: str,
        task_type: str = "RETRIEVAL_DOCUMENT",
    ) -> list[float]:
        if not text or not text.strip():
            raise ValueError(
                "Text cannot be empty."
            )

        try:
            response = (
                self.client.models.embed_content(
                    model=self.model,
                    contents=text,
                    config={
                        "task_type": task_type,
                    },
                )
            )

        except Exception as exc:
            raise RuntimeError(
                "Gemini embedding request failed."
            ) from exc

        embeddings = getattr(
            response,
            "embeddings",
            None,
        )

        if not embeddings:
            raise RuntimeError(
                "Embedding service returned no vector."
            )

        values = getattr(
            embeddings[0],
            "values",
            None,
        )

        if not values:
            raise RuntimeError(
                "Embedding vector is empty."
            )

        return [
            float(value)
            for value in values
        ]