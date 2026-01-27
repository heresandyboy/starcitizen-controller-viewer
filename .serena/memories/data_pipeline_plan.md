# Data Pipeline Plan — Independent SC Action Generation System

## Current State (as of 2026-01-27)

### Completed
- **Data.p4k extraction** (controller-5qf, closed): `scripts/extract-sc-data.py` extracts `defaultProfile.xml` + `global.ini` from SC's Data.p4k archive. Works correctly.
- **SC 4.5 data extracted**: Files in `apps/viewer/public/configs/sc-4.5/`
- **Parser logic** (controller-92t, closed): Parsing logic is correct and tested, BUT was implemented as a runtime browser parser instead of a build-time generator. See `controller_92t_parser_task` memory for details.
- **Types**: `SCDefaultAction` type in `apps/viewer/src/lib/types/defaultProfile.ts` is correct (17 fields matching StarBinder format)
- **Tests**: 29 tests validating parser output against StarBinder's MappedActions.js reference

### Next Up — controller-c3k (P1, OPEN)
**Build the actual generator script.** This is the critical missing piece.
See controller-c3k beads issue for the full implementation spec. Summary:
1. Rewrite `defaultProfileParser.ts` to use `fast-xml-parser` instead of browser `DOMParser`
2. Remove browser `fetchAndParse*()` wrappers
3. Create `scripts/generate-actions.ts` (Node script, takes `--version` arg)
4. Output static TypeScript files to `apps/viewer/src/lib/data/sc-{version}/`:
   - `defaultActions.ts` — `SCDefaultAction[]` (711 actions for SC 4.5)
   - `localization.ts` — `Record<string, string>` (~1125 ui_C keys)
5. Add `"generate:actions"` npm script
6. Update tests

### Future Phases (lower priority, separate issues)
- **controller-ke0** (P2): Config management UI with version selector
- **controller-iw1** (P2): Config comparison view (default vs custom, version vs version)
- **controller-nld** (P2): ReWASD overlay on SC action view
- **controller-xod** (P2): Show all actions including unbound (blocked by c3k)
- **controller-p6q** (P2): Keyword-based filtering (blocked by c3k)

## End-to-End Pipeline (Target Architecture)

```
1. New SC version released
2. Run: python scripts/extract-sc-data.py "C:\...\LIVE" -v 4.6
   → Extracts defaultProfile.xml + global.ini to public/configs/sc-4.6/
3. Run: npm run generate:actions -- --version 4.6
   → Generates src/lib/data/sc-4.6/defaultActions.ts + localization.ts
4. App imports static TypeScript — zero runtime parsing
5. User can switch SC versions via dropdown (controller-ke0)
6. User can import custom actionmaps.xml overlaid on defaults
7. User can compare configs (controller-iw1)
8. ReWASD overlay shows controller→key→action chain (controller-nld)
```

## Key Files
| File | Purpose | Status |
|------|---------|--------|
| `scripts/extract-sc-data.py` | Extract from Data.p4k | Done |
| `scripts/generate-actions.ts` | Generate static TS from XML+INI | **TODO (controller-c3k)** |
| `apps/viewer/src/lib/parsers/defaultProfileParser.ts` | XML parsing logic | Needs rewrite (DOMParser→fast-xml-parser) |
| `apps/viewer/src/lib/parsers/globalIniParser.ts` | INI parsing logic | Done (works in Node) |
| `apps/viewer/src/lib/types/defaultProfile.ts` | SCDefaultAction type | Done |
| `apps/viewer/src/lib/data/sc-{version}/defaultActions.ts` | Generated action data | **TODO** |
| `apps/viewer/src/lib/data/sc-{version}/localization.ts` | Generated i18n data | **TODO** |
| `apps/starbinder-reference/MappedActions.js` | Reference (711 actions) | Reference only |
