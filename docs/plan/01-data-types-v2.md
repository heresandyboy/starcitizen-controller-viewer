# Plan 01: Data Types v2

**Beads:** `controller-6v9`
**Phase:** 1a (Foundation)
**Dependencies:** None
**Plan overview:** [00-overview.md](00-overview.md)

---

## Goal

Define the new type system that all parsers, resolvers, and views depend on. This replaces the current `UnifiedMapping` / `RewasdTrigger` types with a model centered on `ResolvedBinding`.

---

## Types to Create

### File: `src/lib/types/binding.ts` (new)

### ShiftLayer

```typescript
interface ShiftLayer {
  id: number;                    // 0 = Main, 1-11 per reWASD config
  name: string;                  // "Main", "LB", "Y", "Menu", etc.
  triggerButton?: string;        // Which button activates this layer
  triggerType?: 'hold' | 'toggle' | 'radialMenu';
  parentLayerId?: number;        // For sub-layers (e.g., Sub(Menu) → Menu)
  isDefault: boolean;            // true for Main layer only
  unheritableMasks?: number[];   // Masks blocked from inheriting (rare)
}
```

### ActivatorType / ActivatorMode

```typescript
type ActivatorType = 'single' | 'double' | 'long' | 'start' | 'release';
type ActivatorMode = 'onetime' | 'hold_until_release' | 'turbo' | 'toggle';
```

### MacroStepResolved / MacroSequence

```typescript
interface MacroStepResolved {
  type: 'keyboard' | 'gamepad' | 'mouse' | 'pause' | 'rumble';
  key?: string;               // Normalized key name (e.g., "Insert", "F7")
  action?: 'down' | 'up';
  dikCode?: string;           // Original DIK code
  durationMs?: number;        // For pause steps
  gamepadButton?: string;     // Normalized gamepad button name
  resolvedAction?: {
    actionName: string;
    displayName: string;
    actionMap: string;
    gameplayMode: GameplayMode;
  };
}

interface MacroSequence {
  steps: MacroStepResolved[];
  totalDurationMs: number;
  isSimple: boolean;           // Single key press = true
  keyboardKeysOutput: string[];
  gamepadButtonsOutput: string[];
}
```

### ResolvedBinding (core entity)

```typescript
interface ResolvedBinding {
  id: string;
  button: string;              // "A", "DpadUp", "RB", "P1", etc.
  layer: ShiftLayer;
  activator: {
    type: ActivatorType;
    mode: ActivatorMode;
    delayMs?: number;
    longPressMs?: number;
    doubleTapWindowMs?: number;
  };
  macro: MacroSequence;
  actions: ResolvedAction[];
  source: 'rewasd+xml' | 'rewasd+xml-gamepad' | 'rewasd+default' | 'rewasd-unresolved' | 'xml-gamepad' | 'xml-keyboard';
  description?: string;
}
```

### ResolvedAction

```typescript
interface ResolvedAction {
  name: string;
  displayName: string;
  actionMap: string;
  gameplayMode: GameplayMode;
  macroStepIndex: number;
  resolvedVia: 'keyboard' | 'gamepad';
  matchedInput: string;
}
```

### BindingIndex (query structure)

```typescript
interface BindingIndex {
  all: ResolvedBinding[];
  layers: ShiftLayer[];
  byButtonLayerActivator: Map<string, Map<number, Map<ActivatorType, ResolvedBinding>>>;
  byAction: Map<string, ResolvedBinding[]>;
  byMode: Map<GameplayMode, ResolvedBinding[]>;
  byLayer: Map<number, ResolvedBinding[]>;
  byButton: Map<string, ResolvedBinding[]>;
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

## Implementation Notes

- Keep the existing types (`UnifiedMapping`, `RewasdTrigger`, etc.) intact for now - don't break the existing UI
- The new types live alongside the old ones until we're ready to swap views over
- Export everything from a barrel `src/lib/types/index.ts`
- Add `GameplayMode` to a shared enums file if not already there

---

## Acceptance Criteria

- [ ] All types defined and exported from `src/lib/types/binding.ts`
- [ ] Types compile with no errors
- [ ] No changes to existing types (backward compatible)
- [ ] JSDoc comments on all interfaces explaining their purpose
