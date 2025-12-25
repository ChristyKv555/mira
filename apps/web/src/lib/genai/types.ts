export interface ModelParams {
  model?: string;
  temperature?: number;

  maxTokens?: number;
  topP?: number;

  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIRequestConfig {
  prompt: string;

  modelParams?: ModelParams;
  conversationHistory?: ChatMessage[];

  systemMessage?: string;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
