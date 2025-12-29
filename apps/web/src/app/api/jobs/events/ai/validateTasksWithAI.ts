import { makeAICall } from "@/lib/genai/model";
import { buildTaskValidationPrompt } from "./prompts/taskValidationPrompt";
import type { UserContext } from "../handlers/fetchUserContext";
import type { TaskWithSource } from "./processWithAI";

export interface ValidatedTask extends TaskWithSource {
  title: string;
  platform: string;
  description?: string;
  priorityId?: string;
  statusId: string;
  dueDate?: string;
}

export interface ValidationResponse {
  valid: boolean;
  tasks: ValidatedTask[];
  corrections: string[];
}

/**
 * Validates parsed tasks using AI model against task schema
 */
export async function validateTasksWithAI(
  parsedTasks: TaskWithSource[],
  context: UserContext
): Promise<ValidatedTask[]> {
  // Build validation prompt
  const validationPrompt = buildTaskValidationPrompt(parsedTasks, context);

  // Call AI model for validation
  const response = await makeAICall({
    prompt: validationPrompt,
    modelParams: {
      model: "gemini-2.5-flash",
      temperature: 0.5, // Medium temperature for validation
      maxTokens: 2000,
    },
    stream: false,
  });

  // Ensure we have content (not a stream)
  if (typeof response === "object" && "content" in response) {
    let content = response.content;

    // Remove markdown code blocks if present
    content = content.trim();
    if (content.startsWith("```json")) {
      content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    } else if (content.startsWith("```")) {
      content = content.replace(/^```\n?/, "").replace(/\n?```$/, "");
    }

    // Parse JSON response
    let validationResult: ValidationResponse;
    try {
      validationResult = JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to parse validation response as JSON: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    // Check if validation passed
    if (!validationResult.valid) {
      throw new Error(
        `Task validation failed: ${validationResult.corrections.join(", ")}`
      );
    }

    // Ensure all tasks have statusId (use default if missing)
    // Match validated tasks to original tasks by index to preserve source event info
    const validatedTasks: ValidatedTask[] = validationResult.tasks.map(
      (task, index) => {
        const originalTask = parsedTasks[index];

        return {
          ...task,
          sourceEventId: originalTask?.sourceEventId || "",
          sourcePlatform: originalTask?.sourcePlatform || "",
          // Ensure statusId is always present
          statusId: task.statusId || context.defaultStatusId || "",
        };
      }
    );

    return validatedTasks;
  } else {
    throw new Error(
      "Validation response is a stream, expected non-streaming response"
    );
  }
}
