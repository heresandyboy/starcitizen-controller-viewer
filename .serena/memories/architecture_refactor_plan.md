# Architecture Refactor Plan

## Problem Summary

The current app architecture is inverted from the user's intent:
- **Current**: reWASD mappings as primary, SC bindings as destination
- **Intended**: SC bindings as primary, reWASD as optional overlay

## Key Findings

### The "Zoom" Bug Example
The app shows: `A → LShift+F7+F11+F3+F9 → Zoom`

This is wrong because the A button macro is actually an **Inner Thought menu navigation macro** that triggers multiple unrelated actions in sequence, not zoom.

### Root Cause
The `chainResolver.ts` extracts ALL keys from a reWASD macro and tries to match each one to SC keyboard bindings, then shows them all as if they're a combo for one action.

### What Each Key Actually Does
- F7 → `pc_interaction_mode` (Enter interaction mode)
- F11 → `pc_personal_back` (Navigate back in menu)
- F3 → `pc_pit_emotes` (Open emotes wheel)
- F9 → `pc_personal_thought` (Inner thought system)
- DpadDown → `pc_select` (Select menu option)

All in the `player_choice` actionmap - NOT zoom!

## Correct Architecture

### Data Model
Center on SC actions, not reWASD:
```typescript
interface GameAction {
  name: string;           // "zoom"
  displayName: string;    // "Zoom"
  category: string;       // "player"
  
  bindings: {
    keyboard?: KeyboardBinding[];
    mouse?: MouseBinding[];
    gamepad?: GamepadBinding[];
  };
  
  rewasdTriggers?: RewasdTrigger[];  // Optional overlay
}
```

### Display Format
```
Zoom (player category)
├── Keyboard: LShift (default was Right-Click)
├── Gamepad: View button (double-tap)
└── [Optional] reWASD triggers...
```

## Files Needing Changes

1. `apps/viewer/src/lib/types/unified.ts` - New data model
2. `apps/viewer/src/lib/parsers/chainResolver.ts` - Rework resolution logic
3. `apps/viewer/src/lib/parsers/xmlParser.ts` - Group by action
4. `apps/viewer/src/components/ChainVisualization.tsx` - New display
5. `apps/viewer/src/components/MappingCard.tsx` - New display
6. `apps/viewer/src/components/MappingBrowser.tsx` - Update filtering

## reWASD Macro Types

1. **Simple remaps**: Button → single key → single action (show as trigger)
2. **Complex macros**: Button → sequence → multiple actions (show full sequence)

## Reference Document
Full analysis in: `docs/research/mapping-architecture-findings.md`
