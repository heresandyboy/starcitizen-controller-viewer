# Project Overview: Star Citizen Controller Viewer

## Purpose
A web-based tool for visualizing and managing Star Citizen controller bindings. It parses reWASD configuration files (.rewasd) and Star Citizen XML action maps, then resolves the chain from controller button → keyboard key → game action.

## Tech Stack
- **Framework**: Next.js 16.1.3 with React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest (unit), Playwright (E2E), Testing Library
- **Build**: Next.js bundler
- **Package Manager**: npm (monorepo at apps/viewer)

## Key Features
- Parse reWASD JSON config files
- Parse Star Citizen actionmaps.xml files (user custom configs)
- Build-time generation of SC default action data from defaultProfile.xml
- Resolve controller → keyboard → game action chains
- Voice search with TTS
- Gamepad detection via Web Gamepad API
- Filter/search mappings by mode, modifier, button, or text

## Architecture
```
apps/viewer/src/
├── app/              # Next.js App Router pages
├── components/       # React components (ConfigUploader, MappingBrowser, etc.)
├── hooks/            # React hooks (useGamepad)
├── lib/
│   ├── constants/    # DIK codes, gamepad buttons, SC actions
│   ├── data/         # Generated static data (sc-{version}/defaultActions.ts, localization.ts)
│   ├── parsers/      # rewasdParser, xmlParser, chainResolver, defaultProfileParser, globalIniParser
│   ├── types/        # TypeScript type definitions (starcitizen.ts, defaultProfile.ts, unified.ts)
│   └── speech.ts     # TTS utility
└── test/             # Test utilities, mocks, fixtures

scripts/
├── extract-sc-data.py       # Extract defaultProfile.xml + global.ini from Data.p4k
└── generate-actions.ts      # Generate static TypeScript from extracted XML+INI (TODO: controller-c3k)

apps/starbinder-reference/   # StarBinder source files for reference only (not imported)
```

## Data Pipeline
1. Extract: `python scripts/extract-sc-data.py` → raw XML+INI to `public/configs/sc-{version}/`
2. Generate: `npm run generate:actions -- --version X.Y` → static TS to `src/lib/data/sc-{version}/`
3. App imports generated files — no runtime XML parsing

## Issue Tracking
Uses `bd` (beads) CLI for issue tracking with sync-branch workflow.
