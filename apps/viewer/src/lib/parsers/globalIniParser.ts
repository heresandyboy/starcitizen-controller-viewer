/**
 * Parser for Star Citizen global.ini localization file
 *
 * Extracts UI control localization keys (ui_C* prefix) that map @ui_ references
 * in defaultProfile.xml to human-readable text.
 *
 * Format: key=value pairs, one per line. Example:
 *   ui_CIEmergencyExit=Emergency Exit Seat
 *   ui_CGSeatGeneral=Vehicles - Seats and Operator Modes
 *
 * Quirks:
 *   - XML uses @ui_CIEmergencyExit, ini key is ui_CIEmergencyExit (no @ prefix)
 *   - Some keys have ,P= suffix: ui_CGSpaceFlightSalvage,P=Vehicles - Salvage
 *   - File is ~85k lines; only ~1125 keys start with ui_C
 */

import type { SCLocalizationMap } from '../types/defaultProfile';

/** Prefix for UI control localization keys */
const UI_CONTROL_PREFIX = 'ui_C';

/**
 * Parse global.ini content into a localization map.
 * Only includes keys starting with ui_C (control-related UI strings).
 */
export function parseGlobalIni(iniContent: string): SCLocalizationMap {
  const map: SCLocalizationMap = new Map();
  const lines = iniContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith(';') || trimmed.startsWith('#')) {
      continue;
    }

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.substring(0, eqIndex);
    if (!key.startsWith(UI_CONTROL_PREFIX)) continue;

    const value = trimmed.substring(eqIndex + 1);

    // Handle ,P= suffix keys: store both the base key and the suffixed key
    const commaIndex = key.indexOf(',');
    if (commaIndex !== -1) {
      const baseKey = key.substring(0, commaIndex);
      map.set(baseKey, value);
    }
    map.set(key, value);
  }

  return map;
}

/**
 * Resolve a @ui_ reference to its localized text.
 * Strips the @ prefix and looks up in the localization map.
 * Returns the original key if not found.
 */
export function resolveLocalizationKey(key: string, locMap: SCLocalizationMap): string {
  if (!key) return '';
  const lookupKey = key.startsWith('@') ? key.substring(1) : key;
  return locMap.get(lookupKey) ?? key;
}

/**
 * Fetch and parse a global.ini file from a URL.
 */
export async function fetchAndParseGlobalIni(url: string): Promise<SCLocalizationMap> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch global.ini: ${response.status} ${response.statusText}`);
  }
  const text = await response.text();
  return parseGlobalIni(text);
}
