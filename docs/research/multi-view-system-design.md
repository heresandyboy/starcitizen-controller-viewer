# Multi-View Controller Binding Visualization System

**Beads issue:** `controller-1me`
**Date:** 2026-04-06
**Status:** Research / Design
**Prerequisite reading:** [rewasd-sc-xml-architecture.md](./rewasd-sc-xml-architecture.md)

---

## 1. Problem Statement

The GCO 4.7 HOTAS profile creates a three-layer binding system:

```
Physical Xbox button → reWASD shift layer + activator → keyboard macro → SC XML binding → game action
```

A single physical button can trigger **up to 55 different game actions** (11 layers x 5 activator types). The current app can show individual bindings but cannot answer the core user question: **"When I press this button in this context, what happens in the game?"**

The goal is to build multiple complementary views that let a user learn and internalize this complex control scheme, culminating in an interactive controller visual where you can simulate button presses and see the results.

---

## 2. Current System Analysis

### What exists and works

| Component | Location | Status |
|-----------|----------|--------|
| reWASD JSON parser | `src/lib/parsers/rewasdParser.ts` | Partial - extracts buttons, shifts, keyboard output |
| SC XML parser | `src/lib/parsers/xmlParser.ts` | Good - parses all kb1/gp1 bindings with activation modes |
| Chain resolver | `src/lib/parsers/chainResolver.ts` | Partial - links reWASD keyboard output to SC actions |
| Type system | `src/lib/types/rewasd.ts`, `unified.ts`, `starcitizen.ts` | Good foundation |
| DIK key mapping | `src/lib/constants/dikKeys.ts` | ~100 keys mapped |
| Gamepad button mapping | `src/lib/constants/gamepadButtons.ts` | Complete for Xbox Elite |
| SC action names | `src/lib/constants/scActions.ts` | 150+ actions, 30+ action maps |
| GameActionBrowser | `src/components/GameActionBrowser/` | Works for action-centered browsing |
| MappingBrowser | `src/components/MappingBrowser/` | Shows chain visualization |
| Filter system | `src/lib/hooks/useFilterState.ts` | Search, input types, action maps |

### Critical gaps in the data layer

These must be fixed before any new views can work correctly:

#### Gap 1: Macro sequences are flattened
The reWASD parser extracts only unique keyboard key names from macros. All sequencing, timing, and down/up actions are discarded.

**Current behavior:**
```typescript
// A macro like: DIK_LSHIFT down → pause 20ms → DIK_F7 down → DIK_F7 up → DIK_LSHIFT up
// Becomes just: ["LShift", "F7"]
```

**What we need:**
```typescript
interface MacroSequence {
  steps: MacroStepResolved[];
  totalDurationMs: number;
}

interface MacroStepResolved {
  type: 'keyboard' | 'gamepad' | 'mouse' | 'pause' | 'rumble';
  // For keyboard/gamepad/mouse:
  key?: string;           // Normalized key name
  action?: 'down' | 'up'; // Press direction
  dikCode?: string;       // Original DIK code for debugging
  // For pause:
  durationMs?: number;
  // For gamepad:
  gamepadButton?: string; // Normalized button name
  // Resolved SC action (if this step maps to one):
  resolvedAction?: {
    actionName: string;
    displayName: string;
    actionMap: string;
    gameplayMode: GameplayMode;
  };
}
```

#### Gap 2: Gamepad macro outputs are ignored
When reWASD outputs a virtual gamepad button (e.g., `GP:DpadUp`), the parser skips it. These should be resolved against SC XML `gp1_*` bindings.

**Impact:** 72 mappings (45 gamepad-only + 27 mixed) are partially or fully unresolved.

#### Gap 3: Layer identity is lost in chain resolution
`UnifiedMapping.modifier` is a flat string. There's no concept of "which reWASD shift layer is active" or "which button activates this layer." The 11-layer hierarchy is collapsed.

**What we need:**
```typescript
interface ShiftLayer {
  id: number;
  name: string;              // "Main", "LB", "Y", "Menu", etc.
  triggerButton?: string;    // Which button activates this layer
  triggerType?: 'hold' | 'toggle' | 'radialMenu';
  parentLayerId?: number;    // For sub-layers (e.g., "Sub (Menu)" under "Menu")
  isDefault: boolean;        // true for Main layer only
}
```

