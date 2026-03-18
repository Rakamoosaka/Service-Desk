# Service Desk Project Grand Plan

## 1. Project Objective

Build a self-contained Service Desk application on Next.js App Router for authenticated GitLab users. The system will allow users to submit tickets against internal applications, allow admins to manage applications and tickets, display per-application service health, and later add AI-assisted triage using Mastra.

This document is the execution blueprint for the full project. It reflects the finalized planning decisions provided by the stakeholder:

- Next.js App Router full-stack application
- PostgreSQL with Drizzle ORM and a migration pipeline
- better-auth with GitLab OAuth only
- Tailwind CSS + shadcn/ui
- Light and dark mode using next-themes
- Framer Motion for functional motion only
- TanStack Query with optimistic updates
- React Hook Form + Zod
- ESLint, Prettier, Husky, lint-staged
- Vercel-first deployment assumptions
- Uptime Kuma implemented behind a mock-first provider abstraction
- Mastra deferred until late in the project

## 2. Guiding Principles

1. Keep the first release operationally simple.
2. Do not let future integrations force rewrites of current UI contracts.
3. Enforce authentication everywhere.
4. Centralize business logic on the server side.
5. Use typed contracts across forms, APIs, and database boundaries.
6. Prefer stable abstractions over premature feature depth.
7. Optimize for clarity, maintainability, and predictable delivery.

## 3. Finalized Product Decisions

### 3.1 UI and UX

- UI stack: Tailwind CSS + shadcn/ui
- Theme: light and dark mode from day one using next-themes
- Motion: Framer Motion, used only for page transitions, modal entry, and form feedback
- Visual direction: modern, minimal, internal-tool feel inspired by Linear-style clarity
- Charts: use shadcn's own charts for simple admin reporting
- Separate design documentation will be created in `design-system.md`

### 3.2 Authentication and Authorization

- GitLab OAuth is the only sign-in method
- Any authenticated GitLab user may sign in
- Default role on first sign-in: `user`
- First admin provisioning: environment-based allowlist using GitLab ID or email from environment variables
- Admins can promote or demote users from the admin panel
- All pages require authentication
- RBAC roles:
  - `admin`: management capabilities
  - `user`: ticket submission only

### 3.3 Ticket Rules

- Users can submit unlimited tickets
- No comments or threads in MVP
- No `My Tickets` page in MVP
- Admins can move tickets freely between `new`, `in_review`, `resolved`, `closed`
- Priority is assigned automatically later by AI, but admins can overwrite it manually
- No separate audit history for AI decisions or admin overrides

### 3.4 Uptime Kuma Strategy

- Phase 1 uses a formal provider interface with mock data
- Mock payload includes:
  - current status
  - recent incidents list
- Application pages must continue rendering if live service data fails later
- Failure mode for service health: mark service as `unknown` or `stale`, do not block the page
- Live integration must be flexible enough to support either:
  - authenticated API access
  - public status page parsing

### 3.5 AI Strategy

- Mastra is explicitly deferred until late in the project
- MVP AI outputs when implemented:
  - priority scoring
  - category correction
- Post-MVP AI outputs:
  - duplicate detection
  - suggested admin replies
- User experience target when AI arrives:
  - ticket is accepted immediately
  - analysis state is visible as pending or unavailable
- Operational simplification requested by stakeholder:
  - no complex durable background job system in MVP
  - best-effort AI invocation only when the AI phase begins
  - if AI fails, ticket remains usable without retry guarantees

### 3.6 Security, Infra, and Delivery

- Deployment target: Vercel
- Rate limiting: simple in-memory rate limiting
- No audit log system in MVP
- No file attachments in MVP
- Test baseline: unit tests only for the most important logic
- Seeded local development data is required
- Husky + lint-staged must run ESLint and Prettier pre-commit
- Commit message enforcement is not required

## 4. System Architecture Strategy

The codebase should follow a modular full-stack architecture that keeps the App Router UI thin while centralizing business rules inside server-side services.

### 4.1 Core Patterns

#### Repository Pattern

Use repositories to isolate Drizzle queries from route handlers, server actions, and business services.

Examples:

- `ApplicationsRepository`
- `TicketsRepository`
- `UsersRepository`

