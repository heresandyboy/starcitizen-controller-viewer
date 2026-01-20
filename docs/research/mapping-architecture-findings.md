# Mapping Architecture Findings

## Date: 2024-01-19

## Summary

The current app architecture is fundamentally inverted from the user's intent. It was built around reWASD as the primary input source, when it should be centered on Star Citizen XML bindings with reWASD as an optional overlay.

---

## Current Architecture (Wrong)

### Data Flow
```
reWASD Controller Button → reWASD Macro → Keyboard Keys → Star Citizen Action
```

### Data Model (`UnifiedMapping`)
Every mapping is structured around reWASD:
- `controllerButton` - the reWASD input (A, B, X, etc.)
- `keyboardKeys` - what the reWASD macro outputs
- `gameAction` - the SC action this triggers

### Chain Resolution Logic
1. Parse reWASD config, extract all mappings with their output keyboard keys
2. Parse SC XML, build lookup: keyboard key → SC action
3. For each reWASD mapping, find SC actions that match ANY of the output keys
4. Show: `Button → [all macro keys] → Action`

### Problem: Zoom Example
The zoom action in SC XML has:
- `kb1_lshift` (keyboard binding)
- `gp1_back` multiTap="2" (gamepad: View button, double-tap)

The app shows:
```
A → reWASD → LShift + F7 + F11 + F3 + F9 → SC → Zoom
```

This is wrong because:
1. F7, F11, F3, F9 have nothing to do with zoom
2. The actual gamepad binding (View double-tap) is ignored
3. reWASD is shown as primary when it should be secondary

---

## Intended Architecture (Correct)

### Primary Goal
View Star Citizen XML mappings clearly:
- See all actions organized by category
- See keyboard/mouse bindings separate from gamepad bindings
- Search and filter by action name, category, or input

### Secondary Goal (Optional)
If reWASD config is loaded:
- Cross-reference reWASD macros to SC keyboard bindings
- Show "this controller button (via reWASD) can also trigger this action"
- Make it clear these are reWASD-mediated, not direct game bindings

### Correct Data Model
Center on Star Citizen actions:
```typescript
interface GameAction {
  name: string;           // "zoom"
  displayName: string;    // "Zoom"
  category: string;       // "player"

  // Direct SC bindings (from XML)
  bindings: {
    keyboard?: KeyboardBinding[];  // kb1_lshift
    mouse?: MouseBinding[];        // mouse2 (default)
    gamepad?: GamepadBinding[];    // gp1_back (double-tap)
  };

  // Optional: reWASD triggers (cross-referenced)
  rewasdTriggers?: RewasdTrigger[];
}
```

### Correct Display
```
Zoom (player category)
├── Keyboard: LShift (default was Right-Click)
├── Gamepad: View button (double-tap)
│
└── [Optional reWASD section - if config loaded]
    Also triggered via reWASD:
    - A button (start+turbo) macro outputs LShift
```

---

## Key Files Involved

- `apps/viewer/src/lib/parsers/xmlParser.ts` - Parses SC XML (seems correct)
- `apps/viewer/src/lib/parsers/rewasdParser.ts` - Parses reWASD config
- `apps/viewer/src/lib/parsers/chainResolver.ts` - **Problem area** - wrong linking logic
- `apps/viewer/src/lib/types/unified.ts` - **Problem area** - wrong data model
- `apps/viewer/src/components/ChainVisualization.tsx` - UI built for wrong model
- `apps/viewer/src/components/MappingCard.tsx` - UI built for wrong model

---

## Next Steps

1. Research specific reWASD macros to understand what they actually do
2. Redesign data model to center on SC actions
3. Rework chain resolver to be optional reWASD overlay
4. Update UI components for correct display

---

## Deep Dive: A Button (start+turbo) Macro Analysis

### reWASD Config Location
- File: `GCO 4.5 HOSAS.rewasd`
- Mask ID: 1 (A button on Xbox controller)
- Activator: `type: "start"`, `mode: "turbo"`, `pause: 60000ms`

