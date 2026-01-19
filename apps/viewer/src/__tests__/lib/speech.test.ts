import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  isSpeechSupported,
  getVoices,
  getEnglishVoice,
  mappingToSpeech,
  mappingToShortSpeech,
  speak,
  speakMapping,
  speakButtonCombo,
  speakAction,
  stopSpeaking,
  isSpeaking,
} from '@/lib/speech'
import type { UnifiedMapping } from '@/lib/types/unified'

// Mock SpeechSynthesisVoice
function createMockVoice(options: Partial<SpeechSynthesisVoice> = {}): SpeechSynthesisVoice {
  return {
    default: options.default ?? false,
    lang: options.lang ?? 'en-US',
    localService: options.localService ?? false,
    name: options.name ?? 'Mock Voice',
    voiceURI: options.voiceURI ?? 'mock-voice-uri',
  }
}

// Mock SpeechSynthesisUtterance
class MockUtterance {
  text: string
  rate: number = 1
  pitch: number = 1
  lang: string = ''
  voice: SpeechSynthesisVoice | null = null
  onend: (() => void) | null = null
  onerror: ((event: { error: string }) => void) | null = null

  constructor(text: string) {
    this.text = text
  }
}

// Mock speechSynthesis
function createMockSpeechSynthesis() {
  return {
    speaking: false,
    getVoices: vi.fn(() => []),
    speak: vi.fn(),
    cancel: vi.fn(),
  }
}

// Create mock mapping helper
function createMockMapping(overrides: Partial<UnifiedMapping> = {}): UnifiedMapping {
  return {
    id: overrides.id ?? 1,
    source: overrides.source ?? 'rewasd+xml',
    controllerButton: overrides.controllerButton ?? 'A',
    keyboardKeys: overrides.keyboardKeys,
    gameAction: overrides.gameAction ?? 'v_attack1',
    gameActionReadable: overrides.gameActionReadable ?? 'Fire Weapon',
    actionMap: overrides.actionMap ?? 'spaceship_weapons',
    gameplayMode: overrides.gameplayMode ?? 'Flight',
    activationType: overrides.activationType ?? 'Regular',
    modifier: overrides.modifier,
    description: overrides.description,
  }
}

