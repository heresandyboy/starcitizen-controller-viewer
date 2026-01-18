# Star Citizen Controller Mapping Viewer - Implementation Plan

## Project Goal

Build a Next.js/React/TypeScript application that:
1. **Dynamically parses** both reWASD (.rewasd) and Star Citizen XML config files
2. **Shows the full mapping chain**: Controller Button → reWASD → Keyboard Key → Game Action
3. **Supports swappable configs** - users can drop in new files anytime
4. **Voice search** - ask for an action, hear the button combination
5. **Controller detection** - press a button to see what it does

## The Two-Layer System

### Layer 1: Star Citizen XML

Maps **both keyboard keys AND controller buttons** to in-game actions:

```xml
<action name="v_toggle_mining_mode">
  <rebind input="kb1_9"/>              <!-- Keyboard: 9 key -->
  <rebind input="gp1_shoulderl+x"/>    <!-- Controller: LB+X -->
</action>
```

### Layer 2: reWASD

Maps **controller buttons to keyboard keys**, giving controller access to keyboard-only functions:

```json
{
  "condition": { "shiftId": 2, "mask": { "id": 3 } },
  "macros": [{ "keyboard": { "description": "DIK_F7" } }]
}
```

### The Chain

```
Xbox Controller Button + Modifier (Y held)
       ↓ reWASD intercepts
Keyboard Key (F7)
       ↓ Game receives
Star Citizen Action (Toggle Scan Mode)
```

## User Preferences

- **Location**: `c:\code\ai\mine\StarCitizen\sc-controller-viewer\`
- **Primary view**: Organized by Gameplay Mode (Flight, FPS, EVA, etc.)
- **Controller**: Xbox Elite 1/2 with paddles (BP-L, BP-R, TP-L, TP-R)

## Project Structure

```
c:\code\ai\mine\StarCitizen\sc-controller-viewer/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Main page
│   │   ├── layout.tsx               # App layout
│   │   └── globals.css              # Tailwind styles
│   ├── components/
│   │   ├── ConfigUploader.tsx       # Drag/drop config files
│   │   ├── MappingBrowser.tsx       # Main browser (tabs by mode)
│   │   ├── MappingCard.tsx          # Individual mapping display
│   │   ├── ChainVisualization.tsx   # Controller → Key → Action visual
│   │   ├── SearchBar.tsx            # Text search with fuzzy matching
│   │   ├── VoiceSearch.tsx          # Speech recognition input
│   │   ├── ControllerInput.tsx      # Live gamepad detection
│   │   └── SourceIndicator.tsx      # Shows XML vs reWASD source
│   ├── lib/
│   │   ├── parsers/
│   │   │   ├── rewasdParser.ts      # Parse .rewasd JSON
│   │   │   ├── xmlParser.ts         # Parse SC XML
│   │   │   └── chainResolver.ts     # Link reWASD → XML mappings
│   │   ├── types/
│   │   │   ├── rewasd.ts            # reWASD TypeScript types
│   │   │   ├── starcitizen.ts       # SC XML TypeScript types
│   │   │   └── unified.ts           # Combined mapping model
│   │   ├── constants/
│   │   │   ├── dikKeys.ts           # DIK_ code to key name
│   │   │   ├── gamepadButtons.ts    # Button ID to name
│   │   │   └── scActions.ts         # Action name translations
│   │   └── speech.ts                # TTS and voice recognition
│   └── hooks/
│       ├── useGamepad.ts            # Gamepad API hook
│       └── useVoiceRecognition.ts   # Web Speech API hook
├── public/
│   └── configs/                     # Default config files
│       ├── layout_GCO-4-5-HOSAS.xml
│       └── GCO_4_5_HOSAS.rewasd
└── package.json
```

## Implementation Phases

### Phase 1: Project Setup

1. Initialize Next.js 14 with TypeScript
   ```bash
   npx create-next-app@latest sc-controller-viewer --typescript --tailwind --app
   ```

2. Install dependencies
   ```bash
   npm install fuse.js fast-xml-parser
   ```

3. Copy config files to `public/configs/`

4. Create type definition files

### Phase 2: Parsers

#### rewasdParser.ts

```typescript
interface ParsedRewasdMapping {
  maskId: number;
  buttonName: string;           // "A", "DpadUp", etc.
  shiftId?: number;
  shiftName?: string;           // "LB", "Y", etc.
  activatorType: string;        // "single", "long", "double"
  activatorMode: string;        // "onetime", "hold_until_release"
  outputKeys: string[];         // ["F7", "F11"] - keyboard keys sent
  description?: string;         // French description if present
}

