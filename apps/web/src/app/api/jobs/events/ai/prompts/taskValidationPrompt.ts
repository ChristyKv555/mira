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

  console.log("Tasks to validate", tasksToValidate);
  return `You are an AI assistant that validates task data against a schema.

## CRITICAL JSON VALIDITY REQUIREMENTS

**ABSOLUTELY MANDATORY**: Your response MUST be valid, parseable JSON. Follow these rules with extreme care:

1. **VALID JSON ONLY**: Return ONLY a valid JSON array. No text before or after. No markdown code blocks. No explanations. Just pure JSON that can be parsed by JSON.parse().

2. **PROPER STRING ESCAPING** (CRITICAL):
   - All strings MUST be properly quoted with double quotes: "string"
   - Escape all double quotes inside strings with backslash: "He said \\"hello\\""
   - Escape all backslashes: "Path: C:\\\\Users\\\\file"
   - Escape newlines: "Line 1\\nLine 2" (NOT actual newlines)
   - Escape tabs: "Column1\\tColumn2"
   - Escape carriage returns: "Text\\rMore text"
   - Convert actual newlines in descriptions to \\n (do NOT use real newlines)
   - All special characters must be properly escaped

3. **NO INVALID VALUES**:
   - Never use \`null\` for string fields - use empty string "" or omit
   - Never use \`undefined\` - omit the field instead
   - Never use unquoted strings
   - All UUIDs must be valid format strings in quotes
   - All dates must be valid ISO 8601 strings in quotes

4. **REQUIRED FIELD VALIDATION**: A task MUST have ALL required fields (title, description, statusId) to be included. If any required field is missing or invalid, skip the entire task silently.

5. **CLEAN INVALID VALUES**: Before including a task:
   - Remove any fields with \`null\`, \`undefined\`, or empty string values (except description which is required)
   - Remove any fields with invalid UUIDs
   - Remove any fields with invalid date formats
   - Only include fields with valid, non-empty values
   - Ensure all strings are properly escaped (quotes, newlines, backslashes)

6. **EMPTY ARRAY IF NO VALID TASKS**: If no tasks pass validation, return exactly: []

7. **NO ERRORS OR EXPLANATIONS**: Never include error messages, warnings, or any explanatory text. Just return the JSON array.

**CRITICAL**: Your response will be parsed with JSON.parse(). If it fails to parse, the entire process fails. Ensure every character is valid JSON.

## Task Schema Requirements

### Required Fields
- title: string (must be non-empty)
- description: string (must be a non-empty string)
- priorityId: string (must be a valid UUID from the available priorities list, or omitted)
- statusId: string (must be a valid UUID from the available statuses list)

### Optional Fields
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
   - **CRITICAL**: If missing or empty after trimming, skip this task entirely. Do not include it in the response.

2. **Description Validation**:
   - **REQUIRED**: Must be present and a non-empty string
   - Trim whitespace
   - **CRITICAL**: If missing, empty, or not a valid string, skip this task entirely. Do not include it in the response.
   - **CRITICAL**: When writing descriptions with multiple lines, convert newlines to \\n escape sequences. Do NOT use actual newlines in JSON strings.

3. **PriorityId Validation**:
   - Must be a valid UUID from the available priorities list
   - **CRITICAL**: If invalid, not in list, or empty string, COMPLETELY OMIT the field from the task object (do not set to null, do not include the key)
   - Only include priorityId if it is a valid UUID from the list
   - Valid IDs: ${validPriorityIds.join(", ")}

4. **StatusId Validation**:
   - **REQUIRED**: Must be present and a valid UUID from the available statuses list
   - If missing or invalid, use default statusId: ${context.defaultStatusId || "N/A"}
   - **CRITICAL**: If no valid statusId can be determined (including default), skip this task entirely
   - Valid IDs: ${validStatusIds.join(", ")}

5. **DueDate Validation**:
   - Must be a valid ISO 8601 date string (YYYY-MM-DDTHH:mm:ss.sssZ)
   - **CRITICAL**: If invalid format, empty string, or null, COMPLETELY OMIT the field from the task object (do not set to null, do not include the key)
   - Only include dueDate if it is a valid ISO 8601 date string

## Output Format

**CRITICAL JSON STRUCTURE RULES**:

1. **Start with [ and end with ]** - It must be a valid JSON array
2. **Each task must be a valid JSON object** with:
   - Required fields: "title" (string), "description" (string), "statusId" (string UUID)
   - Optional fields: "priorityId" (string UUID, omit if invalid), "dueDate" (ISO string, omit if invalid)
3. **Proper string escaping** - All strings must be properly escaped:
   - Use double quotes: "text"
   - Escape quotes: "He said \\"hello\\""
   - Escape newlines: "Line 1\\nLine 2" (NOT actual newlines)
   - Escape backslashes: "Path: C:\\\\Users"
4. **Omit invalid optional fields completely** - Do not include the key at all if the value is invalid
5. **No null values** - Never use null, use empty string "" or omit the field
6. **Valid UUIDs only** - All UUIDs must match format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

**Example of VALID output**:
[
  {
    "title": "Complete project documentation",
    "description": "Write comprehensive docs for the API. Include examples and best practices.",
    "statusId": "${context.defaultStatusId || "default-uuid"}",
    "priorityId": "${validPriorityIds[0] || "priority-uuid"}",
    "dueDate": "2024-12-31T23:59:59.000Z"
  },
  {
    "title": "Review code changes",
    "description": "Review pull request #123. Check for bugs and performance issues.",
    "statusId": "${context.defaultStatusId || "default-uuid"}"
  },
  {
    "title": "Multi-line description task",
    "description": "First line\\nSecond line\\nThird line",
    "statusId": "${context.defaultStatusId || "default-uuid"}",
    "priorityId": "${validPriorityIds[0] || "priority-uuid"}"
  }
]

**Example of INVALID output (DO NOT DO THIS)**:
- Unescaped newlines: {"description": "Line 1
Line 2"} ❌ (Use: {"description": "Line 1\\nLine 2"})
- Unescaped quotes: {"description": "He said "hello""} ❌ (Use: {"description": "He said \\"hello\\""})
- Unquoted strings: {title: "Task"} ❌ (Use: {"title": "Task"})
- Actual newlines in JSON: {
  "title": "Task"
} ❌ (Must be on single line or properly formatted)
- Including null: {"title": "Task", "priorityId": null} ❌ (Omit field instead)
- Including undefined: {"title": "Task", "dueDate": undefined} ❌ (Omit field instead)
- Missing required fields: {"title": "Task"} ❌ (Must include all required fields)
- Invalid UUIDs: {"statusId": "not-a-uuid"} ❌ (Must be valid UUID)
- Empty strings for required: {"title": "", "description": "..."} ❌ (Skip task if required field is empty)

**FINAL CHECKLIST BEFORE RESPONDING**:
1. ✓ Is it valid JSON that can be parsed by JSON.parse()?
2. ✓ Are all strings properly quoted and escaped?
3. ✓ Are newlines in descriptions escaped as \\n (not actual newlines)?
4. ✓ Are quotes inside strings escaped with backslash?
5. ✓ Does every task have title, description, and statusId?
6. ✓ Are all UUIDs valid format?
7. ✓ Are all optional invalid fields completely omitted (not null)?
8. ✓ Is it just a JSON array with no text before/after?
9. ✓ If no valid tasks, is it exactly []?

Return ONLY the JSON array. Nothing else.`;
}
