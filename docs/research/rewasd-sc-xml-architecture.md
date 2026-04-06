# reWASD + SC XML Architecture Research

**Profile studied:** GCO 4.7 HOTAS (Gamepad Control Overhaul)
**Files:** `GCO 4.7 HOTAS.rewasd`, `layout_GCO-4-7-HOTAS.xml`
**Hardware:** Xbox Elite Series 1/2 controller

---

## The Fundamental Chain

```
Physical Xbox button press
        ↓
  reWASD layer + activator type
        ↓
  Keyboard macro sequence (and/or gamepad passthrough)
        ↓
  SC XML keyboard binding (kb1_*) or gamepad binding (gp1_*)
        ↓
  Star Citizen game action
```

This is a **three-layer system**. reWASD sits between the hardware and the game, translating controller input into keyboard/gamepad events that SC then maps to game actions. The SC XML is not a direct controller map — it is a keyboard + gamepad map that only makes sense in conjunction with the reWASD config.

---

## Layer 1: The reWASD Config

### What it is
A JSON file (schema version 3) that configures reWASD to intercept Xbox controller input and output keyboard macros or virtual gamepad button presses.

### Shift Layers (11 total)
The profile uses 11 named layers ("shifts"). The active layer depends on which modifier button is held:

| ID | Name | Trigger |
|----|------|---------|
| — | **Main** | No modifier held (default) |
| 1 | **LB** | Hold Left Shoulder button |
| 2 | **Y** | Hold Y button |
| 3 | **Menu** | Hold Menu button |
| 4 | **Select / View** | Hold View/Back button |
| 5 | **Start** | Hold Start button |
| 6 | **Sub (Menu)** | Sub-layer of Menu |
| 7 | **Down Pad LR** | D-pad left/right |
| 8 | **LS Bump** | Left stick click |
| 10 | **Sub (Y)** | Sub-layer of Y |
| 11 | **MAIN MENU** | Radial menu |

> **LB takes priority over RB.** If RB is held and LB is then pressed without releasing RB, LB takes precedence.

### Activator Types (5 per button per layer)
Each button in each layer can have up to 5 behaviours depending on how it is pressed:

| Type | Meaning |
|------|---------|
| `single` | Quick single press and release |
| `double` | Two quick presses |
| `long` | Press held beyond threshold (~450ms) |
| `start` | Fires immediately when button goes down (held) |
| `release` | Fires when button is released |

This means a single physical button can theoretically trigger **up to 55 different actions** (11 layers × 5 activator types).

### What the macros actually output
Analysed across 366 non-empty mappings:

| Output type | Count |
|-------------|-------|
| Keyboard-only sequences | 212 |
| Gamepad-only passthrough | 45 |
| Mixed keyboard + gamepad | 27 |

**The majority of mappings output keyboard key sequences, not gamepad buttons.** This is the core of the "complex macros exclusively" design.

### Macro structure
Macros are **ordered sequences of events**, not simple key presses. Each step can be:
- A keyboard key `down` or `up` event
- A gamepad button `down` or `up` event
- A mouse event
- A `pause` (timed delay in milliseconds)

Example — A button, `start` activator (Main layer):
```
DIK_LSHIFT down → DIK_LSHIFT up → GP:DpadUp down → DIK_F9 down → DIK_F11 down
```
This triggers multiple SC actions in a single timed sequence. One button press fires several things.

Example — B button, `long` activator (Main layer):
```
DIK_3 down → DIK_3 up
```
Simple single key, but only fires after holding B for 450ms.

### The Alt+G / Alt+D activators
The profile description warns users to disable external apps using these shortcuts because the profile "heavily uses key combinations associated with the ALT+G and ALT+D activators." These are chord combinations (Alt held while pressing another key) that map to SC keyboard bindings in the custom XML.

---

## Layer 2: The SC Custom XML

**File:** `layout_GCO-4-7-HOTAS.xml`
**Profile name:** `GCO-4-7-HOTAS`

### Binding counts
| Type | Count |
|------|-------|
| Keyboard (`kb1_*`) | 297 |
| Gamepad (`gp1_*`) | 550 |
| Joystick (`js1_*`) | 0 |

### What the keyboard bindings are
The 297 `kb1_*` bindings are the **destinations for reWASD's keyboard macro outputs**. When reWASD outputs `DIK_INSERT`, SC sees `kb1_insert` pressed and looks it up in this XML to find the action.

Confirmed example from tracing:
```
X button (Main, single press)
  → reWASD outputs: DIK_INSERT
  → SC XML: kb1_insert → spaceship_missiles.v_weapon_cycle_missile_fwd
  → Result: cycles missile forward
```

Another example:
```
DpadDown (Main, single press)
  → reWASD outputs: DIK_T
  → SC XML: kb1_t → spaceship_targeting_advanced.v_target_cycle_pinned_fwd
  → Result: cycles pinned targets
```

### What the 550 gamepad bindings are
The `gp1_*` bindings serve two purposes:

1. **reWASD virtual gamepad passthrough** — in some mappings reWASD outputs a virtual gamepad button (e.g. `GP:DpadUp`, `GP:RightShoulder`). These land on the `gp1_*` bindings in the XML.

2. **SC default gamepad scheme** — SC's standard gamepad layout (unchanged from defaults) is preserved in the XML export. These use `gp1_back` (the View/Back button) extensively with different `activationMode` values.

