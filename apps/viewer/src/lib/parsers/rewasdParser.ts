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
import type {
  ShiftLayer,
  MacroStepResolved,
  MacroSequence,
} from '../types/binding';
import { rewasdButtonToName } from '../constants/gamepadButtons';
import { dikToKeyName, dikCodeToKeyName } from '../constants/dikKeys';
import { REWASD_GP_OUTPUT_NAMES } from '../constants/keyMappings';

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

// ============================================================================
// V2 Parser — Full Macro Sequences
// ============================================================================

/**
 * V2 parsed output: preserves full macro sequences, gamepad outputs, and
 * activator timing parameters.
 */
export interface ParsedRewasdMappingV2 {
  maskId: number;
  buttonName: string;
  shiftId?: number;
  activator: {
    type: ActivatorType;
    mode: ActivatorMode;
    params?: {
      delayMs?: number;
      longPressMs?: number;
      doubleTapWindowMs?: number;
    };
  };
  macro: MacroSequence;
  jumpToLayer?: number;
  description?: string;
}

export interface ParseRewasdResultV2 {
  mappings: ParsedRewasdMappingV2[];
  layers: ShiftLayer[];
  layerTriggers: Map<number, string>;
  errors: string[];
}

/**
 * Convert a single reWASD MacroStep into a resolved MacroStepResolved.
 */
function resolveMacroStep(step: MacroStep): MacroStepResolved {
  if (step.keyboard) {
    return {
      type: 'keyboard',
      key: dikCodeToKeyName(step.keyboard.buttonId),
      action: step.keyboard.action,
      dikCode: step.keyboard.description,
    };
  }
  if (step.gamepad) {
    return {
      type: 'gamepad',
      gamepadButton: REWASD_GP_OUTPUT_NAMES[step.gamepad.buttonId] ?? `GP${step.gamepad.buttonId}`,
      action: step.gamepad.action,
    };
  }
  if (step.mouse) {
    return {
      type: 'mouse',
      action: step.mouse.action,
    };
  }
  if (step.pause) {
    return {
      type: 'pause',
      durationMs: step.pause.value,
    };
  }
  if (step.rumble) {
    return { type: 'rumble' };
  }
  // Fallback for unknown step types
  return { type: 'pause', durationMs: 0 };
}

/**
 * Build a MacroSequence from an array of raw macro steps.
 */
function buildMacroSequence(steps: MacroStep[] | undefined): MacroSequence {
  if (!steps || steps.length === 0) {
    return {
      steps: [],
      totalDurationMs: 0,
      isSimple: false,
      keyboardKeysOutput: [],
      gamepadButtonsOutput: [],
    };
  }

  const resolved = steps.map(resolveMacroStep);

  // Compute metadata
  let totalDurationMs = 0;
  const kbKeys = new Set<string>();
  const gpButtons = new Set<string>();

  for (const step of resolved) {
    if (step.type === 'pause' && step.durationMs) {
      totalDurationMs += step.durationMs;
    }
    // Count "down" or unspecified action as an output (some steps omit action)
    if (step.type === 'keyboard' && step.action !== 'up' && step.key) {
      kbKeys.add(step.key);
    }
    if (step.type === 'gamepad' && step.action !== 'up' && step.gamepadButton) {
      gpButtons.add(step.gamepadButton);
    }
  }

  // isSimple: exactly one key/button pressed once, no pauses, no mixed types.
  // Handles both explicit down/up pairs and steps without action field.
  const pauseSteps = resolved.filter(s => s.type === 'pause');
  const nonPassiveSteps = resolved.filter(s => s.type !== 'pause' && s.type !== 'rumble');
  const outputTypes = new Set(nonPassiveSteps.map(s => s.type));
  const isSimple = pauseSteps.length === 0 &&
    outputTypes.size === 1 &&
    (kbKeys.size + gpButtons.size) === 1 &&
    nonPassiveSteps.length <= 2;

  return {
    steps: resolved,
    totalDurationMs,
    isSimple,
    keyboardKeysOutput: Array.from(kbKeys),
    gamepadButtonsOutput: Array.from(gpButtons),
  };
}

/**
 * Extract ShiftLayer[] from the reWASD config.
 *
 * Determines parent-child relationships by inspecting jumpToLayer mappings:
 * if shift X has a jumpToLayer from within shift Y, then X is a sub-layer of Y.
 */
