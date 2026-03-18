# Service Desk Design System

## Direction

The interface is an editorial internal tool: sharp structure, warm neutrals, high-contrast labels, and restrained accent color. It should feel precise rather than playful.

## Typography

- Body: IBM Plex Sans for dense operational UI and readable tables.
- Display: Fraunces for page headers, section titles, and emphasized metrics.

## Color Tokens

- Canvas: warm paper neutrals, not pure white.
- Panels: slightly elevated cream cards in light mode, charcoal stone in dark mode.
- Accent: ember orange for action states and active navigation.
- Status colors:
  - `new`: muted blue
  - `in_review`: amber
  - `resolved`: green
  - `closed`: zinc

## Surfaces

- Cards use soft outlines and long shadows instead of hard borders.
- Dense admin tables keep generous row spacing to avoid spreadsheet fatigue.
- Form sections are grouped with small caps labels and clear field rhythm.

## Motion

- Motion is functional only.
- Use short fades and vertical easing for page entry, dialogs, and success feedback.
- Avoid decorative looping animation.

## Layout

- The protected shell is a split layout with a narrow navigation rail and a wide working canvas.
- Pages should open with a clear title row, supporting description, and a compact action zone.
