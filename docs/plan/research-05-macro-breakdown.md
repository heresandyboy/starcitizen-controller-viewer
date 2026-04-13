# Research: Full Macro Breakdown View — Keys, Buttons, and SC Action Mapping

## Problem

Users need to see three levels of information per binding:
1. **Semantic**: What happens in-game ("Toggle mining laser")
2. **Macro detail**: What reWASD actually sends ("DpadUp + LShift + F9")
3. **SC mapping**: What each key maps to per game mode ("DpadUp → Fire Mining Laser (Mining)")

Currently only level 1 is shown (partially, with the +N problem).

## Data Findings

### Macro step data already available in `ResolvedBinding.macro`:
```typescript
interface MacroSequence {
  steps: MacroStepResolved[];       // Each step has key, action (up/down), resolvedAction
  totalDurationMs: number;          // Macro total timing
  isSimple: boolean;                // true for single-key remaps
  keyboardKeysOutput: string[];     // Deduplicated keys
  gamepadButtonsOutput: string[];   // Deduplicated gamepad buttons
}
```

### Macro complexity distribution:
| Down-steps | Bindings | Notes |
|------------|----------|-------|
| 0 | 7 | Native gamepad (no macro) |
| 1 | 149 | Simple single-key remap (41%) |
| 2 | 52 | Two-key combo |
| 3 | 48 | Three-key macro |
| 4-6 | 61 | Medium complexity |
| 7+ | 49 | Complex / loop macros |
| 81+ | 9 | Turbo/loop macros |

### Key insight:
- **149 bindings (41%) are simple remaps** — one key, one action. No breakdown needed beyond the action name.
- **52 are two-key** — typically modifier+key or sequential press. Brief breakdown useful.
- **48+ are three-key or more** — these benefit most from the full breakdown.
- **Loop macros** (7+ steps with repeats) need deduplication first (research-03) before any meaningful breakdown.

### Example breakdown for A button long-press:
```
A [Main] long hold
├── Macro sends: RShift, NumpadMultiply
├── RShift → Lock Pitch/Yaw (Flight)
└── Numpad* → FOIP Recalibrate (General), Reset View (Camera)
```

## Recommended Solution

### Interaction model: Click-to-expand detail panel

The poster panel stays compact by default (one row per activator with best description). Clicking a row expands it to show the full breakdown:

**Collapsed row (default):**
```
Lock Pitch / Yaw Movement   hold   Flight Mining
```

**Expanded (on click):**
```
▼ Lock Pitch / Yaw Movement   hold
  Macro: RShift + Numpad*
  ├ RShift
  │  → Lock Pitch/Yaw Movement [Flight]
  │  → attackSecondary [FPS]
  └ Numpad*
     → FOIP Recalibrate [General]
     → Reset View [Camera]
```

### For simple remaps (1 key):
No expand needed — the row already shows the full picture. Optionally show the key name in muted text: `Lock Pitch/Yaw  (RShift)  Flight`

### For native gamepad bindings (no macro):
Show `(native)` indicator — no macro to break down.

### Implementation approach:

1. **BindingEntryRow gets an `expanded` state** (local useState or controlled from panel)
2. **Expanded view renders `MacroBreakdown` sub-component** that maps each unique key/button to its resolved actions
3. **Data source**: `binding.macro.steps[]` already has `resolvedAction` per step
4. **Deduplicated steps** (from research-03) group by unique key, show actions per key

### Depends on:
- research-03 (deduplication) — must happen first to avoid 781-row expansions
- research-01 (all actions visible) — the expanded view IS the "no more +N" solution
- research-02 (mode labels) — each action in expanded view shows its own mode

## Files to Change

- New: `apps/viewer/src/components/ControllerVisual/MacroBreakdown.tsx` — expanded detail view
- `apps/viewer/src/components/ControllerVisual/BindingEntryRow.tsx` — click-to-expand toggle
- `apps/viewer/src/components/ControllerVisual/BindingPanel.tsx` — handle expanded row height changes

## Implementation Tasks

1. **Build MacroBreakdown component** — renders key→action tree from macro steps
2. **Add click-to-expand to BindingEntryRow** — toggle between compact and expanded view
3. **Show key name on simple remaps** — muted inline text for 1-key bindings
