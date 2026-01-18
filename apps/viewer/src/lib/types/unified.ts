/**
 * Unified mapping types that combine reWASD and Star Citizen bindings
 * This is the output format after resolving the mapping chain
 */

import type { ActivatorType, ActivatorMode } from './rewasd';

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
