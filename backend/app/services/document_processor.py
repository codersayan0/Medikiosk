from __future__ import annotations

from pathlib import Path
from tempfile import NamedTemporaryFile
from typing import Final
from uuid import uuid4

from fastapi import UploadFile


MAX_FILE_SIZE_BYTES: Final[int] = 10 * 1024 * 1024

ALLOWED_CONTENT_TYPES: Final[set[str]] = {
    "application/pdf",
    "image/jpeg",
    "image/png",
}

ALLOWED_EXTENSIONS: Final[set[str]] = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
}


class DocumentProcessingError(Exception):
    """Expected document-processing failure."""


def _validate_file(
    filename: str,
    content_type: str | None,
) -> None:
    suffix = Path(filename).suffix.lower()

    if suffix not in ALLOWED_EXTENSIONS:
        raise DocumentProcessingError(
            "Unsupported file format. "
            "Only PDF, JPG, JPEG, and PNG files are allowed."
        )

    # Browsers normally provide a MIME type.
    # Do not reject a valid file when MIME type is missing,
    # but reject an explicitly unsupported type.
    if (
        content_type
        and content_type not in ALLOWED_CONTENT_TYPES
    ):
        raise DocumentProcessingError(
            "Unsupported MIME type. "
            "Only PDF, JPG, JPEG, and PNG files are allowed."
        )


def _extract_pdf_text(
    file_path: Path,
) -> str:
    try:
        from pypdf import PdfReader
    except ImportError as exc:
        raise DocumentProcessingError(
            "PDF processing dependency is not installed."
        ) from exc

    try:
        reader = PdfReader(str(file_path))
        pages: list[str] = []

        for page in reader.pages:
            page_text = page.extract_text() or ""
            page_text = page_text.strip()

            if page_text:
                pages.append(page_text)

        return "\n\n".join(pages).strip()

    except Exception as exc:
        raise DocumentProcessingError(
            "Unable to read the PDF document."
        ) from exc


def _extract_image_text(
    file_path: Path,
) -> str:
    try:
        from PIL import Image
        import pytesseract
    except ImportError as exc:
        raise DocumentProcessingError(
            "Image OCR dependencies are not installed. Install Pillow and pytesseract."
        ) from exc

    # Windows/local development: automatically discover common Tesseract
    # installations. Production/Linux can still provide TESSERACT_CMD.
    import os
    import shutil

    candidates = [
        os.getenv("TESSERACT_CMD"),
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        shutil.which("tesseract"),
    ]

    tesseract_path = next(
        (str(candidate) for candidate in candidates if candidate and Path(str(candidate)).exists()),
        None,
    )

    if tesseract_path:
        pytesseract.pytesseract.tesseract_cmd = tesseract_path

    try:
        # Fail early with a useful message instead of a generic OCR exception.
        pytesseract.get_tesseract_version()
    except Exception as exc:
        raise DocumentProcessingError(
            "Tesseract OCR engine is not available. Set TESSERACT_CMD to the full path of tesseract.exe."
        ) from exc

    try:
        with Image.open(file_path) as image:
            image = image.convert("RGB")
            text = pytesseract.image_to_string(image)
            return text.strip()
    except Exception as exc:
        raise DocumentProcessingError(
            "Unable to process the image document with Tesseract OCR."
        ) from exc


def _extract_text(
    file_path: Path,
    filename: str,
) -> str:
    suffix = Path(filename).suffix.lower()

    if suffix == ".pdf":
        return _extract_pdf_text(file_path)

    return _extract_image_text(file_path)


async def process_uploaded_document(
    upload: UploadFile,
) -> dict[str, str | int]:

    filename = Path(
        upload.filename or "document"
    ).name

    content_type = upload.content_type

    _validate_file(
        filename,
        content_type,
    )

    document_id = str(uuid4())

    temp_path: Path | None = None

    total_size = 0

    try:
        with NamedTemporaryFile(
            prefix="medikiosk-doc-",
            suffix=Path(filename).suffix.lower(),
            delete=False,
        ) as temp_file:

            temp_path = Path(
                temp_file.name
            )

            while True:
                chunk = await upload.read(
                    1024 * 1024
                )

                if not chunk:
                    break

                total_size += len(chunk)

                if (
                    total_size
                    > MAX_FILE_SIZE_BYTES
                ):
                    raise DocumentProcessingError(
                        "File size exceeds the 10 MB limit."
                    )

                temp_file.write(chunk)

        extracted_text = _extract_text(
            temp_path,
            filename,
        )

        if not extracted_text:
            raise DocumentProcessingError(
                "No readable text was found in this document. "
                "Scanned PDFs may require OCR before they can be analyzed."
            )

        return {
            "document_id": document_id,
            "file_name": filename,
            "file_type": (
                content_type
                or "application/octet-stream"
            ),
            "file_size": total_size,
            "extracted_text": extracted_text,
            "text_length": len(
                extracted_text
            ),
        }

    finally:
        await upload.close()

        if temp_path is not None:
            try:
                temp_path.unlink(
                    missing_ok=True
                )
            except OSError:
                pass