#### Gap 4: Multi-action macros produce only one mapping
A macro that presses F7 then F9 creates two SC actions in sequence, but the current resolver creates separate `UnifiedMapping` entries with no link between them.

**What we need:** A single `ResolvedBinding` that contains an ordered list of SC actions, preserving the fact that they're triggered by one physical button press.

#### Gap 5: Activator timing parameters are discarded
The `params` object on activators (delay, singlewaittime, doublewaittime) is not captured. This matters for understanding the feel of the controls (e.g., "how long do I hold for a long press?").

---

## 3. Proposed Data Model (v2)

### Core entity: `ResolvedBinding`

This replaces both `UnifiedMapping` and `RewasdTrigger` as the primary data structure for all views.

```typescript
/**
 * A fully resolved binding from physical controller input to game action(s).
 * One ResolvedBinding = one physical interaction (button + layer + activator).
 */
interface ResolvedBinding {
  id: string;

  // === PHYSICAL INPUT ===
  /** Which controller button is pressed */
  button: string;                    // "A", "DpadUp", "RB", "P1", etc.
  /** Which shift layer must be active */
  layer: ShiftLayer;
  /** How the button is pressed */
  activator: {
    type: ActivatorType;             // single | double | long | start | release
    mode: ActivatorMode;             // onetime | hold_until_release | turbo | toggle
    /** Timing params (optional, for display) */
    delayMs?: number;
    longPressMs?: number;
    doubleTapWindowMs?: number;
  };

  // === MACRO CHAIN ===
  /** The full ordered macro sequence from reWASD */
  macro: MacroSequence;

  // === RESOLVED GAME ACTIONS ===
  /** Ordered list of SC actions triggered by this binding */
  actions: ResolvedAction[];

  // === METADATA ===
  source: 'rewasd+xml' | 'rewasd+xml-gamepad' | 'rewasd-unresolved' | 'xml-gamepad' | 'xml-keyboard';
  /** Original reWASD description (often French for GCO) */
  description?: string;
}

interface ResolvedAction {
  /** SC action internal name */
  name: string;
  /** Human-readable name */
  displayName: string;
  /** SC action map */
  actionMap: string;
  /** Gameplay mode */
  gameplayMode: GameplayMode;
  /** Which macro step triggered this */
  macroStepIndex: number;
  /** How this was resolved */
  resolvedVia: 'keyboard' | 'gamepad';
  /** The specific key/button that matched */
  matchedInput: string;
}

interface MacroSequence {
  steps: MacroStepResolved[];
  /** Total estimated duration including pauses */
  totalDurationMs: number;
  /** Whether this is a simple single-key press or a complex sequence */
  isSimple: boolean;
  /** Summary: unique keyboard keys output */
  keyboardKeysOutput: string[];
  /** Summary: unique gamepad buttons output */
  gamepadButtonsOutput: string[];
}
```

### Index structures for view queries

```typescript
/**
 * Pre-built indexes for efficient view queries.
 * Built once after parsing, used by all views.
 */
interface BindingIndex {
  /** All resolved bindings */
  all: ResolvedBinding[];

  /** All shift layers in this config */
  layers: ShiftLayer[];

  /** button → layer → activatorType → ResolvedBinding */
  byButtonLayerActivator: Map<string, Map<number, Map<ActivatorType, ResolvedBinding>>>;

  /** actionName → ResolvedBinding[] (reverse lookup for "how do I do X?") */
  byAction: Map<string, ResolvedBinding[]>;

  /** gameplayMode → ResolvedBinding[] */
  byMode: Map<GameplayMode, ResolvedBinding[]>;

  /** layerId → ResolvedBinding[] */
  byLayer: Map<number, ResolvedBinding[]>;

  /** button → ResolvedBinding[] (all layers, all activators) */
  byButton: Map<string, ResolvedBinding[]>;

  /** Stats */
  stats: {
    totalBindings: number;
    resolvedBindings: number;
    unresolvedBindings: number;
    multiActionBindings: number;
    layerCount: number;
    uniqueActionsTriggered: number;
    bindingsPerLayer: Map<number, number>;
  };
}
```

---