### Full Macro Sequence
The macro executes this sequence when A is pressed:

| Step | Action | SC Binding | In-Game Action |
|------|--------|------------|----------------|
| 1 | DpadDown (press) | `pc_select` | Select in player choice menu |
| 2 | LShift (tap) | `pc_focus` or `zoom` | Focus / Zoom |
| 3 | F7 (down, hold) | `pc_interaction_mode` | Enter interaction mode |
| 4 | pause 20ms | - | - |
| 5 | F11 (tap) | `pc_personal_back` | Go back in personal menu |
| 6 | pause 20ms | - | - |
| 7 | F3 (tap) | `pc_pit_emotes` | Open emotes PIT |
| 8 | F9 (tap) | `pc_personal_thought` | Personal/inner thought |
| 9 | DpadDown (release) | - | - |
| 10 | F11 (tap) | `pc_personal_back` | Go back again |
| 11 | pause 185ms | - | - |
| 12 | F7 (up, then down) | `pc_interaction_mode` | Toggle interaction |
| 13 | pause 50ms | - | - |
| 14 | DpadUp (tap) | `pc_interaction_mode` | Same as F7 |
| 15 | F7 (up) | - | Release |

### What This Macro Actually Does
This is a **Player Choice / Inner Thought menu navigation macro** - NOT a zoom trigger!

All these actions are in the `player_choice` actionmap:
- `pc_interaction_mode` (F7, DpadUp) - Enter/toggle interaction mode
- `pc_personal_back` (F11) - Navigate back in menu
- `pc_pit_emotes` (F3) - Open emotes wheel
- `pc_personal_thought` (F9) - Inner thought system
- `pc_select` (DpadDown) - Select menu option

### Why The App Shows It Wrong

The current app logic:
1. Extracts ALL keys from macro: [LShift, F7, F11, F3, F9]
2. Looks up each key in SC keyboard bindings
3. Finds LShift → zoom, so creates mapping: "A → LShift+F7+F11+F3+F9 → Zoom"

**This is completely wrong because:**
1. LShift is just ONE tap in a complex 15-step macro
2. The macro's PURPOSE is inner thought menu navigation, not zoom
3. Showing all keys as if they're a "combo for zoom" is nonsensical
4. F7, F11, F3, F9 each trigger DIFFERENT unrelated actions

### The Correct Interpretation

If we want to show what this reWASD macro does, it should show:

```
A Button (start+turbo, 60s repeat) - "Inner Thought Menu Macro"
  Triggers these SC actions in sequence:
  1. pc_select (DpadDown)
  2. pc_focus (LShift)
  3. pc_interaction_mode (F7)
  4. pc_personal_back (F11)
  5. pc_pit_emotes (F3)
  6. pc_personal_thought (F9)
  ... [full sequence]
```

NOT: "A → LShift+F7+F11+F3+F9 → Zoom"

---

## Key Insight for App Design

reWASD macros can be:
1. **Simple remaps** - Button → single key → single action
2. **Complex macros** - Button → sequence of keys/pauses → multiple actions in order

The app needs to handle both cases:
- For simple remaps: Show "A button → LShift → triggers Zoom"
- For complex macros: Show the full sequence with each step's action

**Most importantly:** The app should NOT show a macro as triggering a single action when it actually triggers many actions in sequence.

---

## Open Questions Resolved

~~- What does the A button (start+turbo) macro actually do in-game?~~
**Answer:** It's an Inner Thought / Player Choice menu navigation macro that rapidly cycles through menu options. The turbo mode (60s pause) suggests it's meant to repeat periodically.

~~- Need to trace F7, F11, F3, F9 to their actual SC bindings~~
**Answer:** All traced to `player_choice` actionmap:
- F7 → `pc_interaction_mode`
- F11 → `pc_personal_back`
- F3 → `pc_pit_emotes`
- F9 → `pc_personal_thought`
