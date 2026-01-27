# controller-92t: What Was Built (and What's Wrong)

## Status: CLOSED — but implementation was incorrect

## What Was Built
A **runtime browser parser** that parses defaultProfile.xml using DOMParser on every page load:
- `apps/viewer/src/lib/parsers/defaultProfileParser.ts` — uses browser `DOMParser`
- `apps/viewer/src/lib/parsers/globalIniParser.ts` — pure string parsing (this one is fine)
- `apps/viewer/src/lib/types/defaultProfile.ts` — `SCDefaultAction` type (correct)
- Tests in `__tests__/lib/parsers/` — 29 tests validating against StarBinder reference (correct)

## What Was Supposed To Be Built
A **build-time generator script** that runs once per SC version and outputs static TypeScript files.
The plan in `data_pipeline_plan` and the beads issues both specified this clearly.

## What's Wrong
- `defaultProfileParser.ts` uses browser `DOMParser` — won't work in Node for the generator
- `fetchAndParseDefaultProfile()` and `fetchAndParseGlobalIni()` are browser fetch wrappers that shouldn't exist
- No generator script was created
- No static output files were generated
- The app would parse 1770-line XML + 85k-line INI at runtime on every page load

## What Needs to Happen (tracked in controller-c3k)
1. Rewrite `defaultProfileParser.ts` to use `fast-xml-parser` (Node-compatible, already a dep)
2. Remove browser fetch wrappers
3. Create `scripts/generate-actions.ts` — the actual generator
4. Generate static `defaultActions.ts` and `localization.ts` per SC version
5. The parsing LOGIC is validated and correct — just the execution model is wrong

## What's Salvageable
- The parsing logic (filtering rules, field extraction) is correct and tested
- The types are correct
- `globalIniParser.ts` already works in Node
- The tests are valuable — they validate against StarBinder's MappedActions.js
