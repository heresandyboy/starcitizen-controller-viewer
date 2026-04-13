# Research: Misleading Game Mode Labels on Multi-Mode Macros

## Problem

Each binding row shows a single gameplay mode badge from the first resolved action. But 67% of resolved bindings (187 of 280) trigger actions across multiple game modes. The displayed mode is often misleading.

## Data Findings

- 93 bindings are single-mode, 187 are multi-mode
- Common multi-mode pattern: A key like LAlt maps to Flight + Mining + Salvage + General actions simultaneously
- The "first" action's mode is arbitrary — it depends on the order SC action maps appear in the XML, not on importance
- 25 actionmaps in defaultProfile.xml currently map to `Unknown` because they're missing from `ACTION_MAP_MODES` — including the critical `player` map (190+ actions!), `player_choice`, `view_director_mode`, `spaceship_docking`, `prone`, `tractor_beam`, and more

## Root Cause

1. `getGameplayMode()` has an incomplete mapping — many actionmaps return `Unknown`
2. The poster row only shows `primaryAction?.gameplayMode` (the first action)
3. No concept of "which mode is the primary/intended one" for a multi-mode macro

## Recommended Solution

### Phase 1: Fix the Unknown mode gap
Add missing actionmaps to `ACTION_MAP_MODES` in `scActions.ts`:
- `player` → `FPS` (on foot)
- `player_choice` → `General` (interaction mode)
- `view_director_mode` → `Camera`
- `prone` → `FPS`
- `tractor_beam` → `General`
- `spaceship_docking` → `Flight`
- `spaceship_targeting_advanced` → `Flight`
- `vehicle_mfd` → `Flight` (MFDs in cockpit)
- `vehicle_mobiglas` → `Mobiglass`
- `lights_controller` → `General`
- `flycam` → `Camera`
- `character_customizer` → `General`
- `hacking` → `FPS`
- `mining` (FPS hand mining) → `Mining`
- `mapui` → `General`
- `zero_gravity_traversal` → `EVA`
- `incapacitated` → `FPS`
- Remove phantom entries (`fps_movement`, `fps_view`, etc.) that don't exist in SC 4.7

### Phase 2: Show all unique modes per binding
- Instead of one mode badge, show all unique modes as small badges
- In the expanded sub-row view (from research-01), each action already has its own mode
- In collapsed view, show up to 3 mode badges, then `+N` for more

### Phase 3: Mode is per-action, not per-binding
- Once sub-rows are expanded (research-01), each action carries its own mode badge
- The binding-level mode badge becomes unnecessary or shows "Multi"

## Files to Change

- `apps/viewer/src/lib/constants/scActions.ts` — fix ACTION_MAP_MODES
- `apps/viewer/src/components/ControllerVisual/BindingEntryRow.tsx` — multi-mode display

## Implementation Tasks

1. **Fix ACTION_MAP_MODES mapping** — add 15+ missing actionmaps, remove phantoms
2. **Show all unique modes per binding row** — multiple badges or per-action in expanded view
