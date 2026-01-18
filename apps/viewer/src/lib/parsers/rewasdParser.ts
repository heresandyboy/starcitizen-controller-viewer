/**
 * Parser for reWASD .rewasd configuration files
 * Extracts controller button → keyboard key mappings
 */

import type {
  RewasdConfig,
  Shift,
  Mask,
  Mapping,
  MacroStep,
  ParsedRewasdMapping,
  ActivatorType,
  ActivatorMode,
} from '../types/rewasd';
import { rewasdButtonToName } from '../constants/gamepadButtons';
import { dikToKeyName } from '../constants/dikKeys';

// ============================================================================
// Lookup Table Builders
// ============================================================================

interface RewasdLookups {
  masks: Map<number, MaskInfo>;
  shifts: Map<number, ShiftInfo>;
}

interface MaskInfo {
  id: number;
  buttonId: number;
  buttonName: string;
  description: string;
}

interface ShiftInfo {
  id: number;
  description: string;
  type: string;
}

/**
 * Build lookup tables from reWASD config for efficient access
 */
function buildLookups(config: RewasdConfig): RewasdLookups {
  const masks = new Map<number, MaskInfo>();
  const shifts = new Map<number, ShiftInfo>();

  // Build mask lookup (mask ID → button info)
  for (const mask of config.masks ?? []) {
    const firstButton = mask.set?.[0];
    if (firstButton) {
      masks.set(mask.id, {
        id: mask.id,
        buttonId: firstButton.buttonId,
        buttonName: rewasdButtonToName(firstButton.buttonId),
        description: firstButton.description,
      });
    }
  }

  // Build shift lookup (shift ID → shift info)
  for (const shift of config.shifts ?? []) {
    shifts.set(shift.id, {
      id: shift.id,
      description: shift.description,
      type: shift.type,
    });
  }

  return { masks, shifts };
}

// ============================================================================
// Macro Extraction
// ============================================================================

/**
 * Extract keyboard keys from macro steps
 * Returns unique keys that are pressed (ignoring pauses and other actions)
 */
function extractKeyboardKeys(macros: MacroStep[] | undefined): string[] {
  if (!macros) return [];

  const keys: string[] = [];
  const seenKeys = new Set<string>();

  for (const step of macros) {
    if (step.keyboard) {
      const keyName = dikToKeyName(step.keyboard.description);
      // Only add unique keys (macros often have down/up pairs)
      if (!seenKeys.has(keyName)) {
        seenKeys.add(keyName);
        keys.push(keyName);
      }
    }
  }

  return keys;
}

/**
 * Check if a mapping is a shift/layer jump (modifier activation)
 */
function isShiftJump(mapping: Mapping): boolean {
  return mapping.jumpToLayer !== undefined;
}

// ============================================================================
// Main Parser
// ============================================================================

export interface ParseRewasdResult {
  mappings: ParsedRewasdMapping[];
  shifts: ShiftInfo[];
  errors: string[];
}

/**
 * Parse a reWASD config and extract all button → key mappings
 */
export function parseRewasdConfig(config: RewasdConfig): ParseRewasdResult {
  const lookups = buildLookups(config);
  const mappings: ParsedRewasdMapping[] = [];
  const errors: string[] = [];

  for (const mapping of config.mappings ?? []) {
    try {
      // Skip shift/layer jumps - they don't produce keyboard output
      if (isShiftJump(mapping)) {
        continue;
      }

      const maskId = mapping.condition?.mask?.id;
      if (maskId === undefined) {
        continue;
      }

      const maskInfo = lookups.masks.get(maskId);
      if (!maskInfo) {
        errors.push(`Unknown mask ID: ${maskId}`);
        continue;
      }

      const activator = mapping.condition.mask.activator;
      const outputKeys = extractKeyboardKeys(mapping.macros);

      // Skip mappings with no keyboard output
      if (outputKeys.length === 0) {
        continue;
      }

      // Get shift info if present
      const shiftId = mapping.condition.shiftId;
      const shiftInfo = shiftId !== undefined ? lookups.shifts.get(shiftId) : undefined;

      const parsed: ParsedRewasdMapping = {
        maskId,
        buttonName: maskInfo.buttonName,
        shiftId,
        shiftName: shiftInfo?.description,
        activatorType: activator?.type ?? 'single',
        activatorMode: activator?.mode ?? 'onetime',
        outputKeys,
        description: mapping.description,
      };

      mappings.push(parsed);
    } catch (e) {
      errors.push(`Error parsing mapping: ${e}`);
    }
  }

  return {
    mappings,
    shifts: Array.from(lookups.shifts.values()),
    errors,
  };
}

/**
 * Parse reWASD JSON string
 */
export function parseRewasdJson(jsonString: string): ParseRewasdResult {
  try {
    const config = JSON.parse(jsonString) as RewasdConfig;
    return parseRewasdConfig(config);
  } catch (e) {
    return {
      mappings: [],
      shifts: [],
      errors: [`Failed to parse JSON: ${e}`],
    };
  }
}

/**
 * Build a lookup map from keyboard key → button mappings
 * Useful for joining with SC XML bindings
 */
export function buildKeyToButtonMap(
  mappings: ParsedRewasdMapping[]
): Map<string, ParsedRewasdMapping[]> {
  const map = new Map<string, ParsedRewasdMapping[]>();

  for (const mapping of mappings) {
    for (const key of mapping.outputKeys) {
      const normalizedKey = key.toLowerCase();
      const existing = map.get(normalizedKey) ?? [];
      existing.push(mapping);
      map.set(normalizedKey, existing);
    }
  }

  return map;
}

/**
 * Get a human-readable description of a mapping
 */
export function formatMappingDescription(mapping: ParsedRewasdMapping): string {
  const parts: string[] = [];

  // Button with modifier
  if (mapping.shiftName) {
    parts.push(`${mapping.shiftName} + ${mapping.buttonName}`);
  } else {
    parts.push(mapping.buttonName);
  }

  // Activation type (if not standard single press)
  if (mapping.activatorType !== 'single') {
    parts.push(`(${mapping.activatorType})`);
  }

  // Output keys
  parts.push('→');
  parts.push(mapping.outputKeys.join(' + '));

  return parts.join(' ');
}
