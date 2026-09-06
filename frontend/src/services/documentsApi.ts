import { apiRequest } from "./api";

export interface ProcessedDocumentResponse {
  success: boolean;
  category: string;
  processing_status: "completed";
  document_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  extracted_text: string;
  text_length: number;
}

export async function processDocument(
  file: File,
  category: string
): Promise<ProcessedDocumentResponse> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("category", category);

  return apiRequest<ProcessedDocumentResponse>(
    "/api/documents/process",
    {
      method: "POST",
      body: formData,
    }
  );
}