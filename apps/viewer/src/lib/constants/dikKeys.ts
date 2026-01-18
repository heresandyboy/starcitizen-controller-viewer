/**
 * DirectInput Key (DIK) code mappings
 * Maps DIK codes (used by reWASD) to human-readable key names
 */

// DIK button ID to key name
export const DIK_CODES: Record<number, string> = {
  // Number row
  2: '1',
  3: '2',
  4: '3',
  5: '4',
  6: '5',
  7: '6',
  8: '7',
  9: '8',
  10: '9',
  11: '0',
  12: '-',
  13: '=',
  14: 'Backspace',

  // Top row (QWERTY)
  15: 'Tab',
  16: 'Q',
  17: 'W',
  18: 'E',
  19: 'R',
  20: 'T',
  21: 'Y',
  22: 'U',
  23: 'I',
  24: 'O',
  25: 'P',
  26: '[',
  27: ']',
  28: 'Enter',

  // Middle row (ASDF)
  29: 'LCtrl',
  30: 'A',
  31: 'S',
  32: 'D',
  33: 'F',
  34: 'G',
  35: 'H',
  36: 'J',
  37: 'K',
  38: 'L',
  39: ';',
  40: "'",
  41: '`',
  42: 'LShift',
  43: '\\',

  // Bottom row (ZXCV)
  44: 'Z',
  45: 'X',
  46: 'C',
  47: 'V',
  48: 'B',
  49: 'N',
  50: 'M',
  51: ',',
  52: '.',
  53: '/',
  54: 'RShift',

  // Modifiers and special keys
  55: 'NumMult',
  56: 'LAlt',
  57: 'Space',
  58: 'CapsLock',

  // Function keys
  59: 'F1',
  60: 'F2',
  61: 'F3',
  62: 'F4',
  63: 'F5',
  64: 'F6',
  65: 'F7',
  66: 'F8',
  67: 'F9',
  68: 'F10',

  // Numpad
  69: 'NumLock',
  70: 'ScrollLock',
  71: 'Num7',
  72: 'Num8',
  73: 'Num9',
  74: 'NumMinus',
  75: 'Num4',
  76: 'Num5',
  77: 'Num6',
  78: 'NumPlus',
  79: 'Num1',
  80: 'Num2',
  81: 'Num3',
  82: 'Num0',
  83: 'NumDot',

  // Extended function keys
  87: 'F11',
  88: 'F12',

  // Extended keys
  156: 'NumEnter',
  157: 'RCtrl',
  181: 'NumDiv',
  183: 'PrintScreen',
  184: 'RAlt',
  197: 'Pause',
  199: 'Home',
  200: 'Up',
  201: 'PgUp',
  203: 'Left',
  205: 'Right',
  207: 'End',
  208: 'Down',
  209: 'PgDn',
  210: 'Insert',
  211: 'Delete',
  219: 'LWin',
  220: 'RWin',
  221: 'Apps',
};

