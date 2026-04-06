# Plan 02: reWASD Parser v2

**Beads:** `controller-4x5`
**Phase:** 1b (Foundation)
**Dependencies:** [01-data-types-v2.md](01-data-types-v2.md)
**Plan overview:** [00-overview.md](00-overview.md)

---

## Goal

Enhance the reWASD parser to extract full macro sequences, gamepad outputs, activator parameters, and layer hierarchy. Currently the parser flattens macros to unique key names and discards sequencing, timing, and gamepad outputs.

---

## Current State

**File:** `src/lib/parsers/rewasdParser.ts`

Current behavior:
- Extracts buttons, shift IDs, activator types
- Flattens macros to unique keyboard key names only
- Ignores gamepad output steps (GP:DpadUp, GP:Y, etc.)
- Loses macro step ordering and timing
- Does not capture activator timing params (delay, singlewaittime, etc.)
- Layer hierarchy is not captured

---

## Changes Required

### 1. Replace `extractKeyboardKeys()` with `extractFullMacroSequence()`

Walk each step in the reWASD macro array and produce a `MacroStepResolved`:

```typescript
// Current: returns ["LShift", "F7"]
// New: returns MacroSequence with ordered steps including down/up, pauses, gamepad
```

Step type mapping:
| reWASD `DeviceType` | Output type |
|---------------------|-------------|
| 0 (keyboard) | `'keyboard'` |
| 1 (gamepad) | `'gamepad'` |
| 2 (mouse) | `'mouse'` |
| pause object | `'pause'` |
| rumble object | `'rumble'` |

For each step, capture:
- `key`: Normalized key name via DIK mapping (keyboard) or gamepad button mapping
- `action`: `'down'` or `'up'` based on the action field
- `dikCode`: Original DIK code string for debugging
- `durationMs`: For pause steps

### 2. Capture activator timing params

From the `params` object on each activator:
- `delay` → `delayMs`
- `singlewaittime` → `longPressMs`
- `doublewaittime` → `doubleTapWindowMs`
- `macro` flag → indicates this is a macro (vs. simple remap)

### 3. Build layer metadata

Extract from the reWASD config's shift definitions:
- Shift ID, name, trigger button
- Parent-child relationships for sub-layers
- `unheritableMasks` for layers that block inheritance
- Layer type (hold, toggle, radialMenu)

Output: `ShiftLayer[]` array

### 4. Capture gamepad output steps

When a macro step has `DeviceType: 1`, extract the gamepad button name:
- Map reWASD button IDs to normalized names (e.g., `1 → "A"`, `4 → "Y"`, `8 → "DpadUp"`)
- These will be resolved against `gp1_*` bindings in the chain resolver

### 5. Compute MacroSequence metadata

After building the steps array:
- `totalDurationMs` = sum of all pause step durations
- `isSimple` = true if exactly 1 keyboard/gamepad down step + 1 up step, no pauses
- `keyboardKeysOutput` = unique keyboard keys (for backward compat / summary)
- `gamepadButtonsOutput` = unique gamepad buttons

---

## New Output Type

```typescript
interface ParsedRewasdMappingV2 {
  maskId: number;
  buttonName: string;
  shiftId?: number;
  activator: {
    type: ActivatorType;
    mode: ActivatorMode;
    params?: { delayMs?: number; longPressMs?: number; doubleTapWindowMs?: number; };
  };
  macro: MacroSequence;
  jumpToLayer?: number;
  description?: string;
}
```

---

## Testing

Use the existing `GCO 4.7 HOTAS.rewasd` fixture file. Key test cases:

1. **Simple remap**: X button Main single → should produce `isSimple: true`, one keyboard key
2. **Multi-key macro**: A button Main start → should produce full 15-step sequence with pauses
3. **Gamepad output**: Any mapping with `GP:*` output → should appear as gamepad step type
4. **Mixed macro**: Mappings that output both keyboard and gamepad → both step types present
5. **Layer metadata**: All 11 shifts extracted with correct hierarchy
6. **Activator params**: Long press timing captured correctly

---

## Acceptance Criteria

- [ ] Full macro sequences preserved with step ordering
- [ ] Gamepad output steps captured (not filtered)
- [ ] Activator timing params captured
- [ ] Layer hierarchy extracted as `ShiftLayer[]`
- [ ] `isSimple` flag correctly identifies single-key remaps
- [ ] Existing tests still pass (old parser functions remain available)
- [ ] Unit tests for all 5 test cases above
