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
