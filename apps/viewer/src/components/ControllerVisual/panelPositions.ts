/**
 * Spatial layout constants for the Controller Visual "reference poster" view.
 *
 * Positions are defined in absolute px coordinates within a fixed-size canvas.
 * The controller illustration sits centered, and binding panels radiate outward.
 */

export interface PanelPosition {
  /** Controller button key (matches BUTTON_DISPLAY_NAMES keys) */
  button: string;
  /** CSS left offset from canvas origin (px) */
  x: number;
  /** CSS top offset from canvas origin (px) */
  y: number;
  /** Text alignment: panels left of center anchor right, panels right anchor left */
  anchor: 'left' | 'right';
  /** Where the leader line connects on the controller SVG (in SVG viewBox coords) */
  lineTarget: { x: number; y: number };
  /** Visual grouping for styling and layout */
  group: 'stick-left' | 'stick-right' | 'dpad' | 'face' | 'bumper' | 'trigger' | 'special' | 'paddle' | 'axis';
}

/** Canvas dimensions for the poster layout */
export const CANVAS_WIDTH = 2200;
export const CANVAS_HEIGHT = 1500;

/** Controller illustration center point (px within canvas) */
export const CONTROLLER_CENTER = { x: 1100, y: 560 };

/** Controller illustration size */
export const CONTROLLER_WIDTH = 700;
export const CONTROLLER_HEIGHT = Math.round(700 * (630 / 750));

/** Controller SVG viewBox dimensions (the illustration uses these coordinates) */
export const SVG_VIEWBOX = { width: 600, height: 400 };

/** Panel width constraint */
export const PANEL_WIDTH = 300;

/**
 * All binding panel positions.
 *
 * Layout zones (matching the reference image):
 * - Top-left: Left Stick directions (4 panels around LS icon)
 * - Top-right: Right Stick directions (4 panels around RS icon)
 * - Left: D-pad directions (4 panels)
 * - Right: Face buttons (A, B, X, Y)
 * - Top-center: Triggers and bumpers
 * - Center: Special buttons (Menu, View, Xbox)
 * - Bottom: Paddles and stick clicks
 */
export const PANEL_POSITIONS: Record<string, PanelPosition> = {
  // === LEFT STICK DIRECTIONS (top-left) ===
  LSUp:    { button: 'LSUp',    x: 10,  y: 20,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-left' },
  LSDown:  { button: 'LSDown',  x: 10,  y: 380, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-left' },
  LSLeft:  { button: 'LSLeft',  x: 10,  y: 190, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-left' },
  LSRight: { button: 'LSRight', x: 370, y: 190, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-left' },

  // === RIGHT STICK DIRECTIONS (top-right) ===
  RSUp:    { button: 'RSUp',    x: 1900, y: 20,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-right' },
  RSDown:  { button: 'RSDown',  x: 1900, y: 380, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-right' },
  RSLeft:  { button: 'RSLeft',  x: 1590, y: 190, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-right' },
  RSRight: { button: 'RSRight', x: 1900, y: 190, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-right' },

  // === D-PAD (left side) ===
  DpadUp:    { button: 'DpadUp',    x: 10,  y: 560, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'dpad' },
  DpadDown:  { button: 'DpadDown',  x: 10,  y: 880, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'dpad' },
  DpadLeft:  { button: 'DpadLeft',  x: 10,  y: 720, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'dpad' },
  DpadRight: { button: 'DpadRight', x: 370, y: 720, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'dpad' },

  // === FACE BUTTONS (right side) ===
  Y: { button: 'Y', x: 1900, y: 560, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'face' },
  X: { button: 'X', x: 1590, y: 720, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'face' },
  B: { button: 'B', x: 1900, y: 720, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'face' },
  A: { button: 'A', x: 1900, y: 880, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'face' },

  // === TRIGGERS (top) ===
  LT: { button: 'LT', x: 500,  y: 20,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'trigger' },
  RT: { button: 'RT', x: 1400, y: 20,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'trigger' },

  // === BUMPERS ===
  LB: { button: 'LB', x: 500,  y: 250, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'bumper' },
  RB: { button: 'RB', x: 1400, y: 250, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'bumper' },

  // === SPECIAL BUTTONS ===
  View: { button: 'View', x: 700,  y: 430, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'special' },
  Menu: { button: 'Menu', x: 1200, y: 430, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'special' },
  Xbox: { button: 'Xbox', x: 950,  y: 330, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'special' },

  // === STICK CLICKS ===
  LS: { button: 'LS', x: 700,  y: 1020, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'special' },
  RS: { button: 'RS', x: 1200, y: 1020, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'special' },

  // === PADDLES ===
  P1: { button: 'P1', x: 500,  y: 1150, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'paddle' },
  P3: { button: 'P3', x: 500,  y: 1300, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'paddle' },
  P2: { button: 'P2', x: 1400, y: 1150, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'paddle' },
  P4: { button: 'P4', x: 1400, y: 1300, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'paddle' },

  // === ANALOG AXES (native SC gamepad bindings) ===
  // Left Stick axes — below stick direction panels
  LSX: { button: 'LSX', x: 10,  y: 510, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'axis' },
  LSY: { button: 'LSY', x: 370, y: 380, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },
  // Right Stick axes — below stick direction panels
  RSX: { button: 'RSX', x: 1900, y: 510, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },
  RSY: { button: 'RSY', x: 1590, y: 380, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'axis' },
  // Trigger axes — next to trigger panels
  LTAxis: { button: 'LTAxis', x: 500,  y: 140, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'axis' },
  RTAxis: { button: 'RTAxis', x: 1400, y: 140, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },
  // Both triggers combo
  'LT+RT': { button: 'LT+RT', x: 950, y: 140, anchor: 'left', lineTarget: { x: 0, y: 0 }, group: 'axis' },
};

/** All button keys that have panel positions */
export const PANEL_BUTTONS = Object.keys(PANEL_POSITIONS);

/** Group all positions by their group for styling */
export function getPanelsByGroup(): Record<string, PanelPosition[]> {
  const groups: Record<string, PanelPosition[]> = {};
  for (const pos of Object.values(PANEL_POSITIONS)) {
    (groups[pos.group] ??= []).push(pos);
  }
  return groups;
}