## 4. Parser Enhancements Required

### 4.1 reWASD Parser v2

**File:** `src/lib/parsers/rewasdParser.ts`

Changes needed:

1. **Extract full macro sequences** - preserve step order, down/up actions, pause durations, gamepad outputs
2. **Capture activator params** - delay, singlewaittime, doublewaittime, macro flag
3. **Build layer metadata** - extract shift hierarchy, trigger buttons, sub-layer relationships
4. **Capture gamepad output steps** - currently filtered out, need to preserve for gp1 resolution
5. **Capture rumble steps** - nice-to-have for showing haptic feedback info

New output type:
```typescript
interface ParsedRewasdMappingV2 {
  maskId: number;
  buttonName: string;
  shiftId?: number;          // Which layer (undefined = Main)
  activator: {
    type: ActivatorType;
    mode: ActivatorMode;
    params?: ActivatorParams;
  };
  macro: MacroSequence;      // Full sequence, not just key names
  jumpToLayer?: number;      // If this is a layer-switch mapping
  description?: string;
}
```

**Effort estimate:** Medium. The JSON structure is already typed. Main work is changing `extractKeyboardKeys()` to `extractFullMacroSequence()` and preserving all step types.

### 4.2 Chain Resolver v2

**File:** `src/lib/parsers/chainResolver.ts`

Changes needed:

1. **Per-step resolution** - walk each macro step and resolve keyboard steps against `kb1_*` bindings, gamepad steps against `gp1_*` bindings
2. **Preserve ordering** - actions list maintains macro step order
3. **Handle mixed macros** - a step might output keyboard (resolved via kb1) AND gamepad (resolved via gp1)
4. **Build all indexes** - create the `BindingIndex` structure for view queries
5. **Layer-aware output** - each `ResolvedBinding` carries its full `ShiftLayer` context

New main function:
```typescript
function resolveBindings(
  rewasdMappings: ParsedRewasdMappingV2[],
  xmlBindings: ParsedXmlBinding[],
  layers: ShiftLayer[]
): BindingIndex
```

**Effort estimate:** Medium-High. Core logic is similar to current resolver but needs to handle per-step resolution and multi-action output.

### 4.3 DIK-to-SC Key Mapping Completeness

**File:** `src/lib/constants/dikKeys.ts`

The mapping needs to be verified as complete. Cross-reference:
- All DIK codes that appear in the GCO 4.7 HOTAS.rewasd file
- All `kb1_*` keys that appear in the SC XML

Any DIK code that reWASD outputs but has no mapping will produce an unresolved binding. A build-time script could validate completeness.

### 4.4 SC Gamepad Key Normalization

**File:** `src/lib/constants/gamepadButtons.ts` or new file

Need a mapping from reWASD gamepad output format to SC XML gamepad format:
```
reWASD "GP:DpadUp" → SC "gp1_dpad_up"
reWASD "GP:RightShoulder" → SC "gp1_shoulderr"
reWASD "GP:Y" → SC "gp1_y"
```

This doesn't exist yet. The reWASD gamepad description strings need to be mapped to SC's `gp1_*` naming convention.

---

## 5. View Specifications

### 5.1 Layer Browser (Reference View)

**Purpose:** "Show me everything this controller does, organized by layer."

**Layout:**
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
│ ...    │          │                      │                  │
└────────┴──────────┴──────────────────────┴──────────────────┘
```

**Key features:**
- Tab strip shows all 11 layers with the trigger button noted
- Within each layer tab, rows grouped by physical button
- Each button shows all activator variants (single/double/long/start/release)
- Multi-action macros expand to show step-by-step sequence
- Color coding: resolved (green), unresolved (amber), multi-action (blue), gamepad-passthrough (purple)
- Compact mode: hide empty activator slots; Full mode: show all 5 slots per button
- Gameplay mode filter dims/hides actions not in selected mode

**Data query:** `BindingIndex.byLayer.get(selectedLayerId)` then group by button

**Component structure:**
```
LayerBrowser/
  LayerBrowser.tsx          - Main container with tab state
  LayerTabStrip.tsx         - Tab strip for shift layers
  ButtonGroup.tsx           - All activators for one button
  ActivatorRow.tsx          - Single activator variant row
  MacroChainDisplay.tsx     - Shows macro steps → resolved action(s)
  MultiActionExpander.tsx   - Expandable list for multi-action macros
