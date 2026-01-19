/**
 * Text-to-Speech utilities for speaking button mapping combos
 * Uses the Web Speech API (speechSynthesis)
 */

import type { UnifiedMapping } from './types/unified';

// ============================================================================
// Types
// ============================================================================

export interface SpeechOptions {
  /** Speech rate (0.1 to 10, default 1) */
  rate?: number;
  /** Speech pitch (0 to 2, default 1) */
  pitch?: number;
  /** Voice to use (uses default if not specified) */
  voice?: SpeechSynthesisVoice;
  /** Language preference (e.g., 'en-US') */
  lang?: string;
}

// ============================================================================
// Feature Detection
// ============================================================================

/**
 * Check if speech synthesis is available in the browser
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Get available voices, optionally filtered by language
 */
export function getVoices(lang?: string): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];

  const voices = window.speechSynthesis.getVoices();
  if (!lang) return voices;

  return voices.filter(v => v.lang.startsWith(lang));
}

/**
 * Get the best English voice available
 */
export function getEnglishVoice(): SpeechSynthesisVoice | undefined {
  const voices = getVoices('en');
  // Prefer native voices
  return voices.find(v => !v.localService) ?? voices[0];
}

// ============================================================================
// Text Generation
// ============================================================================

/**
 * Button name mappings for more natural speech
 */
const BUTTON_SPEECH_MAP: Record<string, string> = {
  'A': 'A button',
  'B': 'B button',
  'X': 'X button',
  'Y': 'Y button',
  'LB': 'left bumper',
  'RB': 'right bumper',
  'LT': 'left trigger',
  'RT': 'right trigger',
  'LS': 'left stick',
  'RS': 'right stick',
  'LSB': 'left stick button',
  'RSB': 'right stick button',
  'DpadUp': 'D-pad up',
  'DpadDown': 'D-pad down',
  'DpadLeft': 'D-pad left',
  'DpadRight': 'D-pad right',
  'Start': 'start button',
  'Back': 'back button',
  'Guide': 'guide button',
};

/**
 * Convert a button name to natural speech
 */
function buttonToSpeech(button: string): string {
  return BUTTON_SPEECH_MAP[button] ?? button;
}

/**
 * Convert activation type to natural speech
 */
function activationToSpeech(type: string): string {
  switch (type) {
    case 'Regular': return '';
    case 'Long': return 'long press';
    case 'Short': return 'tap';
    case 'DoubleTap': return 'double tap';
    case 'Hold': return 'hold';
    default: return type.toLowerCase();
  }
}

/**
 * Generate speakable text for a unified mapping
 */
export function mappingToSpeech(mapping: UnifiedMapping): string {
  const parts: string[] = [];

  // Build the input description
  const activation = activationToSpeech(mapping.activationType);
  const button = buttonToSpeech(mapping.controllerButton);

  if (mapping.modifier) {
    const modifier = buttonToSpeech(mapping.modifier);
    if (activation) {
      parts.push(`${activation} ${modifier} plus ${button}`);
    } else {
      parts.push(`${modifier} plus ${button}`);
    }
  } else {
    if (activation) {
      parts.push(`${activation} ${button}`);
    } else {
      parts.push(button);
    }
  }

  // Add the action
  parts.push('for');
  parts.push(mapping.gameActionReadable);

  return parts.join(' ');
}

/**
 * Generate a short description (just button combo)
 */
export function mappingToShortSpeech(mapping: UnifiedMapping): string {
  const activation = activationToSpeech(mapping.activationType);
  const button = buttonToSpeech(mapping.controllerButton);

  if (mapping.modifier) {
    const modifier = buttonToSpeech(mapping.modifier);
    if (activation) {
      return `${activation} ${modifier} plus ${button}`;
    }
    return `${modifier} plus ${button}`;
  }

  if (activation) {
    return `${activation} ${button}`;
  }
  return button;
}

// ============================================================================
// Speech Functions
// ============================================================================

/**
 * Speak the given text using speech synthesis
 */
export function speak(text: string, options: SpeechOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSupported()) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.lang = options.lang ?? 'en-US';

    if (options.voice) {
      utterance.voice = options.voice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      if (event.error === 'canceled') {
        resolve(); // Don't reject on cancel
      } else {
        reject(new Error(`Speech error: ${event.error}`));
      }
    };

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Speak a mapping's full description
 */
export function speakMapping(mapping: UnifiedMapping, options?: SpeechOptions): Promise<void> {
  return speak(mappingToSpeech(mapping), options);
}

/**
 * Speak just the button combo for a mapping
 */
export function speakButtonCombo(mapping: UnifiedMapping, options?: SpeechOptions): Promise<void> {
  return speak(mappingToShortSpeech(mapping), options);
}

/**
 * Speak the action name only
 */
export function speakAction(mapping: UnifiedMapping, options?: SpeechOptions): Promise<void> {
  return speak(mapping.gameActionReadable, options);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeaking(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if currently speaking
 */
export function isSpeaking(): boolean {
  if (!isSpeechSupported()) return false;
  return window.speechSynthesis.speaking;
}
