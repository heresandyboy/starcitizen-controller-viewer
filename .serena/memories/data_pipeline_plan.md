# Data Pipeline Plan - Independent SC Action Generation System

## User's Vision (CRITICAL CONTEXT)

The user wants a FULLY INDEPENDENT system - NOT dependent on StarBinder. StarBinder is reference only.

### End-to-End Pipeline
1. **Import Data.p4k** → Extract defaultProfile.xml (per SC version)
2. **Generate MappedActions.ts** → TypeScript typed version of all ~653 actions with defaults
3. **Version-specific defaults** → Drop-down to view defaults per SC patch
4. **Import custom XML** → User's actionmaps.xml overlaid on defaults
5. **Compare configs** → Diff default vs custom, or custom vs custom
6. **ReWASD overlay** → See controller mappings on top of SC bindings, clearly marked

### Key Technical Findings

#### Data.p4k Extraction
- Data.p4k is 80-100GB modified ZIP archive (CryEngine)
- **Cannot do browser-side extraction** - too large, needs decryption
- Tools: unp4k (C#), scdatatools (Python), HAL Extractor (Windows Store)
- Can extract single files without processing whole archive
- Files may be in XMLB (binary XML) format - need unforge.exe to decode
- **Recommended approach**: CLI tool / script the user runs locally, outputs plain XML
- Files needed from Data.p4k:
  - `Data/Libs/Config/defaultProfile.xml` - action definitions
  - `Data/Localization/english/global.ini` - human-readable labels

#### defaultProfile.xml Structure (from StarBinder analysis)
Each `<actionmap>` contains `<action>` elements with:
- `name` - action name (e.g., "v_emergency_exit")
- `UILabel` - localization key (e.g., "@ui_CIEmergencyExit")
- `UIDescription` - description localization key
- `Category` - functional category
- `keyboard`, `mouse`, `gamepad`, `joystick` - default binding attributes
- `activationMode` - how binding triggers
- `optionGroup` - for relative axes (curves/invert)

The `<actionmap>` itself has:
- `name` - map name (e.g., "seat_general")
- `UILabel` - UI category key (e.g., "@ui_CCSeatGeneral")

#### MappedActions.ts Generation
Transform defaultProfile.xml into TypeScript with these fields per action:
```typescript
interface SCDefaultAction {
  actionName: string;        // "v_emergency_exit"
  mapName: string;           // "seat_general"  
  keyboardBind: string|null; // "u+lshift"
  mouseBind: string|null;
  gamepadBind: string|null;
  joystickBind: string|null;
  keyboardBindable: boolean;
  mouseBindable: boolean;
  gamepadBindable: boolean;
  joystickBindable: boolean;
  activationMode: string;    // "tap", "press", "hold", etc.
  category: string|null;     // "ShipSystems", "PlayerActions", etc.
  uiCategory: string;        // "@ui_CCSpaceFlight"
  label: string;             // "@ui_CIEmergencyExit" (or resolved)
  description: string;       // "@ui_CIEmergencyExitDesc"
  optionGroup: string|null;
  version: string;           // SC version
}
```

### Proposed Architecture

#### New Files/Modules
1. `apps/viewer/src/lib/data/` - Data layer
   - `scDefaultActions.ts` - Generated TypeScript (like MappedActions.js)
   - `scActionMetadata.ts` - Labels, descriptions, keywords  
   - `scLocalization.ts` - i18n data
   - `types.ts` - TypeScript interfaces

2. `apps/viewer/src/lib/parsers/`
   - `defaultProfileParser.ts` - Parse defaultProfile.xml → SCDefaultAction[]
   - `globalIniParser.ts` - Parse global.ini → localization map
   - `configMerger.ts` - Merge user XML overrides onto defaults

3. `apps/viewer/src/components/`
   - `DefaultProfileImporter.tsx` - UI for importing defaultProfile.xml
   - `VersionSelector.tsx` - Drop-down for SC version defaults
   - `ConfigComparer.tsx` - Side-by-side comparison
   - Enhanced `ConfigUploader.tsx` - Multiple config support

4. `tools/` or `scripts/`
   - `extract-default-profile.py` - Python script using scdatatools
   - `generate-actions.ts` - Node script to generate TypeScript from XML
   - Instructions for using unp4k manually

### Implementation Phases

#### Phase 1: defaultProfile.xml Parser
- Create `defaultProfileParser.ts` to parse the full XML
- Generate typed action list with all metadata
- Store as versioned JSON in `public/configs/sc-{version}/`

#### Phase 2: Localization & Labels
- Parse global.ini for @ui_ key resolution
- Create human-readable label/description system
- Fall back to auto-formatting for unknown keys

#### Phase 3: Config Management UI
- Version selector dropdown
- Import defaultProfile.xml (extracted by user)
- Import custom XML files
- Switch between configs

#### Phase 4: Config Comparison
- Default vs custom diff
- Custom vs custom diff
- Highlight changed/added/removed bindings

#### Phase 5: ReWASD Integration
- Overlay reWASD mappings on SC bindings
- Show controller button → keyboard key → SC action chain
- Mark reWASD actions distinctly from native bindings
- Support macro visualization

### Existing Beads Tasks
- controller-n3b (P1): Import keybinds.json as scActionMetadata.ts
- controller-c3k (P1): Import MappedActions.js as scDefaultBindings.ts  
- controller-p6q (P2): Implement keyword-based filtering (blocked by n3b)
- controller-xod (P2): Show all actions including unbound (blocked by c3k)
- controller-jqz (P3): Extract defaultProfile.xml documentation

### NEEDS UPDATE: These beads need to be revised to reflect the independent pipeline approach
- controller-n3b → Should be "Create scActionMetadata.ts from defaultProfile.xml" not "import from StarBinder"
- controller-c3k → Should be "Build defaultProfile parser to generate typed actions" not "import MappedActions.js"
- Need new tasks for: extraction script, config management UI, version selector, comparison
