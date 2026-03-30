# Service Desk Design System (KOZ AI)

## Direction

The homepage presents a compact, operational dashboard rather than a flashy AI shell. It is dark by default, highly structured, and built around dense status information, thin borders, and cyan-forward actions.

The overall feel should be precise, calm, and technical: utility first, with just enough glow to signal focus and system state.

## Theme Behavior

- The app mounts in dark mode by default.
- The homepage uses a deep black canvas with near-black panels and white text.
- Cyan is the primary brand/action color; warning and destructive states stay visually loud but contained.

## Typography

- Display / Headers: **Outfit** for large page titles, section headings, and application names.
- Body / UI Elements: **Manrope** for body copy, labels, navigation, and controls.
- Data / Operational: **Manrope** for metrics, counts, and compact status readouts.

Typography should stay tight and pragmatic: small uppercase labels, strong tracking on metadata, and restrained line lengths for descriptions.

## Color Tokens

- Canvas: `#050505` for the main background, with subtle tonal variation from `#090909`.
- Panels: `#171717` with border lines in `#262626` and adjacent dark steps for depth.
- Accent: `#0dd7f2` for primary buttons, active states, linked status, and highlight text.
- Warning: `#ff8a3d` for degraded states and cautionary metrics.
- Destructive: `#ff2244` for outages and destructive actions.
- Text: `#ffffff` for primary copy, `#dedede` for panel copy, and muted greys such as `#919191` and `#626262` for secondary labels.

Use color sparingly. Most of the hierarchy should come from contrast, spacing, and border treatment rather than saturated fills.

## Surfaces

- Cards are flat, dark rectangles with 1px borders and minimal shadowing.
- The homepage relies on rounded-xl containers, rounded-lg utility panels, and full-width sections that feel clipped and intentional.
- Metric blocks are grouped into bordered subpanels with internal dividers instead of separate floating cards.
- Accent treatments are subtle: a cyan border, cyan text, or a faint glow on hover is enough.

## Components

- Primary buttons are uppercase, compact, rounded-xl controls with strong fill contrast.
- Secondary buttons remain transparent or panel-colored and gain emphasis on hover through border and text color changes.
- Badges are pill-shaped, uppercase labels with tight tracking. Status tones map cleanly to neutral, success, warning, and danger.
- Status summaries should be readable at a glance: label on top, number below, with the number always carrying the visual weight.
- Navigation and account controls should stay visually light and unobtrusive compared with the main action CTA.

## Layout

- The homepage is a two-column composition on large screens: a narrow left rail and a wider application list.
- The left rail acts as a control panel with greeting, primary CTA, summary metrics, and account actions.
- The main region contains a section header and a vertical stack of application cards.
- Application cards are spacious but still dense enough to support operational scanning.
- Borders and separators do most of the structural work; avoid relying on large background shifts.

## Motion

- Motion should feel fast, restrained, and exact.
- Use short entrance fades and small Y-offsets for page sections.
- Hover transitions should be crisp and subtle, especially on buttons, badges, and card actions.
- Avoid playful easing or exaggerated movement. A small lift, border change, or glow is sufficient.

## Content Tone

- Copy should be short and functional.
- Labels should use uppercase microcopy for metadata and metrics.
- Descriptions should explain what a user can do, not market the interface.
- Status language should be explicit: operational, degraded, outage, or unknown.

## Practical Rules

- Prefer dark backgrounds, 1px borders, and compact spacing over large decorative shapes.
- Prefer cyan accents for action and focus, reserving warning and destructive colors for true system states.
- Keep pages information-dense but not cluttered.
- Treat the homepage as a status cockpit: everything should support fast scanning and quick task entry.
