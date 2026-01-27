# Star Citizen Data Extraction Scripts

Tools for extracting game data from Star Citizen's `Data.p4k` archive.

## What Gets Extracted

| File | Source Path in Data.p4k | Purpose |
|------|------------------------|---------|
| `defaultProfile.xml` | `Data/Libs/Config/defaultProfile.xml` | All ~653 action definitions with default keybindings |
| `global.ini` | `Data/Localization/english/global.ini` | English localization strings for `@ui_` label keys |

Files are output to `apps/viewer/public/configs/sc-{version}/`.

## Method 1: Python Script (Recommended)

### Setup

```bash
cd scripts

# Create isolated virtual environment
python -m venv .venv

# Activate it
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Windows (cmd):
.venv\Scripts\activate.bat
# Linux/macOS:
source .venv/bin/activate

# Install dependencies into the venv
pip install .
```

### Usage

```bash
# Make sure your venv is activated first, then:
python extract-sc-data.py "C:\Program Files\Roberts Space Industries\StarCitizen\LIVE" --version 4.0.2

# Custom output directory
python extract-sc-data.py "D:\Games\StarCitizen\LIVE" -v 4.0.2 -o ./my-output/

# Use scdt CLI backend instead of Python API
python extract-sc-data.py "D:\Games\StarCitizen\LIVE" -v 4.0.2 --method cli
```

### Common SC Install Paths

| OS | Typical Path |
|----|-------------|
| Windows (default) | `C:\Program Files\Roberts Space Industries\StarCitizen\LIVE` |
| Windows (custom) | `D:\Games\StarCitizen\LIVE` |
| Linux (Wine/Lutris) | `~/.wine/drive_c/Program Files/Roberts Space Industries/StarCitizen/LIVE` |

Replace `LIVE` with `PTU` or `EPTU` for test universe builds.

## Method 2: scdt CLI (Alternative)

After setting up the venv (see above), the `scdt` CLI is also available:

```bash
# Extract specific files
scdt unp4k "C:\...\Data.p4k" "Data/Libs/Config/defaultProfile.xml" --output ./output/
scdt unp4k "C:\...\Data.p4k" "Data/Localization/english/global.ini" --output ./output/

# Convert CryXmlB to readable XML (if extraction produces binary XML)
scdt cryxml-to-xml ./output/Data/Libs/Config/defaultProfile.xml

# Dump action map directly as JSON (useful for quick inspection)
scdt actionmap "C:\...\StarCitizen\LIVE"
```

## Method 3: Manual Extraction with unp4k (Windows)

If you prefer not to use Python, you can use the C# tool [unp4k](https://github.com/dolkensp/unp4k):

1. Download `unp4k` from [GitHub releases](https://github.com/dolkensp/unp4k/releases)
2. Extract the archive to a folder

```powershell
# Extract defaultProfile.xml
.\unp4k.exe "C:\Program Files\Roberts Space Industries\StarCitizen\LIVE\Data.p4k" "Data\Libs\Config\defaultProfile.xml"

# Extract global.ini
.\unp4k.exe "C:\Program Files\Roberts Space Industries\StarCitizen\LIVE\Data.p4k" "Data\Localization\english\global.ini"

# If the XML is in CryXmlB binary format, convert it:
.\unforge.exe "Data\Libs\Config\defaultProfile.xml"
```

3. Copy the extracted files to `apps/viewer/public/configs/sc-{version}/`

## Method 4: HAL Extractor (Windows Store)

For a GUI approach:

1. Install [HAL Extractor](https://www.microsoft.com/store/apps/9PHFC6NKBGML) from the Microsoft Store
2. Open `Data.p4k` in HAL Extractor
3. Navigate to `Data/Libs/Config/` and extract `defaultProfile.xml`
4. Navigate to `Data/Localization/english/` and extract `global.ini`
5. Copy extracted files to `apps/viewer/public/configs/sc-{version}/`

## CryXmlB Binary Format

Files inside `Data.p4k` may be stored in CryEngine's binary XML format (CryXmlB). You can identify these files by their magic bytes: they start with `CryXmlB`.

The Python script handles this automatically. For manual extraction:
- Use `unforge.exe` (included with unp4k) to convert to plain XML
- Or use `scdt cryxml-to-xml <file>` from scdatatools

## Output Structure

After extraction, your configs directory should look like:

```
apps/viewer/public/configs/
  sc-4.0.2/
    actionmaps.xml        # User's custom bindings (existing)
    defaultProfile.xml    # SC default action definitions (extracted)
    global.ini            # English localization strings (extracted)
```

## Troubleshooting

**"Data.p4k not found"** - Make sure you're pointing to the correct channel directory (LIVE/PTU/EPTU), not the parent StarCitizen directory.

**"Missing dependency"** - Make sure your venv is activated and you ran `pip install .` from the `scripts/` directory.

**"Cannot convert CryXmlB"** - The scdatatools CryXml module may need additional native deps. Try `scdt cryxml-to-xml` manually as a fallback.

**Extraction is slow** - Data.p4k is 80-100GB. Initial index scanning can take a while. Subsequent operations are faster.

**zstandard build error** - On Windows, if `zstandard` fails to compile, try `pip install zstandard --only-binary=:all:` first, then `pip install .`.