```

### 5.2 Action Search (Reverse Lookup View)

**Purpose:** "I want to do X in the game - how do I press it?"

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Search: [cycle missile________]                             │
│  Mode: [Flight ▾]  [FPS ▾]  [All Modes]                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✈ Cycle Missile Forward                                    │
│  spaceship_missiles.v_weapon_cycle_missile_fwd              │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Main layer → X button → single press            │       │
│  │  Chain: X → DIK_INSERT → kb1_insert → action     │       │
│  ├──────────────────────────────────────────────────┤       │
│  │  LB layer → DpadRight → single press             │       │
│  │  Chain: DpadRight → DIK_PGUP → kb1_pgup → action│       │
│  └──────────────────────────────────────────────────┘       │
│                                                             │
│  ✈ Cycle Missile Backward                                   │
│  spaceship_missiles.v_weapon_cycle_missile_back             │
│  ┌──────────────────────────────────────────────────┐       │
│  │  Main layer → X button → long press              │       │
│  │  Chain: X (hold) → DIK_DELETE → kb1_delete → ... │       │
│  └──────────────────────────────────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key features:**
- Fuzzy search across action display names, SC action names, and action maps
- Group results by game action, showing all controller paths to trigger it
- Each path shows: layer → button → activator type → chain visualization
- Filter by gameplay mode to narrow results
- Show "easiest" paths first (Main layer, single press) vs complex ones (sub-layer, double-tap)
- Quick-reference format: "Hold LB, then press X" as plain English

**Data query:** `BindingIndex.byAction` with fuzzy search on keys, or `BindingIndex.byMode.get(mode)` then filter

**Component structure:**
```
ActionSearch/
  ActionSearch.tsx           - Main container with search state
  ActionSearchInput.tsx      - Fuzzy search input with debounce
  ActionResultCard.tsx       - One game action with all trigger paths
  TriggerPath.tsx            - One way to trigger the action
  PlainEnglishInstruction.tsx - "Hold LB, then press X (single)"
```

### 5.3 Mode Cheat Sheets (Contextual Learning)

**Purpose:** "I'm flying right now - what are all my controls?"

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Flight] [FPS] [Mining] [EVA] [Vehicle] [General]          │  ← Mode tabs
├─────────────────────────────────────────────────────────────┤
│  Layer: [Main ▾]    Show: [Essential] [All]                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ── WEAPONS ──────────────────────────────────────────────  │
│  A (single)    → Fire Group 1                               │
│  A (long)      → Weapon Group 3                             │
│  X (single)    → Cycle Missile Forward                      │
│  X (long)      → Cycle Missile Backward                     │
│  RB (single)   → Launch Missile                             │
│                                                             │
│  ── TARGETING ────────────────────────────────────────────  │
│  DpadDown (s)  → Cycle Pinned Targets                       │
│  DpadUp (s)    → Cycle Hostile Targets                      │
│                                                             │
│  ── MOVEMENT ─────────────────────────────────────────────  │
│  LT (hold)     → Brake / Reverse                            │
│  RT (hold)     → Throttle Forward                           │
│                                                             │
│  ── POWER ────────────────────────────────────────────────  │
│  [Hold LB] B (single) → Cycle Power Preset                 │
│  [Hold LB] B (long)   → Reset Power                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Key features:**
- Pre-filtered to one gameplay mode at a time
- Sub-grouped by action category (weapons, targeting, movement, power, etc.)
- Shows the most useful layer (Main) by default, with toggle to show other layers
- "Essential" mode hides rarely-used actions (based on action map importance ranking)
- Compact, scannable format optimized for quick reference
- Printable / exportable as image or PDF for desk reference

**Data query:** `BindingIndex.byMode.get(selectedMode)` then sub-group by action map subcategory

**Sub-grouping logic:** Action maps within a gameplay mode should be further categorized:
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
```

**Component structure:**
```
ModeCheatSheet/
  ModeCheatSheet.tsx         - Main container with mode tab state
  ModeTabStrip.tsx           - Mode selector tabs
  SubcategoryGroup.tsx       - Grouped actions under a heading
  CheatSheetRow.tsx          - Compact single binding row
  PrintableExport.tsx        - Print/export button and layout
```