### The gp1_back / "View" issue
`gp1_back` appears on nearly every action map because SC's default gamepad scheme uses the Xbox View/Back button (`back` internally, renamed to "View" by Microsoft) with different activation modes as a shift/modifier key throughout the default layout:

```xml
<rebind input="gp1_back" activationMode="press"/>        <!-- quick tap -->
<rebind input="gp1_back" activationMode="hold"/>          <!-- long hold -->
<rebind input="gp1_back" activationMode="double_tap"/>    <!-- double tap -->
```

These are the **SC default gamepad bindings**, not GCO-specific. The GCO profile is built around the keyboard macro layer, not these gamepad defaults.

### Action maps present
36 action maps in the XML covering the full SC gameplay surface:
`seat_general`, `spaceship_general`, `spaceship_view`, `spaceship_movement`, `spaceship_quantum`, `spaceship_docking`, `spaceship_targeting`, `spaceship_targeting_advanced`, `spaceship_weapons`, `spaceship_missiles`, `spaceship_defensive`, `spaceship_power`, `spaceship_hud`, `spaceship_mining`, `spaceship_salvage`, `turret_movement`, `turret_advanced`, `lights_controller`, `player`, `player_emotes`, `player_choice`, `player_input_optical_tracking`, `prone`, `tractor_beam`, `zero_gravity_eva`, `zero_gravity_traversal`, `vehicle_general`, `vehicle_driver`, `vehicle_mfd`, `spectator`, `stopwatch`, `default`, `view_director_mode`

---

## What the Previous Code Got Wrong

The original `rewasdParser.ts` and `addRewasdTriggersToActions()` attempted a 1:1 mapping:
```
controller button → keyboard key → SC action
```

This is wrong in several ways:

1. **One button → multiple keyboard events.** A single press can fire a sequence of 3-4 keys. It's not a passthrough; it's a macro.

2. **Context is missing.** Which layer is active completely changes what a button does. Without knowing the active shift, the button press is ambiguous.

3. **One press → multiple SC actions.** A macro sequence can trigger several different SC actions in order. There is no single "this button does X" answer.

4. **Gamepad ≠ joystick.** The code merged `js1_` (physical joystick) and `gp1_` (gamepad) into a single `gamepad` array. These are different device types. This profile has zero joystick bindings (GCO uses virtual gamepad, not physical HOTAS joysticks).

5. **The keyboard bindings in the XML are the real mappings.** The `gp1_*` bindings are mostly SC defaults. The GCO-specific mappings almost entirely flow through `kb1_*`.

---

## What a Correct Viewer Would Show

To accurately display this profile, the UI needs to be **layer-first**, not **action-first**:

### Approach A: Layer × Button matrix
A table or grid where:
- **Rows** = physical buttons (A, B, X, Y, LB, RB, LT, RT, DpadUp/Down/Left/Right, LS, RS, View, Menu, Paddles...)
- **Columns** = layers (Main, LB, Y, Menu, View, LS Bump...)
- **Cells** = what action(s) result from that button in that layer, with activator type noted

### Approach B: Controller diagram with layer tabs
- Visual Xbox controller diagram
- Tab strip for each layer
- Click/hover a button to see all activator variants and their SC actions for that layer

### What each cell needs to show
For each button + layer + activator combination:
1. The activator type (single / double / long / held / release)
2. The keyboard keys sent by reWASD (the macro)
3. The resulting SC action name (resolved via XML keyboard binding)
4. The SC action's human-readable label (resolved via localization)
5. Any timing/pause information if it's a sequence macro

### Edge cases to handle
- **Multi-action macros**: one press → sequence of SC actions. Show all actions in sequence order.
- **Mixed macros**: some steps are keyboard (→ SC action), some are gamepad passthrough (→ different SC action). Both need to be shown.
- **Unresolved keys**: reWASD outputs a key that has no SC XML binding. These are likely SC default keyboard bindings not overridden in the custom XML — would need to look up in `defaultActions.ts`.
- **Pause steps**: indicate that there is a deliberate delay between actions in the sequence.

---

## Key Constants / Lookups Needed

### reWASD DIK codes → SC key names
The reWASD JSON uses DirectInput key codes (`DIK_*`). These need mapping to SC's key name format (`kb1_np_5`, `kb1_f7`, etc.) to look up against the SC XML.

A complete DIK → SC key mapping table needs to be built. The current `DIK_TO_KB` mapping used in research is partial.

### SC action name → human-readable label
Already exists in `src/lib/data/sc-4.7/localization.ts` and `defaultActions.ts`. The `label` field resolves `@ui_*` keys to English strings.

---

## Data Sources Summary

| Source | Format | Contains |
|--------|--------|---------|
| `GCO 4.7 HOTAS.rewasd` | JSON (schema v3) | Physical button → macro mappings, layer definitions, mask/shift structure |
| `layout_GCO-4-7-HOTAS.xml` | SC ActionMaps XML | Keyboard + gamepad → SC action bindings (custom overrides) |
| `src/lib/data/sc-4.7/defaultActions.ts` | Generated TS | All SC default actions with keyboard/gamepad/mouse bindings |
| `src/lib/data/sc-4.7/localization.ts` | Generated TS | `@ui_*` key → English label lookup |
