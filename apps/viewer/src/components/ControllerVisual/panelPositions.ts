/**
 * Spatial layout constants for the Controller Visual "reference poster" view.
 *
 * Positions are defined in absolute px coordinates within a fixed-size canvas.
 * The controller illustration sits centered, and binding panels radiate outward.
 *
 * Canvas is designed to auto-fit within a 1920x1080 viewport via zoom-to-fit.
 *
 * Layout grid:
 *   Col A (x=0-240):    far-left, anchor=right at x=250
 *   Col B (x=260-500):  inner-left, anchor=left at x=260
 *   Col C (x=330-570):  mid-left, anchor=right at x=570   (just left of controller)
 *   Controller zone:    x=590-1110, y=160-600
 *   Col D (x=1130-1370): mid-right, anchor=left at x=1130 (just right of controller)
 *   Col E (x=1200-1440): inner-right, anchor=right at x=1440
 *   Col F (x=1460-1700): far-right, anchor=left at x=1460
 *
 * Panel heights (max-h-36=144px content + 20px header = 164px):
 *   Large (10+ entries): ~164px (scrollable)
 *   Medium (5-9):        ~90-140px
 *   Small (1-4):         ~33-70px
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

/** Canvas dimensions for the poster layout — generous to give force layout room */
export const CANVAS_WIDTH = 2400;
export const CANVAS_HEIGHT = 1800;

/** Controller illustration center point (px within canvas) */
export const CONTROLLER_CENTER = { x: 1200, y: 550 };

/** Controller illustration size */
export const CONTROLLER_WIDTH = 520;
export const CONTROLLER_HEIGHT = Math.round(520 * (630 / 750));

/** Controller SVG viewBox dimensions (the illustration uses these coordinates) */
export const SVG_VIEWBOX = { width: 600, height: 400 };

/** Panel width constraint — wider for better readability */
export const PANEL_WIDTH = 280;

// Vertical spacing helper: small=35, medium=100, large=170
// Controller exclusion zone: x=600-1100, y=155-605

/**
 * Ideal positions for panels — used as targets for the d3-force simulation.
 * The force layout will adjust these to prevent overlap while keeping panels
 * near their logical group region.
 *
 * Left-side panels use anchor='right' (leader line exits from right edge).
 * Right-side panels use anchor='left' (leader line exits from left edge).
 *
 * With canvas 2400x1800 and controller at (1200,550):
 *   Left zone:  x=0–620 (far left), x=620–920 (inner left)
 *   Controller: x=940–1460, y=290–810
 *   Right zone: x=1480–1780 (inner right), x=1780–2400 (far right)
 *   Bottom:     y=820–1800
 */
export const PANEL_POSITIONS: Record<string, PanelPosition> = {
  // ═══════════════════════════════════════════════════════
  // LEFT SIDE — far left and inner left
  // ═══════════════════════════════════════════════════════

  // Left Stick Directions
  LSUp:    { button: 'LSUp',    x: 290,  y: 10,   anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-left' },
  LSLeft:  { button: 'LSLeft',  x: 290,  y: 200,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-left' },
  LSDown:  { button: 'LSDown',  x: 290,  y: 400,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-left' },
  LSRight: { button: 'LSRight', x: 300,  y: 200,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-left' },

  // Axis panels
  LSX:     { button: 'LSX',     x: 290,  y: 580,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'axis' },
  LSY:     { button: 'LSY',     x: 300,  y: 400,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },

  // D-Pad
  DpadUp:    { button: 'DpadUp',    x: 290,  y: 700,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'dpad' },
  DpadLeft:  { button: 'DpadLeft',  x: 290,  y: 880,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'dpad' },
  DpadDown:  { button: 'DpadDown',  x: 290,  y: 1200, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'dpad' },
  DpadRight: { button: 'DpadRight', x: 300,  y: 700,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'dpad' },

  // ═══════════════════════════════════════════════════════
  // LEFT-CENTER — inner left, near controller
  // ═══════════════════════════════════════════════════════

  LT:      { button: 'LT',      x: 920,  y: 10,   anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'trigger' },
  LTAxis:  { button: 'LTAxis',  x: 920,  y: 200,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'axis' },
  LB:      { button: 'LB',      x: 920,  y: 320,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'bumper' },

  View:    { button: 'View',    x: 920,  y: 500,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'special' },

  LS:      { button: 'LS',      x: 920,  y: 850,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'special' },
  P1:      { button: 'P1',      x: 920,  y: 1100, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'paddle' },
  P3:      { button: 'P3',      x: 920,  y: 1350, anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'paddle' },

  // ═══════════════════════════════════════════════════════
  // CENTER — above/below controller
  // ═══════════════════════════════════════════════════════

  Xbox:    { button: 'Xbox',    x: 1100, y: 850,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'special' },
  'LT+RT': { button: 'LT+RT',  x: 1100, y: 10,   anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },

  // ═══════════════════════════════════════════════════════
  // RIGHT-CENTER — inner right, near controller
  // ═══════════════════════════════════════════════════════

  RT:      { button: 'RT',      x: 1480, y: 10,   anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'trigger' },
  RTAxis:  { button: 'RTAxis',  x: 1480, y: 200,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },
  RB:      { button: 'RB',      x: 1480, y: 320,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'bumper' },

  Menu:    { button: 'Menu',    x: 1480, y: 500,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'special' },

  RS:      { button: 'RS',      x: 1480, y: 850,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'special' },
  P2:      { button: 'P2',      x: 1480, y: 1100, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'paddle' },
  P4:      { button: 'P4',      x: 1480, y: 1350, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'paddle' },

  // ═══════════════════════════════════════════════════════
  // RIGHT SIDE — far right
  // ═══════════════════════════════════════════════════════

  // Right Stick Directions
  RSUp:    { button: 'RSUp',    x: 2110, y: 10,   anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-right' },
  RSLeft:  { button: 'RSLeft',  x: 2100, y: 200,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-right' },
  RSDown:  { button: 'RSDown',  x: 2110, y: 400,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-right' },
  RSRight: { button: 'RSRight', x: 2110, y: 200,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-right' },

  // Axis panels
  RSX:     { button: 'RSX',     x: 2110, y: 580,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },
  RSY:     { button: 'RSY',     x: 2100, y: 400,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'axis' },

  // Face Buttons
  Y:       { button: 'Y',       x: 2110, y: 700,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'face' },
  X:       { button: 'X',       x: 2100, y: 700,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'face' },
  B:       { button: 'B',       x: 2110, y: 1000, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'face' },
  A:       { button: 'A',       x: 2110, y: 1300, anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'face' },
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
