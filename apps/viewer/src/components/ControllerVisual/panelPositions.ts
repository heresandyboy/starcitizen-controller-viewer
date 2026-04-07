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
  group: 'stick-left' | 'stick-right' | 'dpad' | 'face' | 'bumper' | 'trigger' | 'special' | 'paddle';
}

/** Canvas dimensions for the poster layout */
export const CANVAS_WIDTH = 2600;
export const CANVAS_HEIGHT = 1800;

/** Controller illustration center point (px within canvas) */
export const CONTROLLER_CENTER = { x: 1300, y: 680 };

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
  // === LEFT STICK DIRECTIONS (top-left quadrant) ===
  LSUp: {
    button: 'LSUp',
    x: 20, y: 20,
    anchor: 'right',
    lineTarget: { x: 150, y: 108 },
    group: 'stick-left',
  },
  LSDown: {
    button: 'LSDown',
    x: 20, y: 480,
    anchor: 'right',
    lineTarget: { x: 150, y: 148 },
    group: 'stick-left',
  },
  LSLeft: {
    button: 'LSLeft',
    x: 20, y: 230,
    anchor: 'right',
    lineTarget: { x: 130, y: 128 },
    group: 'stick-left',
  },
  LSRight: {
    button: 'LSRight',
    x: 420, y: 230,
    anchor: 'left',
    lineTarget: { x: 170, y: 128 },
    group: 'stick-left',
  },

  // === RIGHT STICK DIRECTIONS (top-right quadrant) ===
  RSUp: {
    button: 'RSUp',
    x: 2290, y: 20,
    anchor: 'left',
    lineTarget: { x: 390, y: 240 },
    group: 'stick-right',
  },
  RSDown: {
    button: 'RSDown',
    x: 2290, y: 480,
    anchor: 'left',
    lineTarget: { x: 390, y: 280 },
    group: 'stick-right',
  },
  RSLeft: {
    button: 'RSLeft',
    x: 1970, y: 230,
    anchor: 'right',
    lineTarget: { x: 370, y: 260 },
    group: 'stick-right',
  },
  RSRight: {
    button: 'RSRight',
    x: 2290, y: 230,
    anchor: 'left',
    lineTarget: { x: 410, y: 260 },
    group: 'stick-right',
  },

  // === D-PAD (left side, mid-height) ===
  DpadUp: {
    button: 'DpadUp',
    x: 20, y: 720,
    anchor: 'right',
    lineTarget: { x: 180, y: 150 },
    group: 'dpad',
  },
  DpadDown: {
    button: 'DpadDown',
    x: 20, y: 1120,
    anchor: 'right',
    lineTarget: { x: 180, y: 206 },
    group: 'dpad',
  },
  DpadLeft: {
    button: 'DpadLeft',
    x: 20, y: 920,
    anchor: 'right',
    lineTarget: { x: 152, y: 178 },
    group: 'dpad',
  },
  DpadRight: {
    button: 'DpadRight',
    x: 420, y: 920,
    anchor: 'left',
    lineTarget: { x: 208, y: 178 },
    group: 'dpad',
  },

  // === FACE BUTTONS (right side, mid-height) ===
  Y: {
    button: 'Y',
    x: 2290, y: 720,
    anchor: 'left',
    lineTarget: { x: 430, y: 125 },
    group: 'face',
  },
  X: {
    button: 'X',
    x: 1970, y: 920,
    anchor: 'right',
    lineTarget: { x: 398, y: 155 },
    group: 'face',
  },
  B: {
    button: 'B',
    x: 2290, y: 920,
    anchor: 'left',
    lineTarget: { x: 462, y: 155 },
    group: 'face',
  },
  A: {
    button: 'A',
    x: 2290, y: 1120,
    anchor: 'left',
    lineTarget: { x: 430, y: 185 },
    group: 'face',
  },

  // === TRIGGERS (top, flanking center) ===
  LT: {
    button: 'LT',
    x: 640, y: 20,
    anchor: 'right',
    lineTarget: { x: 150, y: 30 },
    group: 'trigger',
  },
  RT: {
    button: 'RT',
    x: 1660, y: 20,
    anchor: 'left',
    lineTarget: { x: 450, y: 30 },
    group: 'trigger',
  },

  // === BUMPERS (above controller, flanking center) ===
  LB: {
    button: 'LB',
    x: 640, y: 300,
    anchor: 'right',
    lineTarget: { x: 150, y: 62 },
    group: 'bumper',
  },
  RB: {
    button: 'RB',
    x: 1660, y: 300,
    anchor: 'left',
    lineTarget: { x: 450, y: 62 },
    group: 'bumper',
  },

  // === SPECIAL BUTTONS (center area) ===
  View: {
    button: 'View',
    x: 840, y: 560,
    anchor: 'right',
    lineTarget: { x: 260, y: 105 },
    group: 'special',
  },
  Menu: {
    button: 'Menu',
    x: 1460, y: 560,
    anchor: 'left',
    lineTarget: { x: 340, y: 105 },
    group: 'special',
  },
  Xbox: {
    button: 'Xbox',
    x: 1150, y: 400,
    anchor: 'left',
    lineTarget: { x: 300, y: 75 },
    group: 'special',
  },

  // === STICK CLICKS (below special, above paddles) ===
  LS: {
    button: 'LS',
    x: 840, y: 1200,
    anchor: 'right',
    lineTarget: { x: 150, y: 128 },
    group: 'special',
  },
  RS: {
    button: 'RS',
    x: 1460, y: 1200,
    anchor: 'left',
    lineTarget: { x: 390, y: 260 },
    group: 'special',
  },

  // === PADDLES (bottom) ===
  P1: {
    button: 'P1',
    x: 640, y: 1400,
    anchor: 'right',
    lineTarget: { x: 175, y: 320 },
    group: 'paddle',
  },
  P3: {
    button: 'P3',
    x: 640, y: 1560,
    anchor: 'right',
    lineTarget: { x: 215, y: 350 },
    group: 'paddle',
  },
  P2: {
    button: 'P2',
    x: 1660, y: 1400,
    anchor: 'left',
    lineTarget: { x: 425, y: 320 },
    group: 'paddle',
  },
  P4: {
    button: 'P4',
    x: 1660, y: 1560,
    anchor: 'left',
    lineTarget: { x: 385, y: 350 },
    group: 'paddle',
  },
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
