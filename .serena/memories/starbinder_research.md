# StarBinder Research - Complete Analysis

## Executive Summary

StarBinder (https://starbinder.space/) has solved the Star Citizen keybinding visualization problem by:
1. Extracting the **complete action list** from `defaultProfile.xml` (inside Data.p4k)
2. Creating **curated metadata** with human-readable labels, descriptions, and keywords
3. Using a **keyword-based filtering** system (72 unique tags)
4. Supporting **multi-language localization** (10 languages)

## Key Files in apps/starbinder-reference/

| File | Size | Purpose |
|------|------|---------|
| MappedActions.js | 378KB | **Source of truth** - 653 actions from defaultProfile.xml |
| keybinds.json | 175KB | 708 action metadata entries with labels, descriptions, keywords |
| localisation.json | 394KB | i18n translations for @ui_ keys in 10 languages |
| script.js | 163KB | Main app logic including XML parsing |

## MappedActions.js Structure (Auto-generated from defaultProfile.xml)

```js
{
  "actionName": "v_emergency_exit",
  "mapName": "seat_general",
  "keyboardBind": "u+lshift",      // Default keyboard binding
  "mouseBind": null,
  "gamepadBind": null,
  "joystickBind": null,
  "keyboardBindable": true,
  "mouseBindable": false,
  "gamepadBindable": false,
  "joystickBindable": true,
  "activationMode": "tap",          // 17+ modes supported
  "category": null,                 // Functional category
  "UICategory": "@ui_CCSeatGeneral", // In-game UI section
  "label": "@ui_CIEmergencyExit",   // Localization key
  "description": "@ui_CIEmergencyExitDesc",
  "version": "1",
  "optionGroup": null
}
```

## keybinds.json Structure (Curated metadata)

```json
{
  "v_emergency_exit": {
    "label": "Emergency Exit",
    "description": "Powers off the ship and makes user exit chair",
    "keywords": [
      "vehicles - seats and operator modes",
      "seats",
      "vehicle"
    ]
  }
}
```

## Category Systems

### UICategories (13 total - from defaultProfile.xml)
| UICategory | Action Count | Meaning |
|------------|--------------|---------|
| @ui_CCSpaceFlight | 340 | Space Flight |
| @ui_CCFPS | 120 | First Person |
| @ui_CGInteraction | 35 | Interaction |
| @ui_CCCamera | 32 | Camera |
| @ui_CCTurrets | 26 | Turrets |
| @ui_CCSeatGeneral | 26 | Seat General |
| @ui_CCEVA | 23 | EVA |
| @ui_CGOpticalTracking | 13 | Optical Tracking |
| @ui_CGEASpectator | 13 | Spectator |
| @ui_CGUIGeneral | 11 | UI General |
| @ui_CCVehicle | 7 | Vehicle |
| @ui_CCEVAZGT | 4 | EVA Zero-G |
| @ui_CGLightControllerDesc | 3 | Light Controller |

### Keywords (72 unique - curated in keybinds.json)
Top-level categories: flight, on foot, eva, vehicle, turrets, camera, interaction, etc.
Sub-categories: flight - movement, flight - power, flight - HUD, weapons, missiles, etc.

## Activation Modes (17 types)

| Mode | Behavior |
|------|----------|
| tap | Fires on release after short press (0.25s threshold) |
| press | Fires immediately on key press |
| hold | Fires continuously while held |
| double_tap | Requires double-tap, blocks single tap |
| double_tap_nonblocking | Double-tap fires but doesn't block single |
| delayed_press | Only fires if held >0.25s |
| delayed_press_medium | Only fires if held >0.5s |
| delayed_press_long | Only fires if held >1.5s |
| delayed_hold | Hold activation with 0.25s delay |
| delayed_hold_long | Hold activation with 1.5s delay |
| delayed_hold_no_retrigger | Hold once per press |
| hold_no_retrigger | Fire once per hold |
| hold_toggle | Toggle state on press/release |
| smart_toggle | Short press toggles, long press holds |
| all | Fires on press, hold, and release |

## How StarBinder Gets the Data

1. **defaultProfile.xml** is packed inside `Data.p4k` at:
   `C:\Program Files\Roberts Space Industries\StarCitizen\LIVE\Data.p4k`

2. Use **unp4k** tool to extract: https://github.com/dolkensp/unp4k
   ```bash
   unp4k.exe Data.p4k Data\Libs\Config\defaultProfile.xml
   unforge.exe Data\Libs\Config\defaultProfile.xml  # Decode XMLB
   ```

3. **global.ini** contains localization strings (also in Data.p4k)

4. They process this into MappedActions.js (auto-generated) + keybinds.json (curated)

## Comparison: Our System vs StarBinder

| Feature | Our System | StarBinder |
|---------|------------|------------|
| Action count | ~100 manually curated | 653 from defaultProfile.xml |
| Action map modes | ~30 mappings | 13 UICategories + 72 keywords |
| Data source | User's actionmaps.xml only | defaultProfile.xml + user overrides |
| Shows unbound actions | No | Yes |
| Human-readable names | Manual lookup | localization + curated labels |
| Descriptions | None | Full descriptions |
| Filtering | By GameplayMode | By 72 keyword tags |
| Multi-language | No | 10 languages |

## Implementation Plan

### Phase 1: Import StarBinder Data Files
1. Copy keybinds.json to our app as action metadata source
2. Copy localisation.json for multi-language support
3. Create TypeScript types for the data structures

### Phase 2: Create Master Action List
1. Parse MappedActions.js or create equivalent JSON
2. Build complete action registry with all 653 actions
3. Include default bindings per device type

### Phase 3: Improve XML Parsing
1. Parse user XML as overrides to defaults
2. Show ALL actions (bound and unbound)
3. Display default vs custom binding indicators

### Phase 4: Keyword-Based Filtering
1. Implement keyword tag system
2. Create UI for category/keyword filtering
3. Support search across names, descriptions, keywords

### Phase 5: Enhanced UI
1. Show activation modes distinctly (double_tap, hold, etc.)
2. Display descriptions on hover/focus
3. Add "Show defaults" toggle

## Critical Files for Implementation

From StarBinder (to copy/adapt):
- `apps/starbinder-reference/keybinds.json` → Action metadata
- `apps/starbinder-reference/localisation.json` → i18n
- `apps/starbinder-reference/MappedActions.js` → Default bindings

To create:
- `apps/viewer/src/lib/data/scActionMetadata.ts` → TypeScript port
- `apps/viewer/src/lib/data/scDefaultBindings.ts` → Default bindings
- `apps/viewer/src/lib/types/actionMetadata.ts` → Type definitions

## Sources

- [RSI Keybinds Support](https://support.robertsspaceindustries.com/hc/en-us/articles/360000183328-Create-export-and-import-custom-profiles)
- [unp4k Tool](https://github.com/dolkensp/unp4k)
- [sc-keybind-extract](https://github.com/GlebYaltchik/sc-keybind-extract)
