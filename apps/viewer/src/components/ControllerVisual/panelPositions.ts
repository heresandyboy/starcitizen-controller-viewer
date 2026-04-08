/**
 * Spatial layout constants for the Controller Visual "reference poster" view.
 *
 * Positions are defined in absolute px coordinates within a fixed-size canvas.
 * The controller illustration sits centered, and binding panels radiate outward.
 *
 * Canvas is designed to auto-fit within a 1920x1080 viewport via zoom-to-fit.
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
export const CANVAS_WIDTH = 1700;
export const CANVAS_HEIGHT = 1000;

/** Controller illustration center point (px within canvas) */
export const CONTROLLER_CENTER = { x: 850, y: 400 };

/** Controller illustration size */
export const CONTROLLER_WIDTH = 520;
export const CONTROLLER_HEIGHT = Math.round(520 * (630 / 750));

/** Controller SVG viewBox dimensions (the illustration uses these coordinates) */
export const SVG_VIEWBOX = { width: 600, height: 400 };

/** Panel width constraint */
export const PANEL_WIDTH = 240;

/**
 * All binding panel positions.
 *
 * Layout zones:
 * - Far-left column (x=10, anchor=right): LS directions, D-pad directions
 * - Inner-left column (x=260, anchor=left): LSRight, DpadRight, axis panels
 * - Top-center left (x=380, anchor=right): LT, LB, LTAxis
 * - Top-center right (x=1080, anchor=left): RT, RB, RTAxis
 * - Center (x=560–940): View, Menu, Xbox, LT+RT
 * - Inner-right column (x=1200, anchor=right): RSLeft, X
 * - Far-right column (x=1460, anchor=left): RS directions, face buttons
 * - Bottom: Stick clicks, paddles
 */
export const PANEL_POSITIONS: Record<string, PanelPosition> = {
  // === LEFT STICK DIRECTIONS (top-left) ===
  LSUp:    { button: 'LSUp',    x: 250,  y: 10,   anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-left' },
  LSLeft:  { button: 'LSLeft',  x: 250,  y: 120,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-left' },
  LSDown:  { button: 'LSDown',  x: 250,  y: 230,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-left' },
  LSRight: { button: 'LSRight', x: 260,  y: 120,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-left' },

  // === RIGHT STICK DIRECTIONS (top-right) ===
  RSUp:    { button: 'RSUp',    x: 1460, y: 10,   anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-right' },
  RSLeft:  { button: 'RSLeft',  x: 1200, y: 120,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-right' },
  RSDown:  { button: 'RSDown',  x: 1460, y: 230,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-right' },
  RSRight: { button: 'RSRight', x: 1460, y: 120,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-right' },

  // === D-PAD (left side, below sticks) ===
  DpadUp:    { button: 'DpadUp',    x: 250,  y: 400,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'dpad' },
  DpadLeft:  { button: 'DpadLeft',  x: 250,  y: 510,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'dpad' },
  DpadDown:  { button: 'DpadDown',  x: 250,  y: 680,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'dpad' },
  DpadRight: { button: 'DpadRight', x: 260,  y: 510,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'dpad' },

  // === FACE BUTTONS (right side, below sticks) ===
  Y: { button: 'Y', x: 1460, y: 400,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'face' },
  X: { button: 'X', x: 1200, y: 510,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'face' },
  B: { button: 'B', x: 1460, y: 510,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'face' },
  A: { button: 'A', x: 1460, y: 680,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'face' },

  // === TRIGGERS (top-center) ===
  LT: { button: 'LT', x: 380,  y: 10,   anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'trigger' },
  RT: { button: 'RT', x: 1080, y: 10,   anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'trigger' },

  // === BUMPERS ===
  LB: { button: 'LB', x: 380,  y: 180,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'bumper' },
  RB: { button: 'RB', x: 1080, y: 180,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'bumper' },

  // === SPECIAL BUTTONS (center) ===
  View: { button: 'View', x: 560,  y: 330,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'special' },
  Menu: { button: 'Menu', x: 940,  y: 330,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'special' },
  Xbox: { button: 'Xbox', x: 750,  y: 240,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'special' },

  // === STICK CLICKS (below controller) ===
  LS: { button: 'LS', x: 560,  y: 700,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'special' },
  RS: { button: 'RS', x: 940,  y: 700,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'special' },

  // === PADDLES (bottom) ===
  P1: { button: 'P1', x: 380,  y: 830,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'paddle' },
  P3: { button: 'P3', x: 380,  y: 920,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'paddle' },
  P2: { button: 'P2', x: 1080, y: 830,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'paddle' },
  P4: { button: 'P4', x: 1080, y: 920,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'paddle' },

  // === ANALOG AXES (compact, near parent groups) ===
  LSX:     { button: 'LSX',     x: 250,  y: 340,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'axis' },
  LSY:     { button: 'LSY',     x: 260,  y: 230,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },
  RSX:     { button: 'RSX',     x: 1460, y: 340,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },
  RSY:     { button: 'RSY',     x: 1200, y: 230,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'axis' },
  LTAxis:  { button: 'LTAxis',  x: 380,  y: 110,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'axis' },
  RTAxis:  { button: 'RTAxis',  x: 1080, y: 110,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },
  'LT+RT': { button: 'LT+RT',  x: 750,  y: 110,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },
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