export function parseRewasd(json: RewasdConfig): ParsedRewasdMapping[]
```

**Steps:**
1. Build lookup: `maskId → button description`
2. Build lookup: `shiftId → shift description`
3. For each mapping:
   - Resolve mask to button name
   - Resolve shiftId to modifier name
   - Extract activator type/mode
   - Extract keyboard keys from macros (DIK_* descriptions)

#### xmlParser.ts

```typescript
interface ParsedXmlBinding {
  actionMap: string;            // "spaceship_movement"
  actionName: string;           // "v_toggle_mining_mode"
  inputType: 'keyboard' | 'gamepad';
  inputKey: string;             // "9", "f7", "shoulderl+x"
  modifiers?: string[];         // ["lalt"]
  activationMode?: string;      // "double_tap"
}

export function parseStarCitizenXml(xml: string): ParsedXmlBinding[]
```

**Steps:**
1. Parse XML using fast-xml-parser
2. Iterate actionmaps → actions → rebinds
3. Parse input string format (`kb1_lalt+f7` → type: keyboard, key: f7, modifiers: [lalt])

#### chainResolver.ts

```typescript
interface UnifiedMapping {
  id: string;

  // Input side
  controllerButton: string;      // "A", "DpadUp"
  modifier?: string;             // "LB", "Y"
  activationType: string;        // "tap", "hold", "long", "double"

  // Chain
  keyboardKey?: string;          // "F7" (if via reWASD)

  // Output side
  gameAction: string;            // "v_toggle_mining_mode"
  gameActionReadable: string;    // "Toggle Mining Mode"
  gameplayMode: string;          // "Flight", "FPS", "EVA"
  actionMap: string;             // "spaceship_movement"

  // Metadata
  source: 'xml-gamepad' | 'xml-keyboard' | 'rewasd' | 'rewasd+xml';
  description?: string;
}

export function resolveChain(
  rewasdMappings: ParsedRewasdMapping[],
  xmlBindings: ParsedXmlBinding[]
): UnifiedMapping[]
```

**Steps:**
1. Create lookup: `keyboard_key → xml_binding[]`
2. For each reWASD mapping:
   - Get output keyboard keys
   - Look up what SC action those keys trigger
   - Create unified mapping with full chain
3. Also include direct gamepad bindings from XML

### Phase 3: Core UI

#### ConfigUploader.tsx

- Drag/drop zone for XML and reWASD files
- File type detection and validation
- Store in React state or localStorage

#### MappingBrowser.tsx

- Tabs for gameplay modes:
  - General
  - Flight
  - FPS
  - EVA
  - Ground Vehicle
  - Mining
  - Salvage
  - Scanning
  - Inventory
  - Mobiglass
  - Camera

- Filter controls:
  - By modifier (None, LB, Y, Menu, etc.)
  - By button
  - By source (XML, reWASD)

#### MappingCard.tsx

Display format:
```
┌─────────────────────────────────────────┐
│ [Y] + A (tap)                    [reWASD]│
│     ↓                                    │
│ F7 key                                   │
│     ↓                                    │
│ Toggle Scan Mode                         │
│ spaceship_scanning                       │
└─────────────────────────────────────────┘
```

### Phase 4: Search & Voice

#### SearchBar.tsx

- Use Fuse.js for fuzzy search
- Search across:
  - Game action names
  - Readable action names
  - Button names
  - Descriptions

#### VoiceSearch.tsx

```typescript
// Web Speech API
const recognition = new webkitSpeechRecognition();
recognition.continuous = false;
recognition.interimResults = false;

recognition.onresult = (event) => {
  const query = event.results[0][0].transcript;
  // Search and speak result
};
```

#### Text-to-Speech

```typescript
function speakMapping(mapping: UnifiedMapping) {
  const text = mapping.modifier
    ? `Hold ${mapping.modifier}, then press ${mapping.controllerButton}`
    : `Press ${mapping.controllerButton}`;

  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}
