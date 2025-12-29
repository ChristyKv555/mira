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

**IMPORTANT FILTERING INSTRUCTIONS**:
- Filter out email campaigns, newsletters, promotional content, spam, and non-actionable items
- Only create tasks for work-related, actionable content that requires specific action or response
- Skip informational-only content, automated notifications, and personal/non-work items
- The source events may contain multiple items inside the content, so extract all actionable work items and create a task for each one
- If a source event contains no actionable work items after filtering, skip it entirely

${eventsData}

Return a JSON array of task objects following the structure specified in the system prompt. Only include tasks that are work-related and actionable.`;

  return {
    prompt: userPrompt,
    systemMessage: systemPrompt,
    modelParams: {
      model: "gemini-2.5-flash",
      temperature: 0.7,
      maxTokens: 100000,
    },
    stream: false,
  };
}
