# Plan 06: Layer Browser View

**Beads:** `controller-8v6`
**Phase:** 2b
**Dependencies:** [04-chain-resolver-v2.md](04-chain-resolver-v2.md), [05-shared-components.md](05-shared-components.md)
**Plan overview:** [00-overview.md](00-overview.md)

---

## Goal

Build the Layer Browser — the primary reference view. Shows everything the controller does, organized by layer. This is the most direct display of the data and serves as validation that the parser/resolver are working correctly.

---

## Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Main] [LB] [Y] [Menu] [View] [Start] [LS] [Sub-M] ...   │  ← Layer tabs
├─────────────────────────────────────────────────────────────┤
│  Search: [________________]  Mode: [All ▾]  [Compact/Full]  │  ← Filters
├────────┬──────────┬──────────────────────┬──────────────────┤
│ Button │ Activate │ Macro Output         │ Game Action(s)   │
├────────┼──────────┼──────────────────────┼──────────────────┤
│ A      │ single   │ DIK_INSERT → kb1_ins │ Cycle Missile Fwd│
│ A      │ long     │ DIK_3 → kb1_3        │ Weapon Group 3   │
│ A      │ double   │ —                    │ (unbound)        │
│ A      │ start    │ LSHIFT↓ LSHIFT↑ ...  │ [Multi-action]   │
│ A      │ release  │ —                    │ (unbound)        │
├────────┼──────────┼──────────────────────┼──────────────────┤
│ B      │ single   │ DIK_T → kb1_t        │ Cycle Pinned Tgt │
└────────┴──────────┴──────────────────────┴──────────────────┘
```

---

## Key Features

1. **Tab strip** for all 11 layers with trigger button noted (e.g., "LB (Hold Left Bumper)")
2. **Rows grouped by physical button** within each layer tab
3. **All 5 activator variants** shown per button (single/double/long/start/release)
4. **Multi-action macros** expand to show step-by-step sequence
5. **Color coding**: resolved (green), unresolved (amber), multi-action (blue), gamepad-passthrough (purple)
6. **Compact mode**: hide empty activator slots; **Full mode**: show all 5 slots per button
7. **Gameplay mode filter** dims/hides actions not in selected mode
8. **Search** filters across action names, button names, key names
9. **Inherited bindings** shown dimmed with "(inherited from Main)" tag for sub-layers

---

## Data Query

```typescript
const layerBindings = bindingIndex.byLayer.get(selectedLayerId);
// Group by button name, then sort by activator type order
```

---

## Component Structure

```
src/components/LayerBrowser/
  LayerBrowser.tsx          - Main container with tab + filter state
  LayerTabStrip.tsx         - Tab strip for shift layers
  ButtonGroup.tsx           - All activators for one button (collapsible)
  ActivatorRow.tsx          - Single activator variant row
  MultiActionExpander.tsx   - Expandable list for multi-action macros
  index.ts
```

Uses shared: `MacroChainViz`, `LayerBadge`, `ActivatorBadge`, `GameplayModeBadge`

---

## Acceptance Criteria

- [ ] Layer tabs switch between all 11 layers
- [ ] Buttons grouped with all activator variants visible
- [ ] Multi-action macros expandable to show full sequence
- [ ] Compact/Full toggle works
- [ ] Search filters results
- [ ] Gameplay mode filter works
- [ ] Sub-layer inherited bindings shown dimmed
- [ ] Responsive on mobile (card layout fallback)
