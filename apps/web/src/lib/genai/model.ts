import { getGeminiClient } from "./helpers";
import type { AIRequestConfig, AIResponse, ModelParams } from "./types";

function buildPrompt(config: AIRequestConfig): string {
  let prompt = "";

  // System message
  if (config.systemMessage) {
    prompt += `${config.systemMessage}\n\n`;
  }

  // Conversation history
  if (config.conversationHistory) {
    for (const msg of config.conversationHistory) {
      if (msg.role === "system") {
        prompt += `${msg.content}\n\n`;
      } else if (msg.role === "user") {
        prompt += `User: ${msg.content}\n\n`;
      } else if (msg.role === "assistant") {
        prompt += `Assistant: ${msg.content}\n\n`;
      }
    }
  }

  // User prompt
  prompt += `User: ${config.prompt}`;

  return prompt;
}

export async function makeAICall(
  config: AIRequestConfig
): Promise<AIResponse | AsyncIterable<string>> {
  const client = getGeminiClient();

  const {
    model = "gemini-2.5-flash",
    temperature = 0.7,
    maxTokens = 1000,
    topP = 1,
  } = config.modelParams || {};

  const prompt = buildPrompt(config);
  const stream = config.stream ?? false;

  try {
    if (stream) {
      const responseStream = await client.models.generateContentStream({
        model,
        contents: prompt,
        config: {
          temperature,
          maxOutputTokens: maxTokens,
          topP,
        },
      });

      // Return async iterable for streaming
      // generateContentStream returns an AsyncGenerator directly
      return (async function* () {
        for await (const chunk of responseStream) {
          const text =
            chunk.text || chunk.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            yield text;
          }
        }
      })();
    } else {
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature,
          maxOutputTokens: maxTokens,
          topP,
        },
      });

      // Access text from response
      const text =
        response.text || response.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("No response content from AI model");
      }

      // Access usage metadata
      const usageMetadata = response.usageMetadata;

      return {
        content: text,
        model: model,
        usage: usageMetadata
          ? {
              promptTokens:
                ((usageMetadata as Record<string, unknown>)
                  .promptTokenCount as number) || 0,
              completionTokens:
                ((usageMetadata as Record<string, unknown>)
                  .candidatesTokenCount as number) || 0,
              totalTokens:
                ((usageMetadata as Record<string, unknown>)
                  .totalTokenCount as number) || 0,
            }
          : undefined,
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AI model call failed: ${error.message}`);
    }
    throw new Error("AI model call failed: Unknown error");
  }
}

export const ModelConfigs = {
  FAST: {
    model: "gemini-2.5-flash",
    temperature: 0.7,
    maxTokens: 500,
  } as ModelParams,

  BALANCED: {
    model: "gemini-2.5-flash",
    temperature: 0.7,
    maxTokens: 1000,
  } as ModelParams,

  HIGH_QUALITY: {
    model: "gemini-2.5-flash",
    temperature: 0.5,
    maxTokens: 2000,
  } as ModelParams,

  CREATIVE: {
    model: "gemini-2.5-flash",
    temperature: 1.0,
    maxTokens: 1500,
  } as ModelParams,
} as const;
