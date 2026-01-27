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
  parseXmlToGameActions,
  parseInputString,
  normalizeKeyboardKey,
  normalizeGamepadButton,
  buildKeyToActionMap,
  buildGamepadToActionMap,
  getActionMapNames,
  filterByInputType,
  type ParseXmlResult,
  type ParseXmlToActionsResult,
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
  buildKeyToRewasdMap,
  addRewasdTriggersToActions,
  type ResolveResult,
  type ResolveStats,
} from './chainResolver';

// Star Citizen defaultProfile.xml parser (game defaults)
export {
  parseDefaultProfile,
  fetchAndParseDefaultProfile,
  filterActionsByMap,
  getDefaultActionMapNames,
  buildActionLookup,
} from './defaultProfileParser';

// Star Citizen global.ini localization parser
export {
  parseGlobalIni,
  resolveLocalizationKey,
  fetchAndParseGlobalIni,
} from './globalIniParser';
