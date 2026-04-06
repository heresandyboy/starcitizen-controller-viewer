/**
 * Chain Resolver - Links reWASD controller mappings to Star Citizen actions
 *
 * The mapping chain works like this:
 * 1. Controller button (via reWASD) → Keyboard key
 * 2. Keyboard key (via SC XML) → Game action
 *
 * This module joins these two steps to create unified mappings:
 * Controller button → Game action
 */

import type { ParsedRewasdMapping } from '../types/rewasd';
import type { ParsedXmlBinding } from '../types/starcitizen';
import type {
  UnifiedMapping,
  GameplayMode,
  MappingSource,
  GameAction,
  RewasdTrigger,
} from '../types/unified';
import { getActionDisplayName, getGameplayMode } from '../constants/scActions';
import {
  parseRewasdConfig,
  buildKeyToButtonMap,
  type ParseRewasdResult,
} from './rewasdParser';
import {
  parseStarCitizenXml,
  buildKeyToActionMap,
  buildGamepadToActionMap,
  type ParseXmlResult,
} from './xmlParser';

// ============================================================================
// Chain Resolution
// ============================================================================

export interface ResolveResult {
  mappings: UnifiedMapping[];
  errors: string[];
  stats: ResolveStats;
}

export interface ResolveStats {
  totalRewasdMappings: number;
  totalXmlBindings: number;
  resolvedChains: number;
  unresolvedRewasd: number;
  directGamepadBindings: number;
}

/**
 * Resolve the full mapping chain from controller input to game action
 */
export function resolveChain(
  rewasdResult: ParseRewasdResult,
  xmlResult: ParseXmlResult
): ResolveResult {
  const mappings: UnifiedMapping[] = [];
  const errors: string[] = [...rewasdResult.errors, ...xmlResult.errors];

  // Build lookup tables
  const keyToAction = buildKeyToActionMap(xmlResult.bindings);
  const gamepadToAction = buildGamepadToActionMap(xmlResult.bindings);

  let resolvedChains = 0;
  let unresolvedRewasd = 0;

  // Process reWASD mappings - find matching SC XML bindings via keyboard key
  for (const rewasdMapping of rewasdResult.mappings) {
    // Try to find SC action for each keyboard key output
    let foundAction = false;

    for (const key of rewasdMapping.outputKeys) {
      const normalizedKey = key.toLowerCase();
      const xmlBindings = keyToAction.get(normalizedKey);

      if (xmlBindings && xmlBindings.length > 0) {
        // Create a unified mapping for each matching SC binding
        for (const xmlBinding of xmlBindings) {
          const unified = createUnifiedMapping(
            rewasdMapping,
            xmlBinding,
            'rewasd+xml'
          );
          mappings.push(unified);
          foundAction = true;
        }
        resolvedChains++;
      }
    }

    // If no SC action found, still include the reWASD mapping
    if (!foundAction) {
      const unresolved = createUnresolvedMapping(rewasdMapping);
      mappings.push(unresolved);
      unresolvedRewasd++;
    }
  }

  // Also include direct gamepad bindings from SC XML (not via reWASD)
  const directGamepadMappings = createDirectGamepadMappings(
    xmlResult.bindings.filter((b) => b.inputType === 'gamepad')
  );
  mappings.push(...directGamepadMappings);

  return {
    mappings,
    errors,
    stats: {
      totalRewasdMappings: rewasdResult.mappings.length,
      totalXmlBindings: xmlResult.bindings.length,
      resolvedChains,
      unresolvedRewasd,
      directGamepadBindings: directGamepadMappings.length,
    },
  };
}

// ============================================================================
// Unified Mapping Creation
// ============================================================================

let mappingIdCounter = 0;

function generateMappingId(): string {
  return `mapping-${++mappingIdCounter}`;
}

/**
 * Create a unified mapping from reWASD + SC XML binding
 */
