# Plan: Update to Star Citizen 4.7 Data Artefacts

## Overview

Upgrade all game data artefacts from SC 4.5 → 4.7. This involves re-running the
extraction pipeline to generate fresh `defaultProfile.xml` / `global.ini` from the
4.7 `Data.p4k`, regenerating the TypeScript data files, and wiring the new version
into the app.

The user has already placed the 4.7 user configs in `apps/viewer/public/configs/`:
- `GCO 4.7 HOTAS.rewasd`
- `layout_GCO-4-7-HOTAS.xml`

---

## Prerequisites

- Star Citizen 4.7 installed (LIVE channel)
- Python venv set up in `scripts/` (see `scripts/README.md`)
  - If not already done: `cd scripts && python -m venv .venv && pip install .`

---

## Step 1 — Extract base game files from Data.p4k

Run the Python extractor, pointing at the SC 4.7 LIVE installation.

```bash
cd scripts

# Activate venv (Windows PowerShell)
.venv\Scripts\Activate.ps1
# or cmd:
.venv\Scripts\activate.bat

# Extract — adjust SC install path if different
python extract-sc-data.py "C:\Program Files\Roberts Space Industries\StarCitizen\LIVE" --version 4.7
```

**What this does:**
- Opens `Data.p4k` (80-100 GB, index scan takes ~1-2 min on first run)
- Extracts `Data/Libs/Config/defaultProfile.xml` → `apps/viewer/public/configs/sc-4.7/defaultProfile.xml`
- Extracts `Data/Localization/english/global.ini` → `apps/viewer/public/configs/sc-4.7/global.ini`
- Auto-converts CryXmlB binary format to plain XML if needed

**Verify output:**
```
apps/viewer/public/configs/sc-4.7/
  defaultProfile.xml   ← ~2-5 MB XML with all action definitions
  global.ini           ← ~5-10 MB INI with localization strings
```

> **Troubleshooting**: See `scripts/README.md` — common issues are wrong SC path,
> venv not activated, or `zstandard` build failure (use `pip install zstandard --only-binary=:all:` first).

---

## Step 2 — Generate TypeScript data files

```bash
cd apps/viewer
npx tsx scripts/generate-actions.ts --version 4.7
```

**What this does:**
- Reads `public/configs/sc-4.7/defaultProfile.xml` → parses all SC actions
- Reads `public/configs/sc-4.7/global.ini` → builds localization map
- Writes `src/lib/data/sc-4.7/defaultActions.ts` (auto-generated, do not edit)
- Writes `src/lib/data/sc-4.7/localization.ts` (auto-generated, do not edit)

**Verify:** The script prints action count (should be similar to 4.5: ~650+ actions) and localization key count.

---

## Step 3 — Update app imports (2 files)

### `apps/viewer/src/components/DefaultActionBrowser.tsx` (lines 6-7)

```diff
- import { defaultActions, SC_VERSION } from '@/lib/data/sc-4.5/defaultActions';
- import { localization } from '@/lib/data/sc-4.5/localization';
+ import { defaultActions, SC_VERSION } from '@/lib/data/sc-4.7/defaultActions';
+ import { localization } from '@/lib/data/sc-4.7/localization';
```

### `apps/viewer/src/components/CardView.tsx` (line 6)

```diff
- import { localization } from '@/lib/data/sc-4.5/localization';
+ import { localization } from '@/lib/data/sc-4.7/localization';
```

---

## Step 4 — Build & smoke test

```bash
cd apps/viewer
npm run build
```

Check:
- Build passes with no TypeScript errors
- Action count in the UI reflects 4.7 data
- Version label in the header shows "Star Citizen 4.7 Default Bindings"
- Spot-check a few known bindings changed in 4.7

---

## Step 5 — (Optional) Keep 4.5 or remove it

- The `src/lib/data/sc-4.5/` generated files can be deleted once 4.7 is confirmed working
- The `public/configs/sc-4.5/` raw files can stay (they are not bundled, just source inputs)
- If the version selector feature (controller-3y0) is implemented in future, 4.5 data may be worth keeping for comparison

---

## Files Changed Summary

| File | Action |
|------|--------|
| `apps/viewer/public/configs/sc-4.7/defaultProfile.xml` | Created by Step 1 |
| `apps/viewer/public/configs/sc-4.7/global.ini` | Created by Step 1 |
| `apps/viewer/src/lib/data/sc-4.7/defaultActions.ts` | Created by Step 2 |
| `apps/viewer/src/lib/data/sc-4.7/localization.ts` | Created by Step 2 |
| `apps/viewer/src/components/DefaultActionBrowser.tsx` | Updated import paths |
| `apps/viewer/src/components/CardView.tsx` | Updated import path |

---

## Notes

- The extraction script uses a minimal P4K reader (no scdatatools dep) — it handles
  both plain ZIP and CryXmlB binary XML automatically.
- `defaultActions.ts` and `localization.ts` are auto-generated — never edit them manually.
- The `--version` flag is just a label; make sure it matches what you pass to the extractor.
