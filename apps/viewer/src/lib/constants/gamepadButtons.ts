/**
 * Gamepad button mappings for reWASD
 * Maps reWASD button IDs to human-readable button names
 */

// reWASD button ID to button name
export const REWASD_BUTTONS: Record<number, string> = {
  // Face buttons
  1: 'A',
  2: 'B',
  3: 'X',
  4: 'Y',

  // Bumpers
  5: 'LB',
  6: 'RB',

  // Special buttons
  7: 'View',
  8: 'Menu',
  9: 'LS',      // Left Stick Click
  10: 'RS',     // Right Stick Click
  11: 'Xbox',

  // Xbox Elite Paddles
  29: 'P1',     // Left Upper Paddle
  30: 'P2',     // Right Upper Paddle
  31: 'P3',     // Left Lower Paddle
  32: 'P4',     // Right Lower Paddle

  // D-Pad
  33: 'DpadUp',
  34: 'DpadDown',
  35: 'DpadLeft',
  36: 'DpadRight',

  // Left Stick Zones (directional)
  37: 'LSUp',
  38: 'LSDown',
  39: 'LSLeft',
  40: 'LSRight',
  41: 'LSUpLeft',
  42: 'LSUpRight',

  // Triggers (as buttons)
  51: 'LT',
  52: 'RT',

  // Right Stick Zones
  113: 'RSUp',
  114: 'RSDown',
  115: 'RSLeft',
  116: 'RSRight',
};

// Reverse lookup: button name to ID
export const REWASD_BUTTON_IDS: Record<string, number> = Object.entries(REWASD_BUTTONS)
  .reduce((acc, [id, name]) => {
    acc[name] = parseInt(id, 10);
    return acc;
  }, {} as Record<string, number>);

// Human-readable button names with descriptions
export const BUTTON_DISPLAY_NAMES: Record<string, string> = {
  'A': 'A Button',
  'B': 'B Button',
  'X': 'X Button',
  'Y': 'Y Button',
  'LB': 'Left Bumper',
  'RB': 'Right Bumper',
  'LT': 'Left Trigger',
  'RT': 'Right Trigger',
  'View': 'View Button',
  'Menu': 'Menu Button',
  'LS': 'Left Stick Click',
  'RS': 'Right Stick Click',
  'Xbox': 'Xbox Button',
  'P1': 'Upper Left Paddle',
  'P2': 'Upper Right Paddle',
  'P3': 'Lower Left Paddle',
  'P4': 'Lower Right Paddle',
  'DpadUp': 'D-Pad Up',
  'DpadDown': 'D-Pad Down',
  'DpadLeft': 'D-Pad Left',
  'DpadRight': 'D-Pad Right',
  'LSUp': 'Left Stick Up',
  'LSDown': 'Left Stick Down',
  'LSLeft': 'Left Stick Left',
  'LSRight': 'Left Stick Right',
  'RSUp': 'Right Stick Up',
  'RSDown': 'Right Stick Down',
  'RSLeft': 'Right Stick Left',
  'RSRight': 'Right Stick Right',
};

// Standard Gamepad API button indices (for browser Gamepad API)
export const GAMEPAD_API_BUTTONS: Record<number, string> = {
  0: 'A',
  1: 'B',
  2: 'X',
  3: 'Y',
  4: 'LB',
  5: 'RB',
  6: 'LT',
  7: 'RT',
  8: 'View',
  9: 'Menu',
  10: 'LS',
  11: 'RS',
  12: 'DpadUp',
  13: 'DpadDown',
  14: 'DpadLeft',
  15: 'DpadRight',
  16: 'Xbox',
  // Xbox Elite paddles may appear at indices 17-20
  17: 'P1',
  18: 'P2',
  19: 'P3',
  20: 'P4',
};

/**
 * Convert a reWASD button ID to a human-readable name
 */
export function rewasdButtonToName(buttonId: number): string {
  return REWASD_BUTTONS[buttonId] ?? `Button${buttonId}`;
}

/**
 * Get the display name for a button
 */
export function getButtonDisplayName(buttonName: string): string {
  return BUTTON_DISPLAY_NAMES[buttonName] ?? buttonName;
}

/**
 * Parse a reWASD button description string (e.g., "XB: A", "DpadUp")
 */
export function parseRewasdButtonDescription(description: string): string {
  // Remove "XB: " prefix if present
  const cleaned = description.replace(/^XB:\s*/, '').trim();

  // Map common variations
  const mappings: Record<string, string> = {
    'A': 'A',
    'B': 'B',
    'X': 'X',
    'Y': 'Y',
    'LB': 'LB',
    'RB': 'RB',
    'LT': 'LT',
    'RT': 'RT',
    'View': 'View',
    'Menu': 'Menu',
    'LS': 'LS',
    'RS': 'RS',
    'Left Stick': 'LS',
    'Right Stick': 'RS',
    'Xbox': 'Xbox',
    'Guide': 'Xbox',
    'DpadUp': 'DpadUp',
    'DpadDown': 'DpadDown',
    'DpadLeft': 'DpadLeft',
    'DpadRight': 'DpadRight',
    'Dpad Up': 'DpadUp',
    'Dpad Down': 'DpadDown',
    'Dpad Left': 'DpadLeft',
    'Dpad Right': 'DpadRight',
  };

  return mappings[cleaned] ?? cleaned;
}