Benefits:

- Keeps query logic composable and testable
- Makes schema changes easier to contain
- Prevents route handlers from becoming SQL-heavy

#### Service Layer

Use service modules for orchestrating real business actions.

Examples:

- `createTicket`
- `updateTicketStatus`
- `upsertUserFromGitLabProfile`
- `promoteUserRole`
- `listAnalyticsSummary`

Benefits:

- Central business rules live in one place
- Easier unit testing
- Reusable across route handlers and server actions

#### Provider / Adapter Pattern

Use provider contracts for external systems.

Examples:

- `UptimeProvider`
- `AiTriageProvider`
- `RateLimitProvider`

Benefits:

- Mock-first development becomes straightforward
- External integrations can be swapped later without UI rewrites

#### Guard / Policy Pattern

RBAC checks should be implemented through centralized guard helpers rather than duplicated inline checks.

Examples:

- `requireAuth()`
- `requireAdmin()`
- `canManageUsers()`

#### Schema-First Contracts

Use Zod schemas as the single input validation layer for:

- client forms
- route handlers
- server actions
- environment variables

### 4.2 High-Level Request Flow

1. User visits any page.
2. Server layout resolves session using better-auth.
3. Middleware or server guards redirect unauthenticated users to sign-in.
4. Protected pages fetch initial server data.
5. Client components use TanStack Query for cache, mutations, and optimistic updates.
6. Mutations hit typed API routes or server actions.
7. Request payloads are validated with Zod.
8. Services orchestrate business logic.
9. Repositories persist or read from PostgreSQL via Drizzle.
10. Response returns canonical data for UI hydration or cache reconciliation.

## 5. Proposed Folder Structure

```text
src/
  app/
    (auth)/
      sign-in/
    (protected)/
      layout.tsx
      page.tsx
      admin/
        page.tsx
        applications/
          page.tsx
        tickets/
          page.tsx
        users/
          page.tsx
      app/
        [slug]/
          page.tsx
    api/
      applications/
      tickets/
      analytics/
      users/
      uptime/
      auth/
  components/
    layout/
    navigation/
    forms/
    tables/
    charts/
    uptime/
    feedback/
    theme/
  features/
    auth/
      server/
      schemas/
      types/
    applications/
      components/
      server/
      schemas/
      types/
    tickets/
      components/
      server/
      schemas/
      types/
    analytics/
      components/
      server/
      types/
    uptime/
      components/
      server/
      providers/
      types/
    ai/
      server/
      providers/
      types/
  lib/
    auth/
    db/
    env/
    rate-limit/
    query/
    utils/
    errors/
  db/
    schema/
    migrations/
    seeds/
  tests/
    unit/
```

### 5.1 Folder Rules

- `app/` contains route composition only
- `features/*/server` contains services, repositories, and server-only logic
- `features/*/components` contains domain-specific UI blocks
- `components/` contains cross-feature UI primitives or shell pieces
- `lib/` contains shared infrastructure and utilities
- `db/` owns schema, migrations, and seeds

## 6. Database Architecture

### 6.1 Core Tables

#### users

- `id`
- `gitlab_user_id`
- `email`
- `name`
- `avatar_url`
- `role` enum: `admin | user`
- `created_at`
- `updated_at`

#### applications

- `id`
- `name`
- `slug`
- `description`
- `uptime_kuma_identifier`
- `created_at`
- `updated_at`

#### tickets

- `id`
- `app_id`
- `type` enum: `feedback | suggestion | bug`
- `title`
- `description`
- `status` enum: `new | in_review | resolved | closed`
- `priority` enum: `low | medium | high | critical | unknown`
- `submitted_by_user_id`
- `analysis_state` enum: `not_requested | pending | completed | failed`
- `created_at`
- `updated_at`

### 6.2 Optional Forward-Compatible Columns

Even if Mastra is deferred, the schema should leave room for future enrichment without structural disruption.

Suggested ticket columns or related analysis table later:

- `ai_summary`
- `ai_confidence`
- `ai_last_error`
- `analyzed_at`

For MVP, keep schema lean. If those fields are not needed immediately, defer them to a later migration.

### 6.3 Constraints and Indexing

