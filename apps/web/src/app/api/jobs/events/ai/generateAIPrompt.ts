import { buildTaskGenerationPrompt } from "./prompts/taskGenerationPrompt";
import type { UserContext } from "../handlers/fetchUserContext";
import type { CleanedSourceEvent } from "../handlers/cleanSourceEvents";
import type { AIRequestConfig } from "@/lib/genai/types";

/**
 * Generates the complete AI prompt configuration for task generation
 */
export function generateAIPrompt(
  cleanedEvents: CleanedSourceEvent[],
  context: UserContext
): AIRequestConfig {
  const systemPrompt = buildTaskGenerationPrompt(context);

  // Build user prompt with cleaned source events
  const eventsData = cleanedEvents
    .map(
      (event, index) => `
          Event ${index + 1}:
          Source Event ID: ${event.id}
          Platform: ${event.platform}
          Content:
          ${event.rawContent}
        ---
        `
    )
    .join("\n");

  const userPrompt = `Process the following source events and create tasks:
  Also the source events item maye contain multiple items inside the content, so you need to extract all the items and create a task for each item.

${eventsData}

Return a JSON array of task objects following the structure specified in the system prompt.`;

  return {
    prompt: userPrompt,
    systemMessage: systemPrompt,
    modelParams: {
      model: "gemini-2.5-flash",
      temperature: 0.7,
      maxTokens: 2000,
    },
    stream: false,
  };
}
