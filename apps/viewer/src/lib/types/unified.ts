/**
 * Unified mapping types that combine reWASD and Star Citizen bindings
 * This is the output format after resolving the mapping chain
 */

import type { ActivatorType, ActivatorMode } from './rewasd';

// ============================================================================
// GameAction Model (Action-Centered Architecture)
// ============================================================================
// The new model centers on Star Citizen actions rather than input devices.
// Each GameAction represents a single game action with all its possible triggers.

/**
 * A Star Citizen game action with all possible input bindings.
 * This is the primary entity in the action-centered architecture.
 */
/**
 * Debug information showing the original XML structure for an action.
 * Used to help understand how bindings were parsed.
 */
export interface XmlDebugInfo {
  /** Original rebind elements as they appear in the XML */
  rebinds: Array<{
    /** The raw input string (e.g., "gp1_back", "kb1_f7") */
    rawInput: string;
    /** Activation mode if specified */
    activationMode?: string;
    /** Multi-tap count if specified */
    multiTap?: number;
  }>;
}

export interface GameAction {
  /** Internal SC action name (e.g., "v_toggle_mining_mode") */
  name: string;
  /** Human-readable name (e.g., "Toggle Mining Mode") */
  displayName: string;
  /** SC action map (e.g., "spaceship_mining") */
  actionMap: string;
  /** Gameplay category for grouping/filtering */
  category: GameplayMode;
  
  /** All input bindings that trigger this action */
  bindings: GameActionBindings;
  
  /** Optional: reWASD controller inputs that can trigger this action via keyboard output */
  rewasdTriggers?: RewasdTrigger[];
  
  /** Optional: Debug information showing original XML structure */
  xmlDebugInfo?: XmlDebugInfo;
}

/**
 * Collection of input bindings for a game action, grouped by input device.
 */
export interface GameActionBindings {
  /** Direct keyboard bindings from SC XML */
  keyboard?: KeyboardBinding[];
  /** Direct mouse bindings from SC XML */
  mouse?: MouseBinding[];
  /** Direct gamepad bindings from SC XML (js1_, js2_, etc.) */
  gamepad?: DirectGamepadBinding[];
}

/**
 * A keyboard binding for a game action.
 */
export interface KeyboardBinding {
  /** Key in SC format (e.g., "lshift", "f7", "space") */
  key: string;
  /** Modifier key if any (e.g., "lalt", "lctrl") */
  modifier?: string;
  /** Whether this is the SC default binding */
  isDefault?: boolean;
}

/**
 * A mouse binding for a game action.
 */
export interface MouseBinding {
  /** Mouse input (e.g., "mouse1", "mouse2", "mwheel_up") */
  input: string;
  /** Modifier key if any */
  modifier?: string;
  /** Whether this is the SC default binding */
  isDefault?: boolean;
}

/**
 * A direct gamepad binding from SC XML (not via reWASD).
 */
export interface DirectGamepadBinding {
  /** Gamepad input in SC format (e.g., "js1_button1", "js2_x") */
  input: string;
  /** Modifier input if any */
  modifier?: string;
  /** Activation mode (e.g., "hold", "toggle", "double_tap") */
  activationMode?: string;
  /** Whether this is the SC default binding */
  isDefault?: boolean;
}

/**
 * A reWASD controller input that triggers a game action via keyboard output.
 * This represents the reWASD → keyboard → SC action chain.
 */
export interface RewasdTrigger {
  /** Controller button name (e.g., "A", "DpadUp", "RB") */
  controllerButton: string;
  /** Modifier button if any (e.g., "LB", "Y") */
  modifier?: string;
  /** How the button is activated (e.g., "regular", "long_press") */
  activationType: ActivatorType;
  /** Activation mode (e.g., "turbo", "toggle") */
  activationMode: ActivatorMode;
  /** Original description from reWASD config */
  description?: string;
  /** The keyboard key(s) that reWASD outputs to trigger this action */
  outputKeys: string[];
}

