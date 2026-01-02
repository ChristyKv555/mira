# Mira System Architecture & Flow Documentation

## Overview

Mira is an AI-powered task management system that aggregates tasks from multiple sources (Slack, Google Calendar, Gmail), processes them using AI, and provides an intelligent task management interface with RAG-powered chat assistance.

---

## 1. Authentication Flow

### Authentication Technology Stack

- **Supabase Auth**: OAuth and email/password authentication
- **Next.js**: Server-side and client-side auth handling
- **Redux**: Client-side auth state management
- **Auth UI**: Supabase Auth UI React components

### Authentication Flow Diagram

```text
┌─────────────┐
│   User      │
│  Visits App │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  /login Page        │
│  - Supabase Auth UI │
│  - Email/Password   │
└──────┬──────────────┘
       │
       │ User enters credentials
       ▼
┌─────────────────────┐
│  Supabase Auth      │
│  - Validates        │
│  - Creates session  │
└──────┬──────────────┘
       │
       │ Redirects with code
       ▼
┌─────────────────────┐
│  /auth/callback     │
│  - Exchange code    │
│  - Create session   │
└──────┬──────────────┘
       │
       │ Session created
       ▼
┌─────────────────────┐
│  AuthProvider       │
│  - Listens to auth  │
│    state changes    │
│  - Updates Redux    │
│  - Redirects to     │
│    /dashboard       │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Dashboard          │
│  - Protected route  │
│  - Requires auth    │
└─────────────────────┘
```

### Key Components

1. **Login Page** (`/login`): Uses Supabase Auth UI component
2. **Callback Route** (`/auth/callback`): Handles OAuth redirects, exchanges code for session
3. **AuthProvider**: React context that:
   - Checks initial user session on mount
   - Subscribes to auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
   - Updates Redux store with user credentials
   - Handles route redirects based on auth state
4. **Middleware**: Protects routes, extracts user data from session

### Session Management

- Sessions stored in Supabase (HTTP-only cookies)
- Token refresh handled automatically by Supabase
- Client-side state synced via Redux store

---

## 2. Dashboard Overview

### Dashboard Technology Stack

- **Next.js App Router**: Page routing and rendering
- **React**: UI components
- **Redux Toolkit Query**: Data fetching and caching
- **Framer Motion**: Animations

### Dashboard Structure

```text
┌─────────────────────────────────────────────────────────┐
│                    Dashboard Layout                      │
├─────────────────────────────────────────────────────────┤
│  Header: Logo, Navigation, Theme Toggle, Logout        │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ Task Statistics  │  │ High Attention   │           │
│  │ - Status view    │  │ Tasks            │           │
│  │ - Priority view  │  │ - High priority  │           │
│  │ - Due date view  │  │ - Overdue        │           │
│  └──────────────────┘  └──────────────────┘           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Source-Based Tasks                               │  │
│  │ - Grouped by platform (Slack, Gmail, Calendar) │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Quick Actions: Tasks | Connect | Analytics             │
└─────────────────────────────────────────────────────────┘
```

### Key Pages

1. **Dashboard** (`/dashboard`): Overview with statistics and high-priority tasks
2. **Tasks** (`/dashboard/tasks`): Kanban board for task management
3. **Connect** (`/dashboard/connect`): Integration management
4. **Keywords** (`/dashboard/keywords`): Keyword mapping configuration
5. **Ask AI** (`/dashboard/ask-ai`): RAG-powered chat interface
6. **Settings** (`/dashboard/settings`): User settings

---

## 3. Keyword Mapping Flow

### Keyword Mapping Technology Stack

- **PostgreSQL**: Stores priority and status mappings
- **Drizzle ORM**: Database queries
- **React**: UI for mapping management

### Use Case

Users can create custom keyword mappings that map specific words/phrases to:

- **Priority levels**: When content contains keywords, assign corresponding priority
- **Status values**: When content contains keywords, assign corresponding status

These mappings are used during AI task generation to automatically assign priorities and statuses.

### Keyword Mapping Flow Diagram

```text
┌─────────────────────┐
│  User navigates to  │
│  /dashboard/keywords│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Keywords Page      │
│  - Lists priorities │
│  - Lists statuses   │
└──────┬──────────────┘
       │
       │ User selects Priority/Status
       ▼
┌─────────────────────┐
│  Mapping Interface  │
│  - Shows keywords    │
│  - Add/Delete        │
└──────┬──────────────┘
       │
       │ User adds keyword
       ▼
┌─────────────────────┐
│  API: POST/PUT      │
│  /api/priority-     │
│  mappings or        │
│  /api/status-       │
│  mappings           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Database           │
│  - priority_mappings│
│  - status_mappings  │
│  Stores:            │
│  - userId           │
│  - priorityId/      │
│    statusId         │
│  - keywords[]       │
│  - isActive         │
└─────────────────────┘
```

