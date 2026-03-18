# KOZ AI Service Desk

KOZ AI Service Desk is a full-stack internal support application built with Next.js App Router. Authenticated GitLab users can browse internal applications and submit tickets, while admins can manage applications, users, and ticket workflows.

The current codebase implements the foundation described in the project plan: project bootstrap, database setup, authentication and RBAC, application management, and ticket intake and admin operations.

## Stack

- Next.js 16.1.7 with App Router
- React 19 and TypeScript 5
- Tailwind CSS 4 for styling
- Custom shadcn-style UI primitives built on Radix UI
- better-auth with GitLab OAuth
- PostgreSQL with Drizzle ORM and Drizzle Kit migrations
- Zod for environment and request validation
- React Hook Form for forms
- TanStack Query for client-side mutations and cache flows
- next-themes for light/dark theme support
- Framer Motion for limited UI motion
- ESLint 9 + Prettier 3
- Husky + lint-staged pre-commit checks

## Architecture

The app follows a modular App Router structure with thin route files and feature-oriented server logic.

### High-level design

- `src/app`: route composition, layouts, pages, and route handlers
- `src/features`: domain logic grouped by feature such as applications, tickets, and users
- `src/lib`: shared infrastructure such as auth, env parsing, HTTP helpers, and query helpers
- `src/db`: Drizzle schema, migrations, seed data, and database bootstrap
- `src/components`: reusable UI, layout, navigation, and theme components

### Request flow

1. Next.js App Router handles routing from `src/app`.
2. Protected layouts resolve the current session on the server.
3. Route handlers validate input and enforce auth/role checks.
4. Feature server modules perform business logic and database operations.
5. Drizzle persists and reads application data from PostgreSQL.
6. Client-side interactive views use TanStack Query, React Hook Form, and shared UI components.

### Current route areas

- `src/app/(auth)`: sign-in flow
- `src/app/(protected)`: authenticated application shell
- `src/app/(protected)/admin`: admin dashboard, applications, tickets, and users
- `src/app/(protected)/app/[slug]`: per-application detail page
- `src/app/api`: route handlers for auth, applications, tickets, and users

## Project structure

```text
.
├─ src/
│  ├─ app/
│  │  ├─ (auth)/
│  │  ├─ (protected)/
│  │  └─ api/
│  ├─ components/
│  ├─ db/
│  │  ├─ migrations/
│  │  ├─ schema/
│  │  └─ seeds/
│  ├─ features/
│  │  ├─ applications/
│  │  ├─ tickets/
│  │  └─ users/
│  └─ lib/
├─ design-system.md
├─ drizzle.config.ts
├─ package.json
└─ .env.example
```

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a local environment file

Create `.env.local` in the project root and copy the values from `.env.example`.

On PowerShell:

```powershell
Copy-Item .env.example .env.local
```

### 3. Provision PostgreSQL

Create a PostgreSQL database that matches `DATABASE_URL`.

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/koz_service_desk
```

The database must already exist before running migrations.

Optional Docker path:

If you want a quick local PostgreSQL instance without installing Postgres directly, you can run:

```bash
docker run --name koz-postgres ^
	-e POSTGRES_USER=postgres ^
	-e POSTGRES_PASSWORD=postgres ^
	-e POSTGRES_DB=koz_service_desk ^
	-p 5432:5432 ^
	-d postgres:16
```

On macOS or Linux, use `\` instead of `^` for line continuation.

### 4. Configure GitLab OAuth

This project supports GitLab OAuth only. There is no local username/password sign-in.

You need a GitLab OAuth application configured with local callback URLs that match `BETTER_AUTH_URL`.

Set these values in `.env.local`:

- `GITLAB_CLIENT_ID`
- `GITLAB_CLIENT_SECRET`
- `GITLAB_ISSUER` (defaults to `https://gitlab.com`)

### 5. Set auth secrets and admin allowlist

- `BETTER_AUTH_SECRET` must be a long random string with at least 32 characters
- `GITLAB_ADMIN_ALLOWLIST` accepts a comma-separated list of GitLab emails and/or GitLab user IDs

Example:

```env
GITLAB_ADMIN_ALLOWLIST=admin@example.com,123456
```

### 6. Run database generation, migrations, and seeds

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

The seed script inserts demo users, applications, and tickets for local development.

### 7. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Optional deployment notes

### Deploying to Vercel

This repository is structured for Vercel-first deployment.

Recommended setup:

1. Create a managed PostgreSQL database.
2. Add the same environment variables from `.env.local` to the Vercel project settings.
3. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_APP_URL` to the production domain.
4. Configure the GitLab OAuth application to use the production callback URLs.
5. Run Drizzle migrations as part of your deployment workflow before serving traffic.

At minimum, configure these production variables:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GITLAB_CLIENT_ID`
- `GITLAB_CLIENT_SECRET`
- `GITLAB_ISSUER`
- `GITLAB_ADMIN_ALLOWLIST`
- `NEXT_PUBLIC_APP_URL`

Deployment note:

- This project currently uses simple local process assumptions for development. If you introduce stronger rate limiting, background processing, or external integrations later, keep those concerns behind shared providers in `src/lib` or `src/features` rather than embedding them in route files.

## Environment variables

The app validates environment variables at startup with Zod.

| Variable                 | Required | Purpose                                                              |
| ------------------------ | -------- | -------------------------------------------------------------------- |
| `DATABASE_URL`           | Yes      | PostgreSQL connection string used by Drizzle                         |
| `BETTER_AUTH_SECRET`     | Yes      | better-auth signing secret                                           |
| `BETTER_AUTH_URL`        | Yes      | Base URL used by better-auth for local or deployed auth flows        |
| `GITLAB_CLIENT_ID`       | Yes      | GitLab OAuth application client ID                                   |
| `GITLAB_CLIENT_SECRET`   | Yes      | GitLab OAuth application client secret                               |
| `GITLAB_ISSUER`          | Yes      | GitLab OAuth issuer URL, typically `https://gitlab.com`              |
| `GITLAB_ADMIN_ALLOWLIST` | Yes      | Comma-separated admin bootstrap allowlist by email or GitLab user ID |
| `NEXT_PUBLIC_APP_URL`    | Yes      | Public base URL used by the frontend                                 |

## Available scripts

| Script                 | What it does                                         |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Start the Next.js development server                 |
| `npm run build`        | Build the production app                             |
| `npm run start`        | Start the production server                          |
| `npm run lint`         | Run ESLint across the repository                     |
| `npm run format`       | Check formatting with Prettier                       |
| `npm run format:write` | Rewrite files with Prettier                          |
| `npm run db:generate`  | Generate Drizzle migration files from schema changes |
| `npm run db:migrate`   | Apply migrations using `src/db/migrate.ts`           |
| `npm run db:seed`      | Seed the local database with demo data               |

## Tooling and quality gates

- Husky installs a pre-commit hook through `npm run prepare`
- The pre-commit hook runs `lint-staged`
- Staged TypeScript, JavaScript, CSS, JSON, and Markdown files are formatted with Prettier
- Staged TypeScript and JavaScript files are also auto-fixed with ESLint

## Notes for contributors

- The app uses `src/app` with the App Router, not the legacy Pages Router
- Keep route handlers in `src/app/api`
- Keep business logic in feature or shared server modules rather than calling internal API routes from server components
- Do not commit real `.env` files; use `.env.example` as the template

## Git ignore

This repository ignores local environment files, build output, dependencies, and other machine-specific artifacts. The `.gitignore` should keep secrets out of version control while still allowing `.env.example` to remain committed as the shared template.