// DIK description string to key name (e.g., "DIK_F7" -> "F7")
export const DIK_NAMES: Record<string, string> = {
  // Numbers
  'DIK_1': '1',
  'DIK_2': '2',
  'DIK_3': '3',
  'DIK_4': '4',
  'DIK_5': '5',
  'DIK_6': '6',
  'DIK_7': '7',
  'DIK_8': '8',
  'DIK_9': '9',
  'DIK_0': '0',

  // Letters
  'DIK_A': 'A',
  'DIK_B': 'B',
  'DIK_C': 'C',
  'DIK_D': 'D',
  'DIK_E': 'E',
  'DIK_F': 'F',
  'DIK_G': 'G',
  'DIK_H': 'H',
  'DIK_I': 'I',
  'DIK_J': 'J',
  'DIK_K': 'K',
  'DIK_L': 'L',
  'DIK_M': 'M',
  'DIK_N': 'N',
  'DIK_O': 'O',
  'DIK_P': 'P',
  'DIK_Q': 'Q',
  'DIK_R': 'R',
  'DIK_S': 'S',
  'DIK_T': 'T',
  'DIK_U': 'U',
  'DIK_V': 'V',
  'DIK_W': 'W',
  'DIK_X': 'X',
  'DIK_Y': 'Y',
  'DIK_Z': 'Z',

  // Function keys
  'DIK_F1': 'F1',
  'DIK_F2': 'F2',
  'DIK_F3': 'F3',
  'DIK_F4': 'F4',
  'DIK_F5': 'F5',
  'DIK_F6': 'F6',
  'DIK_F7': 'F7',
  'DIK_F8': 'F8',
  'DIK_F9': 'F9',
  'DIK_F10': 'F10',
  'DIK_F11': 'F11',
  'DIK_F12': 'F12',

  // Modifiers
  'DIK_LSHIFT': 'LShift',
  'DIK_RSHIFT': 'RShift',
  'DIK_LCONTROL': 'LCtrl',
  'DIK_RCONTROL': 'RCtrl',
  'DIK_LMENU': 'LAlt',
  'DIK_RMENU': 'RAlt',
  'DIK_LWIN': 'LWin',
  'DIK_RWIN': 'RWin',

  // Special keys
  'DIK_SPACE': 'Space',
  'DIK_RETURN': 'Enter',
  'DIK_ESCAPE': 'Esc',
  'DIK_BACK': 'Backspace',
  'DIK_TAB': 'Tab',
  'DIK_CAPITAL': 'CapsLock',

  // Navigation
  'DIK_INSERT': 'Insert',
  'DIK_DELETE': 'Delete',
  'DIK_HOME': 'Home',
  'DIK_END': 'End',
  'DIK_PRIOR': 'PgUp',
  'DIK_NEXT': 'PgDn',
  'DIK_UP': 'Up',
  'DIK_DOWN': 'Down',
  'DIK_LEFT': 'Left',
  'DIK_RIGHT': 'Right',

  // Numpad
  'DIK_NUMPAD0': 'Num0',
  'DIK_NUMPAD1': 'Num1',
  'DIK_NUMPAD2': 'Num2',
  'DIK_NUMPAD3': 'Num3',
  'DIK_NUMPAD4': 'Num4',
  'DIK_NUMPAD5': 'Num5',
  'DIK_NUMPAD6': 'Num6',
  'DIK_NUMPAD7': 'Num7',
  'DIK_NUMPAD8': 'Num8',
  'DIK_NUMPAD9': 'Num9',
  'DIK_NUMPADENTER': 'NumEnter',
  'DIK_NUMPADPLUS': 'NumPlus',
  'DIK_NUMPADMINUS': 'NumMinus',
  'DIK_NUMPADSTAR': 'NumMult',
  'DIK_NUMPADSLASH': 'NumDiv',
  'DIK_DECIMAL': 'NumDot',
  'DIK_NUMLOCK': 'NumLock',

  // Punctuation
  'DIK_MINUS': '-',
  'DIK_EQUALS': '=',
  'DIK_LBRACKET': '[',
  'DIK_RBRACKET': ']',
  'DIK_SEMICOLON': ';',
  'DIK_APOSTROPHE': "'",
  'DIK_GRAVE': '`',
  'DIK_BACKSLASH': '\\',
  'DIK_COMMA': ',',
  'DIK_PERIOD': '.',
  'DIK_SLASH': '/',

  // Other
  'DIK_SCROLL': 'ScrollLock',
  'DIK_PAUSE': 'Pause',
  'DIK_SYSRQ': 'PrintScreen',
  'DIK_APPS': 'Apps',
};

/**
 * Convert a DIK description string to a human-readable key name
 */
export function dikToKeyName(dikDescription: string): string {
  // Try exact match first
  if (DIK_NAMES[dikDescription]) {
    return DIK_NAMES[dikDescription];
  }

  // Try without DIK_ prefix
  const withoutPrefix = dikDescription.replace(/^DIK_/, '');
  if (DIK_NAMES[`DIK_${withoutPrefix.toUpperCase()}`]) {
    return DIK_NAMES[`DIK_${withoutPrefix.toUpperCase()}`];
  }

  // Return the description without DIK_ prefix as fallback
  return withoutPrefix;
}

/**
 * Convert a DIK button ID to a human-readable key name
 */
export function dikCodeToKeyName(buttonId: number): string {
  return DIK_CODES[buttonId] ?? `Key${buttonId}`;
}
