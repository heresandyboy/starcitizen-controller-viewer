/**
 * TypeScript types for Star Citizen ActionMaps XML configuration files
 */

// ============================================================================
// Top-Level Structure
// ============================================================================

export interface ActionMaps {
  version: string;
  optionsVersion: string;
  rebindVersion: string;
  profileName: string;
  customisationUIHeader?: CustomisationUIHeader;
  deviceOptions?: DeviceOptions[];
  options?: DeviceOption[];
  modifiers?: unknown;
  actionmaps: ActionMap[];
}

export interface CustomisationUIHeader {
  label: string;
  description?: string;
  image?: string;
  devices?: Devices;
  categories?: Category[];
}

export interface Devices {
  keyboard?: DeviceInstance;
  mouse?: DeviceInstance;
  gamepad?: DeviceInstance;
  joystick?: DeviceInstance[];
}

export interface DeviceInstance {
  instance: number;
}

export interface Category {
  label: string;
}

// ============================================================================
// Device Options
// ============================================================================

export interface DeviceOptions {
  name: string;
  options: DeviceOptionSetting[];
}

export interface DeviceOptionSetting {
  input: string;
  deadzone?: string;
  [key: string]: unknown;
}

export interface DeviceOption {
  type: DeviceType;
  instance: number;
  product?: string;
  [key: string]: unknown;
}

export type DeviceType = 'keyboard' | 'mouse' | 'gamepad' | 'joystick';

// ============================================================================
// Action Maps
// ============================================================================

export interface ActionMap {
  name: string;
  actions: Action[];
}

export interface Action {
  name: string;
  rebinds: Rebind[];
}

export interface Rebind {
  input: string;
  activationMode?: ActivationMode;
  multiTap?: number;
}

export type ActivationMode = 'double_tap' | 'hold' | 'press' | string;

// ============================================================================
// Input Types
// ============================================================================

export type InputDeviceType = 'keyboard' | 'gamepad' | 'mouse' | 'joystick';

export interface ParsedInput {
  deviceType: InputDeviceType;
  deviceInstance: number;
  key: string;
  modifiers: string[];
}

// ============================================================================
// Parsed Output Types
// ============================================================================

export interface ParsedXmlBinding {
  actionMap: string;
  actionName: string;
  inputType: InputDeviceType;
  inputKey: string;
  modifiers: string[];
  activationMode?: ActivationMode;
  multiTap?: number;
  /** Original input string from XML (e.g., "gp1_back", "kb1_lshift+f7") for debugging */
  rawInput: string;
}

// ============================================================================
// Common Action Map Names
// ============================================================================

export const ACTION_MAP_NAMES = {
  // General
  SEAT_GENERAL: 'seat_general',

  // Spaceship
  SPACESHIP_GENERAL: 'spaceship_general',
  SPACESHIP_VIEW: 'spaceship_view',
  SPACESHIP_MOVEMENT: 'spaceship_movement',
  SPACESHIP_TARGETING: 'spaceship_targeting',
  SPACESHIP_WEAPONS: 'spaceship_weapons',
  SPACESHIP_MISSILES: 'spaceship_missiles',
  SPACESHIP_DEFENSIVE: 'spaceship_defensive',
  SPACESHIP_MINING: 'spaceship_mining',
  SPACESHIP_SALVAGE: 'spaceship_salvage',
  SPACESHIP_SCANNING: 'spaceship_scanning',

  // Turret
  TURRET_MAIN: 'turret_main',

  // Vehicle
  VEHICLE_GENERAL: 'vehicle_general',

  // FPS
  FPS_MOVEMENT: 'fps_movement',
  FPS_COMBAT: 'fps_combat',
  FPS_INTERACTION: 'fps_interaction',

  // EVA
  EVA_MOVEMENT: 'eva_movement',

  // Other
  PLAYER_INPUT_OPTICAL_TRACKING: 'player_input_optical_tracking',
} as const;

// ============================================================================
// Gamepad Button Names (for SC XML)
// ============================================================================

export const SC_GAMEPAD_BUTTONS: Record<string, string> = {
  'a': 'A',
  'b': 'B',
  'x': 'X',
  'y': 'Y',
  'shoulderl': 'LB',
  'shoulderr': 'RB',
  'triggerl_btn': 'LT',
  'triggerr_btn': 'RT',
  'thumbl': 'LS',
  'thumbr': 'RS',
  'back': 'View',
  'start': 'Menu',
  'dpad_up': 'DpadUp',
  'dpad_down': 'DpadDown',
  'dpad_left': 'DpadLeft',
  'dpad_right': 'DpadRight',
};
