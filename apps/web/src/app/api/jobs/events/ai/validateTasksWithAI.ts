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

// Validation response is now just an array of validated tasks
type ValidationResponse = ValidatedTask[];

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
      maxTokens: 100000,
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

    // Clean common JSON issues
    // Remove any text before the first [ or after the last ]
    const firstBracket = content.indexOf("[");
    const lastBracket = content.lastIndexOf("]");
    if (
      firstBracket !== -1 &&
      lastBracket !== -1 &&
      lastBracket > firstBracket
    ) {
      content = content.substring(firstBracket, lastBracket + 1);
    }

    console.log("Validation AI Response content", content);

    // Parse JSON response
    let validatedTasksArray: ValidationResponse;
    try {
      validatedTasksArray = JSON.parse(content);
    } catch (error) {
      // Log the problematic content for debugging
      console.error("Failed to parse validation JSON. Content:", content);
      console.error("JSON Parse Error:", error);

      // Try to extract just the array part if there's extra text
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        try {
          validatedTasksArray = JSON.parse(arrayMatch[0]);
        } catch (retryError) {
          throw new Error(
            `Failed to parse validation response as JSON after retry: ${retryError instanceof Error ? retryError.message : "Unknown error"}. Original error: ${error instanceof Error ? error.message : "Unknown error"}. Content preview: ${content.substring(0, 200)}...`
          );
        }
      } else {
        throw new Error(
          `Failed to parse validation response as JSON: ${error instanceof Error ? error.message : "Unknown error"}. Content preview: ${content.substring(0, 200)}...`
        );
      }
    }

    // Validate it's an array
    if (!Array.isArray(validatedTasksArray)) {
      throw new Error("Validation response is not an array");
    }

    // Create a map of original tasks by their title for matching (since order may change)
    const originalTasksMap = new Map(
      parsedTasks.map((task) => [task.title, task])
    );

    // Match validated tasks to original tasks to preserve source event info
    const validatedTasks: ValidatedTask[] = validatedTasksArray.map((task) => {
      const originalTask = originalTasksMap.get(task.title);

      return {
        ...task,
        sourceEventId: originalTask?.sourceEventId || "",
        sourcePlatform: originalTask?.sourcePlatform || task.platform || "",
        platform: originalTask?.platform || task.platform || "",
        // Ensure statusId is always present
        statusId: task.statusId || context.defaultStatusId || "",
      };
    });

    return validatedTasks;
  } else {
    throw new Error(
      "Validation response is a stream, expected non-streaming response"
    );
  }
}