### 5.4 Interactive Controller Visual (Flagship View)

**Purpose:** "I want to press buttons and see what happens."

This is the most complex view and the ultimate learning tool.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Mode: [Flight ▾]     Layer: [Main]  (hold LB to switch)   │
├───────────────────────┬─────────────────────────────────────┤
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
│   Hover any button    │                                     │
│   to see its action   │  ── Y Layer ─────────────────────── │
│   for current layer   │  single:  Open Starmap              │
│                       │                                     │
│                       │  Chain: A → DIK_INSERT →            │
│                       │         kb1_insert →                 │
│                       │         v_weapon_cycle_missile_fwd   │
│                       │                                     │
└───────────────────────┴─────────────────────────────────────┘
```

**Key features:**

1. **SVG Controller Diagram** - Accurate Xbox Elite controller with all buttons, triggers, sticks, paddles, d-pad as interactive regions
2. **Layer switching** - Click/hold a modifier button on the diagram to switch the active layer. The entire controller updates to show that layer's bindings.
3. **Button hover** - Hovering a button shows a tooltip with the primary action for the current layer
4. **Button click** - Clicking opens the detail panel showing ALL layers and ALL activator types for that button
5. **Action labels on controller** - Each button on the diagram shows a short action label for the current layer's `single` activator (the most common press type)
6. **Gameplay mode filter** - Dims buttons that don't have actions in the selected mode, highlights those that do
7. **Combo simulation** - A "hold" button on the diagram keeps that modifier active so you can click other buttons to see the combined result
8. **Visual indicators:**
   - Glow = has bindings in current layer
   - Dim = no bindings in current layer
   - Pulse = multi-action macro
   - Border color = gameplay mode of primary action

**The SVG controller approach:**

Option A: **Hand-crafted SVG** - Draw an Xbox Elite controller as an SVG with each button as a named `<g>` group. Each group has hover/click handlers. This gives full control over appearance and layout.

Option B: **CSS-positioned overlays** - Use a controller image as background with absolutely-positioned transparent hit areas for each button. Simpler to build but less flexible.

**Recommendation: Option A (SVG).** It allows:
- Precise button highlighting with CSS fills/strokes
- Animation (glow, pulse) via CSS keyframes on SVG elements
- Dynamic text labels positioned relative to each button
- Responsive scaling (SVG scales naturally)
- No image dependency - works in any theme

**SVG button mapping:**
```typescript
const CONTROLLER_BUTTONS: ControllerButton[] = [
  // Face buttons
  { id: 'A', svgId: 'btn-a', position: { cx: 380, cy: 200 }, labelAnchor: 'right' },
  { id: 'B', svgId: 'btn-b', position: { cx: 405, cy: 175 }, labelAnchor: 'right' },
  { id: 'X', svgId: 'btn-x', position: { cx: 355, cy: 175 }, labelAnchor: 'left' },
  { id: 'Y', svgId: 'btn-y', position: { cx: 380, cy: 150 }, labelAnchor: 'top' },
  // Bumpers
  { id: 'LB', svgId: 'btn-lb', position: { cx: 150, cy: 80 }, labelAnchor: 'top' },
  { id: 'RB', svgId: 'btn-rb', position: { cx: 380, cy: 80 }, labelAnchor: 'top' },
  // Triggers
  { id: 'LT', svgId: 'btn-lt', position: { cx: 150, cy: 50 }, labelAnchor: 'top' },
  { id: 'RT', svgId: 'btn-rt', position: { cx: 380, cy: 50 }, labelAnchor: 'top' },
  // D-Pad
  { id: 'DpadUp', svgId: 'btn-dpad-up', position: { cx: 200, cy: 170 }, labelAnchor: 'left' },
  { id: 'DpadDown', svgId: 'btn-dpad-down', position: { cx: 200, cy: 210 }, labelAnchor: 'left' },
  { id: 'DpadLeft', svgId: 'btn-dpad-left', position: { cx: 180, cy: 190 }, labelAnchor: 'left' },
  { id: 'DpadRight', svgId: 'btn-dpad-right', position: { cx: 220, cy: 190 }, labelAnchor: 'left' },
  // Sticks
  { id: 'LS', svgId: 'btn-ls', position: { cx: 170, cy: 230 }, labelAnchor: 'bottom' },
  { id: 'RS', svgId: 'btn-rs', position: { cx: 340, cy: 260 }, labelAnchor: 'bottom' },
  // Special
  { id: 'View', svgId: 'btn-view', position: { cx: 230, cy: 150 }, labelAnchor: 'top' },
  { id: 'Menu', svgId: 'btn-menu', position: { cx: 310, cy: 150 }, labelAnchor: 'top' },
  // Elite paddles (back of controller - shown below or as a separate view)
  { id: 'P1', svgId: 'btn-p1', position: { cx: 170, cy: 300 }, labelAnchor: 'bottom' },
  { id: 'P2', svgId: 'btn-p2', position: { cx: 200, cy: 300 }, labelAnchor: 'bottom' },
  { id: 'P3', svgId: 'btn-p3', position: { cx: 330, cy: 300 }, labelAnchor: 'bottom' },
  { id: 'P4', svgId: 'btn-p4', position: { cx: 360, cy: 300 }, labelAnchor: 'bottom' },
];
```

**Interaction state machine:**
```typescript
interface ControllerViewState {
  /** Currently active shift layer */
  activeLayer: ShiftLayer;
  /** Buttons currently "held" (for combo simulation) */
  heldButtons: Set<string>;
  /** Button currently hovered */
  hoveredButton: string | null;
  /** Button selected (clicked) for detail view */
  selectedButton: string | null;
  /** Active gameplay mode filter */
  gameplayMode: GameplayMode | 'all';
}
```

**Layer switching logic:**
```
When user clicks a modifier button (LB, Y, Menu, View, Start, LS):
  1. Check if this button activates a shift layer
  2. If yes, toggle that layer as active
  3. Update all button labels to show actions for the new layer
  4. Highlight the held modifier button
  5. If another modifier was already held, switch to the new layer (or handle sub-layers)
