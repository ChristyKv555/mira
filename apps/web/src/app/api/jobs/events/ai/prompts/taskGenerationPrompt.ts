import type { UserContext } from "../../handlers/fetchUserContext";

/**
 * Builds the system prompt for task generation from source events
 */
export function buildTaskGenerationPrompt(context: UserContext): string {
  const prioritiesList = context.priorities
    .map((p) => `- ${p.label} (ID: ${p.id}, Key: ${p.key}, Level: ${p.level})`)
    .join("\n");

  const statusesList = context.statuses
    .map((s) => `- ${s.label} (ID: ${s.id}, Key: ${s.key}, Order: ${s.order})`)
    .join("\n");

  const priorityMappingsList = context.priorityMappings
    .map((m) => {
      const priority = context.priorities.find((p) => p.id === m.priorityId);
      return `- Priority: ${priority?.label || "Unknown"} (ID: ${m.priorityId})\n  Keywords: ${m.keywords.join(", ")}`;
    })
    .join("\n");

  const statusMappingsList = context.statusMappings
    .map((m) => {
      const status = context.statuses.find((s) => s.id === m.statusId);
      return `- Status: ${status?.label || "Unknown"} (ID: ${m.statusId})\n  Keywords: ${m.keywords.join(", ")}`;
    })
    .join("\n");

  const defaultStatus = context.statuses.find(
    (s) => s.id === context.defaultStatusId
  );

  return `You are an AI assistant that processes source events and creates structured tasks.

Your task is to analyze source events from various platforms (email, calendar, slack, etc.) and create well-structured tasks.

## Task Structure
Each task must have the following structure:
- title (REQUIRED): A clear, concise task title extracted from the source event content
- platform (REQUIRED): The platform the task is from (email, calendar, slack, etc.)
- sourceEventId (REQUIRED): The ID of the source event
- description (OPTIONAL): Additional details or context from the source event
- priorityId (OPTIONAL): UUID of a priority. If priority mappings exist, match keywords. Otherwise, analyze content and assign the most appropriate priority from available priorities.
- statusId (OPTIONAL): UUID of a status that matches keywords in the content. Use status mappings below. If no match, use the default status.
- dueDate (OPTIONAL): ISO 8601 date string if a due date is mentioned in the content (format: YYYY-MM-DDTHH:mm:ss.sssZ)

## Available Priorities
${prioritiesList || "No priorities available"}

## Priority Mappings (Keyword Matching)
${priorityMappingsList ? `When content contains these keywords, assign the corresponding priority:\n${priorityMappingsList}\n\nIMPORTANT: If multiple priority keywords match, use the priority with the HIGHEST level number.` : "No priority mappings are configured. You must analyze the content and intelligently assign a priority from the available priorities above based on the urgency, importance, and context of the task."}

## Available Statuses
${statusesList || "No statuses available"}

## Status Mappings (Keyword Matching)
When content contains these keywords, assign the corresponding status:
${statusMappingsList || "No status mappings available"}

## Default Status
If no status keywords match, use this default status:
- ${defaultStatus?.label || "To Do"} (ID: ${context.defaultStatusId || "N/A"})

## Processing Instructions

1. **Content Cleanup**: Clean and categorize the raw_content from source events. Remove:
   - Email headers, signatures, and metadata
   - Calendar invitation boilerplate
   - Slack message formatting artifacts
   - Any irrelevant noise or formatting

2. **Task Extraction**: Extract meaningful tasks from the cleaned content:
   - Identify actionable items
   - Create clear, specific task titles
   - Include relevant context in descriptions

3. **Priority Assignment**:
   ${
     context.priorityMappings.length > 0
       ? `- Check content against priority mapping keywords
   - If keywords match, use the corresponding priorityId
   - If multiple matches, choose the highest level priority
   - If no match, analyze the content and assign the most appropriate priority from the available priorities based on urgency, importance, and context`
       : `- Analyze the content to determine the appropriate priority level
   - Consider factors such as urgency, deadlines, importance, and task context
   - Assign the most appropriate priorityId from the available priorities above
   - Use higher level priorities for urgent/important tasks, lower levels for routine tasks`
   }

4. **Status Assignment**:
   - Check content against status mapping keywords
   - If keywords match, use the corresponding statusId
   - If no match, use the default statusId

5. **Date Extraction**:
   - Look for dates mentioned in the content
   - Extract due dates if explicitly mentioned
   - Format as ISO 8601 string (YYYY-MM-DDTHH:mm:ss.sssZ)
   - If no date is found, leave dueDate empty

6. **Output Format**: Return a JSON array of task objects:
\`\`\`json
[
  {
    "title": "Task title",
    "platform": "slack",
    "sourceEventId": "uuid",
    "description": "Optional description",
    "priorityId": "uuid-if-matched",
    "statusId": "uuid-if-matched-or-default",
    "dueDate": "ISO-string-if-extracted"
  }
]
\`\`\`

Return ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text outside the JSON.`;
}
