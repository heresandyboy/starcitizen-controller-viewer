# Plan 00: Multi-View Controller Binding System - Overview

**Status:** Planning
**Research:** [multi-view-system-design.md](../research/multi-view-system-design.md), [rewasd-sc-xml-architecture.md](../research/rewasd-sc-xml-architecture.md), [mapping-architecture-findings.md](../research/mapping-architecture-findings.md)

---

## Vision

Build a multi-view system for visualizing Star Citizen controller mappings through a reWASD three-layer binding chain:

```
Physical Xbox button → reWASD shift layer + activator → keyboard macro → SC XML binding → game action
```

A single physical button can trigger up to 55 different game actions (11 layers x 5 activator types). The system must let users learn and internalize complex control schemes like the GCO 4.7 HOTAS profile.

---

## Phase Plan

| Phase | Plan Doc | Beads ID | Description | Dependencies |
|-------|----------|----------|-------------|--------------|
| 1a | [01-data-types-v2.md](01-data-types-v2.md) | `controller-6v9` | New type system (ResolvedBinding, BindingIndex, etc.) | None |
| 1b | [02-rewasd-parser-v2.md](02-rewasd-parser-v2.md) | `controller-4x5` | Enhanced reWASD parser with full macro sequences | 01 |
| 1c | [03-key-mappings.md](03-key-mappings.md) | `controller-1uy` | Complete DIK-to-SC and gamepad key mappings | None |
| 1d | [04-chain-resolver-v2.md](04-chain-resolver-v2.md) | `controller-7l1` | Chain resolver v2 with BindingIndex | 01, 02, 03 |
| 2a | [05-shared-components.md](05-shared-components.md) | `controller-8uf` | Shared UI components (MacroChainViz, badges) | 01 |
| 2b | [06-layer-browser.md](06-layer-browser.md) | `controller-8v6` | Layer Browser reference view | 04, 05 |
| 2c | [07-action-search.md](07-action-search.md) | `controller-91e` | Action Search reverse lookup view | 04, 05 |
| 3a | [08-mode-cheat-sheets.md](08-mode-cheat-sheets.md) | `controller-dc3` | Mode-filtered cheat sheet view | 04, 05 |
| 4 | [09-controller-visual.md](09-controller-visual.md) | `controller-sx0` | Interactive SVG controller visual (flagship) | 04, 05 |
| 5 | [10-polish.md](10-polish.md) | `controller-9xu` | Print export, keyboard nav, deep links | 06-09 |

**Epic:** `controller-siz` — Multi-View Controller Binding System v2

---

## Critical Path

Phase 1 (data layer) is the critical path. No view can display correct data until the parser enhancements and resolver v2 are complete. The data layer must be solid before building any views.

```
Types → Parser v2 → Key Mappings → Resolver v2 → Views
```

---

## Key Design Decisions

1. **Layer-first, not action-first** - The UI is organized around reWASD shift layers, not SC action maps
2. **Full macro sequences** - Preserve step order, timing, and multi-action chains (not flattened key lists)
3. **SVG controller diagram** - Hand-crafted SVG for the interactive visual, not image overlays
4. **SC defaults fallback** - Unresolved keyboard keys fall back to SC default bindings from `defaultActions.ts`
5. **Layer inheritance** - Sub-layers inherit unmapped buttons from parent layers; show inherited bindings dimmed
6. **English primary** - Resolved SC action names in English; French reWASD descriptions as secondary/debug info
