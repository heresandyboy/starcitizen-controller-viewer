/**
 * TypeScript types for reWASD .rewasd configuration files
 * Based on reverse-engineered schema from GCO 4.5 HOSAS.rewasd
 */

// ============================================================================
// Top-Level Config
// ============================================================================

export interface RewasdConfig {
  schemaVersion: number;
  appVersion: string;
  config: RewasdConfigSection;
  devices: RewasdDevices;
  radialMenuCircles: unknown[];
  radialMenuSectors: unknown[];
  crosshairs: unknown[];
  shifts: Shift[];
  masks: Mask[];
  mappings: Mapping[];
}

export interface RewasdConfigSection {
  name?: string;
  [key: string]: unknown;
}

export interface RewasdDevices {
  [key: string]: unknown;
}

// ============================================================================
// Shifts (Modifier Layers)
// ============================================================================

export interface Shift {
  id: number;
  type: ShiftType;
  description: string;
  unheritableMasks?: number[];
}

export type ShiftType = 'default' | 'radialMenu' | string;

// ============================================================================
// Masks (Input Buttons)
// ============================================================================

export interface Mask {
  id: number;
  set: MaskButton[];
}

export interface MaskButton {
  deviceId: number;
  buttonId: number;
  description: string;
}

// ============================================================================
// Mappings (Button -> Action)
// ============================================================================

export interface Mapping {
  description?: string;
  condition: MappingCondition;
  macros?: MacroStep[];
  jumpToLayer?: JumpToLayer;
}

export interface MappingCondition {
  shiftId?: number;
  mask: MaskCondition;
}

export interface MaskCondition {
  id: number;
  activator: Activator;
}

export interface Activator {
  type: ActivatorType;
  mode: ActivatorMode;
  params?: ActivatorParams;
}

export type ActivatorType = 'single' | 'long' | 'double' | 'start' | 'release';
export type ActivatorMode = 'onetime' | 'hold_until_release' | 'turbo' | 'toggle';

export interface ActivatorParams {
  expert?: boolean;
  delay?: number;
  singlewaittime?: number;
  doublewaittime?: number;
  pause?: number;
  macro?: boolean;
}

export interface JumpToLayer {
  layer: number;
}

// ============================================================================
// Macros (Output Actions)
// ============================================================================

export interface MacroStep {
  keyboard?: KeyboardAction;
  gamepad?: GamepadAction;
  mouse?: MouseAction;
  pause?: PauseAction;
  rumble?: RumbleAction;
}

export interface KeyboardAction {
  buttonId: number;
  description: string;
  action?: 'down' | 'up';
}

export interface GamepadAction {
  id: number;
  buttonId: number;
  description: string;
  action?: 'down' | 'up';
}

export interface MouseAction {
  buttonId?: number;
  description?: string;
  action?: 'down' | 'up';
  [key: string]: unknown;
}

export interface PauseAction {
  value: number;
}

export interface RumbleAction {
  [key: string]: unknown;
}

// ============================================================================
// Parsed Output Types (for use after parsing)
// ============================================================================

export interface ParsedRewasdMapping {
  maskId: number;
  buttonName: string;
  shiftId?: number;
  shiftName?: string;
  activatorType: ActivatorType;
  activatorMode: ActivatorMode;
  outputKeys: string[];
  description?: string;
}