### Keyword Mapping Database Schema

- **priority_mappings**: userId, priorityId, keywords[], isActive
- **status_mappings**: userId, statusId, keywords[], isActive

### Usage in AI Workflow

When processing source events:

1. Fetch all active mappings for user
2. Include mappings in AI prompt
3. AI matches keywords in content to assign priority/status
4. If multiple priority keywords match, uses highest level priority

---

## 4. AI Workflow - Event Processing

### AI Workflow Technology Stack

- **PostgreSQL + pgcron**: Scheduled cron job in Supabase
- **Google Gemini 2.5 Flash**: AI model for task generation and validation
- **Google Gemini Embedding 001**: Embedding generation (1536 dimensions)
- **PostgreSQL pgvector**: Vector storage for embeddings
- **Next.js API Routes**: Processing endpoints

### AI Workflow Flow Diagram

```text
┌─────────────────────────────────────────────────────────┐
│                    Trigger Mechanism                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Option 1: Cron (pgcron in Supabase)                    │
│  ┌──────────────┐                                        │
│  │ pgcron       │───Scheduled───► POST /api/jobs/events/│
│  │ (Supabase)   │    (e.g., every 5 min)    /process    │
│  └──────────────┘                                        │
│                                                          │
│  Option 2: Webhook (from Nango)                         │
│  ┌──────────────┐                                        │
│  │ Nango        │───New records───► POST /api/integrations│
│  │ Integration  │                    /webhook            │
│  └──────────────┘                                        │
│                          │                               │
│                          ▼                               │
│                  ┌─────────────────┐                    │
│                  │ Creates entry in │                    │
│                  │ source_events    │                    │
│                  │ (processedAt=null)│                  │
│                  └─────────────────┘                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Processing Pipeline                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Step 1: Fetch Unprocessed Events                      │
│  ┌──────────────────────────────────────────────┐      │
│  │ SELECT * FROM source_events                   │      │
│  │ WHERE processed_at IS NULL                    │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 2: Batch by User & Platform                      │
│  ┌──────────────────────────────────────────────┐      │
│  │ Group events by:                             │      │
│  │ - userId                                      │      │
│  │ - platform (slack/gmail/google-calendar)     │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 3: Fetch User Context                            │
│  ┌──────────────────────────────────────────────┐      │
│  │ - Priority mappings (keywords)                │      │
│  │ - Status mappings (keywords)                  │      │
│  │ - All task priorities                         │      │
│  │ - All task statuses                           │      │
│  │ - Default status ID                           │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 4: Clean Source Events                          │
│  ┌──────────────────────────────────────────────┐      │
│  │ Extract:                                      │      │
│  │ - id (sourceEventId)                         │      │
│  │ - platform                                    │      │
│  │ - rawContent                                 │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 5: Generate AI Prompt                           │
│  ┌──────────────────────────────────────────────┐      │
│  │ System Prompt includes:                      │      │
│  │ - Available priorities & mappings           │      │
│  │ - Available statuses & mappings             │      │
│  │ - Content filtering rules                    │      │
│  │ - Task extraction instructions               │      │
│  │                                              │      │
│  │ User Prompt includes:                        │      │
│  │ - Cleaned source events                     │      │
│  │ - Instructions to filter & extract          │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 6: Process with AI (Gemini 2.5 Flash)           │
│  ┌──────────────────────────────────────────────┐      │
│  │ - Model: gemini-2.5-flash                    │      │
│  │ - Temperature: 0.7                           │      │
│  │ - Max Tokens: 100000                         │      │
│  │ - Returns: JSON array of tasks               │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 7: Validate Tasks with AI                       │
│  ┌──────────────────────────────────────────────┐      │
│  │ - Validates task structure                   │      │
│  │ - Ensures required fields present            │      │
│  │ - Verifies priorityId/statusId exist         │      │
│  │ - Returns validated tasks                    │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 8: Generate Embeddings                          │
│  ┌──────────────────────────────────────────────┐      │
│  │ For each task:                               │      │
│  │ - Create content string (title, description, │      │
│  │   status, priority, dates, platform)        │      │
│  │ - Generate embedding using                  │      │
│  │   gemini-embedding-001                       │      │
│  │ - Dimensions: 1536                           │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 9: Bulk Create Tasks                            │
│  ┌──────────────────────────────────────────────┐      │
│  │ INSERT INTO tasks (...) VALUES (...)         │      │
│  │ - Includes embedding vector                  │      │
│  │ - Transaction ensures atomicity              │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 10: Mark Events as Processed                    │
│  ┌──────────────────────────────────────────────┐      │
│  │ UPDATE source_events                         │      │
│  │ SET processed_at = NOW()                     │      │
│  │ WHERE id IN (...)                            │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Content Filtering Rules

The AI filters out:

- Email campaigns & marketing
- Automated notifications
- Spam & low-value content
- Informational-only content
- Personal/non-work content
- Generic calendar events
- Cancelled events/emails

Only creates tasks for:

- Actionable work items
- Work-related requests
- Important deadlines
- Meeting action items
- Project-related content
- Direct requests

### Batch Processing

- Events batched by user and platform
- Each batch processed independently
- Errors in one batch don't affect others
- Summary returned with counts and errors

---

## 5. Task Management - Status & Priority

### Task Management Technology Stack

- **PostgreSQL**: Task, status, and priority storage
- **Drizzle ORM**: Database operations
- **Redux Toolkit**: Client state management
- **React**: UI components

### Task Management Flow Diagram

```text
┌─────────────────────────────────────────────────────────┐
│              Task Status & Priority Management           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Creating Custom Status/Priority                        │
│  ┌──────────────────────────────────────────────┐      │
│  │ User clicks "Create Status/Priority"         │      │
│  │ - Enters: label, key, color, order/level    │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  ┌──────────────────────────────────────────────┐      │
│  │ POST /api/statuses or /api/priorities       │      │
│  │ - Validates input                            │      │
│  │ - Checks for duplicate keys                  │      │
│  │ - Auto-assigns order if not provided        │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  ┌──────────────────────────────────────────────┐      │
│  │ Database: task_statuses / task_priorities    │      │
│  │ - Stores: id, userId, label, key, color,    │      │
│  │   order/level, createdAt                     │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
│  Updating Task Status/Priority                          │
│  ┌──────────────────────────────────────────────┐      │
│  │ User drags task to new status column         │      │
│  │ OR selects new priority                       │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  ┌──────────────────────────────────────────────┐      │
│  │ PATCH /api/tasks/[id]                        │      │
│  │ - Updates statusId or priorityId             │      │
│  │ - Regenerates embedding (if title/desc       │      │
│  │   changed)                                    │      │
│  │ - Updates updatedAt timestamp                │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  ┌──────────────────────────────────────────────┐      │
│  │ Embedding Update (if needed)                 │      │
│  │ - Creates new content string                 │      │
│  │ - Generates embedding via Gemini             │      │
│  │ - Updates task.embedding                     │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
│  Deleting Status/Priority                              │
│  ┌──────────────────────────────────────────────┐      │
│  │ DELETE /api/statuses/[id] or                 │      │
│  │ DELETE /api/priorities/[id]                  │      │
│  │ - Checks if in use by tasks                  │      │
│  │ - Prevents deletion if in use               │      │
│  │ - Cascades or sets to null based on schema  │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Task Update Flow

