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

/** Canvas dimensions for the poster layout */
export const CANVAS_WIDTH = 1700;
export const CANVAS_HEIGHT = 1150;

/** Controller illustration center point (px within canvas) */
export const CONTROLLER_CENTER = { x: 850, y: 400 };

/** Controller illustration size */
export const CONTROLLER_WIDTH = 480;
export const CONTROLLER_HEIGHT = Math.round(480 * (630 / 750));

/** Controller SVG viewBox dimensions (the illustration uses these coordinates) */
export const SVG_VIEWBOX = { width: 600, height: 400 };

/** Panel width constraint */
export const PANEL_WIDTH = 240;

// Vertical spacing helper: small=35, medium=100, large=170
// Controller exclusion zone: x=600-1100, y=155-605

export const PANEL_POSITIONS: Record<string, PanelPosition> = {
  // ═══════════════════════════════════════════════════════
  // LEFT SIDE — Columns A (far) and B (inner)
  // ═══════════════════════════════════════════════════════

  // Left Stick Directions — Col A, top section
  // (LSUp 4 entries ~70px, LSLeft/LSRight 5 entries ~85px, LSDown 5 entries ~85px)
  LSUp:    { button: 'LSUp',    x: 250,  y: 5,    anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-left' },
  LSLeft:  { button: 'LSLeft',  x: 250,  y: 80,   anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-left' },
  LSDown:  { button: 'LSDown',  x: 250,  y: 170,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-left' },
  LSRight: { button: 'LSRight', x: 260,  y: 80,   anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-left' },

  // Axis panels — Col A/B, below stick directions
  LSX:     { button: 'LSX',     x: 250,  y: 260,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'axis' },
  LSY:     { button: 'LSY',     x: 260,  y: 170,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },

  // D-Pad — Col A, mid section
  // (DpadUp 6 entries ~100px, DpadLeft 14 entries ~164px, DpadDown 12 ~164px, DpadRight 11 ~164px)
  DpadUp:    { button: 'DpadUp',    x: 250,  y: 310,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'dpad' },
  DpadLeft:  { button: 'DpadLeft',  x: 250,  y: 415,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'dpad' },
  DpadDown:  { button: 'DpadDown',  x: 250,  y: 585,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'dpad' },
  DpadRight: { button: 'DpadRight', x: 260,  y: 310,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'dpad' },

  // ═══════════════════════════════════════════════════════
  // LEFT-CENTER — Col C (next to controller)
  // ═══════════════════════════════════════════════════════

  // Triggers & Bumpers — Col C, top
  LT:      { button: 'LT',      x: 570,  y: 5,    anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'trigger' },
  LTAxis:  { button: 'LTAxis',  x: 570,  y: 115,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'axis' },
  LB:      { button: 'LB',      x: 570,  y: 155,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'bumper' },

  // Special buttons — Col C, center
  View:    { button: 'View',    x: 570,  y: 325,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'special' },

  // Stick clicks & paddles — Col C, bottom
  LS:      { button: 'LS',      x: 570,  y: 620,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'special' },
  P1:      { button: 'P1',      x: 570,  y: 790,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'paddle' },
  P3:      { button: 'P3',      x: 570,  y: 960,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'paddle' },

  // ═══════════════════════════════════════════════════════
  // CENTER — above/below controller
  // ═══════════════════════════════════════════════════════

  Xbox:    { button: 'Xbox',    x: 730,  y: 620,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'special' },
  'LT+RT': { button: 'LT+RT',  x: 730,  y: 5,    anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },

  // ═══════════════════════════════════════════════════════
  // RIGHT-CENTER — Col D (next to controller)
  // ═══════════════════════════════════════════════════════

  RT:      { button: 'RT',      x: 1130, y: 5,    anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'trigger' },
  RTAxis:  { button: 'RTAxis',  x: 1130, y: 115,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },
  RB:      { button: 'RB',      x: 1130, y: 155,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'bumper' },

  Menu:    { button: 'Menu',    x: 1130, y: 325,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'special' },

  RS:      { button: 'RS',      x: 1130, y: 620,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'special' },
  P2:      { button: 'P2',      x: 1130, y: 790,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'paddle' },
  P4:      { button: 'P4',      x: 1130, y: 960,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'paddle' },

  // ═══════════════════════════════════════════════════════
  // RIGHT SIDE — Columns E (inner) and F (far)
  // ═══════════════════════════════════════════════════════

  // Right Stick Directions — Col F, top section
  RSUp:    { button: 'RSUp',    x: 1460, y: 5,    anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-right' },
  RSLeft:  { button: 'RSLeft',  x: 1440, y: 80,   anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'stick-right' },
  RSDown:  { button: 'RSDown',  x: 1460, y: 170,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-right' },
  RSRight: { button: 'RSRight', x: 1460, y: 80,   anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'stick-right' },

  // Axis panels
  RSX:     { button: 'RSX',     x: 1460, y: 260,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'axis' },
  RSY:     { button: 'RSY',     x: 1440, y: 170,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'axis' },

  // Face Buttons — Col F, mid section
  // (Y 8 entries ~130px, X 13 ~164px, B 14 ~164px, A 14 ~164px)
  Y:       { button: 'Y',       x: 1460, y: 310,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'face' },
  X:       { button: 'X',       x: 1440, y: 310,  anchor: 'right', lineTarget: { x: 0, y: 0 }, group: 'face' },
  B:       { button: 'B',       x: 1460, y: 480,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'face' },
  A:       { button: 'A',       x: 1460, y: 650,  anchor: 'left',  lineTarget: { x: 0, y: 0 }, group: 'face' },
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
