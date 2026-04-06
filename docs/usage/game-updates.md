# Updating to a New Star Citizen Version

When SC releases a new version, run through these steps to update the app's data artefacts.

## What needs updating

| Artefact | Location | How |
|----------|----------|-----|
| `defaultProfile.xml` | `apps/viewer/public/configs/sc-{version}/` | Extract from `Data.p4k` (Step 1) |
| `global.ini` | `apps/viewer/public/configs/sc-{version}/` | Extract from `Data.p4k` (Step 1) |
| `defaultActions.ts` | `apps/viewer/src/lib/data/sc-{version}/` | Generated (Step 2) |
| `localization.ts` | `apps/viewer/src/lib/data/sc-{version}/` | Generated (Step 2) |
| Component imports | `DefaultActionBrowser.tsx`, `CardView.tsx` | Manual edit (Step 3) |
| User configs | `apps/viewer/public/configs/` | Copy from reWASD / SC export (Step 0) |

---

## Step 0 — Add your updated user configs

Copy your updated reWASD and SC layout files into `apps/viewer/public/configs/`:

- `GCO X.X HOSAS.rewasd` (or HOTAS, etc.)
- `layout_GCO-X-X-HOSAS.xml`

These are not extracted from the game — they come from reWASD and the SC keybindings export.

---

## Step 1 — Extract base game files from Data.p4k

The Python script opens `Data.p4k` and extracts the two files needed. First time setup:

```bash
cd scripts
python -m venv .venv
.venv\Scripts\Activate.ps1    # PowerShell; use activate.bat for cmd
pip install .
```

Then extract (adjust version number and path if SC is not in the default location):

```bash
cd scripts
.venv\Scripts\Activate.ps1

python extract-sc-data.py "C:\Program Files\Roberts Space Industries\StarCitizen\LIVE" --version 4.7
```

This outputs to `apps/viewer/public/configs/sc-4.7/` automatically.

> The first run scans the archive index (~1-2 min for a 80-100 GB p4k). Subsequent runs are faster.

**Output files:**
```
apps/viewer/public/configs/sc-{version}/
  defaultProfile.xml   ← all ~650+ action definitions with default keybindings
  global.ini           ← English localization strings for @ui_ label keys
```

**Common issues:**
- Wrong path? Make sure you point to the channel folder (`LIVE`, `PTU`, etc.), not the parent `StarCitizen` folder.
- `zstandard` build error? Run `pip install zstandard --only-binary=:all:` first, then `pip install .` again.
- CryXmlB format? The script handles this automatically.

---

## Step 2 — Generate TypeScript data files

```bash
cd apps/viewer
npx tsx scripts/generate-actions.ts --version 4.7
```

Reads `public/configs/sc-{version}/defaultProfile.xml` + `global.ini`, writes:
- `src/lib/data/sc-{version}/defaultActions.ts`
- `src/lib/data/sc-{version}/localization.ts`

The script prints action count (expect ~650+) and localization key count. These files are auto-generated — never edit them manually.

---

## Step 3 — Update hardcoded version imports

Two components import directly from the version-specific data path. Update both:

**`apps/viewer/src/components/DefaultActionBrowser.tsx`** (top of file):
```diff
- import { defaultActions, SC_VERSION } from '@/lib/data/sc-4.5/defaultActions';
- import { localization } from '@/lib/data/sc-4.5/localization';
+ import { defaultActions, SC_VERSION } from '@/lib/data/sc-4.7/defaultActions';
+ import { localization } from '@/lib/data/sc-4.7/localization';
```

**`apps/viewer/src/components/CardView.tsx`** (top of file):
```diff
- import { localization } from '@/lib/data/sc-4.5/localization';
+ import { localization } from '@/lib/data/sc-4.7/localization';
```

> **Tip:** Search for `sc-4.X` across the codebase to catch any other references:
> `grep -r "sc-4\." apps/viewer/src --include="*.ts" --include="*.tsx"`

---

## Step 4 — Build & verify

```bash
cd apps/viewer
npm run build
```

Smoke checks:
- Build passes with no TypeScript errors
- App header shows "Star Citizen {version} Default Bindings"
- Action count in the UI looks right (~650+)
- Spot-check a few bindings known to have changed in the new version

---

## Step 5 — Clean up old version (optional)

Once the new version is confirmed working:

```bash
# Remove old generated data (safe to delete — regeneratable)
rm -rf apps/viewer/src/lib/data/sc-4.5/
```

Keep `apps/viewer/public/configs/sc-4.5/` if you want to support version switching later (see `controller-3y0`). The raw XML/INI files are not bundled into the app build.

---

## Future: Version selector (controller-3y0)

When the SC version selector feature is implemented, this manual import-swap step will go away. Instead, all version data will be registered in a version registry and the user can switch at runtime.
