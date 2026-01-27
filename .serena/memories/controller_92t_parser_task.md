# Task: controller-92t — defaultProfile.xml → TypeScript Parser

## What This Task Is
Build a browser-side parser (`defaultProfileParser.ts`) that reads SC 4.5's `defaultProfile.xml` 
and generates a typed array of SC default actions — our own version of StarBinder's `MappedActions.js`.
Also parse `global.ini` for `@ui_` localization key resolution.

## Beads Status
- Issue: `controller-92t` (P1, task) — status: **in_progress**
- Depends on: ✓ controller-5qf (closed)
- Blocks: controller-ke0 (config management UI)

## Input Files (already in repo)
- `apps/viewer/public/configs/sc-4.5/defaultProfile.xml` — 1770 lines, ~1097 `<action>` elements
- `apps/viewer/public/configs/sc-4.5/global.ini` — 85267 lines, ~1125 `ui_C*` control keys
- `apps/viewer/public/configs/sc-4.5/actionmaps.xml` — user custom config (separate concern)

## Reference Implementation (StarBinder)
StarBinder already solved this problem. Our task is to replicate the output in TypeScript.

### Key Reference Files
| File | Lines | Purpose |
|------|-------|---------|
| `apps/starbinder-reference/MappedActions.js` | 13514 (711 actions) | **THE TARGET OUTPUT** — auto-generated from defaultProfile.xml |
| `apps/starbinder-reference/keybinds.json` | 6024 | Hand-curated action metadata (labels, descriptions, keywords) |
| `apps/starbinder-reference/localisation.json` | 8197 | Multi-language `@ui_` key translations from global.ini |
| `apps/starbinder-reference/script.js` | 2000+ | Main app logic including XML parser (`loadAndParseDataminedXML`) |

### MappedActions.js Output Format (our target)
Each action is an object with these fields:
```typescript
{
  actionName: string;        // "v_emergency_exit"
  mapName: string;           // "seat_general" (from parent <actionmap>)
  keyboardBind: string|null; // "u+lshift" or null (space=" "→null, empty=""→null)
  mouseBind: string|null;    // "maxis_x" or null
  gamepadBind: string|null;  // "shoulderl+a" or null
  joystickBind: string|null; // null in most cases
  keyboardBindable: boolean; // true if keyboard attr exists on <action>
  mouseBindable: boolean;    // true if mouse attr exists
  gamepadBindable: boolean;  // true if gamepad attr exists
  joystickBindable: boolean; // true if joystick attr exists
  activationMode: string|null; // "tap", "press", "hold", etc. or null
  category: string|null;     // "ShipSystems", "PlayerActions", etc. (from Category attr)
  UICategory: string;        // "@ui_CCSeatGeneral" (from parent actionmap's UICategory attr)
  label: string;             // "@ui_CIEmergencyExit" (from UILabel attr)
  description: string;       // "@ui_CIEmergencyExitDesc" (from UIDescription attr)
  version: string;           // "1" (from parent actionmap's version attr)
  optionGroup: string|null;  // "flight_view_yaw" or null (from optionGroup attr)
}
```

### XML Structure (defaultProfile.xml)
```xml
<profile version="1" optionsVersion="2" rebindVersion="2">
  <!-- ActivationModes definitions (lines 14-31) -->
  <!-- optiontree sections (sensitivity curves, not needed for parsing) -->
  
  <actionmap name="seat_general" version="1" UILabel="@ui_CGSeatGeneral" UICategory="@ui_CCSeatGeneral">
    <action name="v_emergency_exit" activationMode="tap" keyboard="u+lshift" joystick=" "
            UILabel="@ui_CIEmergencyExit" UIDescription="@ui_CIEmergencyExitDesc" />
    <action name="v_eject" activationMode="press" keyboard="ralt+y" gamepad=" " joystick=" "
            UILabel="@ui_CIEject" UIDescription="@ui_CIEjectDesc" Category="PlayerActions" />
    <!-- Some actions have child elements: -->
    <action name="v_self_destruct" activationMode="delayed_press_medium" keyboard="backspace" joystick=" "
            UILabel="@ui_CISelfDestruct" UIDescription="@ui_CISelfDestructDesc" Category="ShipSystems">
      <gamepad activationMode="delayed_press_medium" input=" " />
    </action>
    <action name="v_toggle_all_doors" ...>
      <states>
        <state name="opened" UILabel="@ui_CICockpitDoorsToggleAll_Close_All" />
      </states>
    </action>
  </actionmap>
</profile>
```

