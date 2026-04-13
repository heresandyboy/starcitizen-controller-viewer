# Research: Duplicate SC Actions from Repeated Macro Keypresses

## Problem

reWASD macros often send the same key multiple times (turbo mode, loop macros). Each keypress resolves to the same SC action, creating duplicate entries.

## Data Findings

- **74 bindings have duplicate actions** (26% of resolved bindings)
- Worst case: P1 Main start has `v_ifcs_speed_limiter_off` appearing **138 times** (L key looped)
- RT Main start has same action repeated **309 times** (Home key looped)
- Common duplicates: 2-4x repeats from macros that press release press release sequences
- Examples: "Exit seat" 4x, "attackSecondary" 2x, "holster" 2x

## Root Cause

The resolver in `chainResolver.ts` walks every macro step and resolves each independently. It doesn't track whether the same action was already resolved from a previous step. Turbo/loop macros amplify this because they repeat the same key 10-600+ times.

## Recommended Solution

### Deduplicate at the resolver level (in `resolveBindingsV2`)

After walking all macro steps, deduplicate `allActions` by `(actionName, actionMap)`:

```typescript
// After the step-walking loop:
const deduped = new Map<string, ResolvedAction & { repeatCount: number }>();
for (const action of allActions) {
  const key = `${action.actionMap}::${action.name}`;
  if (deduped.has(key)) {
    deduped.get(key)!.repeatCount++;
  } else {
    deduped.set(key, { ...action, repeatCount: 1 });
  }
}
const finalActions = [...deduped.values()];
```

### Add `repeatCount` to ResolvedAction type

Optional field — only meaningful for display (e.g., showing `×138` badge for turbo macros). Most bindings will have repeatCount=1.

### Display changes

- Use deduplicated actions for poster rows — eliminates 74 bindings worth of noise
- Show `×N` suffix for actions with repeatCount > 1 (indicates turbo/loop behavior)
- This is a prerequisite for research-01 (expanding all actions) — without dedup, expanding would show 781 rows for P3

## Files to Change

- `apps/viewer/src/lib/parsers/chainResolver.ts` — deduplicate in the step-walking loop
- `apps/viewer/src/lib/types/binding.ts` — add optional `repeatCount` to `ResolvedAction`
- `apps/viewer/src/components/ControllerVisual/BindingEntryRow.tsx` — show ×N for turbo repeats

## Implementation Tasks

1. **Deduplicate resolved actions in chainResolver** — by (actionName, actionMap) with repeatCount tracking
2. **Add repeatCount to ResolvedAction type and display ×N indicator**

## Note

This task and research-01 share the same code change in chainResolver. They should be implemented together — dedup first, then expand display.
