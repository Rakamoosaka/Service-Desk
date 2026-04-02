# KOZ AI Service Desk

Internal support workspace for KOZ AI.

Users sign in with GitLab, browse application and service status, and submit support tickets. Admins get a separate workspace for analytics, ticket operations, application management, and user role management.

## What it does

- GitLab-only authentication with automatic first-login provisioning
- Shared dashboard for applications and services
- Application and service status pages with Uptime Kuma data when configured
- Service-level ticket intake
- Admin dashboard for analytics, tickets, applications, and user access
- Mastra-powered ticket priority scoring, category review, and duplicate detection

## Stack

- Next.js 16 App Router
- React 19 + TypeScript
- Tailwind CSS 4
- better-auth with GitLab OAuth
- PostgreSQL + Drizzle ORM
- TanStack Query + React Hook Form
- Mastra + OpenAI for ticket triage

## Local setup

### Prerequisites

- Node.js 20+
- pnpm
- Docker Desktop
- A GitLab OAuth app for local development

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create env file

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
- If your account should become an admin on first sign-in, include it in `GITLAB_ADMIN_ALLOWLIST` before logging in.
- `OPENROUTER_API_KEY`, `OPENROUTER_BASE_URL`, and `OPENROUTER_MODEL` let the Mastra ticket triage agent run against OpenRouter.
- `OPENAI_API_KEY` remains available as a direct fallback if you prefer OpenAI instead of OpenRouter.
- `UPTIME_KUMA_BASE_URL` is only needed if you want live uptime data.
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are required in production for API route rate limiting.
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are only needed for email notifications.
- `RESEND_TEST_EMAIL` is optional and useful with an unverified Resend setup. When set, all admin notification emails are routed to that single address.

### 3. Configure GitLab OAuth

Use these values in your GitLab OAuth app:

- Application URL: `http://localhost:3000`
- Redirect URI: `http://localhost:3000/api/auth/callback/gitlab`

### 4. Start PostgreSQL

```bash
pnpm db:up
```

The local database runs on `localhost:5433` with database name `koz_service_desk`.

### 5. Run migrations and seed data

```bash
pnpm db:migrate
pnpm db:seed
```

### 6. Start the app

```bash
pnpm dev
```

Open `http://localhost:3000` and sign in with GitLab.

## Scripts

- `pnpm dev` - start the development server
- `pnpm build` - build for production
- `pnpm start` - start the production server
- `pnpm lint` - run ESLint
- `pnpm format` - check formatting
- `pnpm format:write` - write formatting fixes
- `pnpm db:up` - start local PostgreSQL
- `pnpm db:down` - stop local PostgreSQL
- `pnpm db:logs` - view PostgreSQL logs
- `pnpm db:migrate` - apply migrations
- `pnpm db:seed` - seed local data
- `pnpm db:generate` - generate new Drizzle migrations

## Deployment

This app needs:

- A PostgreSQL database
- The same environment variables used locally
- GitLab OAuth configured for the deployed domain
- Migrations applied before serving traffic

For a deployed domain such as `https://service-desk.example.com`, the GitLab callback becomes:

```text
https://service-desk.example.com/api/auth/callback/gitlab
```
