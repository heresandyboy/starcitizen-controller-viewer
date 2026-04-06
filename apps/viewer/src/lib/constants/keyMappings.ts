/**
 * Cross-system key mappings
 *
 * Maps between reWASD output names and Star Citizen XML input names.
 * Used by the chain resolver to connect reWASD macro outputs to SC bindings.
 *
 * Plan: docs/plan/03-key-mappings.md
 * Beads: controller-1uy
 */

// ---------------------------------------------------------------------------
// DIK Key Name → SC Keyboard Key Name (kb1_*)
// ---------------------------------------------------------------------------

/**
 * Maps human-readable key names (from dikKeys.ts) to SC XML keyboard key
 * names (the part after "kb1_"). For example, 'Insert' → 'insert' means
 * the SC binding would be "kb1_insert".
 *
 * Most keys are just lowercased, but numpad keys use "np_" prefix and
 * some keys have different SC names.
 */
export const KEY_TO_SC_KEYBOARD: Record<string, string> = {
  // Letters (lowercase in SC)
  'A': 'a', 'B': 'b', 'C': 'c', 'D': 'd', 'E': 'e',
  'F': 'f', 'G': 'g', 'H': 'h', 'I': 'i', 'J': 'j',
  'K': 'k', 'L': 'l', 'M': 'm', 'N': 'n', 'O': 'o',
  'P': 'p', 'Q': 'q', 'R': 'r', 'S': 's', 'T': 't',
  'U': 'u', 'V': 'v', 'W': 'w', 'X': 'x', 'Y': 'y',
  'Z': 'z',

  // Number row
  '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
  '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',

  // Function keys
  'F1': 'f1', 'F2': 'f2', 'F3': 'f3', 'F4': 'f4',
  'F5': 'f5', 'F6': 'f6', 'F7': 'f7', 'F8': 'f8',
  'F9': 'f9', 'F10': 'f10', 'F11': 'f11', 'F12': 'f12',

  // Modifiers
  'LShift': 'lshift',
  'RShift': 'rshift',
  'LCtrl': 'lctrl',
  'RCtrl': 'rctrl',
  'LAlt': 'lalt',
  'RAlt': 'ralt',

  // Navigation
  'Insert': 'insert',
  'Delete': 'delete',
  'Home': 'home',
  'End': 'end',
  'PgUp': 'pgup',
  'PgDn': 'pgdn',
  'Up': 'up',
  'Down': 'down',
  'Left': 'left',
  'Right': 'right',

  // Special keys
  'Space': 'space',
  'Enter': 'return',
  'Esc': 'escape',
  'Backspace': 'backspace',
  'Tab': 'tab',
  'CapsLock': 'capslock',

  // Punctuation
  '-': 'minus',
  '=': 'equals',
  '[': 'lbracket',
  ']': 'rbracket',
  ';': 'semicolon',
  "'": 'apostrophe',
  '`': 'grave',
  '\\': 'backslash',
  ',': 'comma',
  '.': 'period',
  '/': 'slash',

  // Numpad
  'Num0': 'np_0', 'Num1': 'np_1', 'Num2': 'np_2', 'Num3': 'np_3',
  'Num4': 'np_4', 'Num5': 'np_5', 'Num6': 'np_6', 'Num7': 'np_7',
  'Num8': 'np_8', 'Num9': 'np_9',
  'NumPlus': 'np_add',
  'NumMinus': 'np_subtract',
  'NumMult': 'np_multiply',
  'NumDiv': 'np_divide',
  'NumDot': 'np_period',
  'NumEnter': 'np_enter',
  'NumLock': 'numlock',

  // Other
  'ScrollLock': 'scrolllock',
  'Pause': 'pause',
  'PrintScreen': 'printscreen',
  'LWin': 'lwin',
  'RWin': 'rwin',
  'Apps': 'apps',
};

/**
 * Convert a human-readable key name to SC XML keyboard key format.
 * Returns the key part only (without "kb1_" prefix).
 * Returns undefined if no mapping exists.
 */
export function keyToScKeyboard(keyName: string): string | undefined {
  return KEY_TO_SC_KEYBOARD[keyName];
}

/**
 * Convert a human-readable key name to the full SC XML input string
 * (e.g., "Insert" → "kb1_insert").
 */
export function keyToScKeyboardFull(keyName: string): string | undefined {
  const sc = KEY_TO_SC_KEYBOARD[keyName];
  return sc ? `kb1_${sc}` : undefined;
}

// ---------------------------------------------------------------------------
// reWASD Gamepad Output → SC Gamepad Key Name (gp1_*)
// ---------------------------------------------------------------------------

/**
 * Maps reWASD gamepad output button IDs (from macro steps) to SC XML gamepad
 * key names (the part after "gp1_").
 *
 * These are the buttons that reWASD *outputs* in macros (virtual gamepad),
 * not the physical buttons being pressed on the controller.
 */
export const REWASD_GP_OUTPUT_TO_SC: Record<number, string> = {
  // Face buttons
  1: 'a',
  2: 'b',
  3: 'x',
  4: 'y',

  // Bumpers
  5: 'shoulderl',
  6: 'shoulderr',

  // Stick clicks
  9: 'thumbl',
  10: 'thumbr',

  // D-Pad
  33: 'dpad_up',
  34: 'dpad_down',
  35: 'dpad_left',
  36: 'dpad_right',

  // Left stick zones (SC uses axis names)
  40: 'thumbly',       // LeftStickUp → Y axis
  41: 'thumbly',       // LeftStickDown → Y axis (negative)
  42: 'thumblx',       // LeftStickLeft → X axis (negative)
  43: 'thumblx',       // LeftStickRight → X axis

  // Right stick zones (SC uses axis names)
  47: 'thumbry',       // RightStickUp → Y axis
  48: 'thumbry',       // RightStickDown → Y axis (negative)
  49: 'thumbrx',       // RightStickLeft → X axis (negative)
  50: 'thumbrx',       // RightStickRight → X axis

  // Triggers (as buttons)
  51: 'triggerl_btn',
  55: 'triggerr_btn',
};

/**
 * Maps reWASD gamepad output button IDs to human-readable names for display.
 */
export const REWASD_GP_OUTPUT_NAMES: Record<number, string> = {
  1: 'A', 2: 'B', 3: 'X', 4: 'Y',
  5: 'LB', 6: 'RB',
  9: 'LS', 10: 'RS',
  33: 'DpadUp', 34: 'DpadDown', 35: 'DpadLeft', 36: 'DpadRight',
  40: 'LeftStickUp', 41: 'LeftStickDown', 42: 'LeftStickLeft', 43: 'LeftStickRight',
  47: 'RightStickUp', 48: 'RightStickDown', 49: 'RightStickLeft', 50: 'RightStickRight',
  51: 'LT', 55: 'RT',
};

/**
 * Convert a reWASD gamepad output button ID to the full SC XML input string
 * (e.g., 33 → "gp1_dpad_up").
 */
export function rewasdGpOutputToScFull(buttonId: number): string | undefined {
  const sc = REWASD_GP_OUTPUT_TO_SC[buttonId];
  return sc ? `gp1_${sc}` : undefined;
}
