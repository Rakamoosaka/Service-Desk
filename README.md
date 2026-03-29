# KOZ AI Service Desk

KOZ AI Service Desk is an internal support application built with Next.js App Router. Authenticated GitLab users can browse internal applications and submit tickets, while admins manage applications, users, and ticket workflows.

This repository is ready for a Docker-based local PostgreSQL workflow and a Vercel deployment target.

## Stack

- Next.js 16.1.7 with App Router
- React 19 and TypeScript 5
- Tailwind CSS 4
- better-auth with GitLab OAuth
- PostgreSQL with Drizzle ORM and Drizzle Kit
- Zod for environment validation
- React Hook Form and TanStack Query
- ESLint 9, Prettier 3, Husky, and lint-staged

## Architecture

- `src/app`: routes, layouts, pages, and route handlers
- `src/features`: domain logic for applications, tickets, and users
- `src/lib`: shared auth, env, HTTP, and utility code
- `src/db`: schema, migration, seed, and database bootstrap code
- `src/components`: reusable UI and layout components

## Project structure

```text
.
├─ compose.yaml
├─ src/
│  ├─ app/
│  ├─ components/
│  ├─ db/
│  │  ├─ migrations/
│  │  ├─ schema/
│  │  └─ seeds/
│  ├─ features/
│  └─ lib/
├─ drizzle.config.ts
├─ package.json
└─ .env.example
```

## Quick start

If you already ran `npm install`, the next local setup steps are:

1. Create `.env.local` from `.env.example`
2. Start PostgreSQL with Docker Compose
3. Generate the initial Drizzle migration files
4. Run migrations and seeds
5. Start the Next.js app

## Local development

### Prerequisites

- Node.js 20+
- Docker Desktop
- A GitLab OAuth application for localhost

### 1. Create `.env.local`

From the project root:

```powershell
Copy-Item .env.example .env.local
```

Update `.env.local` with your real values:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/koz_service_desk
BETTER_AUTH_SECRET=replace-with-a-long-random-secret-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000
GITLAB_CLIENT_ID=replace-with-gitlab-client-id
GITLAB_CLIENT_SECRET=replace-with-gitlab-client-secret
GITLAB_ISSUER=https://gitlab.com
GITLAB_ADMIN_ALLOWLIST=you@example.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
UPTIME_KUMA_BASE_URL=https://test-monitor.koz-ai.com
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=Service Desk <notifications@example.com>
```

Notes:

- `BETTER_AUTH_SECRET` must be at least 32 characters
- `GITLAB_ADMIN_ALLOWLIST` accepts a comma-separated list of GitLab emails and or GitLab user IDs
- If you want your first login to be an admin, include your own GitLab email or GitLab numeric user ID in `GITLAB_ADMIN_ALLOWLIST`
- `UPTIME_KUMA_BASE_URL` should point to the public Uptime Kuma host if you want application pages to poll service health
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` enable admin email notifications for newly created tickets

### 2. Configure GitLab OAuth for local development

This app supports GitLab OAuth only.

Use these local values in your GitLab OAuth application:

- Application URL: `http://localhost:3000`
- Redirect URI: `http://localhost:3000/api/auth/callback/gitlab`

The redirect URI must match exactly.

### 3. Start PostgreSQL with Docker

This repository includes [compose.yaml](compose.yaml) with a local PostgreSQL 16 service.

Start the database:

```bash
npm run db:up
```

View logs if needed:

```bash
npm run db:logs
```

Stop the database:

```bash
npm run db:down
```

Default local database settings from `compose.yaml`:

- host: `localhost`
- port: `5433`
- database: `koz_service_desk`
- username: `postgres`
- password: `postgres`

### 4. Generate and apply the database schema

This repository checks in migration files, so local setup should apply the committed migrations before the app starts.

```bash
npm run db:migrate
```

`npm run dev` and `npm start` now run `db:migrate` automatically before the app boots.

### 5. Seed development data

```bash
npm run db:seed
```

The seed inserts demo applications, services, users, and tickets for local development.

### 6. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

### 7. Sign in

