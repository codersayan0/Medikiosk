import { apiRequest } from "./api";

export interface AssistantSource {
  title: string;
  source_type: string;
  source_id: string | null;
  score?: number;
}

export interface AssistantResponse {
  success: boolean;
  conversation_id: string;
  answer: string;
  sources: AssistantSource[];
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export async function askAssistant(
  message: string,
  conversationId?: string | null
): Promise<AssistantResponse> {
  if (!message.trim()) {
    throw new Error(
      "Message cannot be empty."
    );
  }

  return apiRequest<AssistantResponse>(
    "/api/assistant/ask",
    {
      method: "POST",
      body: JSON.stringify({
        conversation_id:
          conversationId || null,
        message: message.trim(),
      }),
    }
  );
}

export async function createConversation(
  title?: string
) {
  return apiRequest<{
    success: boolean;
    conversation_id: string;
  }>(
    "/api/conversations",
    {
      method: "POST",
      body: JSON.stringify({
        title:
          title || "New Health Chat",
      }),
    }
  );
}

export async function getConversations() {
  return apiRequest<{
    success: boolean;
    conversations: Conversation[];
  }>(
    "/api/conversations"
  );
}