**Critical parsing rules:**
1. Bindings are **attributes on `<action>`**, NOT child `<rebind>` elements (that's the user config format)
2. `keyboard=" "` (single space) means "bindable but unbound" → `keyboardBind: null`, `keyboardBindable: true`
3. Missing attribute (no `keyboard` at all) means "not bindable" → `keyboardBind: null`, `keyboardBindable: false`  
4. `keyboard=""` (empty string) also means unbound
5. `UICategory` comes from the **parent `<actionmap>`'s `UICategory` attribute**, NOT from the action
6. `version` comes from the **parent `<actionmap>`'s `version` attribute**
7. Some actions have child `<gamepad>` elements with override bindings (e.g., `v_self_destruct`)
8. Modifier notation: `"u+lshift"` means key "u" with modifier "lshift"; `"ralt+y"` means "ralt" modifier + "y" key
9. Mouse binds use `mouse="maxis_x"` format (axis bindings)
10. `optionGroup` attribute links to `<optiontree>` for sensitivity curve settings

### global.ini Localization Format
```
ui_CIEmergencyExit=Emergency Exit Seat
ui_CGSeatGeneral=Vehicles - Seats and Operator Modes
```
- Keys do NOT have `@` prefix (the XML uses `@ui_CIEmergencyExit`, the ini key is `ui_CIEmergencyExit`)
- Some keys have `,P=` suffix: `ui_CGSpaceFlightSalvage,P=Vehicles - Salvage`
- File is UTF-8 with BOM likely, 85k lines (most are non-UI game text)
- Only ~1125 keys start with `ui_C` (our target subset)

## Existing Codebase to Hook Into

### Current Parser: `apps/viewer/src/lib/parsers/xmlParser.ts`
- Parses **user actionmaps.xml** (which has `<rebind>` child elements, different from defaultProfile.xml)
- Uses browser `DOMParser`
- Exports: `parseStarCitizenXml()`, `parseXmlToGameActions()`, etc.
- This parser handles the USER's custom config. We need a NEW parser for the DEFAULTS.

### Types: `apps/viewer/src/lib/types/starcitizen.ts`
- Has `ActionMap`, `Action`, `Rebind`, `ParsedXmlBinding` types
- These are for the user XML format. We'll need new types for the default profile format.

### Constants: `apps/viewer/src/lib/constants/scActions.ts`
- Has `SC_ACTION_NAMES` (168 hand-curated labels) and `ACTION_MAP_MODES` (category mappings)
- Has `getActionDisplayName()`, `getGameplayMode()`, `formatActionName()`

### Types: `apps/viewer/src/lib/types/unified.ts`
- Has `GameAction`, `GameActionBindings`, `GameplayMode` etc.
- The new parser should produce data compatible with this type system.

## Implementation Plan

### New Files to Create
1. **`apps/viewer/src/lib/parsers/defaultProfileParser.ts`** — Core parser
   - `parseDefaultProfile(xmlString: string): SCDefaultAction[]`
   - Uses browser `DOMParser` (same pattern as xmlParser.ts)
   - Iterates `<actionmap>` → `<action>`, extracts all attrs
   
2. **`apps/viewer/src/lib/parsers/globalIniParser.ts`** — Localization resolver
   - `parseGlobalIni(iniContent: string): Map<string, string>`
   - Filters to `ui_C*` keys only (skip the 84k lines of game text)
   - Strips `@` prefix when looking up, handles `,P=` suffix keys

3. **`apps/viewer/src/lib/types/defaultProfile.ts`** — Type definitions
   - `SCDefaultAction` type matching the MappedActions.js output format
   - `SCActivationMode` union type for all 18 activation modes
   - `SCLocalizationMap` type

4. **Update `apps/viewer/src/lib/parsers/index.ts`** — Re-export new parsers

### Parsing Logic (from StarBinder's script.js lines 1247-1331)
```
For each <actionmap>:
  mapName = map.getAttribute("name")
  mapVersion = map.getAttribute("version") 
  UICategory = map.getAttribute("UICategory")  // NOTE: UICategory not UILabel!
  
  For each <action> in map:
    actionName = action.getAttribute("name")
    label = action.getAttribute("UILabel")
    description = action.getAttribute("UIDescription")
    category = action.getAttribute("Category")
    activationMode = action.getAttribute("activationMode") || null
    optionGroup = action.getAttribute("optionGroup") || null
    
    keyboardBind = action.getAttribute("keyboard")  // null if attr missing
    mouseBind = action.getAttribute("mouse")
    gamepadBind = action.getAttribute("gamepad")
    joystickBind = action.getAttribute("joystick")
    
    // Bindable = attribute EXISTS (even if value is " " or "")
    keyboardBindable = action.hasAttribute("keyboard")
    mouseBindable = action.hasAttribute("mouse")
    gamepadBindable = action.hasAttribute("gamepad")
    joystickBindable = action.hasAttribute("joystick")
    
    // Clean bind values: " " or "" → null
    if (keyboardBind?.trim() === "") keyboardBind = null
```

### Integration Points
- The generated `SCDefaultAction[]` feeds into the existing `GameAction` system
- Can create a converter: `scDefaultActionToGameAction(action: SCDefaultAction): GameAction`
- Localization resolver replaces the hard-coded `SC_ACTION_NAMES` dictionary
- Version-specific defaults stored in `public/configs/sc-{version}/`

## Code Style Reminders
- File names: camelCase (`defaultProfileParser.ts`)
- Types: PascalCase, prefer `type` over `interface`
- Named exports, re-export from index
- Strict TypeScript, explicit type annotations
- Use `Record<K,V>` for dictionaries
- Tests in `__tests__/` mirroring src structure
