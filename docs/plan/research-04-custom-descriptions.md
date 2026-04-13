# Research: Custom Localisation/Description System per reWASD Config

## Problem

Binding descriptions are nearly absent. Only 4 real user descriptions exist in the HOTAS config (out of 649 mappings). The user needs a way to:
1. See translated reWASD descriptions (French → English)
2. Add custom descriptions based on actual in-game testing
3. Support multiple reWASD configs, each with their own descriptions
4. Fall back gracefully when no custom description exists

## Data Findings

### Available description sources (current):
| Source | Coverage | Language | Quality |
|--------|----------|----------|---------|
| reWASD `mapping.description` | 4/649 HOTAS, 9/609 HOSAS | Mixed FR/EN | Good but sparse |
| SC action `displayName` | ~506 entries | English | Technical, from game localization |
| SC action `label` (raw) | Most actions | `@ui_*` keys | Unusable without localization lookup |
| SC `defaultProfile.xml` description | Some actions | `@ui_*` keys | Needs localization |

### reWASD JSON description structure:
- `config.description` — profile name ("Main"), useless
- `shifts[].description` — layer names ("LB", "Menu"), already used
- `masks[].set[].description` — hardware button names, machine-generated
- `mappings[].description` — **user annotations**, extremely sparse, mixed FR/EN
- `macros[].keyboard.description` — DIK key codes, technical

### Key insight:
English reWASD configs may have better descriptions. The user sometimes tries different configs and some have decent English annotations. The system must work with any quality level.

## Recommended Solution

### Description file format: JSON sidecar per reWASD config

For each `*.rewasd` file, support an optional `*.descriptions.json` sidecar:
```
configs/
  GCO 4.7 HOTAS.rewasd
  GCO 4.7 HOTAS.descriptions.json    ← custom descriptions
  GCO 4.5 HOSAS.rewasd
  GCO 4.5 HOSAS.descriptions.json    ← custom descriptions
```

### File format:
```json
{
  "$schema": "controller-descriptions-v1",
  "config": "GCO 4.7 HOTAS",
  "descriptions": {
    "A-Main-single": "Interact / Use (tap in any mode)",
    "A-Main-long": "Lock pitch+yaw (flight) / FOIP recalibrate",
    "A-Main-start": "Secondary fire / ADS / Mining laser toggle",
    "A-LB-single": "Eject / Flight Ready / Night Vision"
  }
}
```

Key format: `{button}-{layerName}-{activatorType}` — matches the binding ID pattern already used in `generateV2Id()`.

### Fallback chain (priority order):
1. **Custom description** from `.descriptions.json` sidecar
2. **reWASD description** from `mapping.description` field (translated if needed)
3. **SC action displayName** from localization data (current behavior)

### Auto-generation tool:
A script/button that generates a `.descriptions.json` template from the current binding data, pre-populated with:
- Any existing reWASD descriptions (marked for translation if French)
- SC action display names as placeholders
- Empty strings for bindings that need manual annotation

### No edit UI initially:
The user maintains the JSON file manually. This keeps the implementation simple and the user already has notes from in-game testing. A future UI could provide inline editing.

### Loading in the app:
- When loading a reWASD config, also attempt to fetch the matching `.descriptions.json`
- Pass custom descriptions to `resolveBindingsV2()` or apply them post-resolution
- Store on `ResolvedBinding.customDescription?: string`
- `BindingEntryRow` fallback: `customDescription > rewasdDescription > actionDisplayName`

## Files to Change

- New: `apps/viewer/public/configs/*.descriptions.json` — sidecar files
- New: `scripts/generate-descriptions.ts` — template generator
- `apps/viewer/src/lib/parsers/chainResolver.ts` — accept and apply custom descriptions
- `apps/viewer/src/lib/types/binding.ts` — add `customDescription` field
- `apps/viewer/src/components/ControllerVisual/BindingEntryRow.tsx` — use fallback chain
- `apps/viewer/src/app/page.tsx` — load sidecar alongside reWASD config

## Implementation Tasks

1. **Define description file format and loading** — JSON sidecar, fetch alongside .rewasd, type definitions
2. **Apply custom descriptions in the resolver/display chain** — fallback logic in BindingEntryRow
3. **Build description template generator script** — pre-populate from binding data
