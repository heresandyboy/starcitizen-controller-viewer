# Data Pipeline & App Roadmap

## Status: Phase 1 foundation COMPLETE, UI/UX Design phase started (as of 2026-01-27)

### UI/UX Design Epic (controller-a1z) — NEW, DO FIRST
| Issue | Description | Depends On |
|-------|-------------|------------|
| **controller-1fx** (P1) | Design: UX Principles & Design System | Epic |
| **controller-fbv** (P1) | Design: Unified Filter Bar Component | 1fx |
| **controller-00e** (P1) | Design: Enhanced Table View | fbv |
| **controller-e8r** (P2) | Design: Card View | fbv |
| **controller-q0b** (P2) | Design: Controller Visual View | fbv |
| **controller-dwp** (P2) | Design: Comparison View | fbv, ke0 |
| **controller-cf0** (P1) | Implement: Design System (Tailwind + CSS) | 1fx |
| **controller-26h** (P1) | Implement: Unified Filter Bar | fbv, cf0 |
| **controller-hok** (P1) | Implement: Enhanced Table View | 00e, 26h |
| **controller-wdn** (P2) | Implement: Card View | e8r, 26h |
| **controller-0q2** (P2) | Implement: Controller Visual View | q0b, 26h |
| **controller-3xe** (P2) | Implement: Comparison View | dwp, 26h, ke0 |

**NOTE**: Phase 1 filter features (controller-ucr, cc2, 6kj, cms) are absorbed into the unified filter bar.
See Serena memories: `ux_design_strategy`, `binding_data_complexity` for full design context.

### Phase 1: Default Bindings Viewer (original, mostly absorbed into UI/UX epic)
| Issue | Description | Depends On |
|-------|-------------|------------|
| ✅ **controller-xod** (P1) | Foundation: Load & display all defaults on app start | ✅ Done |
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
