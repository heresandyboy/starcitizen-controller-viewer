# Plan 03: Key Mapping Completeness

**Beads:** `controller-1uy`
**Phase:** 1c (Foundation)
**Dependencies:** None (can run parallel with 01-02)
**Plan overview:** [00-overview.md](00-overview.md)

---

## Goal

Ensure complete mappings between:
1. reWASD DIK codes → SC keyboard key names (`kb1_*`)
2. reWASD gamepad output → SC gamepad key names (`gp1_*`)

Missing mappings cause unresolved bindings — the viewer can't show what an action does.

---

## Part 1: DIK-to-SC Key Mapping

**File:** `src/lib/constants/dikKeys.ts`

### Task

1. Extract all unique DIK codes from `GCO 4.7 HOTAS.rewasd`
2. Extract all unique `kb1_*` keys from the SC XML
3. Cross-reference: find any DIK codes that have no SC key mapping
4. Add missing mappings

### Known gaps

The current file has ~100 mappings. The GCO profile uses DIK codes for ~212 keyboard-only macros + ~27 mixed macros. Some codes may be unmapped.

### Validation approach

Write a script or test that:
1. Parses the reWASD fixture file
2. Extracts all DIK codes used
3. Checks each against the DIK mapping
4. Reports unmapped codes

---

## Part 2: reWASD Gamepad → SC Gamepad Mapping

**File:** `src/lib/constants/gamepadButtons.ts` (extend or new section)

### Task

Create a mapping from reWASD gamepad output format to SC XML gamepad format.

### Mapping table needed

```typescript
const REWASD_GP_TO_SC: Record<string, string> = {
  'GP:A': 'gp1_a',              // or however reWASD names it
  'GP:B': 'gp1_b',
  'GP:X': 'gp1_x',
  'GP:Y': 'gp1_y',
  'GP:LeftShoulder': 'gp1_shoulderl',
  'GP:RightShoulder': 'gp1_shoulderr',
  'GP:LeftTrigger': 'gp1_triggerl_axis',
  'GP:RightTrigger': 'gp1_triggerr_axis',
  'GP:DpadUp': 'gp1_dpad_up',
  'GP:DpadDown': 'gp1_dpad_down',
  'GP:DpadLeft': 'gp1_dpad_left',
  'GP:DpadRight': 'gp1_dpad_right',
  'GP:Back': 'gp1_back',
  'GP:Start': 'gp1_start',
  'GP:LeftStick': 'gp1_thumbl',
  'GP:RightStick': 'gp1_thumbr',
  // ... etc
};
```

### Research needed

- Check the reWASD JSON to see the exact format used for gamepad outputs in macros
- The outputs may use numeric button IDs, not string names — need to verify
- Map those to the SC XML `gp1_*` naming convention

---

## Acceptance Criteria

- [ ] All DIK codes from GCO 4.7 fixture have valid SC key mappings
- [ ] Gamepad output mapping table created and exported
- [ ] Validation script/test that reports unmapped codes
- [ ] Zero unmapped codes for the GCO 4.7 profile