function createUnifiedMapping(
  rewasd: ParsedRewasdMapping,
  xml: ParsedXmlBinding,
  source: MappingSource
): UnifiedMapping {
  return {
    id: generateMappingId(),
    controllerButton: rewasd.buttonName,
    modifier: rewasd.shiftName,
    activationType: rewasd.activatorType,
    activationMode: rewasd.activatorMode,
    keyboardKeys: rewasd.outputKeys,
    gameAction: xml.actionName,
    gameActionReadable: getActionDisplayName(xml.actionName),
    gameplayMode: getGameplayMode(xml.actionMap),
    actionMap: xml.actionMap,
    source,
    description: rewasd.description,
  };
}

/**
 * Create a mapping for reWASD binding with no SC action found
 */
function createUnresolvedMapping(rewasd: ParsedRewasdMapping): UnifiedMapping {
  return {
    id: generateMappingId(),
    controllerButton: rewasd.buttonName,
    modifier: rewasd.shiftName,
    activationType: rewasd.activatorType,
    activationMode: rewasd.activatorMode,
    keyboardKeys: rewasd.outputKeys,
    gameAction: `[${rewasd.outputKeys.join(' + ')}]`,
    gameActionReadable: `Keyboard: ${rewasd.outputKeys.join(' + ')}`,
    gameplayMode: 'Unknown',
    actionMap: '',
    source: 'rewasd',
    description: rewasd.description,
  };
}

/**
 * Create unified mappings from direct gamepad bindings in SC XML
 */
function createDirectGamepadMappings(
  gamepadBindings: ParsedXmlBinding[]
): UnifiedMapping[] {
  return gamepadBindings.map((binding) => ({
    id: generateMappingId(),
    controllerButton: binding.inputKey,
    modifier: binding.modifiers.length > 0 ? binding.modifiers[0] : undefined,
    activationType: binding.activationMode === 'double_tap' ? 'double' : 'single',
    activationMode: 'onetime',
    keyboardKeys: undefined,
    gameAction: binding.actionName,
    gameActionReadable: getActionDisplayName(binding.actionName),
    gameplayMode: getGameplayMode(binding.actionMap),
    actionMap: binding.actionMap,
    source: 'xml-gamepad',
  }));
}

// ============================================================================
// High-Level API
// ============================================================================

/**
 * Parse both config files and resolve the mapping chain
 */
export function parseAndResolve(
  rewasdJson: string,
  xmlString: string
): ResolveResult {
  // Reset ID counter for fresh parse
  mappingIdCounter = 0;

  const rewasdResult = parseRewasdConfig(JSON.parse(rewasdJson));
  const xmlResult = parseStarCitizenXml(xmlString);

  return resolveChain(rewasdResult, xmlResult);
}

// ============================================================================
// GameAction reWASD Integration (Optional Overlay)
// ============================================================================

/**
 * Build a lookup map from keyboard key → reWASD mappings that output that key.
 * This enables reverse lookup: given a keyboard key, find which controller buttons trigger it.
 */
