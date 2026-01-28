# Unified Filter Bar Progress (controller-fbv)

## Status: IN PROGRESS — Types + Logic + Hook DONE, Visual Components IN PROGRESS

## Completed Work This Session

### controller-1fx: Design System (CLOSED)
- Created globals.css with full @theme inline design token system
- Tokens: background hierarchy (5), accent colors (6), text hierarchy (4), input type badges (5 with subtle variants), semantic status (4 with subtle variants), borders (3), shadows (8 including glow), border radius (7)
- Fira Code (display/mono) + Fira Sans (body) via next/font/google in layout.tsx
- Class-based dark mode via @custom-variant dark
- Created /design-system reference page at app/design-system/page.tsx
- Updated page.tsx to use new semantic tokens
- Custom scrollbar styling, ::selection, focus-ring utility, reduced-motion support

### controller-cf0: Implement Design System (CLOSED)
- Covered by 1fx work — tokens, fonts, dark mode, page shell all done
- Existing components work via dark: class bridge
- Component-level token migration deferred to view implementations

### controller-fbv: Unified Filter Bar (IN PROGRESS)
Files created so far:
- `src/lib/types/filters.ts` — FilterState, FilterActions, FilterMeta types, InputType/BindingState/ViewMode unions, constants (ALL_INPUT_TYPES, labels)
- `src/lib/filters/filterActions.ts` — Pure filter logic: filterActions(), groupActionsByMap(), getUniqueActionMaps(). Filter pipeline: text search → action map → binding state. Includes reverse binding lookup in search.
- `src/lib/hooks/useFilterState.ts` — useFilterState() hook returning {filters, actions, meta}. Manages searchQuery, inputTypes (Set), actionMaps (Set), bindingState, activeView. Enforces at least one input type selected.
- `src/components/FilterBar/` — Directory created, visual components NOT YET BUILT

### What's Next for fbv
Build FilterBar visual components:
1. FilterBar.tsx — Main composed container
2. SearchInput.tsx — Search field with icon + clear
3. InputTypeToggles.tsx — Multi-select toggle buttons (kbd/mouse/gamepad/joystick)
4. ActionMapSelector.tsx — Multi-select dropdown with category grouping + search
5. BindingStateToggle.tsx — Tri-state segmented control (All/Bound/Unbound)
6. FilterPills.tsx — Active filter chips with individual clear + clear all
7. ViewSwitcher.tsx — Table/Card/Controller toggle icons
8. index.ts — Barrel exports

### Design System Token Reference (for components)
Use ONLY these Tailwind classes (from globals.css @theme):
- Backgrounds: bg-background, bg-surface, bg-surface-elevated, bg-surface-hover, bg-surface-dim
- Accents: bg-primary, bg-primary-hover, bg-primary-light, bg-primary-subtle, bg-cta, bg-cta-hover
- Text: text-text, text-text-secondary, text-text-muted, text-text-dim
- Input badges: bg-kbd(-subtle), bg-mouse(-subtle), bg-gamepad(-subtle), bg-joystick(-subtle), bg-rewasd(-subtle)
- Semantic: bg-success(-subtle), bg-warning(-subtle), bg-error(-subtle), bg-info(-subtle)
- Borders: border-border, border-border-subtle, border-border-accent, border-ring (focus)
- Fonts: font-display (Fira Code), font-body (Fira Sans), font-mono (Fira Code)
- Shadows: shadow-sm/md/lg/xl, shadow-glow-sm/md/lg, shadow-glow-cta
- Radius: rounded-xs/sm/md/lg/xl/2xl/full
- Focus: focus-ring class for focus-visible outlines

### Existing Filter Architecture (from exploration)
- DefaultActionBrowser: text search + collapse/expand groups by mapName
- GameActionBrowser: text search + category dropdown + input type dropdown + view mode
- MappingBrowser: fuzzy search (Fuse.js) + mode dropdown + modifier dropdown
- Data type: SCDefaultAction with keyboardBind/mouseBind/gamepadBind/joystickBind fields
- 39 action maps grouped by GameplayMode categories (General, Flight, FPS, EVA, Vehicle, Mining, Salvage, Scanning, Turret, Inventory, Mobiglass, Camera, Social, Unknown)
- ACTION_MAP_MODES constant maps mapName → GameplayMode
