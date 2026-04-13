# Research: SC Context-Based Action Resolution

## Problem

reWASD macros are context-blind — they send the same keys regardless of game mode. SC decides which action fires based on current game state. The poster view shows ALL possible actions across ALL modes, even though only a subset fires in any given context. This makes bindings look more complex than they are.

## Data Findings

### SC action map structure (from defaultProfile.xml):

50 action maps exist. Each has:
- `name` — internal identifier (e.g., `spaceship_movement`)
- `UILabel` — display name key (e.g., `@ui_CGSpaceFlightMovement`)
- `UICategory` — grouping key (e.g., `@ui_CCSpaceFlight`)

### UICategory groupings reveal context clusters:

| UICategory | Action Maps | Likely Active When |
|------------|-------------|-------------------|
| `@ui_CCSpaceFlight` | spaceship_general, spaceship_view, spaceship_movement, spaceship_quantum, spaceship_targeting, spaceship_weapons, spaceship_missiles, spaceship_defensive, spaceship_power, spaceship_hud, spaceship_scanning, spaceship_mining, spaceship_salvage, vehicle_mfd, vehicle_mobiglas | Piloting a ship |
| `@ui_CCFPS` | player, prone, player_emotes, tractor_beam, incapacitated | On foot |
| `@ui_CCVehicle` | vehicle_general, vehicle_driver | Driving ground vehicle |
| `@ui_CCTurrets` | turret_movement, turret_advanced | Manning a turret |
| `@ui_CCEVA` | zero_gravity_eva | EVA in space |
| `@ui_CCEVAZGT` | zero_gravity_traversal | Zero-G traversal |
| `@ui_CGUIGeneral` | default, ui_notification | Always active (UI) |
| `@ui_CGInteraction` | player_choice | Interaction mode (any context) |
| `@ui_CGOpticalTracking` | player_input_optical_tracking | FOIP active |
| `@ui_CCCamera` | view_director_mode | Director camera |
| (none) | debug, IFCS_controls, flycam, character_customizer, hacking, mapui, stopwatch, server_renderer, RemoteRigidEntityController | Special contexts |

### Key structural insights:

1. **No priority/exclusivity system in the XML.** The game engine determines active action maps — this is NOT encoded in the config file.

2. **UICategory is the best proxy for "context group."** All `@ui_CCSpaceFlight` maps are likely active simultaneously when piloting. All `@ui_CCFPS` maps are active on foot.

3. **Some maps are always active**: `default`, `player_choice`, `player_input_optical_tracking` seem to be available across all contexts.

4. **Mining/Salvage/Scanning are sub-modes of Flight**: They're under `@ui_CCSpaceFlight` and are additional action maps activated when you enter those modes while piloting.

5. **The `<modifiers>` section confirms LB (shoulderl) is a game-level modifier**: SC treats `shoulderl` as a modifier key, not just a reWASD shift layer. This means `shoulderl+a` in SC is a native modifier combo, separate from reWASD's LB shift layer.

### What we CAN'T determine from the XML:

- Exact mutual exclusivity rules (is `player` active during EVA? probably not, but XML doesn't say)
- Priority when multiple maps have the same key bound (does spaceship_weapons override spaceship_movement?)
- Whether sub-modes (mining) completely replace base flight bindings or add to them

## Recommended Solution

### Phase 1: Group actions by UICategory context

Instead of showing a flat list of all actions, group by context cluster:

```
A [Main] hold:
  When piloting:
    → Lock Pitch/Yaw [spaceship_movement]
  When on foot:
    → ADS / Aim [player]
  Always:
    → FOIP Recalibrate [player_input_optical_tracking]
```

### Phase 2: Define context groups in code

Create a `SC_CONTEXT_GROUPS` mapping:
```typescript
const SC_CONTEXT_GROUPS = {
  'Piloting': ['spaceship_*', 'vehicle_mfd', 'vehicle_mobiglas'],
  'On Foot': ['player', 'prone', 'player_emotes', 'tractor_beam'],
  'Vehicle': ['vehicle_general', 'vehicle_driver'],
  'Turret': ['turret_*'],
  'EVA': ['zero_gravity_*'],
  'Always': ['default', 'player_choice', 'player_input_optical_tracking'],
  'Camera': ['view_director_mode', 'flycam', 'spectator'],
  'Mining (sub-mode)': ['spaceship_mining'],
  'Salvage (sub-mode)': ['spaceship_salvage'],
  'Scanning (sub-mode)': ['spaceship_scanning'],
};
```

### Phase 3: Use context groups in the mode filter

The existing mode filter dropdown could use these context groups instead of per-action-map modes. "Show me what this button does when I'm piloting" would show all `@ui_CCSpaceFlight` actions and `Always` actions, filtering out FPS/Vehicle/EVA.

### Important caveat:

**We cannot determine exact SC behavior from the XML alone.** The context groupings above are best-effort based on UICategory and naming conventions. The user's custom description system (research-04) is the authoritative source for "what actually happens when I press this."

## Files to Change

- New: `apps/viewer/src/lib/constants/scContextGroups.ts` — context group definitions
- `apps/viewer/src/lib/constants/scActions.ts` — fix ACTION_MAP_MODES (see research-02)
- `apps/viewer/src/components/ControllerVisual/MacroBreakdown.tsx` — group by context in expanded view
- `apps/viewer/src/components/ControllerVisual/useControllerVisualData.ts` — context-aware filtering

## Implementation Tasks

1. **Define SC context groups from UICategory data** — mapping from actionmap → context
2. **Group expanded macro view by context** — "When piloting:", "When on foot:", etc.
3. **Context-aware mode filter** — filter by game state, not individual action map
