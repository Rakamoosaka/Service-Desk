# Service Desk Design System (KOZ AI)

## Direction

The interface embodies a highly modern, tech-forward aesthetic driven by dark mode, neon accents, and clean, geometric typography. It leans into a futuristic AI brand narrative—sharp, high-contrast, yet deeply functional and precise.

## Typography

- Display / Headers: **Outfit** for striking, geometric headings and page titles.
- Body / UI Elements: **Satoshi** for modern, highly legible body copy and form elements.
- Data / Operational: **Manrope** for dense data tables, precise numeric metrics, and structural metadata.

## Color Tokens

- Canvas: Deep blacks (`#050505`, `#141414`) for primary and secondary background planes.
- Panels & Elevated Surfaces: Subtle dark greys (`#171717`, `#262626`, `#3d3d3d`) for cards, dialogs, and sidebar surfaces.
- Accents (Neon glow/action):
  - Primary Neon Cyan: `#0dd7f2` for active states, primary buttons, and navigational focus.
  - Secondary Neon Pink/Red: `#ff2244` (approx `#f24`) for destructive actions, alerts, or critical badges.
- Text & Iconography:
  - Primary Text: Bright white (`#ffffff`) and off-white (`#dedede`).
  - Muted Text: Soft greys (`#afafaf`, `#919191`, `#626262`) for disabled states, placeholders, and secondary metadata.

## Surfaces

- Cards drop the soft drop-shadows in favor of sharp 1px borders (e.g., `#262626`) and flat dark backgrounds.
- Optional subtle glowing borders or glowing box-shadows (cyan or pink) on active inputs or selection.
- Interactive elements feature subtle, bright-neon hover states and tight border radii.

## Motion

- Crisp, aggressive transitions (fast durations, sharp eases).
- Subtle neon glowing effects on hover transitions for primary interactive layers.
- Avoid playful bouncing; rely on crisp opacity or 1px shifts.

## Layout

- Full-bleed dark canvas stretching edge-to-edge.
- The protected shell uses a dark, structured rail separating content zones via thin `#262626` dividing strokes.
- High contrast with neon status badges (`#0dd7f2` for active, `#ff2244` for error) to pop against the dark canvas (`#141414`).