When a task is updated:

1. Check which fields changed
2. If title, description, status, priority, or dates changed:
   - Fetch current status/priority labels
   - Create new content string for embedding
   - Generate new embedding
   - Update task with new embedding
3. This ensures RAG search always has current task context

---

## 6. RAG Chat Flow (AI Agent)

### RAG Chat Technology Stack

- **Google Gemini 2.5 Flash**: Chat model
- **Google Gemini Embedding 001**: Query embedding
- **PostgreSQL pgvector**: Vector similarity search
- **Drizzle ORM**: Database queries with cosine distance

### RAG Chat Flow Diagram

```text
┌─────────────────────────────────────────────────────────┐
│                    RAG Chat Flow                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  User sends message                                     │
│  ┌──────────────────────────────────────────────┐      │
│  │ POST /api/assistant/chat/stream             │      │
│  │ Body: { message, sessionId?, type? }       │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 1: Session Management                            │
│  ┌──────────────────────────────────────────────┐      │
│  │ - Get or create chat session                 │      │
│  │ - Load conversation history                  │      │
│  │ - Save user message to chat_messages        │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 2: Generate Query Embedding                      │
│  ┌──────────────────────────────────────────────┐      │
│  │ - Use gemini-embedding-001                   │      │
│  │ - Generate embedding for user message       │      │
│  │ - Dimensions: 1536                           │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 3: Vector Similarity Search                     │
│  ┌──────────────────────────────────────────────┐      │
│  │ SELECT tasks.*,                              │      │
│  │   1 - cosine_distance(embedding, query)      │      │
│  │     AS similarity                             │      │
│  │ FROM tasks                                   │      │
│  │ LEFT JOIN task_statuses ...                  │      │
│  │ LEFT JOIN task_priorities ...                │      │
│  │ WHERE userId = ?                             │      │
│  │   AND similarity > 0.5                       │      │
│  │ ORDER BY cosine_distance ASC                 │      │
│  │ LIMIT 10                                      │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 4: Build System Prompt                          │
│  ┌──────────────────────────────────────────────┐      │
│  │ System prompt includes:                      │      │
│  │ - Role: Task management assistant            │      │
│  │ - Context: Top 10 similar tasks              │      │
│  │   (with status, priority, description)       │      │
│  │ - Instructions: Answer based on tasks       │      │
│  │ - Task details: title, status, priority,    │      │
│  │   description, due date, completion status    │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 5: Generate AI Response                         │
│  ┌──────────────────────────────────────────────┐      │
│  │ - Model: gemini-2.5-flash                    │      │
│  │ - Temperature: 0.7                           │      │
│  │ - Max Tokens: 1000                           │      │
│  │ - Stream: true (SSE)                         │      │
│  │ - Includes conversation history              │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 6: Stream Response & Save                      │
│  ┌──────────────────────────────────────────────┐      │
│  │ - Stream chunks via Server-Sent Events     │      │
│  │ - Save complete response to chat_messages   │      │
│  │ - Update session timestamp                  │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### RAG Chat Database Schema

- **chat_sessions**: id, userId, createdAt, updatedAt
- **chat_messages**: id, chatSessionId, userId, role (user/assistant), content, createdAt

### Similarity Threshold

- Uses cosine distance for similarity
- Threshold: 0.5 (similarity = 1 - cosine_distance)
- Returns top 10 most similar tasks
- Includes joined status and priority labels for context

### Embedding Content Structure

When creating task embeddings, includes:

- Task title
- Task description
- Status label
- Priority label
- Due date
- Completion status
- Created/updated dates
- Source platform

This ensures RAG can match queries to relevant tasks based on all task attributes.

---

## 7. Third-Party Integration Flow (Nango)

### Integration Technology Stack

- **Nango**: OAuth management and token refresh
- **PostgreSQL**: Integration and source event storage
- **Next.js API Routes**: Webhook handlers

### Integration Flow Diagram

```text
┌─────────────────────────────────────────────────────────┐
│              Integration Connection Flow                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Step 1: User Initiates Connection                     │
│  ┌──────────────────────────────────────────────┐      │
│  │ User clicks "Connect" on platform            │      │
│  │ (Slack, Gmail, Google Calendar)              │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 2: Create Nango Session                         │
│  ┌──────────────────────────────────────────────┐      │
│  │ POST /api/integrations/connect/session       │      │
│  │ - Creates Nango connect session              │      │
│  │ - Returns: sessionToken, connectLink         │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 3: Open Nango Connect UI                        │
│  ┌──────────────────────────────────────────────┐      │
│  │ Frontend: nango.openConnectUI()              │      │
│  │ - Opens OAuth flow modal                     │      │
│  │ - User authenticates with provider           │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 4: Nango Handles OAuth                          │
│  ┌──────────────────────────────────────────────┐      │
│  │ Nango:                                        │      │
│  │ - Manages OAuth flow                          │      │
│  │ - Stores tokens securely                     │      │
│  │ - Handles token refresh automatically        │      │
│  │ - Sends webhook on success                   │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 5: Auth Creation Webhook                        │
│  ┌──────────────────────────────────────────────┐      │
│  │ POST /api/integrations/webhook               │      │
│  │ Type: auth, Operation: creation              │      │
│  │ - Verifies webhook signature                 │      │
│  │ - Extracts: connectionId, userId, platform   │      │
│  │ - Creates entry in integrations table        │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  ┌──────────────────────────────────────────────┐      │
│  │ Database: integrations                       │      │
│  │ - id, userId, platform, connectionId,        │      │
│  │   nangoConnectionId, metadata, createdAt     │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Sync Webhook Flow (Data Ingestion)          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Step 1: Nango Sync Trigger                            │
│  ┌──────────────────────────────────────────────┐      │
│  │ Nango periodically syncs data from provider  │      │
│  │ - Fetches new records                        │      │
│  │ - Detects changes                            │      │
│  │ - Sends sync webhook                         │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 2: Sync Webhook Handler                         │
│  ┌──────────────────────────────────────────────┐      │
│  │ POST /api/integrations/webhook               │      │
│  │ Type: sync                                    │      │
│  │ - Verifies signature                          │      │
│  │ - Looks up integration by connectionId       │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 3: Fetch New Records                            │
│  ┌──────────────────────────────────────────────┐      │
│  │ - Uses Nango SDK to fetch records            │      │
│  │ - Filters by modifiedAfter (last sync)       │      │
│  │ - Gets records added since last sync         │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 4: Build Source Event                           │
│  ┌──────────────────────────────────────────────┐      │
│  │ - Generates externalId (unique per record)   │      │
│  │ - Builds metadata JSON (sync info, errors)   │      │
│  │ - Builds rawContent (formatted record data) │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 5: Create Source Event Entry                   │
│  ┌──────────────────────────────────────────────┐      │
│  │ INSERT INTO source_events                    │      │
│  │ - userId, integrationId, platform            │      │
│  │ - externalId, rawContent, metadata           │      │
│  │ - processedAt = NULL (unprocessed)          │      │
│  └──────────────────────────────────────────────┘      │
│                          │                              │
│                          ▼                              │
│  Step 6: Update Last Sync Time                       │
│  ┌──────────────────────────────────────────────┐      │
│  │ UPDATE integrations                          │      │
│  │ SET metadata.lastSyncTime = NOW()            │      │
│  │ - Prevents re-fetching old records           │      │
│  └──────────────────────────────────────────────┘      │
│                                                          │
│  Note: Source event will be processed by cron job     │
│        (see AI Workflow section)                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Supported Platforms