```

**Component structure:**
```
ControllerVisual/
  ControllerVisual.tsx       - Main container with state machine
  ControllerSvg.tsx          - The SVG controller diagram
  ControllerButton.tsx       - Individual interactive button in SVG
  ButtonTooltip.tsx          - Hover tooltip with action summary
  ButtonDetailPanel.tsx      - Full detail panel for selected button
  LayerIndicator.tsx         - Shows which layer is active and why
  ActionLabel.tsx            - Short action label positioned on controller
  GameplayModeFilter.tsx     - Mode filter strip
  useControllerState.ts      - State management hook
```

### 5.5 Quick Reference Cards (Exportable)

**Purpose:** "Give me something I can print and put next to my monitor."

**Layout:** A compact, print-optimized card for one layer or one gameplay mode showing the most important bindings in a grid format similar to a gamepad overlay.

This view reuses data from the Mode Cheat Sheet and Layer Browser but with a print-specific CSS layout. Lower priority - build after the other views are working.

---

## 6. Shared Components

Several components will be shared across views:

### MacroChainViz
Visualizes the mapping chain: `Button → [Macro] → Key → SC Action`
- Compact mode: single line with arrows
- Expanded mode: step-by-step with timing
- Reused in: Layer Browser, Action Search, Controller Visual detail panel

### LayerBadge
Shows which shift layer a binding belongs to with consistent color coding:
```typescript
const LAYER_COLORS: Record<string, string> = {
  'Main':    '#3B82F6',  // Blue
  'LB':     '#10B981',  // Green
  'Y':      '#F59E0B',  // Amber
  'Menu':   '#8B5CF6',  // Purple
  'View':   '#EF4444',  // Red
  'Start':  '#EC4899',  // Pink
  'LS':     '#06B6D4',  // Cyan
  'Sub':    '#6B7280',  // Gray (sub-layers)
};
```

### ActivatorBadge
Shows the activator type with icon and label:
- `single` → tap icon
- `double` → double-tap icon
- `long` → long-press icon
- `start` → down-arrow icon
- `release` → up-arrow icon

### GameplayModeBadge
Consistent badge for gameplay modes (Flight, FPS, Mining, etc.) with mode-specific icons.

---

## 7. Build Order & Dependencies

```
Phase 1: Data Layer (Foundation)
├── 1a. Enhance reWASD parser (full macro sequences, gamepad output, activator params)
├── 1b. Build reWASD-to-SC gamepad key mapping
├── 1c. Verify DIK-to-SC key mapping completeness
└── 1d. Build chain resolver v2 with BindingIndex

