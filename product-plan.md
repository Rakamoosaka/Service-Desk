# Service Desk Product Plan

## Goal

Turn the application page at `/app/[slug]` into a simple support workspace.

When someone opens an application, they should immediately be able to:

- choose the kind of request they want to submit
- fill in the right form without guessing where it goes
- see every service for that application and its current status

This page should feel focused and useful. It should not show extra panels that do not help the user take action.

## What Is Wrong With The Current Page

The current version mixes one generic ticket form with two panels that do not match the main job of the page:

- `Recent ticket activity`
- `Application map`

These panels add noise instead of helping a user report an issue or check service health.

## Product Decision

The application page should be rebuilt around two things only:

1. three clear request forms
2. one service status list

## Target Experience For `/app/[slug]`

### 1. Application Header

Keep the application name and short description at the top.

The header should explain the page in plain language, for example:

- report a problem
- request a change
- share feedback
- check service health

### 2. Three Separate Forms

Replace the single generic ticket form with three explicit form blocks.

The three forms should be:

1. `Report an issue`
2. `Request a change`
3. `Share feedback`

Each form should feel distinct, even if some fields overlap.

#### Report an issue

Purpose:

- for bugs, broken flows, outages, and unexpected behavior

Expected fields:

- title
- what happened
- impact on work
- affected service

#### Request a change

Purpose:

- for new features, workflow improvements, or missing functionality

Expected fields:

- title
- requested change
- why it matters
- related service

#### Share feedback

Purpose:

- for general feedback, friction points, and smaller improvement notes

Expected fields:

- title
- feedback details
- optional related service

### 3. Service Status List

Replace `Application map` with a real service list that shows operational state.

Each service row should show:

- service name
- short description
- current status
- whether it is being monitored
- link to the service detail page if that page remains part of the product

The point of this section is not to explain architecture. The point is to answer: `which part is healthy and which part is not?`

## Status Model For Services

The status list should use service-health language, not ticket-workflow language.

Recommended visible statuses:

- `Operational`
- `Degraded`
- `Outage`
- `Unknown`

Rules:

- if monitoring data exists, show the live or latest known service status
- if monitoring is missing or unavailable, show `Unknown`
- do not hide services just because monitoring is not connected

## Page Layout Direction

The page should be easy to scan.

Recommended structure:

1. application header
2. three request forms grouped together
3. service status list below or beside the forms, depending on available width

On desktop, the forms and service list can sit in separate columns.

On mobile, the layout should stack in this order:

1. header
2. forms
3. service list

## What Must Be Removed

Remove these from the application page:

- `Recent ticket activity`
- `Application map`

Also remove any nearby copy that tells users this page is mainly for viewing ticket activity.

## Content And Copy Direction

Use plain language.

Good:

- `Report an issue`
- `Request a change`
- `Share feedback`
- `Service status`

Avoid:

- architecture-heavy explanations
- internal technical wording that normal users do not need
- descriptions focused on microservice structure instead of user outcomes

## Scope For The First Change

This redesign does not need new complex product behavior.

For the first delivery:

- the three forms can still create the same ticket object underneath
- each form should set the right ticket type automatically
- the service list can use the current monitoring information that already exists, with `Unknown` as the safe fallback

This keeps the product clearer without requiring a backend rewrite.

## Acceptance Criteria

The change is complete when:

1. `/app/[slug]` shows three distinct request forms
2. `/app/[slug]` shows a service list with one visible status per service
3. `Recent ticket activity` is gone
4. `Application map` is gone
5. the page copy is understandable without technical knowledge
6. the layout works on desktop and mobile

## Delivery Plan

### Phase 1: Page Restructure

- remove the two unwanted panels
- replace the single intake area with three clear request sections
- rewrite the page copy to focus on action and service health

### Phase 2: Service Status Presentation

- make the service list the main supporting section on the page
- show a status label for every service
- make `Unknown` the default when status data is missing

### Phase 3: Visual Polish

- match the final layout to the desired screenshot direction
- improve spacing, hierarchy, and badge styling
- ensure the forms feel intentionally different from each other

## Assumption To Confirm

This plan assumes the screenshot direction means:

- three clearly separated request areas
- a compact service list with visible status badges
- less dashboard noise and more direct action

If the screenshot includes a more specific layout pattern, that can be applied during implementation without changing the core product plan.