- **Slack**: Messages, threads
- **Google Calendar**: Events, meetings
- **Gmail**: Emails

### Nango Benefits

- **Automatic Token Refresh**: Handles OAuth token refresh automatically
- **Secure Token Storage**: Tokens stored securely in Nango
- **Sync Management**: Handles periodic data syncing
- **Webhook Delivery**: Reliable webhook delivery for events

### Webhook Security

- Webhook signatures verified using Nango secret key
- Prevents unauthorized webhook calls
- Validates payload structure before processing

---

## 8. Complete System Flow

### High-Level Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                        User Actions                          │
├─────────────────────────────────────────────────────────────┤
│  Login → Connect Integrations → Configure Keywords          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Ingestion                           │
├─────────────────────────────────────────────────────────────┤
│  Nango Sync → Webhook → source_events (unprocessed)        │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Processing                            │
├─────────────────────────────────────────────────────────────┤
│  pgcron → Process API → AI Generation → Task Creation     │
│  → Embedding Generation → tasks table                      │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    User Interaction                         │
├─────────────────────────────────────────────────────────────┤
│  Dashboard → View Tasks → Update Status/Priority           │
│  → Chat with AI (RAG) → Manage Keywords                    │
└─────────────────────────────────────────────────────────────┘
```

### Key Database Tables

1. **users**: User accounts
2. **integrations**: Connected third-party accounts (via Nango)
3. **source_events**: Raw events from integrations (before processing)
4. **tasks**: Processed tasks with embeddings
5. **task_statuses**: Custom status definitions
6. **task_priorities**: Custom priority definitions
7. **priority_mappings**: Keyword → Priority mappings
8. **status_mappings**: Keyword → Status mappings
9. **chat_sessions**: AI chat conversation sessions
10. **chat_messages**: Individual chat messages

### Key Technologies Summary

- **Frontend**: Next.js 14, React, Redux Toolkit, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL (Supabase) with pgvector extension
- **AI/ML**: Google Gemini 2.5 Flash, Gemini Embedding 001
- **Auth**: Supabase Auth
- **Integrations**: Nango
- **Scheduling**: pgcron (Supabase)
- **Vector Search**: pgvector cosine distance

---

## Notes for AI Diagram Generation Tools

This document provides structured flow descriptions that can be used with AI-powered diagram generation tools. Each section includes:

- Clear step-by-step flows
- Technology stack information
- ASCII-style flow diagrams
- Database schema references
- API endpoint references

The flows are designed to be:

- **Modular**: Each flow can be understood independently
- **Detailed**: Includes specific technologies and models used
- **Visual**: ASCII diagrams show relationships and data flow
- **Complete**: Covers all major system components and interactions

Use these descriptions with tools like:

- Mermaid diagram generators
- PlantUML
- Draw.io AI
- Excalidraw AI
- Or any other diagram generation tool that accepts structured text descriptions
