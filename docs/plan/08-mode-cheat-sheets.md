# Plan 08: Mode Cheat Sheets

**Beads:** `controller-dc3`
**Phase:** 3a
**Dependencies:** [04-chain-resolver-v2.md](04-chain-resolver-v2.md), [05-shared-components.md](05-shared-components.md)
**Plan overview:** [00-overview.md](00-overview.md)

---

## Goal

Build contextual cheat sheets filtered by gameplay mode — "I'm flying right now, what are all my controls?" Compact, scannable format optimized for quick reference during gameplay.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Flight] [FPS] [Mining] [EVA] [Vehicle] [General]          │  ← Mode tabs
├─────────────────────────────────────────────────────────────┤
│  Layer: [Main ▾]    Show: [Essential] [All]                  │
├─────────────────────────────────────────────────────────────┤
│  ── WEAPONS ──────────────────────────────────────────────  │
│  A (single)    → Fire Group 1                               │
│  A (long)      → Weapon Group 3                             │
│  X (single)    → Cycle Missile Forward                      │
│  RB (single)   → Launch Missile                             │
│                                                             │
│  ── TARGETING ────────────────────────────────────────────  │
│  DpadDown (s)  → Cycle Pinned Targets                       │
│  DpadUp (s)    → Cycle Hostile Targets                      │
│                                                             │
│  ── POWER ────────────────────────────────────────────────  │
│  [Hold LB] B (single) → Cycle Power Preset                 │
│  [Hold LB] B (long)   → Reset Power                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

1. **Pre-filtered to one gameplay mode** at a time
2. **Sub-grouped by action category** (Weapons, Targeting, Movement, Power, etc.)
3. **Default layer is Main** with dropdown to switch (not tabs — less prominent than Layer Browser)
4. **"Essential" mode** hides rarely-used actions based on action map importance ranking
5. **Compact, scannable format** — one line per binding
6. **Layer prefix** for non-Main layers: `[Hold LB]` before button name
7. **Printable / exportable** as image or PDF (Phase 5 polish)

---

## Sub-category Grouping

```typescript
const FLIGHT_SUBCATEGORIES = {
  'Movement':  ['spaceship_movement'],
  'Weapons':   ['spaceship_weapons', 'spaceship_missiles'],
  'Targeting': ['spaceship_targeting', 'spaceship_targeting_advanced'],
  'Defense':   ['spaceship_defensive'],
  'Power':     ['spaceship_power'],
  'HUD':       ['spaceship_hud'],
  'General':   ['spaceship_general', 'spaceship_view', 'spaceship_quantum', 'spaceship_docking'],
};

const FPS_SUBCATEGORIES = {
  'Movement':  ['player'],
  'Combat':    ['player_choice'],
  'Interaction': ['tractor_beam', 'player_input_optical_tracking'],
  'EVA':       ['zero_gravity_eva', 'zero_gravity_traversal'],
  'Emotes':    ['player_emotes'],
};

// Similar for Mining, EVA, Vehicle modes
```

---

## Data Query

```typescript
const modeBindings = bindingIndex.byMode.get(selectedMode);
// Filter to selected layer (or all layers)
// Sub-group by action map → subcategory mapping
// Sort within each subcategory by button + activator
```

---

## Component Structure

```
src/components/ModeCheatSheet/
  ModeCheatSheet.tsx         - Main container with mode tab state
  ModeTabStrip.tsx           - Mode selector tabs
  SubcategoryGroup.tsx       - Grouped actions under a heading
  CheatSheetRow.tsx          - Compact single binding row
  index.ts
```

---

## Acceptance Criteria

- [ ] Mode tabs filter to relevant gameplay actions
- [ ] Actions sub-grouped by category with headers
- [ ] Compact one-line format per binding
- [ ] Essential/All toggle reduces clutter
- [ ] Layer dropdown filters within mode
- [ ] Non-Main layer bindings show modifier prefix
- [ ] Responsive on mobile
