# Plan 09: Interactive Controller Visual (Flagship View)

**Beads:** `controller-sx0`
**Phase:** 4
**Dependencies:** [04-chain-resolver-v2.md](04-chain-resolver-v2.md), [05-shared-components.md](05-shared-components.md)
**Plan overview:** [00-overview.md](00-overview.md)

---

## Goal

Build an interactive SVG Xbox Elite controller diagram where users can press buttons and see what happens in each layer. This is the flagship learning tool — the culmination of all the data work.

---

## Layout

```
┌───────────────────────┬─────────────────────────────────────┐
│                       │                                     │
│   Xbox Controller     │  BUTTON DETAIL: A                   │
│   Visual Diagram      │                                     │
│                       │  ── Main Layer ──────────────────── │
│   [LB] glows when     │  single:  Fire Group 1             │
│    held, controller   │  long:    Weapon Group 3            │
│    updates to show    │  double:  (unbound)                 │
│    LB layer actions   │  start:   [Multi] Shield + F9 + F11│
│                       │  release: (unbound)                 │
│   [A] highlighted     │                                     │
│   with current        │  ── LB Layer ────────────────────── │
│   action label        │  single:  Toggle Gimbal Lock        │
│                       │  long:    Reset Gimbal               │
│                       │                                     │
│                       │  Chain: A → DIK_INSERT →            │
│                       │         kb1_insert →                 │
│                       │         v_weapon_cycle_missile_fwd   │
└───────────────────────┴─────────────────────────────────────┘
```

---

## Key Features

### 1. SVG Controller Diagram (Option A: Hand-crafted SVG)

Accurate Xbox Elite controller with all buttons, triggers, sticks, paddles, d-pad as interactive `<g>` groups.

Benefits:
- Precise button highlighting with CSS fills/strokes
- Animation (glow, pulse) via CSS keyframes
- Dynamic text labels positioned relative to buttons
- Responsive scaling (SVG scales naturally)
- No image dependency

### 2. Layer Switching

Click/hold a modifier button (LB, Y, Menu, View, Start, LS) to switch the active layer. The entire controller updates to show that layer's bindings on every button.

### 3. Button Interaction

- **Hover**: Tooltip with primary action for current layer
- **Click**: Opens detail panel showing ALL layers and ALL activator types for that button

### 4. Action Labels on Controller

Each button shows a short action label for the current layer's `single` activator (most common press type).

### 5. Visual Indicators

- **Glow** = has bindings in current layer
- **Dim** = no bindings in current layer
- **Pulse** = multi-action macro
- **Border color** = gameplay mode of primary action

### 6. Combo Simulation

A "hold" toggle on modifier buttons keeps that modifier active so you can click other buttons to see combined results.

### 7. Stick Zone Display

Each stick shown as a circular zone diagram:
- Concentric rings for low/med/high zones
- Cardinal direction sectors
- Center button for stick click
- Hover each zone to see its binding

---

## Interaction State Machine

```typescript
interface ControllerViewState {
  activeLayer: ShiftLayer;
  heldButtons: Set<string>;       // For combo simulation
  hoveredButton: string | null;
  selectedButton: string | null;  // For detail panel
  gameplayMode: GameplayMode | 'all';
}
```

### Layer switching logic

```
User clicks a modifier button:
  1. Check if this button activates a shift layer
  2. If yes, toggle that layer as active
  3. Update all button labels for the new layer
  4. Highlight the held modifier
  5. Handle sub-layers if another modifier was already held
```

---

## SVG Button Mapping

20+ interactive regions covering:
- Face buttons: A, B, X, Y
- Bumpers: LB, RB
- Triggers: LT, RT
- D-Pad: Up, Down, Left, Right
- Sticks: LS (click), RS (click)
- Special: View, Menu
- Elite paddles: P1, P2, P3, P4
- Stick zones (optional): directional + ring zones

---

## Component Structure

```
src/components/ControllerVisual/
  ControllerVisual.tsx       - Main container with state machine
  ControllerSvg.tsx          - The SVG controller diagram
  ControllerButton.tsx       - Individual interactive button in SVG
  ButtonTooltip.tsx          - Hover tooltip with action summary
  ButtonDetailPanel.tsx      - Full detail panel for selected button
  LayerIndicator.tsx         - Shows which layer is active and why
  ActionLabel.tsx            - Short action label on controller
  StickZoneDiagram.tsx       - Circular zone display for sticks
  GameplayModeFilter.tsx     - Mode filter strip
  useControllerState.ts      - State management hook
  index.ts
```

---

## Accessibility

- Keyboard navigable: Tab through buttons, Enter to select
- ARIA labels on all SVG button groups
- Color coding has text alternatives (not color-only)
- Screen reader announces button name + current action on focus

---

## Build Order (within this phase)

1. SVG controller diagram (static, no interaction)
2. Button hover + tooltip
3. Button click + detail panel
4. Layer switching
5. Action labels on buttons
6. Visual indicators (glow, dim, pulse)
7. Combo simulation
8. Stick zone diagram
9. Gameplay mode filter

---

## Acceptance Criteria

- [ ] SVG controller renders all Xbox Elite buttons
- [ ] Hover shows tooltip with current layer action
- [ ] Click opens detail panel with all layers/activators
- [ ] Layer switching updates all button labels
- [ ] Combo simulation (hold modifier + click button)
- [ ] Visual indicators distinguish bound/unbound/multi-action
- [ ] Keyboard accessible (tab navigation)
- [ ] Responsive (scales to viewport)
