/**
 * Parser for Star Citizen defaultProfile.xml
 *
 * Extracts all action definitions with their default bindings and metadata.
 * Produces an SCDefaultAction[] matching StarBinder's MappedActions.js format.
 *
 * Key difference from xmlParser.ts: this parses the GAME DEFAULTS (attributes
 * on <action> elements), not user overrides (<rebind> child elements).
 */

import type { SCDefaultAction, SCActivationMode } from '../types/defaultProfile';

/** Action maps excluded from output (matches StarBinder's excludedCategories) */
const EXCLUDED_MAPS = new Set(['debug']);

/**
 * Returns the bind value for a device attribute.
 * - Missing attribute → null (not bindable)
 * - Space " " or empty "" → null (bindable but unbound)
 * - Any other value → the bind string
 */
function cleanBindValue(value: string | null): string | null {
  if (value === null) return null;
  if (value.trim() === '') return null;
  return value;
}

/**
 * Parse defaultProfile.xml content into an array of SCDefaultAction objects.
 *
 * Uses browser DOMParser. Each <actionmap> contains <action> elements whose
 * attributes define the default bindings and metadata.
 *
 * Filtering rules (matching StarBinder's loadAndParseDataminedXML):
 * - Skip duplicate actionNames (first occurrence wins)
 * - Skip actionmaps in the excluded list (e.g. "debug")
 * - Skip actions with names starting with "flashui"
 * - Skip actions that have no UILabel, UIDescription, or Category
 */
export function parseDefaultProfile(xmlString: string): SCDefaultAction[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error(`XML parse error: ${parseError.textContent}`);
  }

  const actions: SCDefaultAction[] = [];
  const seenNames = new Set<string>();
  const actionMaps = doc.querySelectorAll('actionmap');

  for (const map of actionMaps) {
    const mapName = map.getAttribute('name') ?? '';
    if (EXCLUDED_MAPS.has(mapName)) continue;

    const version = map.getAttribute('version') || null;
    const uiCategory = map.getAttribute('UICategory') || null;

    const actionElements = map.querySelectorAll('action');

    for (const action of actionElements) {
      const actionName = action.getAttribute('name');
      if (!actionName) continue;
      if (seenNames.has(actionName)) continue;
      if (actionName.startsWith('flashui')) continue;

      const label = action.getAttribute('UILabel') || null;
      const description = action.getAttribute('UIDescription') || null;
      const category = action.getAttribute('Category') || null;

      // Skip actions with no metadata (no label, description, or category)
      if (!label && !description && !category) continue;

      seenNames.add(actionName);

      const keyboardRaw = action.getAttribute('keyboard');
      const mouseRaw = action.getAttribute('mouse');
      const gamepadRaw = action.getAttribute('gamepad');
      const joystickRaw = action.getAttribute('joystick');

      const activationModeRaw = action.getAttribute('activationMode');

      actions.push({
        actionName,
        mapName,
        keyboardBind: cleanBindValue(keyboardRaw),
        mouseBind: cleanBindValue(mouseRaw),
        gamepadBind: cleanBindValue(gamepadRaw),
        joystickBind: cleanBindValue(joystickRaw),
        keyboardBindable: !!action.getAttribute('keyboard'),
        mouseBindable: !!action.getAttribute('mouse'),
        gamepadBindable: !!action.getAttribute('gamepad'),
        joystickBindable: !!action.getAttribute('joystick'),
        activationMode: (activationModeRaw as SCActivationMode) ?? null,
        category: category ?? null,
        UICategory: uiCategory,
        label: label?.trim() ?? '',
        description: description?.trim() || null,
        version,
        optionGroup: action.getAttribute('optionGroup') ?? null,
      });
    }
  }

  return actions;
}

/**
 * Fetch and parse a defaultProfile.xml file from a URL (e.g. public/configs/).
 */
export async function fetchAndParseDefaultProfile(url: string): Promise<SCDefaultAction[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch defaultProfile.xml: ${response.status} ${response.statusText}`);
  }
  const xmlString = await response.text();
  return parseDefaultProfile(xmlString);
}

/**
 * Look up actions by map name.
 */
export function filterActionsByMap(actions: SCDefaultAction[], mapName: string): SCDefaultAction[] {
  return actions.filter((a) => a.mapName === mapName);
}

/**
 * Get unique action map names from parsed actions.
 */
export function getDefaultActionMapNames(actions: SCDefaultAction[]): string[] {
  return [...new Set(actions.map((a) => a.mapName))];
}

/**
 * Build a lookup from actionName → SCDefaultAction.
 */
export function buildActionLookup(actions: SCDefaultAction[]): Map<string, SCDefaultAction> {
  const lookup = new Map<string, SCDefaultAction>();
  for (const action of actions) {
    lookup.set(action.actionName, action);
  }
  return lookup;
}
