/**
 * Parser module exports
 */

// reWASD parser
export {
  parseRewasdConfig,
  parseRewasdJson,
  buildKeyToButtonMap,
  formatMappingDescription,
  type ParseRewasdResult,
} from './rewasdParser';

// Star Citizen XML parser
export {
  parseStarCitizenXml,
  parseInputString,
  normalizeKeyboardKey,
  normalizeGamepadButton,
  buildKeyToActionMap,
  buildGamepadToActionMap,
  getActionMapNames,
  filterByInputType,
  type ParseXmlResult,
} from './xmlParser';

// Chain resolver (combines reWASD + XML)
export {
  resolveChain,
  parseAndResolve,
  filterByMode,
  filterByModifier,
  filterByButton,
  getAvailableModes,
  getAvailableModifiers,
  groupByMode,
  groupByModifier,
  searchMappings,
  type ResolveResult,
  type ResolveStats,
} from './chainResolver';
