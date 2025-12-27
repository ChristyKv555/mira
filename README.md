# Mira

**Mira** is an AI-powered task management application that aggregates and intelligently prioritizes tasks from multiple source channels, helping you stay organized and focused on what truly matters.

## 🎯 Overview

Mira connects tasks from various sources (email, Slack, Jira, etc.) into a unified platform and uses AI to intelligently prioritize them, ensuring you never miss important deadlines and stay organized effortlessly.

### Key Features

- **📊 Task Aggregation** - Connect all your task sources in one place
- **🤖 AI Prioritization** - Let AI intelligently prioritize what matters most
- **📅 Deadline Management** - Never miss important deadlines
- **🎨 Modern UI** - Beautiful, responsive interface with dark mode support
- **🔐 User Authentication** - Secure user accounts and session management
- **📱 Multi-Source Integration** - Support for Gmail, Slack, Calendar, and more

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: PostgreSQL with [Drizzle ORM](https://orm.drizzle.team/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) with Redux Persist
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Validation**: [Zod](https://zod.dev/)
- **Monorepo**: [Turborepo](https://turborepo.org/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18
- **pnpm** >= 9.0.0
- **PostgreSQL** database (local or remote)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mira
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env` file in the `apps/web` directory:

```bash
cd apps/web
touch .env
```

Add the following environment variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/mira

# Supabase (for authentication)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google OAuth (for Calendar and Gmail integration)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
# For local development with ngrok, use: https://your-ngrok-url.ngrok.io/api/integrations/google/callback
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/integrations/google/callback

# Google Pub/Sub (for webhooks)
GOOGLE_PUBSUB_TOPIC=google-notifications
GOOGLE_PUBSUB_PROJECT_ID=your_google_cloud_project_id

# Webhook Security
WEBHOOK_SECRET=your_webhook_secret_for_verification

# Optional: Allowed origins for CORS (comma-separated, or use * for all)
# For ngrok: https://your-ngrok-url.ngrok.io
ALLOWED_ORIGINS=*

# AI Model (Gemini)
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder values with your actual credentials:

- `DATABASE_URL`: Replace `username`, `password`, `localhost`, `5432`, and `mira` with your actual PostgreSQL credentials
- `GOOGLE_REDIRECT_URI`: Use your production domain in production, or `http://localhost:3000/api/integrations/google/callback` for local development
- `GOOGLE_PUBSUB_TOPIC`: Name of your Pub/Sub topic (e.g., `google-notifications`)
- `GOOGLE_PUBSUB_PROJECT_ID`: Your Google Cloud project ID

### 4. Database Setup

#### Generate Migration Files

```bash
pnpm db:generate
```

#### Run Migrations

```bash
pnpm db:migrate
```

Alternatively, you can push schema changes directly (for development):

```bash
pnpm db:push
```

#### Open Database Studio (Optional)

```bash
pnpm db:studio
```

This opens Drizzle Studio where you can view and manage your database visually.

### 5. Start Development Server

From the root directory:

```bash
# Start all apps
pnpm dev

# Or start only the web app
pnpm dev --filter=web
```

The web application will be available at `http://localhost:3000`.

## 📁 Project Structure

```text
mira/
├── apps/
│   ├── web/                 # Main Next.js application
│   │   ├── src/
│   │   │   ├── app/         # Next.js app router pages
│   │   │   ├── components/  # React components
│   │   │   ├── database/    # Database schema and migrations
│   │   │   ├── lib/         # Utility functions
│   │   │   ├── providers/   # React context providers
│   │   │   ├── store/       # Redux store and slices
│   │   │   └── types/       # TypeScript type definitions
│   │   └── drizzle/         # Generated migration files
│   └── docs/                # Documentation app
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── eslint-config/       # ESLint configurations
│   └── typescript-config/   # TypeScript configurations
└── turbo.json               # Turborepo configuration
```

## 🎮 Available Commands

### Root Level Commands

```bash
# Development
pnpm dev                    # Start all apps in development mode
pnpm dev --filter=web       # Start only the web app

# Build
pnpm build                  # Build all apps and packages
pnpm build --filter=web     # Build only the web app

# Linting
pnpm lint                   # Lint all apps and packages

# Formatting
pnpm format                 # Format code with Prettier

# Type Checking
pnpm check-types            # Type check all apps and packages
```

### Web App Commands

```bash
cd apps/web

# Development
pnpm dev                    # Start Next.js dev server

# Database
pnpm db:generate            # Generate Drizzle migration files
pnpm db:migrate             # Run database migrations
pnpm db:push                # Push schema changes to database
pnpm db:studio              # Open Drizzle Studio

# UI Components
pnpm add-component          # Add shadcn/ui components

# Production
pnpm build                  # Build for production
pnpm start                  # Start production server
```

## 🗄️ Database Schema

### Users Table

- `id` (UUID, Primary Key)
- `email` (Text, Unique)
- `name` (Text, Optional)
- `passwordHash` (Text)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

### Tasks Table

- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key → users.id)
- `title` (Text, Required)
- `description` (Text, Optional)
- `status` (Text: "pending" | "in_progress" | "completed")
- `priority` (Integer: 0 = low, 1 = medium, 2 = high)
- `source` (Text, Optional) - e.g., "email", "slack", "jira"
- `sourceId` (Text, Optional) - ID from the source system
- `dueDate` (Timestamp, Optional)
- `completedAt` (Timestamp, Optional)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

## 🔧 Development

### Adding New Components

Use shadcn/ui CLI to add components:

```bash
cd apps/web
pnpm add-component
```

### Database Migrations

When you modify the database schema:

1. Update the schema files in `apps/web/src/database/schema/`
2. Generate migration: `pnpm db:generate`
3. Review the generated migration files in `apps/web/drizzle/`
4. Apply migrations: `pnpm db:migrate`

### Code Style

- ESLint is configured for code linting
- Prettier is configured for code formatting
- TypeScript strict mode is enabled

## 🌐 Remote Caching (Optional)

Turborepo supports remote caching to share build artifacts across machines. To enable:

1. Create a [Vercel account](https://vercel.com/signup)
1. Authenticate:

```bash
turbo login
# or
pnpm exec turbo login
```

1. Link your repository:

```bash
turbo link
# or
pnpm exec turbo link
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Turborepo Documentation](https://turborepo.org/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## 📝 License

This project is private and proprietary.

---

Built with ❤️ using modern web technologies
