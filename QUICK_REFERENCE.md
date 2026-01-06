# Mira System - Quick Reference Guide

## Technology Stack Overview

### Core Technologies

- **Frontend**: Next.js 14 (App Router), React, Redux Toolkit, Tailwind CSS
- **Backend**: Next.js API Routes, Drizzle ORM
- **Database**: PostgreSQL (Supabase) with pgvector extension
- **AI Models**:
  - Google Gemini 2.5 Flash (task generation, chat)
  - Google Gemini Embedding 001 (1536 dimensions)
- **Authentication**: Supabase Auth
- **Integrations**: Nango (OAuth management)
- **Scheduling**: pgcron (Supabase PostgreSQL extension)

---

## Key Flows Summary

### 1. Authentication

**Flow**: User → Login Page → Supabase Auth → Callback → AuthProvider → Dashboard
**Tech**: Supabase Auth UI, Redux state management, Next.js middleware

### 2. Keyword Mapping

**Flow**: User creates mappings → Database stores → AI uses during task generation
**Purpose**: Map keywords to priorities/statuses for automatic assignment
**Storage**: `priority_mappings`, `status_mappings` tables

### 3. AI Workflow (Event Processing)

**Trigger**: pgcron (every 5 min) OR Nango webhook
**Process**:

1. Fetch unprocessed `source_events`
2. Batch by user & platform
3. Fetch user context (mappings, priorities, statuses)
4. Generate AI prompt with context
5. Process with Gemini 2.5 Flash
6. Validate tasks with AI
7. Generate embeddings (Gemini Embedding 001)
8. Bulk create tasks with embeddings
9. Mark events as processed

### 4. Task Management

**Features**:

- Create/update/delete tasks
- Move tasks between statuses
- Assign priorities
- Custom status/priority creation
- Embedding auto-updates on task changes

### 5. RAG Chat

**Flow**: User message → Generate query embedding → Vector similarity search → Build context → AI response
**Search**: pgvector cosine distance, similarity threshold 0.5, top 10 results
**Context**: Includes task title, description, status, priority, dates

### 6. Third-Party Integration (Nango)

**Flow**: User connects → Nango OAuth → Webhook → Store integration → Sync webhooks → Create source_events
**Benefits**: Automatic token refresh, secure storage, sync management
**Platforms**: Slack, Gmail, Google Calendar

---

## Database Tables

| Table               | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `users`             | User accounts                                       |
| `integrations`      | Connected third-party accounts                      |
| `source_events`     | Raw events from integrations (before AI processing) |
| `tasks`             | Processed tasks with pgvector embeddings            |
| `task_statuses`     | Custom status definitions                           |
| `task_priorities`   | Custom priority definitions                         |
| `priority_mappings` | Keyword → Priority mappings                         |
| `status_mappings`   | Keyword → Status mappings                           |
| `chat_sessions`     | AI chat conversation sessions                       |
| `chat_messages`     | Individual chat messages                            |

---

## API Endpoints

### Authentication

- `POST /api/auth/logout` - Logout user

### Tasks

- `GET /api/tasks` - List tasks
- `POST /api/tasks/create` - Create task
- `PATCH /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Statuses & Priorities

- `GET /api/statuses` - List statuses
- `POST /api/statuses` - Create status
- `PATCH /api/statuses/[id]` - Update status
- `DELETE /api/statuses/[id]` - Delete status
- `GET /api/priorities` - List priorities
- `POST /api/priorities` - Create priority
- `PATCH /api/priorities/[id]` - Update priority
- `DELETE /api/priorities/[id]` - Delete priority

### Keyword Mappings

- `GET /api/priority-mappings` - List priority mappings
- `POST /api/priority-mappings` - Create priority mapping
- `PATCH /api/priority-mappings/[id]` - Update priority mapping
- `GET /api/status-mappings` - List status mappings
- `POST /api/status-mappings` - Create status mapping
- `PATCH /api/status-mappings/[id]` - Update status mapping

### Integrations

- `POST /api/integrations/connect/session` - Create Nango session
- `POST /api/integrations/webhook` - Receive Nango webhooks
- `GET /api/integrations` - List user integrations

### AI Chat

- `POST /api/assistant/chat` - Non-streaming chat
- `POST /api/assistant/chat/stream` - Streaming chat (SSE)

### Processing

- `POST /api/jobs/events/process` - Process unprocessed events (called by pgcron)

---

## Key Concepts

### Embeddings

- **Model**: Gemini Embedding 001
- **Dimensions**: 1536
- **Content**: Task title, description, status label, priority label, dates, platform
- **Storage**: PostgreSQL pgvector column in `tasks` table
- **Update**: Regenerated whenever task title, description, status, priority, or dates change

### Vector Search

- **Method**: Cosine distance
- **Similarity**: `1 - cosine_distance`
- **Threshold**: 0.5
- **Results**: Top 10 most similar tasks
- **Usage**: RAG chat context retrieval

### Batch Processing

- Events grouped by `userId` and `platform`
- Each batch processed independently
- Errors in one batch don't affect others
- Summary returned with counts and errors

### Content Filtering

AI filters out:

- Email campaigns & marketing
- Automated notifications
- Spam & low-value content
- Informational-only content
- Personal/non-work content
- Generic calendar events
- Cancelled events/emails

Only creates tasks for actionable, work-related content.

---

## Cron Job Configuration

**Service**: pgcron (Supabase PostgreSQL extension)
**Endpoint**: `POST /api/jobs/events/process`
**Frequency**: Every 5 minutes (configurable)
**Purpose**: Process unprocessed `source_events` entries

---

## Webhook Flow

1. Nango syncs data from provider
2. Sends webhook to `/api/integrations/webhook`
3. Webhook handler:
   - Verifies signature
   - Fetches new records via Nango SDK
   - Creates `source_events` entry
   - Updates last sync time
4. Cron job processes new events

---

## Security

- **Auth**: Supabase Auth with HTTP-only cookies
- **Webhooks**: Signature verification using Nango secret key
- **API Routes**: Middleware extracts user from session
- **Database**: Row-level security (user-scoped queries) (Not enabled as of now)

---

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_GENAI_API_KEY`
- `NANGO_SECRET_KEY`
- `NANGO_PUBLIC_KEY` (frontend)