function extractLayers(config: RewasdConfig): { layers: ShiftLayer[]; layerTriggers: Map<number, string> } {
  const lookups = buildLookups(config);
  const layerTriggers = new Map<number, string>();

  // Find which button triggers each layer by looking at jumpToLayer mappings
  // from the Main layer (shiftId === undefined)
  for (const mapping of config.mappings ?? []) {
    if (mapping.jumpToLayer && mapping.condition.shiftId === undefined) {
      const maskInfo = lookups.masks.get(mapping.condition.mask.id);
      if (maskInfo) {
        layerTriggers.set(mapping.jumpToLayer.layer, maskInfo.buttonName);
      }
    }
  }

  // Determine parent layers: if a shift has jumpToLayer entries from within
  // another shift, it's a sub-layer. Look for jumpToLayer mappings where
  // shiftId is set (meaning we're already in a layer).
  const parentMap = new Map<number, number>();
  for (const mapping of config.mappings ?? []) {
    if (mapping.jumpToLayer && mapping.condition.shiftId !== undefined) {
      const targetLayer = mapping.jumpToLayer.layer;
      // If the target layer isn't 0 (Main) and isn't the same as source,
      // and we haven't seen a parent yet, record it
      if (targetLayer !== 0 && targetLayer !== mapping.condition.shiftId && !parentMap.has(targetLayer)) {
        parentMap.set(targetLayer, mapping.condition.shiftId);
      }
    }
  }

  // Build the Main layer (id=0)
  const layers: ShiftLayer[] = [{
    id: 0,
    name: 'Main',
    isDefault: true,
  }];

  // Build layers for each shift
  for (const shift of config.shifts ?? []) {
    const trigger = layerTriggers.get(shift.id);
    const parentId = parentMap.get(shift.id);

    layers.push({
      id: shift.id,
      name: shift.description,
      triggerButton: trigger,
      triggerType: shift.type === 'radialMenu' ? 'radialMenu' : 'hold',
      parentLayerId: parentId,
      isDefault: false,
      unheritableMasks: shift.unheritableMasks?.length ? shift.unheritableMasks : undefined,
    });
  }

  return { layers, layerTriggers };
}

/**
 * Parse a reWASD config with full v2 output — preserves macro sequences,
 * gamepad outputs, activator params, and layer hierarchy.
 */
export function parseRewasdConfigV2(config: RewasdConfig): ParseRewasdResultV2 {
  const lookups = buildLookups(config);
  const { layers, layerTriggers } = extractLayers(config);
  const mappings: ParsedRewasdMappingV2[] = [];
  const errors: string[] = [];

  for (const mapping of config.mappings ?? []) {
    try {
      // Capture jumpToLayer mappings as metadata (layer triggers)
      // but don't produce output mappings for them
      if (isShiftJump(mapping)) {
        continue;
      }

      const maskId = mapping.condition?.mask?.id;
      if (maskId === undefined) continue;

      const maskInfo = lookups.masks.get(maskId);
      if (!maskInfo) {
        errors.push(`Unknown mask ID: ${maskId}`);
        continue;
      }

      const activator = mapping.condition.mask.activator;
      const macro = buildMacroSequence(mapping.macros);

      // V2: don't skip gamepad-only macros
      if (macro.steps.length === 0) continue;

      const shiftId = mapping.condition.shiftId;
      const params = activator?.params;

      const parsed: ParsedRewasdMappingV2 = {
        maskId,
        buttonName: maskInfo.buttonName,
        shiftId,
        activator: {
          type: activator?.type ?? 'single',
          mode: activator?.mode ?? 'onetime',
          params: params ? {
            delayMs: params.delay,
            longPressMs: params.longwaittime ?? params.singlewaittime,
            doubleTapWindowMs: params.doublewaittime,
          } : undefined,
        },
        macro,
        description: mapping.description,
      };

      mappings.push(parsed);
    } catch (e) {
      errors.push(`Error parsing mapping: ${e}`);
    }
  }

  return { mappings, layers, layerTriggers, errors };
}

/**
 * Parse reWASD JSON string with v2 output.
 */
export function parseRewasdJsonV2(jsonString: string): ParseRewasdResultV2 {
  try {
    const config = JSON.parse(jsonString) as RewasdConfig;
    return parseRewasdConfigV2(config);
  } catch (e) {
    return {
      mappings: [],
      layers: [],
      layerTriggers: new Map(),
      errors: [`Failed to parse JSON: ${e}`],
    };
  }
}