describe('speech', () => {
  let mockSpeechSynthesis: ReturnType<typeof createMockSpeechSynthesis>
  let originalSpeechSynthesis: typeof window.speechSynthesis

  beforeEach(() => {
    // Store original
    originalSpeechSynthesis = window.speechSynthesis

    // Setup mock
    mockSpeechSynthesis = createMockSpeechSynthesis()
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      configurable: true,
      writable: true,
    })

    // Mock SpeechSynthesisUtterance
    vi.stubGlobal('SpeechSynthesisUtterance', MockUtterance)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()

    // Restore original
    Object.defineProperty(window, 'speechSynthesis', {
      value: originalSpeechSynthesis,
      configurable: true,
    })
  })

  describe('isSpeechSupported', () => {
    it('returns true when speechSynthesis is available', () => {
      expect(isSpeechSupported()).toBe(true)
    })

    // Note: In jsdom, 'speechSynthesis' in window returns true even when value is undefined
    // So we can only test the positive case reliably
  })

  describe('getVoices', () => {
    it('returns all voices when no language filter', () => {
      const mockVoices = [
        createMockVoice({ lang: 'en-US', name: 'English US' }),
        createMockVoice({ lang: 'en-GB', name: 'English UK' }),
        createMockVoice({ lang: 'fr-FR', name: 'French' }),
      ]
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices)

      const voices = getVoices()
      expect(voices).toHaveLength(3)
    })

    it('filters voices by language prefix', () => {
      const mockVoices = [
        createMockVoice({ lang: 'en-US', name: 'English US' }),
        createMockVoice({ lang: 'en-GB', name: 'English UK' }),
        createMockVoice({ lang: 'fr-FR', name: 'French' }),
      ]
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices)

      const voices = getVoices('en')
      expect(voices).toHaveLength(2)
      expect(voices.every(v => v.lang.startsWith('en'))).toBe(true)
    })
  })

  describe('getEnglishVoice', () => {
    it('prefers non-local voices', () => {
      const mockVoices = [
        createMockVoice({ lang: 'en-US', name: 'Local', localService: true }),
        createMockVoice({ lang: 'en-US', name: 'Cloud', localService: false }),
      ]
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices)

      const voice = getEnglishVoice()
      expect(voice?.name).toBe('Cloud')
      expect(voice?.localService).toBe(false)
    })

    it('falls back to local voice when no cloud voice available', () => {
      const mockVoices = [
        createMockVoice({ lang: 'en-US', name: 'Local', localService: true }),
      ]
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices)

      const voice = getEnglishVoice()
      expect(voice?.name).toBe('Local')
    })

    it('returns undefined when no English voices', () => {
      const mockVoices = [
        createMockVoice({ lang: 'fr-FR', name: 'French' }),
      ]
      mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices)

      const voice = getEnglishVoice()
      expect(voice).toBeUndefined()
    })
  })

  describe('mappingToSpeech', () => {
    it('generates speech for simple button mapping', () => {
      const mapping = createMockMapping({
        controllerButton: 'A',
        gameActionReadable: 'Fire Weapon',
        activationType: 'Regular',
      })

      const speech = mappingToSpeech(mapping)
      expect(speech).toBe('A button for Fire Weapon')
    })

    it('includes modifier in speech', () => {
      const mapping = createMockMapping({
        controllerButton: 'X',
        modifier: 'LB',
        gameActionReadable: 'Toggle Mining Mode',
        activationType: 'Regular',
      })

      const speech = mappingToSpeech(mapping)
      expect(speech).toBe('left bumper plus X button for Toggle Mining Mode')
    })

    it('includes activation type for non-regular activations', () => {
      const mapping = createMockMapping({
        controllerButton: 'A',
        gameActionReadable: 'Jump',
        activationType: 'Long',
      })

      const speech = mappingToSpeech(mapping)
      expect(speech).toBe('long press A button for Jump')
    })

    it('includes both modifier and activation type', () => {
      const mapping = createMockMapping({
        controllerButton: 'Y',
        modifier: 'RB',
        gameActionReadable: 'Eject',
        activationType: 'Hold',
      })

      const speech = mappingToSpeech(mapping)
      expect(speech).toBe('hold right bumper plus Y button for Eject')
    })

    it('handles different activation types', () => {
      const activationTypes = [
        { type: 'Short', expected: 'tap' },
        { type: 'DoubleTap', expected: 'double tap' },
        { type: 'Hold', expected: 'hold' },
        { type: 'Long', expected: 'long press' },
        { type: 'Custom', expected: 'custom' }, // Falls back to lowercase
      ]

      for (const { type, expected } of activationTypes) {
        const mapping = createMockMapping({
          controllerButton: 'A',
          gameActionReadable: 'Action',
          activationType: type,
        })

        const speech = mappingToSpeech(mapping)
        expect(speech).toContain(expected)
      }
    })

    it('converts button names to natural speech', () => {
      const buttonMappings = [
        { button: 'LB', expected: 'left bumper' },
        { button: 'RB', expected: 'right bumper' },
        { button: 'LT', expected: 'left trigger' },
        { button: 'RT', expected: 'right trigger' },
        { button: 'DpadUp', expected: 'D-pad up' },
        { button: 'DpadDown', expected: 'D-pad down' },
        { button: 'LS', expected: 'left stick' },
        { button: 'RS', expected: 'right stick' },
      ]

      for (const { button, expected } of buttonMappings) {
        const mapping = createMockMapping({
          controllerButton: button,
          gameActionReadable: 'Action',
          activationType: 'Regular',
        })

        const speech = mappingToSpeech(mapping)
        expect(speech).toContain(expected)
      }
    })

    it('passes through unknown button names', () => {
      const mapping = createMockMapping({
        controllerButton: 'UnknownButton',
        gameActionReadable: 'Action',
        activationType: 'Regular',
      })

      const speech = mappingToSpeech(mapping)
      expect(speech).toBe('UnknownButton for Action')
    })
  })

  describe('mappingToShortSpeech', () => {
    it('generates short speech without action', () => {
      const mapping = createMockMapping({
        controllerButton: 'A',
        activationType: 'Regular',
      })

      const speech = mappingToShortSpeech(mapping)
      expect(speech).toBe('A button')
      expect(speech).not.toContain('for')
    })

    it('includes modifier in short speech', () => {
      const mapping = createMockMapping({
        controllerButton: 'X',
        modifier: 'LB',
        activationType: 'Regular',
      })

      const speech = mappingToShortSpeech(mapping)
      expect(speech).toBe('left bumper plus X button')
    })

    it('includes activation type in short speech', () => {
      const mapping = createMockMapping({
        controllerButton: 'A',
        activationType: 'DoubleTap',
      })

      const speech = mappingToShortSpeech(mapping)
      expect(speech).toBe('double tap A button')
    })
  })

  describe('speak', () => {
    it('cancels ongoing speech before speaking', async () => {
      mockSpeechSynthesis.speak.mockImplementation((utterance: MockUtterance) => {
        utterance.onend?.()
      })

      await speak('Hello')
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
    })

    it('creates utterance with default options', async () => {
      let capturedUtterance: MockUtterance | null = null
      mockSpeechSynthesis.speak.mockImplementation((utterance: MockUtterance) => {
        capturedUtterance = utterance
        utterance.onend?.()
      })

      await speak('Test text')

      expect(capturedUtterance).not.toBeNull()
      expect(capturedUtterance!.text).toBe('Test text')
      expect(capturedUtterance!.rate).toBe(1)
      expect(capturedUtterance!.pitch).toBe(1)
      expect(capturedUtterance!.lang).toBe('en-US')
    })

    it('applies custom options', async () => {
      let capturedUtterance: MockUtterance | null = null
      mockSpeechSynthesis.speak.mockImplementation((utterance: MockUtterance) => {
        capturedUtterance = utterance
        utterance.onend?.()
      })

      const mockVoice = createMockVoice()
      await speak('Test', {
        rate: 1.5,
        pitch: 0.8,
        lang: 'en-GB',
        voice: mockVoice,
      })

      expect(capturedUtterance!.rate).toBe(1.5)
      expect(capturedUtterance!.pitch).toBe(0.8)
      expect(capturedUtterance!.lang).toBe('en-GB')
      expect(capturedUtterance!.voice).toBe(mockVoice)
    })

    it('resolves when speech ends', async () => {
      mockSpeechSynthesis.speak.mockImplementation((utterance: MockUtterance) => {
        // Simulate speech ending
        setTimeout(() => utterance.onend?.(), 10)
      })

      await expect(speak('Hello')).resolves.toBeUndefined()
    })

    it('rejects on speech error', async () => {
      mockSpeechSynthesis.speak.mockImplementation((utterance: MockUtterance) => {
        utterance.onerror?.({ error: 'audio-busy' })
      })

      await expect(speak('Hello')).rejects.toThrow('Speech error: audio-busy')
    })

    it('resolves (does not reject) on cancel', async () => {
      mockSpeechSynthesis.speak.mockImplementation((utterance: MockUtterance) => {
        utterance.onerror?.({ error: 'canceled' })
      })

      await expect(speak('Hello')).resolves.toBeUndefined()
    })
  })

  describe('speakMapping', () => {
    it('speaks full mapping description', async () => {
      let capturedUtterance: MockUtterance | null = null
      mockSpeechSynthesis.speak.mockImplementation((utterance: MockUtterance) => {
        capturedUtterance = utterance
        utterance.onend?.()
      })

      const mapping = createMockMapping({
        controllerButton: 'A',
        gameActionReadable: 'Fire Weapon',
        activationType: 'Regular',
      })

      await speakMapping(mapping)

      expect(capturedUtterance!.text).toBe('A button for Fire Weapon')
    })
  })

  describe('speakButtonCombo', () => {
    it('speaks only the button combo', async () => {
      let capturedUtterance: MockUtterance | null = null
      mockSpeechSynthesis.speak.mockImplementation((utterance: MockUtterance) => {
        capturedUtterance = utterance
        utterance.onend?.()
      })

      const mapping = createMockMapping({
        controllerButton: 'LB',
        modifier: 'A',
        gameActionReadable: 'Fire Weapon',
        activationType: 'Regular',
      })

      await speakButtonCombo(mapping)

      expect(capturedUtterance!.text).toBe('A button plus left bumper')
      expect(capturedUtterance!.text).not.toContain('Fire Weapon')
    })
  })

  describe('speakAction', () => {
    it('speaks only the action name', async () => {
      let capturedUtterance: MockUtterance | null = null
      mockSpeechSynthesis.speak.mockImplementation((utterance: MockUtterance) => {
        capturedUtterance = utterance
        utterance.onend?.()
      })

      const mapping = createMockMapping({
        controllerButton: 'A',
        gameActionReadable: 'Toggle Mining Mode',
      })

      await speakAction(mapping)

      expect(capturedUtterance!.text).toBe('Toggle Mining Mode')
    })
  })

  describe('stopSpeaking', () => {
    it('calls cancel when speech supported', () => {
      stopSpeaking()
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled()
    })
  })

  describe('isSpeaking', () => {
    it('returns true when speaking', () => {
      mockSpeechSynthesis.speaking = true
      expect(isSpeaking()).toBe(true)
    })

    it('returns false when not speaking', () => {
      mockSpeechSynthesis.speaking = false
      expect(isSpeaking()).toBe(false)
    })
  })
})
