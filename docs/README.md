# Star Citizen Controller Mapping Project

## Project Overview

This project aims to build a web application that helps users understand and learn their Star Citizen controller mappings, specifically for configurations that use **reWASD** to extend controller functionality.

## The Problem

Star Citizen has limited native controller support. The **GCO (Gamepad Control Overhaul)** profile solves this by using:

1. **In-game XML mappings** - Maps controller buttons and keyboard keys to game actions
2. **reWASD mappings** - Maps controller buttons to keyboard keys, giving controller access to keyboard-only functions

This creates a two-layer system where a single controller button press can:

- Trigger a direct gamepad action in-game, OR
- Be intercepted by reWASD, converted to keyboard key(s), which then trigger game actions

## The Solution

Build a viewer application that:

- **Parses both config files dynamically** (not hardcoded)
- **Shows the full chain**: Controller → reWASD → Keyboard → Game Action
- **Indicates the source** of each mapping (XML vs reWASD)
- **Supports voice search** - "How do I fire missiles?" → speaks the button combo
- **Detects controller input** - press a button to see what it does
- **Allows config swapping** - drop in new configs anytime

## Documentation

| File | Description |
|------|-------------|
| [REWASD_SCHEMA.md](./REWASD_SCHEMA.md) | Complete reverse-engineered schema of .rewasd JSON files |
| [STARCITIZEN_XML_SCHEMA.md](./STARCITIZEN_XML_SCHEMA.md) | Schema for Star Citizen actionmap XML files |
| [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) | Detailed implementation plan with code examples |
| [TRANSLATIONS_EN.md](./TRANSLATIONS_EN.md) | English translation of French instruction files |

## Source Config Files

Located in `../GCO 4.5 HOSAS/`:

| File | Purpose |
|------|---------|
| `layout_GCO-4-5-HOSAS.xml` | Star Citizen in-game mappings |
| `GCO 4.5 HOSAS.rewasd` | reWASD controller-to-keyboard mappings |
| `LISEZ-MOI.txt` | Installation instructions (French) |

Located in `../Fichier Texte Des Raccourcis GCO 4.5 HOSAS/`:

| File | Purpose |
|------|---------|
| `Fichier Texte Des Raccourcis GCO 4.5.txt` | Human-readable mapping reference (French) |

## Key Concepts

### Modifiers (Shifts)

The GCO profile uses modifier buttons to multiply available actions:

| Modifier | Button | Activation |
|----------|--------|------------|
| M1 | LS Bump (Left Stick Click) | Hold |
| M2 | LB (Left Bumper) | Hold |
| M3 | VIEW | Hold |
| M4 | XBOX | Toggle |
| M5 | MENU | Hold |
| M6 | RB (Right Bumper) | Hold |
| M7 | Y | Toggle |

### Activation Types

| Symbol | Meaning |
|--------|---------|
| (1) | Single tap |
| (2) | Double tap |
| (L) | Long press |
| (M) | Hold |
| (B) | Toggle |

### Gameplay Modes

| Code | Mode |
|------|------|
| V | Vehicle/Flight |
| FPS | First Person Shooter |
| TPS | Third Person |
| EVA | Zero-G/Spacewalk |
| VT | Ground Vehicle |
| MI | Mining |
| R | Salvage/Recycling |
| SC | Scanning |
| TB | Tractor Beam |
| I | Inventory |
| IR | Quick Inventory |
| IM | Interaction Mode |
| MB | Mobiglass |
| AM | Weapon Attachment |
| TM | Turret Mode |

## Technology Stack

- **Next.js ^15 (latest)** - React framework ^19 (latest)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Fuse.js** - Fuzzy search
- **fast-xml-parser** - XML parsing
- **Web Speech API** - Voice recognition & TTS
- **Gamepad API** - Controller detection

## Getting Started

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for detailed setup instructions.

Quick start:

```bash
cd c:\code\ai\mine\StarCitizen
npx create-next-app@latest sc-controller-viewer --typescript --tailwind --app
cd sc-controller-viewer
npm install fuse.js fast-xml-parser
```

## Requirements

- Xbox Elite Controller (Series 1 or 2) recommended
- reWASD application (paid, 7-day trial available)
- Star Citizen installed
- Node.js 18+
