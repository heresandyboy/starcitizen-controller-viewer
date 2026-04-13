# Research: +N Hidden Actions Display

## Problem

When a reWASD macro sends multiple keypresses, each resolving to different SC actions, the poster row shows only the first action name with `+N` for the rest. Users can't see what the hidden actions are.

## Data Findings

- **220 of 280 resolved bindings (79%) have multiple actions**
- Action count distribution: 55 have 2 actions, 19 have 3, 21 have 4... up to 781 actions on extreme macro loops
- The massive counts (100+) are from **macro repeat loops** — e.g., P1 presses `L` key 138 times, each resolving to the same action
- Even moderate macros (3-6 unique keypresses) can resolve to 10-20 actions because one key like `LAlt` maps to ~39 SC actions across all modes

## Root Cause

The resolver treats every key-down event in a macro as an independent action resolution. A macro that presses LAlt once resolves it against ALL SC bindings for LAlt — producing matches in Flight, Mining, Salvage, General, etc. When the macro loops, each loop iteration re-resolves.

## Recommended Solution

### Phase 1: Deduplicate at the resolver level
- In `chainResolver.ts`, deduplicate resolved actions by `(actionName, actionMap)` tuple within a single binding
- Track repeat count but only emit each unique action once
- This alone cuts P1's 781 actions to ~40, and RT's 309 to 1

### Phase 2: Expand all actions in the poster panel (no +N)
- Replace the single-row-with-+N display with one sub-row per unique action
- Group by gameplay mode within the binding entry
- Each sub-row: `[ModeBadge] ActionName`
- Indent sub-rows under the parent activator row

### Phase 3: Collapse by mode (optional)
- If a binding has >5 unique actions, collapse by mode: `Flight (3 actions)`, `Mining (2 actions)`
- Click to expand

## Files to Change

- `apps/viewer/src/lib/parsers/chainResolver.ts` — deduplicate in `resolveBindingsV2()`
- `apps/viewer/src/components/ControllerVisual/BindingEntryRow.tsx` — expand sub-rows
- `apps/viewer/src/components/ControllerVisual/useControllerVisualData.ts` — adjust BindingEntry to carry deduplicated actions

## Implementation Tasks

1. **Deduplicate resolved actions in chainResolver** — dedupe by (actionName, actionMap), track repeat count
2. **Expand binding rows to show all actions** — remove +N, show sub-rows grouped by mode
