# Data Pipeline — Independent SC Action Generation System

## Status: Core pipeline COMPLETE (as of 2026-01-27)

### Completed
- **Data.p4k extraction** (controller-5qf): `scripts/extract-sc-data.py`
- **Parser rewrite** (controller-c3k): `defaultProfileParser.ts` uses `fast-xml-parser` (Node-compatible)
- **Generator script** (controller-c3k): `apps/viewer/scripts/generate-actions.ts`
- **SC 4.5 generated data**: `apps/viewer/src/lib/data/sc-4.5/defaultActions.ts` (711 actions) + `localization.ts` (1227 keys)
- **Types**: `SCDefaultAction` in `apps/viewer/src/lib/types/defaultProfile.ts`
- **Tests**: All 398 tests passing, build clean
- **Browser fetch wrappers removed**: No more runtime parsing

### Workflow for New SC Versions
```
1. python scripts/extract-sc-data.py "C:\...\StarCitizen\LIVE" -v 4.6
   → Extracts defaultProfile.xml + global.ini to public/configs/sc-4.6/
2. cd apps/viewer && npm run generate:actions -- --version 4.6
   → Generates src/lib/data/sc-4.6/defaultActions.ts + localization.ts
3. App imports static TypeScript — zero runtime parsing
```

### Key Files
| File | Purpose |
|------|---------|
| `scripts/extract-sc-data.py` | Extract from Data.p4k |
| `apps/viewer/scripts/generate-actions.ts` | Generate static TS from XML+INI |
| `apps/viewer/src/lib/parsers/defaultProfileParser.ts` | XML parsing (fast-xml-parser) |
| `apps/viewer/src/lib/parsers/globalIniParser.ts` | INI parsing (pure string) |
| `apps/viewer/src/lib/types/defaultProfile.ts` | SCDefaultAction type |
| `apps/viewer/src/lib/data/sc-{version}/defaultActions.ts` | Generated action data |
| `apps/viewer/src/lib/data/sc-{version}/localization.ts` | Generated i18n data |

### Remaining Work (separate issues)
- **controller-ke0** (P2): Config management UI with version selector
- **controller-iw1** (P2): Config comparison view
- **controller-nld** (P2): ReWASD overlay on SC action view
- **controller-xod** (P2): Show all actions including unbound
- **controller-p6q** (P2): Keyword-based filtering
- **controller-gbn** (P2): Category hierarchy in UI
