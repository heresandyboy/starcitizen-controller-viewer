# Star Citizen ActionMaps XML Schema

## Overview

Star Citizen uses XML files to define controller/keyboard mappings. These files are located at:
```
C:\Program Files\Roberts Space Industries\StarCitizen\LIVE\USER\Client\0\Controls\Mappings
```

## Top-Level Structure

```xml
<ActionMaps version="1" optionsVersion="2" rebindVersion="2" profileName="GCO-4-5-HOSAS">
  <CustomisationUIHeader label="..." description="..." image="">
    <devices>...</devices>
    <categories>...</categories>
  </CustomisationUIHeader>
  <deviceoptions name="...">...</deviceoptions>
  <options type="..." instance="...">...</options>
  <modifiers />
  <actionmap name="...">
    <action name="...">
      <rebind input="..." />
    </action>
  </actionmap>
</ActionMaps>
```

## Key Sections

### CustomisationUIHeader

Metadata about the profile.

```xml
<CustomisationUIHeader label="GCO-4-5-HOSAS" description="" image="">
  <devices>
    <keyboard instance="1"/>
    <mouse instance="1"/>
    <gamepad instance="1"/>
  </devices>
  <categories>
    <category label="@ui_CCSeatGeneral"/>
    <category label="@ui_CCSpaceFlight"/>
    <category label="@ui_CCFPS"/>
    <!-- etc -->
  </categories>
</CustomisationUIHeader>
```

### deviceoptions

Device-specific settings like deadzones.

```xml
<deviceoptions name="Controller (Gamepad)">
  <option input="thumbr" deadzone="0.14384"/>
  <option input="thumbl" deadzone="0.22475"/>
</deviceoptions>
```

### options

Sensitivity curves and other input options per device.

```xml
<options type="gamepad" instance="1" Product="Controller (Gamepad)">
  <fps_view exponent="1.5">
    <nonlinearity_curve />
  </fps_view>
  <flight_move_pitch invert="0" exponent="3" />
  <!-- etc -->
</options>
```

### actionmap

Groups of related actions. Each game system has its own actionmap.

**Common ActionMap Names:**
- `seat_general` - General seat controls
- `spaceship_general` - Ship systems
- `spaceship_view` - Camera/view controls
- `spaceship_movement` - Flight controls
- `spaceship_targeting` - Target acquisition
- `spaceship_weapons` - Weapons
- `spaceship_missiles` - Missile controls
- `spaceship_defensive` - Countermeasures
- `spaceship_mining` - Mining mode
- `spaceship_salvage` - Salvage mode
- `spaceship_scanning` - Scanning
- `turret_main` - Turret controls
- `vehicle_general` - Ground vehicle
- `fps_movement` - On-foot movement
- `fps_combat` - On-foot combat
- `fps_interaction` - Interaction system
- `eva_movement` - Zero-G movement
- `player_input_optical_tracking` - Head tracking

### action

Individual bindable actions within an actionmap.

```xml
<action name="v_toggle_mining_mode">
  <rebind input="kb1_9"/>
  <rebind input="gp1_shoulderl+x"/>
</action>
```

### rebind

Maps an input to an action.

**Attributes:**
- `input` - The input binding (see Input Format below)
- `activationMode` - Optional: "double_tap", etc.
- `multiTap` - Optional: Number of taps required

## Input Format

### Keyboard

Format: `kb{instance}_{key}` or `kb{instance}_{modifier}+{key}`

**Examples:**
- `kb1_9` - Key 9
- `kb1_f12` - F12
- `kb1_lalt+1` - Left Alt + 1
- `kb1_ralt+pgup` - Right Alt + Page Up
- `kb1_lctrl` - Left Control
- `kb1_minus` - Minus key
- `kb1_apostrophe` - Apostrophe
- `kb1_np_5` - Numpad 5
- `kb1_oem_102` - OEM key

### Gamepad

Format: `gp{instance}_{button}` or `gp{instance}_{button}+{button2}`

**Button Names:**
| Input Code | Button |
|------------|--------|
| `a` | A button |
| `b` | B button |
| `x` | X button |
| `y` | Y button |
| `shoulderl` | Left Bumper (LB) |
| `shoulderr` | Right Bumper (RB) |
| `triggerl_btn` | Left Trigger (as button) |
| `triggerr_btn` | Right Trigger (as button) |
| `thumbl` | Left Stick Click |
| `thumbr` | Right Stick Click |
| `back` | View/Back button |
| `start` | Menu/Start button |
| `dpad_up` | D-Pad Up |
| `dpad_down` | D-Pad Down |
| `dpad_left` | D-Pad Left |
| `dpad_right` | D-Pad Right |

**Examples:**
- `gp1_a` - A button
- `gp1_shoulderl+x` - LB + X
- `gp1_back` - View button
- `gp1_dpad_up` - D-Pad Up

### Activation Modes

```xml
<rebind input="gp1_back" activationMode="double_tap"/>
<rebind input="gp1_back" multiTap="2"/>
```

- `activationMode="double_tap"` - Requires double-tap
- `multiTap="2"` - Requires 2 taps

## Common Action Names

### Flight
- `v_toggle_mining_mode` - Toggle Mining Mode
- `v_toggle_salvage_mode` - Toggle Salvage Mode
- `v_toggle_scan_mode` - Toggle Scan Mode
- `v_toggle_quantum_mode` - Toggle Quantum Mode
- `v_ifcs_speed_limiter_toggle` - Toggle Speed Limiter
- `v_ifcs_vector_decoupling_toggle` - Toggle Decoupled Mode
- `v_deploy_landing_system` - Landing Gear
- `v_autoland` - Auto Land
- `v_view_mode` - Cycle View
- `v_flightready` - Flight Ready

### Weapons
- `v_attack1` - Fire Group 1
- `v_attack2` - Fire Group 2
- `v_weapon_cycle_missile_fwd` - Cycle Missiles

### Targeting
- `v_target_cycle_hostile_fwd` - Cycle Hostile Targets
- `v_target_cycle_friendly_fwd` - Cycle Friendly Targets

### FPS
- `fps_jump` - Jump
- `fps_crouch` - Crouch
- `fps_sprint` - Sprint
- `fps_reload` - Reload
- `fps_interact` - Interact

## TypeScript Interface

```typescript
interface ActionMaps {
  version: string;
  optionsVersion: string;
  rebindVersion: string;
  profileName: string;
  actionmaps: ActionMap[];
}

interface ActionMap {
  name: string;
  actions: Action[];
}

interface Action {
  name: string;
  rebinds: Rebind[];
}

interface Rebind {
  input: string;
  activationMode?: 'double_tap' | string;
  multiTap?: number;
}
```

## Parsing Strategy

1. Parse XML to extract all actionmaps
2. For each actionmap, extract all actions
3. For each action, extract all rebinds
4. Parse input strings to determine:
   - Device type (kb/gp/mouse)
   - Key/button
   - Modifiers (if any)
   - Activation mode

5. Build lookup tables:
   - `keyboard_key → action_name`
   - `gamepad_input → action_name`

## Linking to reWASD

The key insight is that reWASD outputs keyboard keys, and Star Citizen receives them:

```
reWASD: Controller A + Y held → outputs DIK_F7 (F7 key)
SC XML: kb1_f7 → v_toggle_scan_mode

Therefore: Controller A + Y held → Toggle Scan Mode
```

To link:
1. Parse reWASD to get: `controller_input → keyboard_key`
2. Parse SC XML to get: `keyboard_key → game_action`
3. Join on keyboard key to get: `controller_input → game_action`
