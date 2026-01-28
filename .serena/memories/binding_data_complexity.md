# Star Citizen Binding Data Complexity

## Default SC Bindings (defaultProfile.xml)
- **711 actions** across **39 action maps** (spaceflight, on_foot, vehicle_general, mining, etc.)
- Each action can have bindings for: keyboard, mouse, gamepad, joystick
- **Modifiers in defaults**: Usually one modifier available per input type:
  - Gamepad: LB (left bumper) as modifier (e.g., `gp1_shoulderl+a`)
  - Keyboard: Alt/Shift/Ctrl combos (e.g., `kb1_lalt+1`, `kb1_ralt+end`)
- **Activation modes in defaults**: `double_tap`, `multiTap` (e.g., multiTap="2")
- Bindings use input prefixes: `kb1_` (keyboard), `gp1_` (gamepad), `mo1_` (mouse), `js1_` (joystick)
- Generated static data lives in `src/lib/data/sc-{version}/defaultActions.ts`
- Localization keys (`@hud_pl_moveforward`) resolved via `localization.ts` (1227 keys)

## Custom User XML (actionmaps.xml)
- Players export custom bindings from SC's in-game settings
- Same XML format as defaultProfile.xml but only contains overridden bindings
- Overlays on top of defaults — unmentioned actions keep their default bindings
- Example file: `layout_GCO-4-5-HOSAS.xml` — a HOSAS (Hands On Stick And Stick) config
- Contains: device options (deadzones, curves), action map overrides
- Categories defined in `CustomisationUIHeader` section

## reWASD Config (.rewasd) — OPTIONAL
- **Not all users have reWASD** — many custom configs are SC XML only
- reWASD is a third-party tool that remaps controller inputs at OS level
- When present, it adds a MASSIVE layer of complexity on top of SC bindings:

### reWASD Structure (schema v3.0)
- **Shift layers** (modifier layers): 9+ layers in the GCO config
  - Each shift is activated by holding a specific button (LB, Y, Menu, Select, Start, etc.)
  - Named examples: "LB", "Y", "Menu", "Select", "Start", "Subdivided (Menu)", "Down Pad LR", "D-pad LEFT", "Turret", "Y (A)"
- **Masks** (physical button identifiers): 48 in GCO config
  - Basic buttons: A, B, X, Y, LB, RB, LT, RT, sticks, d-pad, back/start, paddles
  - Analog zones: LeftStickLowZone, LeftStickMedZone, LeftStickHighZone, etc.
  - Stick directions: LeftStickUp/Down/Left/Right, RightStickUp/Down/Left/Right
  - **Combo masks**: Two buttons pressed simultaneously (both sticks, both paddles, Menu+View, LB+RB)
- **609 total mappings** across all layers
- **6 activation types** per button:
  - `single` (tap) — 215 mappings
  - `start` (hold begin) — 78 mappings
  - `long` (long press) — 49 mappings
  - `release` (on release) — 23 mappings
  - `double` (double tap) — 8 mappings
  - `none` (default/passthrough) — 236 mappings
- **Macro sequences**: A single button can trigger multiple keyboard presses with pauses
  - Example: Button press → DIK_F7 → pause 300ms → DIK_F11 → DIK_F3 → DIK_F9
  - These keyboard presses then trigger in-game SC actions via the custom XML bindings
- **LED indicators**: Each shift layer has different LED color/pattern for visual feedback
- **Radial menus**: Custom radial menus for grouped actions

### The Full Chain (with reWASD)
```
Controller Button (+ modifier held) + Activation Type
  → reWASD shift layer active
    → reWASD mapping fires keyboard macro
      → SC custom XML maps keyboard keys to game actions
```

Example: Hold LB (shift 1) + Press A (single tap)
  → reWASD outputs DIK_F7 (keyboard F7)
    → SC XML maps F7 to `pc_interaction_mode`
      → In-game: Enter interaction mode

### Complexity per Button
A single physical button like DpadDown can have **20 different mappings** depending on:
1. Which modifier/shift is held (9 possible)
2. What activation type is used (6 possible)
This creates up to 54 potential mappings per button (though not all are used).

## Key Architectural Insight
The app is **action-centric** (SC actions are primary), with reWASD as an optional overlay.
The correct display model is:
```
Game Action (e.g., "Eject")
├── Default KB: [key]
├── Default Gamepad: [button] (with modifier/activation info)
├── Custom KB override: [key] (if different from default)
├── Custom Gamepad override: [button]
└── [Optional] reWASD triggers:
    └── Controller: [button + modifier + activation] → outputs [keyboard macro] → triggers this action
```

## Reference Image
`apps/viewer/public/configs/1. Schéma de Contrôles 4.5.jpg` shows the GCO 4.5 config visually:
- Xbox Elite 2 controller centered
- Color-coded lines from each button to action lists
- Actions organized by shift layer and activation type
- Shows the full 609-mapping complexity in a single poster-style image
