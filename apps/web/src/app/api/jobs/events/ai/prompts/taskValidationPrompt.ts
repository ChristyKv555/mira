import type { UserContext } from "../../handlers/fetchUserContext";

export interface ParsedTask {
  title: string;
  description?: string;
  priorityId?: string;
  statusId?: string;
  dueDate?: string;
}

/**
 * Builds the validation prompt for validating parsed tasks against the task schema
 */
export function buildTaskValidationPrompt(
  parsedTasks: ParsedTask[],
  context: UserContext
): string {
  const prioritiesList = context.priorities
    .map((p) => `- ${p.label} (ID: ${p.id})`)
    .join("\n");

  const statusesList = context.statuses
    .map((s) => `- ${s.label} (ID: ${s.id})`)
    .join("\n");

  const validPriorityIds = context.priorities.map((p) => p.id);
  const validStatusIds = context.statuses.map((s) => s.id);

  // Extract only task fields (exclude sourceEventId and sourcePlatform)
  const tasksToValidate = parsedTasks.map((task) => ({
    title: task.title,
    description: task.description,
    priorityId: task.priorityId,
    statusId: task.statusId,
    dueDate: task.dueDate,
  }));

  return `You are an AI assistant that validates task data against a schema.

## Task Schema Requirements

### Required Fields
- title: string (must be non-empty)

### Optional Fields
- description: string (can be empty or omitted)
- priorityId: string (must be a valid UUID from the available priorities list, or omitted)
- statusId: string (must be a valid UUID from the available statuses list, or omitted)
- dueDate: string (must be a valid ISO 8601 date string in format YYYY-MM-DDTHH:mm:ss.sssZ, or omitted)

## Available Priorities (Valid priorityId values)
${prioritiesList || "No priorities available"}

## Available Statuses (Valid statusId values)
${statusesList || "No statuses available"}

## Default Status
If statusId is missing or invalid, use: ${context.defaultStatusId || "N/A"}

## Tasks to Validate

\`\`\`json
${JSON.stringify(tasksToValidate, null, 2)}
\`\`\`

## Validation Rules

1. **Title Validation**:
   - Must be present and non-empty string
   - Trim whitespace
   - If missing or empty, reject the task

2. **Description Validation**:
   - Can be omitted or empty string
   - If present, must be a string
   - Trim whitespace

3. **PriorityId Validation**:
   - Must be a valid UUID from the available priorities list
   - If invalid or not in list, remove the field (set to null/omit)
   - Valid IDs: ${validPriorityIds.join(", ")}

4. **StatusId Validation**:
   - Must be a valid UUID from the available statuses list
   - If invalid or not in list, use default statusId: ${context.defaultStatusId || "N/A"}
   - Valid IDs: ${validStatusIds.join(", ")}

5. **DueDate Validation**:
   - Must be a valid ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ)
   - If invalid format, remove the field (set to null/omit)
   - If empty string, remove the field

## Output Format

Return a JSON object with this structure:
\`\`\`json
{
  "valid": true,
  "tasks": [
    {
      "title": "Validated task title",
      "description": "Validated description or omitted",
      "priorityId": "validated-uuid-or-omitted",
      "statusId": "validated-uuid-or-default",
      "dueDate": "validated-ISO-string-or-omitted"
    }
  ],
  "corrections": ["List any corrections made"]
}
\`\`\`

If validation fails for any task, set "valid": false and include error details in "corrections".

Return ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text outside the JSON.`;
}
