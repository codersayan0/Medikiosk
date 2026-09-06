import { apiRequest } from "./api";

// ============================================================
// MEDICAL DOCUMENT AI ANALYSIS
// ============================================================

export interface AIAnalysis {
  summary: string;

  key_findings: string[];

  abnormal_values: string[];

  possible_concerns: string[];

  recommendations: string[];

  important_questions_for_doctor: string[];
}

export interface AIAnalysisResponse {
  success: boolean;

  analysis_id?: string;

  analysis: AIAnalysis;
}

export async function analyzeMedicalText(
  sourceText: string
): Promise<AIAnalysisResponse> {
  if (!sourceText.trim()) {
    throw new Error(
      "Medical text cannot be empty."
    );
  }

  return apiRequest<AIAnalysisResponse>(
    "/api/ai/analyze",
    {
      method: "POST",

      body: JSON.stringify({
        source_text: sourceText,
      }),
    }
  );
}

/**
 * Registration-stage medical document analysis.
 *
 * The patient account does not exist yet,
 * so this endpoint does not require a patient JWT.
 */
export async function analyzeRegistrationMedicalText(
  sourceText: string
): Promise<AIAnalysisResponse> {
  if (!sourceText.trim()) {
    throw new Error(
      "Medical text cannot be empty."
    );
  }

  return apiRequest<AIAnalysisResponse>(
    "/api/registration-ai/analyze",
    {
      method: "POST",

      body: JSON.stringify({
        source_text: sourceText,
      }),
    }
  );
}


// ============================================================
// AI HEALTH INTERVIEW
// ============================================================

export interface InterviewAnswer {
  question_index: number;

  question: string;

  answer: string;
}

export interface RegistrationInterviewRequest {
  language: string;

  answers: InterviewAnswer[];
}

export interface RegistrationInterviewResponse {
  success: boolean;

  completed: boolean;

  question_index: number;

  question: string;

  acknowledgement: string;

  answers_count: number;
}

/**
 * Runs one step of the registration AI Health Interview.
 *
 * The account has not been created yet, so the current
 * registration endpoint does not require a patient JWT.
 *
 * The backend uses Gemini to generate the next adaptive
 * question from the answers already provided.
 */
export async function runRegistrationInterview(
  language: string,
  answers: InterviewAnswer[]
): Promise<RegistrationInterviewResponse> {
  if (!language.trim()) {
    throw new Error(
      "Interview language is required."
    );
  }

  if (answers.length > 5) {
    throw new Error(
      "A maximum of 5 interview answers is allowed."
    );
  }

  return apiRequest<RegistrationInterviewResponse>(
    "/api/registration-ai/interview",
    {
      method: "POST",

      body: JSON.stringify({
        language,
        answers,
      } satisfies RegistrationInterviewRequest),
    }
  );
}