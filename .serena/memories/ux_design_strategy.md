# UX Design Strategy

## Core Design Principles

1. **Instant Findability** — Gamers mid-session need answers in seconds. Search is the primary interaction.
2. **Progressive Disclosure** — 2,800+ actions across 39 maps. Show summaries first, expand on demand.
3. **Multi-Perspective Data** — Same binding data viewable from different angles:
   - By Action: "What key does strafe left use?"
   - By Input: "What does pressing G do?" (reverse lookup)
   - By Category: "Show me all mining controls"
   - By Controller: Visual controller layout showing all mappings per physical button
4. **Composable Filters** — Input type + action map + bound/unbound + search text — all combinable, all clearable individually. Shared across all views.
5. **Zero-Config Useful** — Immediately useful on first load. Defaults show everything; filters reduce.
6. **Comparison as First-Class** — Default vs custom bindings comparison is a core use case.
7. **Usability First, Beauty Second** — Functional, fast, accessible. Dark OLED style for aesthetics but never at cost of usability.

## Design System (from UI/UX Pro Max analysis)

- **Style**: Dark Mode OLED — WCAG AAA, excellent performance, matches SC aesthetic
- **Typography**: Fira Code (headings/data) + Fira Sans (body) — technical, precise, readable
- **Palette**:
  - Primary: #7C3AED (purple accent)
  - Secondary: #A78BFA (lighter purple)
  - CTA: #F43F5E (action red)
  - Background: #0F0F23 (deep dark)
  - Text: #E2E8F0 (high contrast)
- **Effects**: Minimal glow only, no distracting animations. Smooth transitions 150-300ms.
- **Icons**: SVG only (Lucide/Heroicons), never emojis
- **Accessibility**: 4.5:1 contrast minimum, visible focus rings, keyboard navigable, prefers-reduced-motion respected
- **Responsive**: 375px, 768px, 1024px, 1440px breakpoints

## Proposed Views

### View 1: Table View (enhanced current)
- Dense, scannable, power-user oriented
- Sortable columns, toggleable input type columns
- Grouped by action map with collapse/expand
- Shared filter bar at top

### View 2: Card View
- One card per action showing all bindings
- More visual, less dense, learning-oriented
- Good for new players discovering controls

### View 3: Controller Visual View (end-game feature)
- Interactive SVG of controller (Xbox Elite 2 as primary)
- Shift/modifier layer selector to switch views
- Click/hover button to see full action chain
- Color-coded by action category
- Filterable by game mode
- Digital equivalent of the GCO 4.5 control scheme image

### View 4: Comparison View
- Side-by-side default vs custom config
- Highlight differences/remapped actions
- Show added/removed/changed bindings

## Unified Filter Bar Architecture
All views share a single composable filter bar:
- **Input type toggles**: Keyboard/Mouse | Gamepad | Joystick (multi-select, show all default)
- **Action map dropdown**: Multi-select with search, grouped by category
- **Binding state**: All | Bound Only | Unbound Only (tri-state)
- **Text search**: Always visible, real-time, searches all fields
- **Active filter pills** with individual clear + "Clear all"
- **View switcher**: Toggle between Table / Card / Controller Visual views

## UX Guidelines Applied
- Tables: overflow-x-auto wrapper on mobile, card layout alternative
- Search: "No results" with suggestions, debounced real-time filtering
- Keyboard nav: tab order matches visual order, visible focus rings
- Skip links for nav-heavy pages
- Sticky nav with padding compensation
- Skeleton loaders for async content
