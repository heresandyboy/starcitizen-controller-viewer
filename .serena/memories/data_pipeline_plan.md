# Data Pipeline & App Roadmap

## Status: Core pipeline COMPLETE, Phase 1 UI next (as of 2026-01-27)

### Completed (Data Pipeline)
- **Data.p4k extraction**: `scripts/extract-sc-data.py`
- **Parser**: `defaultProfileParser.ts` uses `fast-xml-parser` (Node-compatible)
- **Generator**: `apps/viewer/scripts/generate-actions.ts`
- **SC 4.5 generated data**: `defaultActions.ts` (711 actions, 39 actionmaps) + `localization.ts` (1227 keys)
- **Types**: `SCDefaultAction` in `apps/viewer/src/lib/types/defaultProfile.ts`
- **Tests**: All passing, build clean

### Workflow for New SC Versions
```
1. python scripts/extract-sc-data.py "C:\...\StarCitizen\LIVE" -v 4.6
2. cd apps/viewer && npm run generate:actions -- --version 4.6
3. App imports static TypeScript — zero runtime parsing
```

### Phase 1: Default Bindings Viewer (NEXT)
| Issue | Description | Depends On |
|-------|-------------|------------|
| **controller-xod** (P1) | Foundation: Load & display all defaults on app start | ✅ Done |
| **controller-ucr** (P1) | Input type selector (KB/Mouse, Gamepad, Joystick) | xod |
| **controller-cc2** (P1) | Action map / game mode filter | xod |
| **controller-6kj** (P1) | Bound/unbound toggle (tri-state) | xod |
| **controller-cms** (P1) | Text search across actions | xod |
| **controller-3y0** (P2) | SC version selector dropdown | xod |
| **controller-gbn** (P2) | Category hierarchy (StarBinder-style) | xod |
| **controller-p6q** (P2) | Keyword tag filtering (72 tags) | xod |

### Phase 2: Custom User Bindings
| Issue | Description | Depends On |
|-------|-------------|------------|
| **controller-ke0** (P2) | Import custom actionmaps.xml as overrides | xod |
| **controller-iw1** (P2) | Config comparison view (default vs custom) | ke0 |

### Phase 3: ReWASD Integration
| Issue | Description | Depends On |
|-------|-------------|------------|
| **controller-nld** (P2) | ReWASD overlay (controller→KB→action chains) | ke0 |

### Phase 4: Interactive Discovery
| Issue | Description |
|-------|-------------|
| **controller-cqd** (P2) | Physical controller button detection |
| Voice search | Ask "how do I eject?" (existing component) |
| Bidirectional lookup | Action↔button in both directions |

### Key Files
| File | Purpose |
|------|---------|
| `scripts/extract-sc-data.py` | Extract from Data.p4k |
| `apps/viewer/scripts/generate-actions.ts` | Generate static TS |
| `apps/viewer/src/lib/parsers/defaultProfileParser.ts` | XML parsing |
| `apps/viewer/src/lib/types/defaultProfile.ts` | SCDefaultAction type |
| `apps/viewer/src/lib/data/sc-{version}/defaultActions.ts` | Generated action data |
| `apps/viewer/src/lib/data/sc-{version}/localization.ts` | Generated i18n data |
