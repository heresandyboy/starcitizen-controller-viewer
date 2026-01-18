# reWASD Configuration File Schema

## Overview

The `.rewasd` file is a JSON configuration file used by the reWASD application to remap controller inputs to keyboard/mouse actions. This document describes the schema reverse-engineered from analyzing the `GCO 4.5 HOSAS.rewasd` file.

## Top-Level Structure

```json
{
  "schemaVersion": 3.0,
  "appVersion": "9.3.0",
  "config": { ... },
  "devices": { ... },
  "radialMenuCircles": [ ... ],
  "radialMenuSectors": [ ... ],
  "crosshairs": [ ... ],
  "shifts": [ ... ],
  "masks": [ ... ],
  "mappings": [ ... ]
}
```

## Key Sections

### shifts

Defines modifier layers. When a shift is active, button mappings change.

```typescript
interface Shift {
  id: number;                    // Referenced by mappings
  type: string;                  // "default", "radialMenu", etc.
  description: string;           // Human-readable name: "LB", "Y", "Menu", "Select", "Start"
  unheritableMasks?: number[];   // Masks that don't inherit to this shift
}
```

**Example from GCO 4.5:**
```json
{ "id": 1, "type": "default", "description": "LB" }
{ "id": 2, "type": "default", "description": "Y" }
{ "id": 3, "type": "default", "description": "Menu" }
{ "id": 4, "type": "default", "description": "Select" }
{ "id": 5, "type": "default", "description": "Start" }
```

### masks

Defines input buttons or button combinations. Each mask has an ID that mappings reference.

```typescript
interface Mask {
  id: number;                    // Referenced by mappings
  set: MaskButton[];             // Buttons that make up this input
}

interface MaskButton {
  deviceId: number;              // 1 = gamepad
  buttonId: number;              // Button identifier (see Button IDs below)
  description: string;           // Human-readable: "XB: A", "DpadUp", etc.
}
```

**Common Button IDs:**
| buttonId | Description |
|----------|-------------|
| 1 | A button |
| 2 | B button |
| 3 | X button |
| 4 | Y button |
| 5 | Left Shoulder (LB) |
| 6 | Right Shoulder (RB) |
| 7 | View/Back/Select |
| 8 | Menu/Start |
| 9 | Left Stick Click (L3) |
| 10 | Right Stick Click (R3) |
| 11 | Home/Xbox button |
| 29 | Left Upper Paddle (Xbox Elite) |
| 30 | Right Upper Paddle (Xbox Elite) |
| 31 | Left Lower Paddle (Xbox Elite) |
| 32 | Right Lower Paddle (Xbox Elite) |
| 33 | D-Pad Up |
| 34 | D-Pad Down |
| 35 | D-Pad Left |
| 36 | D-Pad Right |
| 37-42 | Left Stick Zones (Low, Med, High) |
| 51 | Left Trigger |
| 52 | Right Trigger |
| 113+ | Stick directional zones |

### mappings

The core of the config - defines what happens when a button (mask) is pressed with a specific activation type, optionally while a shift is active.

```typescript
interface Mapping {
  description?: string;          // Optional human-readable name (French in GCO)
  condition: MappingCondition;
  macros?: MacroStep[];          // Actions to execute
  jumpToLayer?: { layer: number }; // Switch to different shift layer
}

interface MappingCondition {
  shiftId?: number;              // Which shift must be active (undefined = default/no shift)
  mask: {
    id: number;                  // Which mask (button) triggers this
    activator: Activator;
  };
}

interface Activator {
  type: 'single' | 'long' | 'double' | 'start' | 'release';
  mode: 'onetime' | 'hold_until_release' | 'turbo' | 'toggle';
  params?: {
    expert?: boolean;
    delay?: number;              // Milliseconds
    singlewaittime?: number;     // For double-tap detection
    doublewaittime?: number;
    pause?: number;              // For turbo mode
    macro?: boolean;
  };
}
```

**Activator Types:**
- `single` - Single press
- `long` - Long press (hold)
- `double` - Double tap
- `start` - On press down
- `release` - On release

**Activator Modes:**
- `onetime` - Execute once
- `hold_until_release` - Hold key while button held
- `turbo` - Repeat while held
- `toggle` - Toggle on/off

### macros

Array of actions to execute when a mapping triggers.

```typescript
interface MacroStep {
  keyboard?: KeyboardAction;
  gamepad?: GamepadAction;
  mouse?: MouseAction;
  pause?: { value: number };     // Delay in milliseconds
  rumble?: RumbleAction;
}

interface KeyboardAction {
  buttonId: number;              // DirectInput key code
  description: string;           // "DIK_F7", "DIK_LALT", "DIK_1", etc.
  action?: 'down' | 'up';        // If omitted, does press-release
}

interface GamepadAction {
  id: number;                    // Virtual gamepad ID
  buttonId: number;              // Button to press
  description: string;
  action?: 'down' | 'up';
}
```

## DirectInput Key Codes (DIK_)

Common key codes found in the config:

| buttonId | DIK Name | Key |
|----------|----------|-----|
| 2 | DIK_1 | 1 |
| 3 | DIK_2 | 2 |
| 4 | DIK_3 | 3 |
| 5 | DIK_4 | 4 |
| 6 | DIK_5 | 5 |
| 7 | DIK_6 | 6 |
| 8 | DIK_7 | 7 |
| 9 | DIK_8 | 8 |
| 10 | DIK_9 | 9 |
| 11 | DIK_0 | 0 |
| 42 | DIK_LSHIFT | Left Shift |
| 56 | DIK_LMENU | Left Alt |
| 184 | DIK_RMENU | Right Alt |
| 53 | DIK_SLASH | / |
| 59 | DIK_F1 | F1 |
| 60 | DIK_F2 | F2 |
| 61 | DIK_F3 | F3 |
| 65 | DIK_F7 | F7 |
| 67 | DIK_F9 | F9 |
| 87 | DIK_F11 | F11 |
| 88 | DIK_F12 | F12 |
| 80 | DIK_NUMPAD2 | Numpad 2 |
| 81 | DIK_NUMPAD3 | Numpad 3 |
| 210 | DIK_INSERT | Insert |

## How Shifts Work

1. A button press can `jumpToLayer` to activate a shift
2. While shift is active, mappings with matching `shiftId` are used
3. Releasing the shift button returns to layer 0 (default)

**Example flow:**
```
Press Y button → jumpToLayer: 2 (Y shift active)
While Y held, press A → mapping with shiftId: 2 and mask A executes
Release Y → return to layer 0
```

## Parsing Strategy

1. Build lookup tables:
   - `maskId → button description`
   - `shiftId → shift description`

2. For each mapping:
   - Get button name from mask
   - Get modifier name from shiftId (if present)
   - Get activator type
   - Extract keyboard keys from macros

3. Output format:
   ```
   Button: A
   Modifier: Y (held)
   Activation: single tap
   Output: F7, then F11, then SLASH
   ```
