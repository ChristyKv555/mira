import { NextResponse } from "next/server";
import { fetchUnprocessedEvents } from "../handlers/fetchUnprocessedEvents";
import { batchEventsByUser } from "../handlers/batchEventsByUser";
import { fetchUserContext } from "../handlers/fetchUserContext";
import { cleanSourceEvents } from "../handlers/cleanSourceEvents";
import { generateAIPrompt } from "../ai/generateAIPrompt";
import { processWithAI } from "../ai/processWithAI";
import { validateTasksWithAI } from "../ai/validateTasksWithAI";
import { bulkCreateTasks } from "../handlers/bulkCreateTasks";
import { markEventsProcessed } from "../handlers/markEventsProcessed";

interface ProcessingSummary {
  usersProcessed: number;
  tasksCreated: number;
  eventsProcessed: number;
  errors: Array<{
    userId: string;
    error: string;
  }>;
}

export async function POST() {
  const summary: ProcessingSummary = {
    usersProcessed: 0,
    tasksCreated: 0,
    eventsProcessed: 0,
    errors: [],
  };

  try {
    // Step 1: Fetch unprocessed events
    const events = await fetchUnprocessedEvents();

    if (events.length === 0) {
      console.info(
        "--------------------------------No unprocessed events found--------------------------------"
      );
      return NextResponse.json({
        message: "No unprocessed events found",
        summary,
      });
    }

    // Step 2: Batch events by user and platform/integration
    const userBatches = batchEventsByUser(events);

    // Step 3: Process each user batch
    for (const [userId, platformBatches] of userBatches.entries()) {
      try {
        // Fetch user context (mappings, priorities, statuses)
        const context = await fetchUserContext(userId);

        // Process each platform/integration batch for this user
        for (const [platformKey, userEvents] of platformBatches.entries()) {
          try {
            // Clean source events (extract only platform and raw_content)
            const cleanedEvents = cleanSourceEvents(userEvents);

            // Generate AI prompt
            const promptConfig = generateAIPrompt(cleanedEvents, context);

            // Process with AI to generate tasks
            const parsedTasks = await processWithAI(
              promptConfig,
              cleanedEvents
            );

            // Validate tasks with AI
            const validatedTasks = await validateTasksWithAI(
              parsedTasks,
              context
            );

            // Bulk create tasks
            const createdTasks = await bulkCreateTasks(
              validatedTasks,
              userId,
              context
            );

            // Mark events as processed
            const eventIds = userEvents.map((e) => e.id);
            await markEventsProcessed(eventIds);

            // Update summary
            summary.tasksCreated += createdTasks.length;
            summary.eventsProcessed += eventIds.length;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Unknown error";
            console.error(
              `Error processing events for user ${userId}, platform ${platformKey}:`,
              error
            );
            summary.errors.push({
              userId,
              error: `Platform ${platformKey}: ${errorMessage}`,
            });
            // Continue with next batch
          }
        }

        summary.usersProcessed++;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`Error processing user ${userId}:`, error);
        summary.errors.push({
          userId,
          error: `User context: ${errorMessage}`,
        });
        // Continue with next user
      }
    }

    return NextResponse.json({
      message: "Processing completed",
      summary,
    });
  } catch (error) {
    console.error("Error in events processing job:", error);
    return NextResponse.json(
      {
        error: "Failed to process events",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
        summary,
      },
      { status: 500 }
    );
  }
}
