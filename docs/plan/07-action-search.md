# Plan 07: Action Search (Reverse Lookup View)

**Beads:** `controller-91e`
**Phase:** 2c
**Dependencies:** [04-chain-resolver-v2.md](04-chain-resolver-v2.md), [05-shared-components.md](05-shared-components.md)
**Plan overview:** [00-overview.md](00-overview.md)

---

## Goal

Build the Action Search view — a reverse lookup that answers "I want to do X in the game, how do I press it?" Users search for a game action and see every controller path to trigger it.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Search: [cycle missile________]                             │
│  Mode: [Flight ▾]  [FPS ▾]  [All Modes]                    │
├─────────────────────────────────────────────────────────────┤
│  ✈ Cycle Missile Forward                                    │
│  spaceship_missiles.v_weapon_cycle_missile_fwd              │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Main layer → X button → single press            │       │
│  │  Chain: X → DIK_INSERT → kb1_insert → action     │       │
│  ├──────────────────────────────────────────────────┤       │
│  │  LB layer → DpadRight → single press             │       │
│  │  Chain: DpadRight → DIK_PGUP → kb1_pgup → action│       │
│  └──────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

1. **Fuzzy search** across action display names, SC action names, and action maps
2. **Results grouped by game action** — each action card shows ALL controller paths to trigger it
3. **Each trigger path shows**: layer → button → activator type → chain visualization
4. **Gameplay mode filter** narrows results to relevant modes
5. **"Easiest" paths first**: Main layer single press sorted above sub-layer double-tap
6. **Plain English instructions**: "Hold LB, then press X" alongside the technical chain
7. **Action count badge**: Shows how many controller paths exist for each action

---

## Data Query

```typescript
// Fuzzy search against all action names
const matchingActions = fuzzySearch(query, bindingIndex.byAction.keys());

// For each matched action, get all bindings
const bindings = bindingIndex.byAction.get(actionName);

// Sort: Main layer first, then by activator simplicity
bindings.sort((a, b) => {
  if (a.layer.isDefault !== b.layer.isDefault) return a.layer.isDefault ? -1 : 1;
  return ACTIVATOR_PRIORITY[a.activator.type] - ACTIVATOR_PRIORITY[b.activator.type];
});
```

---

## Plain English Generation

```typescript
function toPlainEnglish(binding: ResolvedBinding): string {
  const layer = binding.layer.isDefault ? '' : `Hold ${binding.layer.triggerButton}, then `;
  const activator = {
    single: 'press',
    double: 'double-tap',
    long: 'hold',
    start: 'press and hold',
    release: 'release',
  }[binding.activator.type];
  return `${layer}${activator} ${binding.button}`;
}
// → "Hold LB, then press X"
// → "double-tap A"
// → "press and hold Menu"
```

---

## Component Structure

```
src/components/ActionSearch/
  ActionSearch.tsx           - Main container with search state
  ActionSearchInput.tsx      - Fuzzy search input with debounce
  ActionResultCard.tsx       - One game action with all trigger paths
  TriggerPath.tsx            - One way to trigger the action
  PlainEnglishInstruction.tsx - "Hold LB, then press X (single)"
  index.ts
```

Uses shared: `MacroChainViz`, `LayerBadge`, `ActivatorBadge`, `GameplayModeBadge`

---

## Acceptance Criteria

- [ ] Fuzzy search works across action names, SC names, action maps
- [ ] Results grouped by action with all trigger paths
- [ ] Trigger paths sorted by simplicity (Main + single first)
- [ ] Plain English instructions generated correctly
- [ ] Gameplay mode filter works
- [ ] Debounced search input (no jank on fast typing)
- [ ] Empty state when no results