```

### Phase 5: Controller Detection

#### useGamepad.ts

```typescript
function useGamepad() {
  const [buttons, setButtons] = useState<GamepadButton[]>([]);
  const [axes, setAxes] = useState<number[]>([]);

  useEffect(() => {
    const poll = () => {
      const gamepads = navigator.getGamepads();
      const gp = gamepads[0];
      if (gp) {
        setButtons([...gp.buttons]);
        setAxes([...gp.axes]);
      }
      requestAnimationFrame(poll);
    };
    poll();
  }, []);

  return { buttons, axes };
}
```

**Xbox Elite Button Indices:**
| Index | Button |
|-------|--------|
| 0 | A |
| 1 | B |
| 2 | X |
| 3 | Y |
| 4 | LB |
| 5 | RB |
| 6 | LT (as button) |
| 7 | RT (as button) |
| 8 | View |
| 9 | Menu |
| 10 | L3 |
| 11 | R3 |
| 12 | D-Up |
| 13 | D-Down |
| 14 | D-Left |
| 15 | D-Right |
| 16 | Xbox |

**Note:** Paddles may appear as additional buttons (indices 17-20) depending on Elite controller mode.

## Key Constants

### dikKeys.ts

```typescript
export const DIK_KEYS: Record<number, string> = {
  2: '1', 3: '2', 4: '3', 5: '4', 6: '5', 7: '6', 8: '7', 9: '8', 10: '9', 11: '0',
  16: 'Q', 17: 'W', 18: 'E', 19: 'R', 20: 'T', 21: 'Y', 22: 'U', 23: 'I', 24: 'O', 25: 'P',
  30: 'A', 31: 'S', 32: 'D', 33: 'F', 34: 'G', 35: 'H', 36: 'J', 37: 'K', 38: 'L',
  44: 'Z', 45: 'X', 46: 'C', 47: 'V', 48: 'B', 49: 'N', 50: 'M',
  42: 'LShift', 54: 'RShift',
  56: 'LAlt', 184: 'RAlt',
  29: 'LCtrl', 157: 'RCtrl',
  53: '/',
  59: 'F1', 60: 'F2', 61: 'F3', 62: 'F4', 63: 'F5', 64: 'F6',
  65: 'F7', 66: 'F8', 67: 'F9', 68: 'F10', 87: 'F11', 88: 'F12',
  71: 'Num7', 72: 'Num8', 73: 'Num9',
  75: 'Num4', 76: 'Num5', 77: 'Num6',
  79: 'Num1', 80: 'Num2', 81: 'Num3',
  82: 'Num0',
  199: 'Home', 207: 'End',
  201: 'PgUp', 209: 'PgDn',
  210: 'Insert', 211: 'Delete',
};

export const DIK_NAMES: Record<string, string> = {
  'DIK_1': '1', 'DIK_2': '2', /* ... */
  'DIK_F7': 'F7', 'DIK_F11': 'F11',
  'DIK_LMENU': 'LAlt', 'DIK_RMENU': 'RAlt',
  'DIK_LSHIFT': 'LShift', 'DIK_RSHIFT': 'RShift',
  'DIK_NUMPAD2': 'Num2', 'DIK_NUMPAD3': 'Num3',
  // etc.
};
```

### gamepadButtons.ts

```typescript
export const REWASD_BUTTONS: Record<number, string> = {
  1: 'A', 2: 'B', 3: 'X', 4: 'Y',
  5: 'LB', 6: 'RB',
  7: 'View', 8: 'Menu',
  9: 'LS', 10: 'RS',
  11: 'Xbox',
  29: 'LeftUpperPaddle', 30: 'RightUpperPaddle',
  31: 'LeftLowerPaddle', 32: 'RightLowerPaddle',
  33: 'DpadUp', 34: 'DpadDown', 35: 'DpadLeft', 36: 'DpadRight',
  51: 'LT', 52: 'RT',
};
```

### scActions.ts

```typescript
export const SC_ACTION_NAMES: Record<string, string> = {
  'v_toggle_mining_mode': 'Toggle Mining Mode',
  'v_toggle_salvage_mode': 'Toggle Salvage Mode',
  'v_toggle_scan_mode': 'Toggle Scan Mode',
  'v_ifcs_speed_limiter_toggle': 'Toggle Speed Limiter',
  'v_view_mode': 'Cycle Camera View',
  'v_flightready': 'Flight Ready',
  // Build from XML or maintain manually
};

export const SC_ACTION_MODES: Record<string, string> = {
  'spaceship_movement': 'Flight',
  'spaceship_weapons': 'Flight',
  'spaceship_mining': 'Mining',
  'spaceship_salvage': 'Salvage',
  'spaceship_scanning': 'Scanning',
  'fps_movement': 'FPS',
  'fps_combat': 'FPS',
  'eva_movement': 'EVA',
  // etc.
};
```

## Verification Plan

1. **Parser Tests**
   - Load both config files
   - Verify parsing completes without errors
   - Check expected number of mappings extracted

2. **Chain Resolution Tests**
   - Pick 5 known mappings from French text file
   - Verify they appear correctly in unified output
   - Example: Y + A → F7 → Toggle Scan Mode

3. **Search Tests**
   - Search "missile" → find missile-related actions
   - Search "scan" → find scanning actions
   - Search "landing" → find landing gear actions

4. **Voice Tests**
   - Say "How do I toggle mining mode?"
   - Verify correct button combination is spoken

5. **Controller Tests**
   - Connect Xbox Elite controller
   - Press buttons and verify detection
   - Test modifier combinations (hold LB + press A)

## Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "fuse.js": "^7.0.0",
    "fast-xml-parser": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0"
  }
}
```