- unique index on `users.gitlab_user_id`
- unique index on `users.email` if the auth provider guarantees stable email
- unique index on `applications.slug`
- index on `tickets.app_id`
- index on `tickets.status`
- index on `tickets.type`
- composite index on `tickets.app_id + status`
- composite index on `tickets.app_id + created_at`

### 6.4 Drizzle Migration Pipeline

1. Define schema in `db/schema`
2. Generate SQL migration with Drizzle tooling
3. Apply migrations locally
4. Seed demo data
5. Run migrations in preview and production through deployment workflow

## 7. Authentication and RBAC Design

### 7.1 better-auth Integration

- GitLab OAuth only
- No local credentials
- No additional providers
- Session must be available in server components, route handlers, and client hydration boundary

### 7.2 User Provisioning Flow

1. User signs in with GitLab.
2. System checks for an existing user by provider user ID or email.
3. If not found, create a local user record.
4. Determine role:
   - if GitLab ID or email matches environment allowlist, assign `admin`
   - otherwise assign `user`
5. Persist session and redirect to protected app.

### 7.3 Admin Management

Admins need a user management view with:

- user table
- role badge
- promote to admin action
- demote to user action
- search or filter by email/name if dataset grows

### 7.4 Route Protection Model

- middleware for broad auth redirects if needed
- server-side guards in protected layouts and server actions
- admin routes require explicit `requireAdmin()` checks

## 8. Frontend Strategy

### 8.1 Rendering Strategy

- Use server components for initial page shells and data bootstrapping
- Use client components for forms, filters, optimistic interactions, charts, theme switching, and animated transitions
- Keep heavy client logic isolated to feature components

### 8.2 State and Data Fetching

- TanStack Query handles client-side caching and mutation flows
- Initial page data may be fetched server-side and hydrated into the client where useful
- Optimistic updates required for:
  - ticket status updates
  - application CRUD where safe

### 8.3 Form Strategy

- React Hook Form for all complex forms
- Shared Zod schemas for client and server validation
- Separate schema variants for:
  - feedback submission
  - suggestion submission
  - bug report submission
  - application create/update
  - admin role changes
  - ticket status updates

### 8.4 Theming and Motion

- `next-themes` controls light/dark mode
- Tailwind tokens should be aligned with shadcn/ui theme variables
- Framer Motion should be limited to practical UX improvements

## 9. Component Map

### 9.1 App Shell Components

- app sidebar or top navigation
- authenticated layout shell
- page header
- theme toggle
- user account menu

### 9.2 User-Facing Components

- application card list
- application detail header
- service status card
- recent incidents list
- feedback form
- suggestion form
- bug report form
- success state panel
- validation error feedback blocks

### 9.3 Admin Components

- admin dashboard cards
- ticket filters toolbar
- tickets table
- ticket status selector
- applications table
- create/edit application dialog or page form
- users table
- role management controls
- analytics charts

### 9.4 Shared Components

- data table wrapper
- empty state
- error state
- loading skeleton
- confirmation dialog
- toast system
- badge components for role, status, priority, uptime state

## 10. API Map

### 10.1 Auth

- better-auth managed auth endpoints

### 10.2 Applications

- `GET /api/applications`
- `POST /api/applications`
- `GET /api/applications/:id`
- `PATCH /api/applications/:id`
- `DELETE /api/applications/:id`

Rules:

- list may be accessible to all authenticated users
- create, update, delete restricted to admins

### 10.3 Tickets

- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/tickets/:id`
- `PATCH /api/tickets/:id/status`

Rules:

- create available to authenticated users
- list and status mutation restricted to admins unless future product changes require otherwise

### 10.4 Users

- `GET /api/users`
- `PATCH /api/users/:id/role`

Rules:

- admin only

### 10.5 Analytics

- `GET /api/analytics/summary`
- `GET /api/analytics/trends?range=7d|30d|90d`
- `GET /api/analytics/status-distribution?range=7d|30d|90d`

Rules:

- admin only

### 10.6 Uptime

- `GET /api/uptime/:applicationSlug`

Behavior:

- returns provider-normalized status payload
- mock provider first
- live provider later
- returns `unknown` or `stale` state instead of hard-blocking on external failures

## 11. Validation and Error Handling

### 11.1 Zod Boundaries

Every write endpoint must validate:

- authentication context
- role requirements
- request body
- route params
- query params where relevant

### 11.2 Error Taxonomy

Standardize error categories:

- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `RATE_LIMITED`
- `EXTERNAL_SERVICE_ERROR`
- `INTERNAL_SERVER_ERROR`

### 11.3 UX Error States

- form-level inline validation
- non-blocking toast errors for mutations
- route-level fallback UIs
- stale or unknown status state for external uptime failures

## 12. Rate Limiting Strategy

The project will use a simple in-memory rate limiting approach because:

- deployment target is Vercel
- complexity must stay low
- traffic expectations are modest

Apply rate limiting to:

- ticket creation endpoints
- admin mutation endpoints if needed
- auth-sensitive flows if supported by the chosen auth integration layer

Important note: in-memory rate limiting on serverless infrastructure is best-effort, not globally strict. That is acceptable for this project’s initial scope.

## 13. Uptime Kuma Abstraction Design

### 13.1 Provider Interface

Define a normalized interface like:

- get service status by application identifier
- get recent incidents by application identifier

### 13.2 Normalized Return Shape

Suggested payload shape:

- `status`: `operational | degraded | outage | unknown | stale`
- `checkedAt`
- `source`: `mock | kuma-api | kuma-page-parser`
- `incidents[]`
  - `id`
  - `title`
  - `status`
  - `startedAt`
  - `resolvedAt`
  - `summary`

### 13.3 Initial Implementation

- static or seeded mock data source
- deterministic local behavior
- per-application identifier mapping from database

### 13.4 Future Implementation

- live API adapter if authenticated endpoint is available
- page parser adapter if only public status pages are available
- preserve provider contract so UI remains unchanged

## 14. Mastra Integration Plan

Mastra is not part of the early build sequence. It should only begin after core CRUD, status handling, analytics, and mock uptime are stable.

### 14.1 Initial AI Scope

- assign initial priority
- correct ticket category when misclassified

### 14.2 Proposed Execution Model

Because the requirements contain two competing constraints, the implementation should use a simplified non-durable async pattern when AI is introduced:

- user submission succeeds immediately
- ticket may enter `analysis_state = pending`
- AI is invoked best-effort after creation
- no retry job table in MVP
- if AI fails, mark `analysis_state = failed`

This preserves the desired user experience without introducing queue infrastructure.

### 14.3 Admin Experience

- admin sees current priority and category values only
- admin can overwrite either value directly
- no AI history or audit trail required

## 15. Analytics Scope

Initial analytics are intentionally simple.

### 15.1 Dashboard Metrics

- tickets per application
- status distribution
- ticket trend over time

### 15.2 Time Ranges

- 7 days
- 30 days
- 90 days

### 15.3 Non-Goals for MVP

- SLA reporting
- MTTR calculations
- aging buckets
- custom date-range builder

## 16. Testing Strategy

Unit tests only for the highest-value logic.

Priority unit test targets:

- role guard logic
- status transition utility rules if any rules are encoded
- allowlist admin bootstrap logic
- request schema validation helpers
- analytics aggregation logic
- uptime normalization logic

Not required for MVP:

- end-to-end testing
- full API integration suite
- browser automation

## 17. Development Tooling Strategy

### 17.1 Lint and Format

- ESLint configured for Next.js + TypeScript
- Prettier for formatting
- lint-staged to run on staged files
- Husky pre-commit hook runs linting and formatting checks

### 17.2 Environment Management

Create a strict `.env.example` with all required variables, including:

- `DATABASE_URL`
- auth secret values
- `GITLAB_CLIENT_ID`
- `GITLAB_CLIENT_SECRET`
- `GITLAB_ADMIN_ALLOWLIST`
- app base URL values
- theme and feature flags if needed
- mock uptime configuration if needed
- future Mastra configuration placeholders

### 17.3 Seed Data

Local seed should create:

- at least one admin user placeholder strategy or guidance
- several standard users if practical
- several applications
- several tickets across all statuses and types
- mock uptime incident data source if used from seed fixtures

## 18. Delivery Phases and Milestones

### Phase 0: Project Bootstrap

Deliverables:

- initialize Next.js App Router project
- configure TypeScript, ESLint, Prettier
- install Tailwind, shadcn/ui, next-themes, Framer Motion
- configure Husky and lint-staged
- create `.env.example`
- create `design-system.md`

Exit criteria:

- project runs locally
- lint and format pipeline works
- theme foundation exists

### Phase 1: Database and Infrastructure

Deliverables:

- set up PostgreSQL and Drizzle
- define initial schema
- generate and apply first migration
- create seed script
- add shared env parsing and DB bootstrap

Exit criteria:

- database can be reset and reseeded locally
- schema and migration process are documented and repeatable

### Phase 2: Authentication and RBAC

Deliverables:

- better-auth with GitLab OAuth only
- authenticated app shell
- automatic user provisioning
- environment allowlist admin bootstrap
- admin role management UI foundations

Exit criteria:

- unauthenticated users cannot access app pages
- admin and user roles resolve correctly

### Phase 3: Application Management

Deliverables:

- admin application CRUD
- applications listing for authenticated users
- application detail route scaffold at `/app/[slug]`

Exit criteria:

- admins can create and manage services
- application detail pages resolve by slug

### Phase 4: Ticket Submission and Ticket Ops

Deliverables:

- feedback form
- suggestion form
- bug report form
- admin ticket list with filters
- admin ticket status mutation
- optimistic updates for status changes

Exit criteria:

- users can submit tickets
- admins can manage all ticket statuses

### Phase 5: Analytics Dashboard

Deliverables:

- trend charts for 7, 30, 90 day views
- status distribution chart
- tickets per application summary

Exit criteria:

- dashboard is populated from real DB aggregates
- seeded data produces meaningful demo output

### Phase 6: Mock Uptime Layer

Deliverables:

- uptime provider contract
- mock provider implementation
- application page status card
- recent incidents list
- graceful unknown or stale state handling

Exit criteria:

- application pages show service health without live Kuma integration
- UI does not depend on provider implementation details

### Phase 7: Hardening

Deliverables:

- route request validation coverage
- in-memory rate limiting
- core loading and error states polished
- highest-value unit tests
- Vercel deployment sanity review

Exit criteria:

- important write routes are validated and rate-limited
- basic quality guardrails are in place

### Phase 8: Mastra Integration

Deliverables:

- AI provider abstraction
- best-effort post-create analysis trigger
- priority scoring
- category correction
- analysis state display in admin workflow if needed

Exit criteria:

- ticket submission still works even if AI fails
- AI output can update category and priority

## 19. Risks and Mitigations

### Risk: Auth Edge Cases with GitLab Identity Data

Mitigation:

- normalize provider identity mapping carefully
- avoid relying on mutable display fields
- prefer provider user ID for uniqueness

### Risk: Serverless Rate Limiting Is Approximate

Mitigation:

- scope rate limiting to practical abuse prevention
- document that stronger shared-store limiting can be added later if needed

### Risk: Uptime Kuma Integration Details Unknown

Mitigation:

- lock UI to a provider interface now
- ship against mock data first
- support both API and page-parser adapters later

### Risk: AI Requirements Drift

Mitigation:

- defer AI until the product is already useful without it
- keep AI non-blocking and optional

## 20. Immediate Next Build Order

When implementation begins, the recommended sequence is:

1. Bootstrap Next.js project and tooling
2. Add design system foundation and theme setup
3. Set up Drizzle schema and migrations
4. Integrate GitLab auth and role bootstrap
5. Build admin application CRUD
6. Build ticket submission flows and admin ticket management
7. Add analytics
8. Add mock uptime provider and UI
9. Add rate limiting and tests
10. Add Mastra only after everything else is stable

## 21. Scope Summary

The MVP is intentionally focused:

- authenticated GitLab-only access
- admin/user RBAC
- admin-managed applications
- user ticket submission
- admin ticket management and analytics
- mock uptime visibility
- polished but restrained internal-tool UX

The system does not need, in MVP:

- attachments
- comments or conversations
- audit logs
- strict commit message enforcement
- live Uptime Kuma integration on day one
- AI-first triage before the core product works
