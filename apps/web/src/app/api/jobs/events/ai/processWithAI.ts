import { makeAICall } from "@/lib/genai/model";
import type { AIRequestConfig } from "@/lib/genai/types";
import type { CleanedSourceEvent } from "../handlers/cleanSourceEvents";

export interface ParsedTask {
  title: string;
  platform: string;
  sourceEventId: string;
  description?: string;
  priorityId?: string;
  statusId?: string;
  dueDate?: string;
}

export interface TaskWithSource extends ParsedTask {
  sourceEventId: string;
  sourcePlatform: string;
}

/**
 * Calls AI model to generate tasks from source events and parses the response
 */
export async function processWithAI(
  promptConfig: AIRequestConfig,
  sourceEvents: CleanedSourceEvent[]
): Promise<TaskWithSource[]> {
  // Call AI model
  const response = await makeAICall(promptConfig);

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
    let parsedTasks: ParsedTask[];
    try {
      parsedTasks = JSON.parse(content);
    } catch (error) {
      throw new Error(
        `Failed to parse AI response as JSON: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    // Validate it's an array
    if (!Array.isArray(parsedTasks)) {
      throw new Error("AI response is not an array of tasks");
    }

    // Map tasks to include source event information
    const sourceEventsMap = new Map(
      sourceEvents.map((event) => [event.id, event])
    );

    const tasksWithSource: TaskWithSource[] = parsedTasks.map((task) => {
      // Validate that sourceEventId exists in source events
      const sourceEvent = sourceEventsMap.get(task.sourceEventId);
      if (!sourceEvent) {
        console.info(
          `Source event ID ${task.sourceEventId} not found in provided source events`
        );
      }

      // Validate platform matches
      if (sourceEvent?.platform !== task.platform) {
        console.info(
          `Platform mismatch: task platform "${task.platform}" does not match source event platform "${sourceEvent?.platform}" for event ${task.sourceEventId}`
        );
      }

      return {
        ...task,
        sourcePlatform: task.platform,
      };
    });

    return tasksWithSource;
  } else {
    throw new Error("AI response is a stream, expected non-streaming response");
  }
}
