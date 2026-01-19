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
- Parse Star Citizen actionmaps.xml files
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
│   ├── parsers/      # rewasdParser, xmlParser, chainResolver
│   ├── types/        # TypeScript type definitions
│   └── speech.ts     # TTS utility
└── test/             # Test utilities, mocks, fixtures
```

## Issue Tracking
Uses `bd` (beads) CLI for issue tracking with sync-branch workflow.
