# KOZ AI Service Desk

Internal support workspace for KOZ AI.

Users sign in with GitLab, browse application and service status, and submit support tickets. Admins get a separate workspace for analytics, ticket operations, application management, and user role management.

## Overview

The application combines a user-facing support workspace and an admin operations console inside a single Next.js App Router codebase. It is designed around a small set of business domains:

- authentication and access control
- applications and services
- uptime visibility
- ticket intake and ticket operations
- analytics and user administration

Ticket handling includes optional AI-assisted triage for priority, category recommendation, and duplicate detection. Uptime data is pulled from Uptime Kuma when configured.

## Architecture

### High-level shape

The repository is structured as a full-stack monolith:

- `src/app/` contains routes, layouts, loading states, and API route handlers
- `src/features/` contains domain-specific UI, schemas, queries, and mutations
- `src/db/` contains the Drizzle schema, migrations, seed data, and connection setup
- `src/components/` contains shared UI primitives and app-level reusable components
- `src/lib/` contains auth, env parsing, HTTP helpers, query utilities, and rate limiting

The key architectural decision is that route handlers stay thin and delegate most business logic into feature-level server modules.

### Route groups and access model

The app uses route groups to separate public and protected experiences:

- `(auth)` contains the sign-in experience
- `(protected)` contains authenticated user routes
- `(protected)/admin` contains admin-only routes

Access is enforced in two layers:

1. `proxy.ts` redirects unauthenticated users away from protected pages and redirects authenticated users away from `/sign-in`.
2. Server-side guards in `src/lib/auth/session.ts` enforce `requireUser()` and `requireAdmin()` in layouts and server routes.

This gives both fast request-level redirect behavior and route-level authorization checks inside the app.

### Authentication flow

Authentication is implemented with Better Auth and GitLab OAuth.

- Better Auth is configured in `src/lib/auth.ts`
- Next.js auth route handlers are exposed from `src/app/api/auth/[...all]/route.ts`
- Session lookup is centralized in `src/lib/auth/session.ts`
- Admin bootstrapping uses `GITLAB_ADMIN_ALLOWLIST` in `src/lib/auth/allowlist.ts`

On first sign-in, a user is provisioned automatically. If their email address or GitLab numeric user ID appears in the allowlist, they are created as an admin. Otherwise they are created as a regular user.

### UI and rendering model

The app primarily uses Server Components for route rendering and data composition. Client behavior is layered in where it is needed.

- `src/app/layout.tsx` loads fonts, global styles, and wraps the app with providers
- `src/components/providers/AppProviders.tsx` installs:
  - TanStack Query
  - theme handling via `next-themes`
  - Sonner toast notifications

Shared UI primitives live in `src/components/ui/`, while route-specific UI is colocated inside app routes or feature folders.

### Feature organization

Business logic is grouped under `src/features/` by domain:

- `analytics`
- `applications`
- `services`
- `tickets`
- `uptime`
- `users`

Each feature typically contains some combination of:

- `components/` for UI
- `schemas/` for Zod validation and parsing
- `server/` for queries, mutations, integrations, and cache-aware data access

This keeps the codebase feature-sliced instead of organizing everything by framework concern alone.

### API layer

API route handlers live under `src/app/api/` and expose a focused backend surface for admin dashboards, user workflows, and async operations.

Current route groups include:

- `api/auth`
- `api/analytics`
- `api/applications`
- `api/services`
- `api/tickets`
- `api/uptime`
- `api/users`

Representative ticket operations include:

- creating tickets
- listing tickets for admin workflows
- bulk status changes
- manual priority updates
- AI review acceptance or dismissal
- outbound ticket response flows
- ticket export

The route handlers validate input, authorize the caller, enforce rate limits where needed, and then call feature services. Ticket creation also triggers async post-processing using `after(...)` for AI analysis, email notification, and cache revalidation.

### Data layer

The application uses PostgreSQL with Drizzle ORM.

- connection setup is in `src/db/index.ts`
- schema definitions are in `src/db/schema/`
- migrations are stored in `src/db/migrations/`
- seed scripts are in `src/db/seeds/`
- migration configuration is in `drizzle.config.ts`

Core tables are split by domain:

- `auth.ts` for users, sessions, accounts, and verifications
- `applications.ts` for top-level products or systems
- `services.ts` for application-owned services
- `tickets.ts` for support requests and AI triage state

The ticket model is the richest part of the schema. It includes:

- ticket type, status, and priority enums
- AI suggestion status and analysis state
- JSONB storage for AI triage output
- optional duplicate-ticket references
- generated full-text search vectors and indexes for search

### Integrations

The codebase integrates with several external systems:

- GitLab OAuth for login
- Uptime Kuma for application and service health visibility
- Mastra plus model providers for ticket triage
- Upstash Redis for distributed rate limiting
- Resend for email notifications

These are optional in local development except for GitLab OAuth, which is required to complete sign-in.

### AI workflow

AI ticket triage is implemented in `src/features/tickets/server/ticketAiService.ts`.

The flow is:

1. ticket is created
2. candidate duplicate tickets are gathered and ranked
3. a prompt is built from the ticket and ranked candidates
4. an agent runs against OpenRouter if configured
5. if OpenRouter is not configured, OpenAI can be used directly
6. the resulting analysis updates ticket priority, suggested type, and suspected duplicate state

If no model credentials are configured, the core service desk still runs. AI enrichment is optional rather than required for baseline functionality.

### Rate limiting

Rate limiting is implemented in `src/lib/rateLimit.ts`.

- Upstash Redis is used when its REST credentials are present
- local in-memory fallback is used otherwise

