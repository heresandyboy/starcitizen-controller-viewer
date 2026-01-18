/**
 * Parser for Star Citizen ActionMaps XML configuration files
 * Extracts keyboard/gamepad → game action bindings
 */

import type {
  ActionMaps,
  ActionMap,
  Action,
  Rebind,
  ParsedXmlBinding,
  InputDeviceType,
  ParsedInput,
  ActivationMode,
} from '../types/starcitizen';
import { SC_GAMEPAD_BUTTONS } from '../types/starcitizen';

// ============================================================================
// Input String Parsing
// ============================================================================

/**
 * Parse an input string like "kb1_f7" or "gp1_shoulderl+x"
 */
export function parseInputString(input: string): ParsedInput | null {
  // Match: device prefix (kb/gp/mouse/js) + instance number + underscore + rest
  const match = input.match(/^(kb|gp|mouse|js)(\d+)_(.+)$/);
  if (!match) return null;

  const [, devicePrefix, instanceStr, keyPart] = match;
  const deviceInstance = parseInt(instanceStr, 10);

  // Map prefix to device type
  const deviceTypeMap: Record<string, InputDeviceType> = {
    kb: 'keyboard',
    gp: 'gamepad',
    mouse: 'mouse',
    js: 'joystick',
  };

  const deviceType = deviceTypeMap[devicePrefix];
  if (!deviceType) return null;

  // Check for modifier (e.g., "shoulderl+x" or "lalt+1")
  const plusIndex = keyPart.indexOf('+');
  if (plusIndex > 0) {
    const modifier = keyPart.substring(0, plusIndex);
    const key = keyPart.substring(plusIndex + 1);
    return {
      deviceType,
      deviceInstance,
      key,
      modifiers: [modifier],
    };
  }

  return {
    deviceType,
    deviceInstance,
    key: keyPart,
    modifiers: [],
  };
}

/**
 * Normalize a keyboard key name to match DIK names
 * e.g., "f7" → "F7", "lalt" → "LAlt"
 */
export function normalizeKeyboardKey(key: string): string {
  const keyLower = key.toLowerCase();

  // Function keys
  if (/^f\d+$/.test(keyLower)) {
    return key.toUpperCase();
  }

  // Number keys
  if (/^\d$/.test(key)) {
    return key;
  }

  // Numpad keys
  if (keyLower.startsWith('np_')) {
    const num = keyLower.substring(3);
    return `Num${num}`;
  }

  // Special key mappings
  const specialKeys: Record<string, string> = {
    lalt: 'LAlt',
    ralt: 'RAlt',
    lctrl: 'LCtrl',
    rctrl: 'RCtrl',
    lshift: 'LShift',
    rshift: 'RShift',
    space: 'Space',
    return: 'Enter',
    escape: 'Esc',
    back: 'Backspace',
    tab: 'Tab',
    capital: 'CapsLock',
    insert: 'Insert',
    delete: 'Delete',
    home: 'Home',
    end: 'End',
    prior: 'PgUp',
    pgup: 'PgUp',
    next: 'PgDn',
    pgdn: 'PgDn',
    up: 'Up',
    down: 'Down',
    left: 'Left',
    right: 'Right',
    minus: '-',
    equals: '=',
    lbracket: '[',
    rbracket: ']',
    semicolon: ';',
    apostrophe: "'",
    grave: '`',
    backslash: '\\',
    comma: ',',
    period: '.',
    slash: '/',
    // Letters
    ...Object.fromEntries(
      'abcdefghijklmnopqrstuvwxyz'.split('').map((c) => [c, c.toUpperCase()])
    ),
  };

  return specialKeys[keyLower] ?? key;
}

/**
 * Normalize a gamepad button name to standard format
 * e.g., "shoulderl" → "LB", "triggerl_btn" → "LT"
 */
export function normalizeGamepadButton(button: string): string {
  return SC_GAMEPAD_BUTTONS[button.toLowerCase()] ?? button;
}

// ============================================================================
// XML Parsing (Browser DOMParser)
// ============================================================================

/**
 * Parse Star Citizen XML string and extract all bindings
 */
