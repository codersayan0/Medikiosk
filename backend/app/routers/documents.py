from fastapi import (
    APIRouter,
    File,
    Form,
    HTTPException,
    UploadFile,
)

from app.services.document_processor import (
    DocumentProcessingError,
    process_uploaded_document,
)


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


@router.post("/process")
async def process_document(
    file: UploadFile = File(...),
    category: str = Form("medical"),
):
    """
    Process one medical document
    without persisting the original file.

    The uploaded file is written to a temporary
    local file only while it is being processed.

    The temporary file is removed after processing.

    The response contains extracted text for
    the next AI-processing stage.
    """

    try:
        result = (
            await process_uploaded_document(
                file
            )
        )

        return {
            "success": True,
            "category": category,
            "processing_status": "completed",
            **result,
        }

    except DocumentProcessingError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Document processing failed.",
        ) from exc