That means the app can run locally without Upstash, while production can use distributed rate limiting across instances.

## Tech Stack

### Core framework

- Next.js 16.1.7
- React 19.2.3
- TypeScript 5.9

### Styling and component layer

- Tailwind CSS 4
- Radix UI primitives
- `class-variance-authority`
- `clsx`
- `tailwind-merge`
- `next-themes`
- `framer-motion`
- Google fonts loaded via `next/font`

The visual direction is documented in `design-system.md`. The main theme is dark, status-dense, border-driven, and operational rather than marketing-oriented.

### Forms, validation, and client data

- React Hook Form
- `@hookform/resolvers`
- TanStack Query
- Zod

### Authentication and security

- Better Auth
- Better Auth Drizzle adapter
- GitLab OAuth

### Database and persistence

- PostgreSQL 16
- Drizzle ORM
- Drizzle Kit
- `postgres` driver

### AI and external services

- Mastra Core
- AI SDK OpenAI adapter
- OpenRouter support
- OpenAI fallback support
- Uptime Kuma integration
- Upstash Redis
- Resend

### Tooling and developer workflow

- ESLint 9
- `eslint-config-next`
- Prettier 3
- `prettier-plugin-tailwindcss`
- Husky
- lint-staged
- `tsx` for scripts and tests

### Test coverage currently present

The repo currently includes tests for:

- HTTP utilities
- rate limiting behavior
- analytics dashboard utilities
- ticket AI analysis
- ticket schema validation

## Local Setup

### Prerequisites

Required:

- Node.js 20+
- Docker Desktop
- a GitLab OAuth app for local development

Recommended:

- `npm` or `pnpm`

Optional, depending on what you want to test:

- OpenRouter or OpenAI credentials for ticket triage
- Uptime Kuma base URL for live status data
- Upstash Redis credentials for production-style rate limiting
- Resend credentials for email notifications

### Package manager note

The repository currently contains both `package-lock.json` and README commands written with `pnpm`.

- if you want to match the checked-in lockfile, prefer `npm`
- if you want to follow the original project commands, use `pnpm`

Use one consistently for your local environment.

### 1. Install dependencies

Using pnpm:

```bash
pnpm install
```

Using npm:

```bash
npm install
```

### 2. Create the environment file

The project loads `.env.local` explicitly from `src/db/loadEnv.ts`.

Copy the template:

```powershell
Copy-Item .env.example .env.local
```

Required values:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/koz_service_desk
BETTER_AUTH_SECRET=replace-with-a-random-secret-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000
GITLAB_CLIENT_ID=replace-with-gitlab-client-id
GITLAB_CLIENT_SECRET=replace-with-gitlab-client-secret
GITLAB_ISSUER=https://gitlab.com
GITLAB_ADMIN_ALLOWLIST=you@example.com,123456
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Optional values:

```env
OPENAI_API_KEY=sk-xxxxxxxxx
OPENROUTER_API_KEY=sk-or-xxxxxxxxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=qwen/qwen3.5-flash-02-23
UPTIME_KUMA_BASE_URL=https://status.example.com
UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=replace-with-upstash-rest-token
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=Service Desk <notifications@example.com>
RESEND_TEST_EMAIL=you@example.com
```

Notes:

- `BETTER_AUTH_SECRET` must be at least 32 characters.
- `GITLAB_ADMIN_ALLOWLIST` accepts GitLab emails and GitLab numeric user IDs.
- if your account should become an admin on first sign-in, add it to `GITLAB_ADMIN_ALLOWLIST` before logging in
- `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, and `OPENROUTER_MODEL` enable the Mastra ticket triage agent through OpenRouter
- `OPENAI_API_KEY` can be used as a direct fallback instead of OpenRouter
- `UPTIME_KUMA_BASE_URL` is only needed for live uptime data
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are paired values
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are only needed for email notifications
- `RESEND_TEST_EMAIL` is useful when you want all outbound admin notifications routed to a single inbox during setup

### 3. Configure GitLab OAuth

Use these values in your GitLab OAuth app:

- Application URL: `http://localhost:3000`
- Redirect URI: `http://localhost:3000/api/auth/callback/gitlab`

Without valid GitLab credentials, the app can boot but users will not be able to authenticate.

### 4. Start PostgreSQL

Using pnpm:

```bash
pnpm db:up
```

Using npm:

```bash
npm run db:up
```

The local database runs in Docker on `localhost:5433` with database name `koz_service_desk`.

### 5. Run migrations

Using pnpm:

```bash
pnpm db:migrate
```

Using npm:

```bash
npm run db:migrate
```

### 6. Seed local data

Using pnpm:

```bash
pnpm db:seed
```

Using npm:

```bash
npm run db:seed
```

### 7. Start the app

Using pnpm:

```bash
pnpm dev
```

Using npm:

```bash
npm run dev
```

Then open `http://localhost:3000` and sign in with GitLab.

### 8. Optional verification steps

Run linting:

```bash
pnpm lint
```

or

```bash
npm run lint
```

Run tests:

```bash
pnpm test
```

or

```bash
npm test
```

## Scripts

- `dev` - start the development server
- `build` - build for production
- `start` - start the production server
- `lint` - run ESLint
- `test` - run the `tsx` test suite
- `format` - check formatting
- `format:write` - write formatting fixes
- `db:up` - start local PostgreSQL
- `db:down` - stop local PostgreSQL
- `db:logs` - view PostgreSQL logs
- `db:generate` - generate new Drizzle migrations
- `db:migrate` - apply migrations
- `db:seed` - seed local data