/**
 * State for the action-centered config view.
 */
export interface GameActionState {
  /** Whether configs have been loaded */
  loaded: boolean;
  /** reWASD config file name (optional) */
  rewasdFileName?: string;
  /** Star Citizen XML file name */
  xmlFileName?: string;
  /** All game actions with their bindings */
  actions: GameAction[];
  /** Available gameplay categories (derived from actions) */
  availableCategories: GameplayMode[];
  /** Loading/parsing errors */
  error?: string;
}

/**
 * Filter criteria for game actions.
 */
export interface GameActionFilter {
  /** Filter by gameplay category */
  category?: GameplayMode;
  /** Text search query (matches name, displayName) */
  searchQuery?: string;
  /** Filter to actions with keyboard bindings */
  hasKeyboard?: boolean;
  /** Filter to actions with gamepad bindings */
  hasGamepad?: boolean;
  /** Filter to actions with reWASD triggers */
  hasRewasd?: boolean;
}

// ============================================================================
// Unified Mapping (Final Output)
// ============================================================================

export interface UnifiedMapping {
  /** Unique identifier for this mapping */
  id: string;

  // Input side (controller)
  /** Controller button name (e.g., "A", "DpadUp") */
  controllerButton: string;
  /** Modifier button if any (e.g., "LB", "Y") */
  modifier?: string;
  /** How the button is activated */
  activationType: ActivatorType;
  /** Activation mode */
  activationMode: ActivatorMode;

  // Chain (intermediate step via reWASD)
  /** Keyboard key(s) output by reWASD (if applicable) */
  keyboardKeys?: string[];

  // Output side (game action)
  /** Game action internal name (e.g., "v_toggle_mining_mode") */
  gameAction: string;
  /** Human-readable action name (e.g., "Toggle Mining Mode") */
  gameActionReadable: string;
  /** Gameplay mode category */
  gameplayMode: GameplayMode;
  /** Action map from SC XML */
  actionMap: string;

  // Metadata
  /** Source of this mapping */
  source: MappingSource;
  /** Original description from reWASD (often in French for GCO) */
  description?: string;
}

export type MappingSource =
  | 'xml-gamepad'      // Direct gamepad binding from SC XML
  | 'xml-keyboard'     // Keyboard binding from SC XML
  | 'rewasd'           // reWASD mapping (no SC action found)
  | 'rewasd+xml';      // reWASD → keyboard → SC action chain

export type GameplayMode =
  | 'General'
  | 'Flight'
  | 'FPS'
  | 'EVA'
  | 'Vehicle'
  | 'Mining'
  | 'Salvage'
  | 'Scanning'
  | 'Turret'
  | 'Inventory'
  | 'Mobiglass'
  | 'Camera'
  | 'Social'
  | 'Unknown';

// ============================================================================
// Filter/Search Types
// ============================================================================

export interface MappingFilter {
  /** Filter by gameplay mode */
  gameplayMode?: GameplayMode;
  /** Filter by modifier (e.g., "LB", "Y", or null for no modifier) */
  modifier?: string | null;
  /** Filter by controller button */
  button?: string;
  /** Filter by source type */
  source?: MappingSource;
  /** Text search query */
  searchQuery?: string;
}

export interface MappingGroup {
  /** Group label */
  label: string;
  /** Mappings in this group */
  mappings: UnifiedMapping[];
}

// ============================================================================
// Config State
// ============================================================================

export interface ConfigState {
  /** Whether configs have been loaded */
  loaded: boolean;
  /** reWASD config file name */
  rewasdFileName?: string;
  /** Star Citizen XML file name */
  xmlFileName?: string;
  /** All unified mappings */
  mappings: UnifiedMapping[];
  /** Available gameplay modes (derived from mappings) */
  availableModes: GameplayMode[];
  /** Available modifiers (derived from mappings) */
  availableModifiers: string[];
  /** Loading/parsing errors */
  error?: string;
}