export function buildKeyToRewasdMap(
  rewasdMappings: ParsedRewasdMapping[]
): Map<string, ParsedRewasdMapping[]> {
  const map = new Map<string, ParsedRewasdMapping[]>();

  for (const mapping of rewasdMappings) {
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
 * Convert a ParsedRewasdMapping to a RewasdTrigger for attachment to a GameAction.
 */
function toRewasdTrigger(rewasd: ParsedRewasdMapping): RewasdTrigger {
  return {
    controllerButton: rewasd.buttonName,
    modifier: rewasd.shiftName,
    activationType: rewasd.activatorType,
    activationMode: rewasd.activatorMode,
    description: rewasd.description,
    outputKeys: rewasd.outputKeys,
  };
}

/**
 * Add reWASD triggers to GameActions based on matching keyboard bindings.
 * 
 * This function implements the "optional overlay" pattern:
 * - Primary: SC XML bindings define game actions
 * - Secondary: reWASD mappings optionally add controller triggers
 * 
 * A reWASD mapping is added as a trigger when its keyboard output matches
 * a keyboard binding on the GameAction.
 * 
 * @param actions - GameActions from parseXmlToGameActions()
 * @param rewasdResult - Optional reWASD parsing result
 * @returns GameActions with rewasdTriggers attached where applicable
 */
export function addRewasdTriggersToActions(
  actions: GameAction[],
  rewasdResult: ParseRewasdResult | null
): GameAction[] {
  // If no reWASD data, return actions unchanged
  if (!rewasdResult || rewasdResult.mappings.length === 0) {
    return actions;
  }

  // Build reverse lookup: keyboard key → reWASD mappings
  const keyToRewasd = buildKeyToRewasdMap(rewasdResult.mappings);

  // Process each action
  return actions.map((action) => {
    // Skip actions without keyboard bindings
    if (!action.bindings.keyboard || action.bindings.keyboard.length === 0) {
      return action;
    }

    // Find reWASD triggers for this action's keyboard bindings
    const triggers: RewasdTrigger[] = [];
    const seenTriggers = new Set<string>(); // Avoid duplicates

    for (const keyboardBinding of action.bindings.keyboard) {
      const normalizedKey = keyboardBinding.key.toLowerCase();
      const rewasdMappings = keyToRewasd.get(normalizedKey);

      if (rewasdMappings) {
        for (const rewasdMapping of rewasdMappings) {
          // Create unique key for deduplication
          const triggerKey = `${rewasdMapping.buttonName}:${rewasdMapping.shiftName ?? ''}:${rewasdMapping.activatorType}`;
          if (!seenTriggers.has(triggerKey)) {
            seenTriggers.add(triggerKey);
            triggers.push(toRewasdTrigger(rewasdMapping));
          }
        }
      }
    }

    // Return action with triggers if any found
    if (triggers.length > 0) {
      return {
        ...action,
        rewasdTriggers: triggers,
      };
    }

    return action;
  });
}

// ============================================================================
// Filtering & Grouping
// ============================================================================

/**
 * Filter mappings by gameplay mode
 */
export function filterByMode(
  mappings: UnifiedMapping[],
  mode: GameplayMode
): UnifiedMapping[] {
  return mappings.filter((m) => m.gameplayMode === mode);
}

/**
 * Filter mappings by modifier
 */
export function filterByModifier(
  mappings: UnifiedMapping[],
  modifier: string | null
): UnifiedMapping[] {
  if (modifier === null) {
    return mappings.filter((m) => !m.modifier);
  }
  return mappings.filter((m) => m.modifier === modifier);
}

/**
 * Filter mappings by button
 */
export function filterByButton(
  mappings: UnifiedMapping[],
  button: string
): UnifiedMapping[] {
  return mappings.filter((m) => m.controllerButton === button);
}

/**
 * Get all unique gameplay modes from mappings
 */
export function getAvailableModes(mappings: UnifiedMapping[]): GameplayMode[] {
  const modes = new Set<GameplayMode>();
  for (const m of mappings) {
    modes.add(m.gameplayMode);
  }
  return Array.from(modes).sort();
}

/**
 * Get all unique modifiers from mappings
 */
export function getAvailableModifiers(mappings: UnifiedMapping[]): string[] {
  const modifiers = new Set<string>();
  for (const m of mappings) {
    if (m.modifier) {
      modifiers.add(m.modifier);
    }
  }
  return Array.from(modifiers).sort();
}

/**
 * Group mappings by gameplay mode
 */
export function groupByMode(
  mappings: UnifiedMapping[]
): Map<GameplayMode, UnifiedMapping[]> {
  const groups = new Map<GameplayMode, UnifiedMapping[]>();

  for (const m of mappings) {
    const existing = groups.get(m.gameplayMode) ?? [];
    existing.push(m);
    groups.set(m.gameplayMode, existing);
  }

  return groups;
}

/**
 * Group mappings by modifier
 */
export function groupByModifier(
  mappings: UnifiedMapping[]
): Map<string | null, UnifiedMapping[]> {
  const groups = new Map<string | null, UnifiedMapping[]>();

  for (const m of mappings) {
    const key = m.modifier ?? null;
    const existing = groups.get(key) ?? [];
    existing.push(m);
    groups.set(key, existing);
  }

  return groups;
}

/**
 * Search mappings by text query (searches action names and descriptions)
 */
export function searchMappings(
  mappings: UnifiedMapping[],
  query: string
): UnifiedMapping[] {
  const lowerQuery = query.toLowerCase();

  return mappings.filter((m) => {
    return (
      m.gameAction.toLowerCase().includes(lowerQuery) ||
      m.gameActionReadable.toLowerCase().includes(lowerQuery) ||
      m.controllerButton.toLowerCase().includes(lowerQuery) ||
      m.modifier?.toLowerCase().includes(lowerQuery) ||
      m.description?.toLowerCase().includes(lowerQuery)
    );
  });
}

// ============================================================================
// V2 Chain Resolver — Per-Step Macro Resolution with BindingIndex
// ============================================================================

import type {
  ParseRewasdResultV2,
} from './rewasdParser';
import type {
  ResolvedBinding,
  ResolvedAction,
  BindingIndex,
  BindingStats,
  BindingSource,
  ShiftLayer,
  MacroStepResolved,
} from '../types/binding';
import type { ActivatorType } from '../types/rewasd';
import type { SCDefaultAction } from '../types/defaultProfile';
import {
  keyToScKeyboard,
  REWASD_GP_OUTPUT_TO_SC,
} from '../constants/keyMappings';

let v2IdCounter = 0;

function generateV2Id(button: string, layerId: number, activatorType: string): string {
  return `${button}-${layerId}-${activatorType}-${++v2IdCounter}`;
}

/**
 * Build a lookup map from SC keyboard key (e.g., "insert") to default actions.
 * The default actions use "key+modifier" format like "u+lshift" which we normalize.
 */
function buildDefaultKeyboardMap(
  defaults: SCDefaultAction[]
): Map<string, SCDefaultAction[]> {
  const map = new Map<string, SCDefaultAction[]>();
  for (const action of defaults) {
    if (!action.keyboardBind) continue;
    // defaultProfile uses format like "u+lshift" — the first part is the key
    const normalizedKey = action.keyboardBind.split('+')[0].toLowerCase();
    const existing = map.get(normalizedKey) ?? [];
    existing.push(action);
    map.set(normalizedKey, existing);
  }
  return map;
}

/**
 * Resolve a single macro step against SC XML bindings and/or default actions.
 * Mutates the step's resolvedAction field and returns any ResolvedActions found.
 */
function resolveStep(
  step: MacroStepResolved,
  stepIndex: number,
  keyToAction: Map<string, ParsedXmlBinding[]>,
  gamepadToAction: Map<string, ParsedXmlBinding[]>,
  defaultKeyboardMap: Map<string, SCDefaultAction[]>
): { actions: ResolvedAction[]; resolvedVia: 'keyboard' | 'gamepad' | null; usedDefault: boolean } {
  const actions: ResolvedAction[] = [];
  let usedDefault = false;

  // Only resolve "down" events (or steps without action — those are implicit presses)
  if (step.action === 'up') {
    return { actions, resolvedVia: null, usedDefault };
  }

  if (step.type === 'keyboard' && step.key) {
    const scKey = keyToScKeyboard(step.key);
    if (!scKey) return { actions, resolvedVia: 'keyboard', usedDefault };

    // Try custom XML bindings first
    const xmlBindings = keyToAction.get(scKey);
    if (xmlBindings && xmlBindings.length > 0) {
      for (const xml of xmlBindings) {
        actions.push({
          name: xml.actionName,
          displayName: getActionDisplayName(xml.actionName),
          actionMap: xml.actionMap,
          gameplayMode: getGameplayMode(xml.actionMap),
          macroStepIndex: stepIndex,
          resolvedVia: 'keyboard',
          matchedInput: `kb1_${scKey}`,
        });
      }
      return { actions, resolvedVia: 'keyboard', usedDefault: false };
    }

    // Fall back to SC defaults
    const defaultActions = defaultKeyboardMap.get(scKey);
    if (defaultActions && defaultActions.length > 0) {
      for (const def of defaultActions) {
        actions.push({
          name: def.actionName,
          displayName: getActionDisplayName(def.actionName),
          actionMap: def.mapName,
          gameplayMode: getGameplayMode(def.mapName),
          macroStepIndex: stepIndex,
          resolvedVia: 'keyboard',
          matchedInput: `kb1_${scKey}`,
        });
      }
      return { actions, resolvedVia: 'keyboard', usedDefault: true };
    }

    return { actions, resolvedVia: 'keyboard', usedDefault };
  }

  if (step.type === 'gamepad' && step.gamepadButton) {
    // Map reWASD output name back to SC gamepad name
    // REWASD_GP_OUTPUT_NAMES maps buttonId → display name (e.g., 33 → "DpadUp")
    // REWASD_GP_OUTPUT_TO_SC maps buttonId → SC name (e.g., 33 → "dpad_up")
    // But step.gamepadButton is already the display name. We need SC name.
    // Find the SC name by looking up through the output names table.
    const scGamepadKey = findScGamepadKey(step.gamepadButton);
    if (!scGamepadKey) return { actions, resolvedVia: 'gamepad', usedDefault };

    const xmlBindings = gamepadToAction.get(scGamepadKey);
    if (xmlBindings && xmlBindings.length > 0) {
      for (const xml of xmlBindings) {
        actions.push({
          name: xml.actionName,
          displayName: getActionDisplayName(xml.actionName),
          actionMap: xml.actionMap,
          gameplayMode: getGameplayMode(xml.actionMap),
          macroStepIndex: stepIndex,
          resolvedVia: 'gamepad',
          matchedInput: `gp1_${scGamepadKey}`,
        });
      }
    }
    return { actions, resolvedVia: 'gamepad', usedDefault };
  }

  return { actions, resolvedVia: null, usedDefault };
}

/**
 * Map a reWASD gamepad output display name (e.g., "DpadUp") back to SC name (e.g., "dpad_up").
 */
function findScGamepadKey(displayName: string): string | undefined {
  // Reverse lookup: display name → SC key name
  for (const [idStr, scKey] of Object.entries(REWASD_GP_OUTPUT_TO_SC)) {
    const id = Number(idStr);
    const name = REWASD_GP_OUTPUT_NAMES[id];
    if (name === displayName) return scKey;
  }
  return undefined;
}

import { REWASD_GP_OUTPUT_NAMES } from '../constants/keyMappings';

/**
 * Determine the BindingSource from resolution results.
 */
function determineSource(
  resolvedVias: Set<'keyboard' | 'gamepad'>,
  usedDefault: boolean,
  hasActions: boolean
): BindingSource {
  if (!hasActions) return 'rewasd-unresolved';
  if (usedDefault) return 'rewasd+default';
  if (resolvedVias.has('gamepad') && resolvedVias.has('keyboard')) return 'rewasd+xml';
  if (resolvedVias.has('gamepad')) return 'rewasd+xml-gamepad';
  return 'rewasd+xml';
}

/**
 * Resolve all reWASD v2 mappings against SC XML bindings and produce a BindingIndex.
 *
 * This is the v2 chain resolver that walks each macro step individually,
 * resolves keyboard steps via kb1_* and gamepad steps via gp1_*, and
 * builds a pre-indexed query structure for all views.
 */
export function resolveBindingsV2(
  rewasdResult: ParseRewasdResultV2,
  xmlResult: ParseXmlResult,
  defaults: SCDefaultAction[] = [],
): BindingIndex {
  v2IdCounter = 0;

  const keyToAction = buildKeyToActionMap(xmlResult.bindings);
  const gamepadToAction = buildGamepadToActionMap(xmlResult.bindings);
  const defaultKeyboardMap = buildDefaultKeyboardMap(defaults);

  const layers = rewasdResult.layers;
  const layerMap = new Map<number, ShiftLayer>();
  for (const layer of layers) layerMap.set(layer.id, layer);

  // Main layer (id=0) used when shiftId is undefined
  const mainLayer = layerMap.get(0) ?? { id: 0, name: 'Main', isDefault: true };

  const bindings: ResolvedBinding[] = [];

  for (const mapping of rewasdResult.mappings) {
    const layer = mapping.shiftId !== undefined
      ? layerMap.get(mapping.shiftId) ?? mainLayer
      : mainLayer;

    const resolvedVias = new Set<'keyboard' | 'gamepad'>();
    let usedDefault = false;
    const allActions: ResolvedAction[] = [];

    // Walk each macro step and resolve
    const resolvedSteps: MacroStepResolved[] = [];
    for (let i = 0; i < mapping.macro.steps.length; i++) {
      const step = { ...mapping.macro.steps[i] };
      const result = resolveStep(step, i, keyToAction, gamepadToAction, defaultKeyboardMap);

      if (result.resolvedVia) resolvedVias.add(result.resolvedVia);
      if (result.usedDefault) usedDefault = true;

      // Attach resolved action to step
      if (result.actions.length > 0) {
        step.resolvedAction = {
          actionName: result.actions[0].name,
          displayName: result.actions[0].displayName,
          actionMap: result.actions[0].actionMap,
          gameplayMode: result.actions[0].gameplayMode,
        };
      }

      resolvedSteps.push(step);
      allActions.push(...result.actions);
    }

    const source = determineSource(resolvedVias, usedDefault, allActions.length > 0);

    const binding: ResolvedBinding = {
      id: generateV2Id(mapping.buttonName, layer.id, mapping.activator.type),
      button: mapping.buttonName,
      layer,
      activator: {
        type: mapping.activator.type,
        mode: mapping.activator.mode,
        ...mapping.activator.params,
      },
      macro: {
        ...mapping.macro,
        steps: resolvedSteps,
      },
      actions: allActions,
      source,
      description: mapping.description,
    };

    bindings.push(binding);
  }

  return buildBindingIndex(bindings, layers);
}

/**
 * Build the BindingIndex with all query maps from a flat list of bindings.
 */
export function buildBindingIndex(
  bindings: ResolvedBinding[],
  layers: ShiftLayer[]
): BindingIndex {
  const byButtonLayerActivator = new Map<string, Map<number, Map<ActivatorType, ResolvedBinding>>>();
  const byAction = new Map<string, ResolvedBinding[]>();
  const byMode = new Map<string, ResolvedBinding[]>();
  const byLayer = new Map<number, ResolvedBinding[]>();
  const byButton = new Map<string, ResolvedBinding[]>();
  const bindingsPerLayer = new Map<number, number>();

  const uniqueActions = new Set<string>();
  let resolvedCount = 0;
  let unresolvedCount = 0;
  let multiActionCount = 0;

  for (const binding of bindings) {
    // byButtonLayerActivator
    if (!byButtonLayerActivator.has(binding.button)) {
      byButtonLayerActivator.set(binding.button, new Map());
    }
    const layerMap = byButtonLayerActivator.get(binding.button)!;
    if (!layerMap.has(binding.layer.id)) {
      layerMap.set(binding.layer.id, new Map());
    }
    layerMap.get(binding.layer.id)!.set(binding.activator.type, binding);

    // byAction
    for (const action of binding.actions) {
      uniqueActions.add(action.name);
      const existing = byAction.get(action.name) ?? [];
      existing.push(binding);
      byAction.set(action.name, existing);
    }

    // byMode
    for (const action of binding.actions) {
      const existing = byMode.get(action.gameplayMode) ?? [];
      // Avoid duplicating if multiple actions in same binding have same mode
      if (!existing.includes(binding)) {
        existing.push(binding);
        byMode.set(action.gameplayMode, existing);
      }
    }

    // byLayer
    const layerBindings = byLayer.get(binding.layer.id) ?? [];
    layerBindings.push(binding);
    byLayer.set(binding.layer.id, layerBindings);

    // byButton
    const buttonBindings = byButton.get(binding.button) ?? [];
    buttonBindings.push(binding);
    byButton.set(binding.button, buttonBindings);

    // Stats
    bindingsPerLayer.set(binding.layer.id, (bindingsPerLayer.get(binding.layer.id) ?? 0) + 1);
    if (binding.source === 'rewasd-unresolved') {
      unresolvedCount++;
    } else {
      resolvedCount++;
    }
    if (binding.actions.length > 1) {
      multiActionCount++;
    }
  }

  const stats: BindingStats = {
    totalBindings: bindings.length,
    resolvedBindings: resolvedCount,
    unresolvedBindings: unresolvedCount,
    multiActionBindings: multiActionCount,
    layerCount: layers.length,
    uniqueActionsTriggered: uniqueActions.size,
    bindingsPerLayer,
  };

  return {
    all: bindings,
    layers,
    byButtonLayerActivator: byButtonLayerActivator as BindingIndex['byButtonLayerActivator'],
    byAction,
    byMode: byMode as BindingIndex['byMode'],
    byLayer,
    byButton,
    stats,
  };
}