export function parseStarCitizenXml(xmlString: string): ParseXmlResult {
  const bindings: ParsedXmlBinding[] = [];
  const errors: string[] = [];

  try {
    // Use browser's DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, 'text/xml');

    // Check for parse errors
    const parseError = doc.querySelector('parsererror');
    if (parseError) {
      return {
        bindings: [],
        profileName: '',
        errors: [`XML parse error: ${parseError.textContent}`],
      };
    }

    // Get profile name
    const actionMaps = doc.querySelector('ActionMaps');
    const profileName = actionMaps?.getAttribute('profileName') ?? '';

    // Iterate through all actionmaps
    const actionMapElements = doc.querySelectorAll('actionmap');
    for (const actionMapEl of actionMapElements) {
      const actionMapName = actionMapEl.getAttribute('name') ?? '';

      // Iterate through all actions in this actionmap
      const actionElements = actionMapEl.querySelectorAll('action');
      for (const actionEl of actionElements) {
        const actionName = actionEl.getAttribute('name') ?? '';

        // Iterate through all rebinds for this action
        const rebindElements = actionEl.querySelectorAll('rebind');
        for (const rebindEl of rebindElements) {
          const input = rebindEl.getAttribute('input');
          if (!input) continue;

          const parsed = parseInputString(input);
          if (!parsed) {
            errors.push(`Could not parse input: ${input}`);
            continue;
          }

          // Get activation mode and multiTap
          const activationMode = rebindEl.getAttribute('activationMode') as ActivationMode | null;
          const multiTapStr = rebindEl.getAttribute('multiTap');
          const multiTap = multiTapStr ? parseInt(multiTapStr, 10) : undefined;

          // Normalize key names based on device type
          let normalizedKey: string;
          let normalizedModifiers: string[];

          if (parsed.deviceType === 'keyboard') {
            normalizedKey = normalizeKeyboardKey(parsed.key);
            normalizedModifiers = parsed.modifiers.map(normalizeKeyboardKey);
          } else if (parsed.deviceType === 'gamepad') {
            normalizedKey = normalizeGamepadButton(parsed.key);
            normalizedModifiers = parsed.modifiers.map(normalizeGamepadButton);
          } else {
            normalizedKey = parsed.key;
            normalizedModifiers = parsed.modifiers;
          }

          const binding: ParsedXmlBinding = {
            actionMap: actionMapName,
            actionName,
            inputType: parsed.deviceType,
            inputKey: normalizedKey,
            modifiers: normalizedModifiers,
            activationMode: activationMode ?? undefined,
            multiTap,
          };

          bindings.push(binding);
        }
      }
    }

    return { bindings, profileName, errors };
  } catch (e) {
    return {
      bindings: [],
      profileName: '',
      errors: [`Failed to parse XML: ${e}`],
    };
  }
}

// ============================================================================
// Result Types
// ============================================================================

export interface ParseXmlResult {
  bindings: ParsedXmlBinding[];
  profileName: string;
  errors: string[];
}

// ============================================================================
// Lookup Builders
// ============================================================================

/**
 * Build a lookup map from keyboard key → action bindings
 * Used for joining with reWASD mappings
 */
export function buildKeyToActionMap(
  bindings: ParsedXmlBinding[]
): Map<string, ParsedXmlBinding[]> {
  const map = new Map<string, ParsedXmlBinding[]>();

  for (const binding of bindings) {
    if (binding.inputType !== 'keyboard') continue;

    // Build the full key including modifiers
    const fullKey = binding.modifiers.length > 0
      ? `${binding.modifiers.join('+')}+${binding.inputKey}`
      : binding.inputKey;

    const normalizedKey = fullKey.toLowerCase();
    const existing = map.get(normalizedKey) ?? [];
    existing.push(binding);
    map.set(normalizedKey, existing);
  }

  return map;
}

/**
 * Build a lookup map from gamepad input → action bindings
 * Used for direct gamepad bindings (not via reWASD)
 */
export function buildGamepadToActionMap(
  bindings: ParsedXmlBinding[]
): Map<string, ParsedXmlBinding[]> {
  const map = new Map<string, ParsedXmlBinding[]>();

  for (const binding of bindings) {
    if (binding.inputType !== 'gamepad') continue;

    // Build the full input including modifiers
    const fullInput = binding.modifiers.length > 0
      ? `${binding.modifiers.join('+')}+${binding.inputKey}`
      : binding.inputKey;

    const normalizedInput = fullInput.toLowerCase();
    const existing = map.get(normalizedInput) ?? [];
    existing.push(binding);
    map.set(normalizedInput, existing);
  }

  return map;
}

/**
 * Get all unique action map names from bindings
 */
export function getActionMapNames(bindings: ParsedXmlBinding[]): string[] {
  const names = new Set<string>();
  for (const binding of bindings) {
    names.add(binding.actionMap);
  }
  return Array.from(names).sort();
}

/**
 * Filter bindings by input type
 */
export function filterByInputType(
  bindings: ParsedXmlBinding[],
  inputType: InputDeviceType
): ParsedXmlBinding[] {
  return bindings.filter((b) => b.inputType === inputType);
}