Use the GitLab sign-in flow on the local app. If your email or GitLab user ID is present in `GITLAB_ADMIN_ALLOWLIST`, your account will be bootstrapped as an admin on first creation.

## First-run command sequence

After `.env.local` is filled in, the full local bootstrap is:

```bash
npm run db:up
npm run db:migrate
npm run db:seed
npm run dev
```

## Vercel deployment

This project is structured for Vercel deployment, but the local Docker PostgreSQL service is for development only. Do not attempt to run Docker Compose on Vercel.

### Production checklist

1. Create a managed PostgreSQL database.
2. Add all required environment variables in the Vercel project settings.
3. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain.
4. Add the production GitLab OAuth redirect URI.
5. Run Drizzle migrations against the production database before serving traffic.

### Required Vercel environment variables

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GITLAB_CLIENT_ID`
- `GITLAB_CLIENT_SECRET`
- `GITLAB_ISSUER`
- `GITLAB_ADMIN_ALLOWLIST`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

### Production GitLab OAuth values

For a production domain such as `https://service-desk.example.com`:

- Application URL: `https://service-desk.example.com`
- Redirect URI: `https://service-desk.example.com/api/auth/callback/gitlab`

### Database choice for Vercel

Use a managed PostgreSQL provider that is reachable from Vercel. The simplest options are:

- Vercel Postgres
- Neon
- Supabase Postgres
- Railway Postgres

### Migration strategy for production

Recommended approach:

1. Generate migrations locally when schema changes.
2. Commit the migration files.
3. Apply migrations in CI or as a release step before traffic hits the new deployment.

At the moment, local setup generates the initial migration because `src/db/migrations` is empty.

## Environment variables

The application validates its environment at startup.

| Variable                 | Required | Purpose                                                |
| ------------------------ | -------- | ------------------------------------------------------ |
| `DATABASE_URL`           | Yes      | PostgreSQL connection string used by Drizzle           |
| `BETTER_AUTH_SECRET`     | Yes      | better-auth signing secret                             |
| `BETTER_AUTH_URL`        | Yes      | Base URL used by better-auth                           |
| `GITLAB_CLIENT_ID`       | Yes      | GitLab OAuth application client ID                     |
| `GITLAB_CLIENT_SECRET`   | Yes      | GitLab OAuth application client secret                 |
| `GITLAB_ISSUER`          | Yes      | GitLab OAuth issuer URL, usually `https://gitlab.com`  |
| `GITLAB_ADMIN_ALLOWLIST` | Yes      | Comma-separated admin bootstrap allowlist              |
| `NEXT_PUBLIC_APP_URL`    | Yes      | Public base URL used by the frontend                   |
| `UPTIME_KUMA_BASE_URL`   | No       | Public Uptime Kuma host used for status page polling   |
| `RESEND_API_KEY`         | No       | Resend API key used to send admin ticket notifications |
| `RESEND_FROM_EMAIL`      | No       | From address used for admin ticket notifications       |

## Available scripts

| Script                 | What it does                                         |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Start the Next.js development server                 |
| `npm run build`        | Build the production app                             |
| `npm run start`        | Start the production app                             |
| `npm run lint`         | Run ESLint across the repository                     |
| `npm run format`       | Check formatting with Prettier                       |
| `npm run format:write` | Rewrite files with Prettier                          |
| `npm run db:up`        | Start the local PostgreSQL container                 |
| `npm run db:down`      | Stop local Docker services defined in `compose.yaml` |
| `npm run db:logs`      | Follow PostgreSQL container logs                     |
| `npm run db:generate`  | Generate Drizzle migration files from schema changes |
| `npm run db:migrate`   | Apply migrations using `src/db/migrate.ts`           |
| `npm run db:seed`      | Seed the local database with demo data               |

## Tooling and quality gates

- `npm run prepare` installs Husky hooks
- `lint-staged` formats staged source files and fixes lint issues on staged JS and TS files

## Contributor notes

- Use App Router under `src/app`
- Keep route handlers in `src/app/api`
- Keep business logic in feature modules or shared server modules rather than calling internal API routes from server components
- Do not commit real environment files