Phase 2: First Views (Validate Data)
├── 2a. Layer Browser (most direct data display - validates parsing)
├── 2b. Shared components (MacroChainViz, LayerBadge, ActivatorBadge)
└── 2c. Action Search (reverse index on same data)

Phase 3: Contextual Views
├── 3a. Mode Cheat Sheets (filtered projection)
└── 3b. Sub-category grouping logic per mode

Phase 4: Controller Visual (Flagship)
├── 4a. SVG controller diagram
├── 4b. Interaction state machine
├── 4c. Button detail panel
├── 4d. Combo simulation / layer switching
└── 4e. Action labels and visual indicators

Phase 5: Polish
├── 5a. Quick Reference Cards / print export
├── 5b. Keyboard shortcut navigation between views
└── 5c. URL-based state (deep links to specific layer/button/action)
```

**Phase 1 is the critical path.** No view can display correct data until the parser enhancements and resolver v2 are complete. Phases 2-4 can be built incrementally once the data layer is solid.

---

## 8. Technical Considerations

### Performance
- The GCO 4.7 profile has ~366 non-empty mappings across 11 layers. After full resolution this might produce ~500-800 `ResolvedBinding` objects. This is small enough to keep in memory and render without virtualization.
- Index building should be O(n) on parse, O(1) on lookup.
- SVG controller with ~20 interactive buttons is lightweight.

### Testing Strategy
- **Unit tests for parser v2:** Use the existing GCO 4.7 HOTAS files as fixtures. Test specific known chains (e.g., X button Main single → DIK_INSERT → kb1_insert → v_weapon_cycle_missile_fwd).
- **Unit tests for resolver v2:** Test multi-action macros, gamepad passthrough, unresolved bindings, layer hierarchy.
- **Snapshot tests for views:** Render each view with fixture data and snapshot the output.
- **Interactive tests:** Playwright tests for controller visual interactions (hover, click, layer switch).

### Accessibility
- Controller visual must be keyboard-navigable (tab through buttons, enter to select)
- All views must work with screen readers (ARIA labels on SVG buttons)
- Color coding should have text alternatives (not color-only indicators)

### State Management
- All view state can be React `useState`/`useReducer` - no need for a state library
- The `BindingIndex` is computed once from parsed data and passed as context
- URL state for deep linking: `/viewer?layer=1&button=A&mode=flight`

---

## 9. Open Questions

1. **Sub-layer behavior:** When "Sub (Menu)" is active, are Main layer bindings still available for buttons not overridden? Need to check the reWASD `unheritableMasks` logic.

2. **Default SC bindings as fallback:** When a reWASD macro outputs a key that has no SC XML custom binding, should we fall back to SC default keyboard bindings (from `defaultActions.ts`)? This would resolve more chains but adds complexity.

3. **Analog stick handling:** The controller visual shows stick-click (LS/RS), but stick directions (LSUp, LSDown, etc.) are also mapped in reWASD. Should these be shown as separate zones on the stick, or collapsed?

4. **Profile switching:** GCO uses a radial menu layer for profile switching. Should this be shown as a special layer, or treated as an advanced feature shown separately?

5. **Localization of action names:** The current `localization.ts` has `@ui_*` key → English mapping. The GCO descriptions are in French. Should we show both, or only resolved English names?

---

## 10. Success Criteria

The system is successful when a user can:

1. **Look up any button** and instantly see what it does in every layer and activator type
2. **Search for any game action** and find every controller path to trigger it
3. **Focus on one gameplay mode** and see only relevant controls in a scannable format
4. **Simulate button combos** on the controller visual and see the resulting game actions
5. **Understand multi-action macros** - see the full sequence of what happens when one button fires multiple SC actions
6. **Print a reference card** for their most-used gameplay mode

If a user can go from "I don't know what any of these buttons do" to "I can confidently play any game mode with this controller" using only this tool, the system has achieved its goal.
