/**
 * Mock factory functions for tests
 */

import type { UnifiedMapping, GameplayMode, MappingSource } from '@/lib/types/unified'
import type { ActivatorType, ActivatorMode, ParsedRewasdMapping } from '@/lib/types/rewasd'

// ============================================================================
// Unified Mapping Mocks
// ============================================================================

let mappingIdCounter = 0

export interface MockMappingOptions {
  id?: string
  controllerButton?: string
  modifier?: string
  activationType?: ActivatorType
  activationMode?: ActivatorMode
  keyboardKeys?: string[]
  gameAction?: string
  gameActionReadable?: string
  gameplayMode?: GameplayMode
  actionMap?: string
  source?: MappingSource
  description?: string
}

/**
 * Create a mock UnifiedMapping with sensible defaults
 */
export function mockMapping(options: MockMappingOptions = {}): UnifiedMapping {
  mappingIdCounter++
  return {
    id: options.id ?? `mock-mapping-${mappingIdCounter}`,
    controllerButton: options.controllerButton ?? 'A',
    modifier: options.modifier,
    activationType: options.activationType ?? 'single',
    activationMode: options.activationMode ?? 'onetime',
    keyboardKeys: options.keyboardKeys,
    gameAction: options.gameAction ?? 'v_test_action',
    gameActionReadable: options.gameActionReadable ?? 'Test Action',
    gameplayMode: options.gameplayMode ?? 'General',
    actionMap: options.actionMap ?? 'spaceship_general',
    source: options.source ?? 'xml-gamepad',
    description: options.description,
  }
}

/**
 * Create multiple mock mappings
 */
export function mockMappings(count: number, baseOptions: MockMappingOptions = {}): UnifiedMapping[] {
  return Array.from({ length: count }, (_, i) =>
    mockMapping({
      ...baseOptions,
      id: `mock-mapping-${mappingIdCounter + i + 1}`,
      controllerButton: baseOptions.controllerButton ?? ['A', 'B', 'X', 'Y', 'LB', 'RB'][i % 6],
    })
  )
}

// ============================================================================
// Parsed Rewasd Mapping Mocks
// ============================================================================

export interface MockParsedRewasdOptions {
  maskId?: number
  buttonName?: string
  shiftId?: number
  shiftName?: string
  activatorType?: ActivatorType
  activatorMode?: ActivatorMode
  outputKeys?: string[]
  description?: string
}

/**
 * Create a mock ParsedRewasdMapping
 */
export function mockParsedRewasdMapping(options: MockParsedRewasdOptions = {}): ParsedRewasdMapping {
  return {
    maskId: options.maskId ?? 0,
    buttonName: options.buttonName ?? 'A',
    shiftId: options.shiftId,
    shiftName: options.shiftName,
    activatorType: options.activatorType ?? 'single',
    activatorMode: options.activatorMode ?? 'onetime',
    outputKeys: options.outputKeys ?? ['W'],
    description: options.description,
  }
}

// ============================================================================
// Gamepad Mocks
// ============================================================================

export interface MockGamepadOptions {
  id?: string
  index?: number
  connected?: boolean
  buttons?: GamepadButton[]
  axes?: number[]
}

/**
 * Create a mock Gamepad object
 */
export function mockGamepad(options: MockGamepadOptions = {}): Gamepad {
  const buttonCount = options.buttons?.length ?? 17
  const axisCount = options.axes?.length ?? 4

  return {
    id: options.id ?? 'Mock Gamepad (Vendor: 0000 Product: 0000)',
    index: options.index ?? 0,
    connected: options.connected ?? true,
    timestamp: performance.now(),
    mapping: 'standard',
    buttons: options.buttons ?? createMockButtons(buttonCount),
    axes: options.axes ?? new Array(axisCount).fill(0),
    vibrationActuator: null,
  } as Gamepad
}

/**
 * Create mock gamepad buttons
 */
export function createMockButtons(count: number, pressedIndices: number[] = []): GamepadButton[] {
  return Array.from({ length: count }, (_, i) => ({
    pressed: pressedIndices.includes(i),
    touched: pressedIndices.includes(i),
    value: pressedIndices.includes(i) ? 1 : 0,
  }))
}

/**
 * Create a mock for navigator.getGamepads()
 */
export function mockGetGamepads(gamepads: (Gamepad | null)[] = []): void {
  const result = new Array(4).fill(null)
  gamepads.forEach((gp, i) => {
    if (i < 4) result[i] = gp
  })

  Object.defineProperty(navigator, 'getGamepads', {
    value: () => result,
    writable: true,
    configurable: true,
  })
}

// ============================================================================
// Speech Synthesis Mocks
// ============================================================================

export interface MockSpeechSynthesisOptions {
  speaking?: boolean
  pending?: boolean
  paused?: boolean
  voices?: SpeechSynthesisVoice[]
}

/**
 * Create a mock SpeechSynthesis object
 */
export function mockSpeechSynthesis(options: MockSpeechSynthesisOptions = {}): SpeechSynthesis {
  const mockVoices = options.voices ?? [
    createMockVoice('Microsoft David', 'en-US'),
    createMockVoice('Microsoft Zira', 'en-US'),
    createMockVoice('Google UK English Female', 'en-GB'),
  ]

  return {
    speaking: options.speaking ?? false,
    pending: options.pending ?? false,
    paused: options.paused ?? false,
    onvoiceschanged: null,
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: vi.fn(() => mockVoices),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  }
}

/**
 * Create a mock SpeechSynthesisVoice
 */
export function createMockVoice(name: string, lang: string, isDefault = false): SpeechSynthesisVoice {
  return {
    name,
    lang,
    default: isDefault,
    localService: true,
    voiceURI: `urn:moz-tts:sapi:${name}?${lang}`,
  }
}

/**
 * Install mock speech synthesis on window
 */
export function installMockSpeechSynthesis(options: MockSpeechSynthesisOptions = {}): SpeechSynthesis {
  const mock = mockSpeechSynthesis(options)
  Object.defineProperty(window, 'speechSynthesis', {
    value: mock,
    writable: true,
    configurable: true,
  })
  return mock
}

// ============================================================================
// Speech Recognition Mocks
// ============================================================================

export interface MockSpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
}

/**
 * Create a mock SpeechRecognition class
 */
export function createMockSpeechRecognitionClass() {
  return class MockSpeechRecognition {
    continuous = false
    interimResults = false
    lang = 'en-US'
    onresult: ((event: SpeechRecognitionEvent) => void) | null = null
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null = null
    onstart: (() => void) | null = null
    onend: (() => void) | null = null

    start = vi.fn(() => {
      this.onstart?.()
    })

    stop = vi.fn(() => {
      this.onend?.()
    })

    abort = vi.fn(() => {
      this.onend?.()
    })

    /**
     * Simulate a recognition result
     */
    simulateResult(transcript: string, confidence = 0.9) {
      const event = {
        resultIndex: 0,
        results: {
          length: 1,
          item: () => ({
            length: 1,
            item: () => ({ transcript, confidence }),
            isFinal: true,
            0: { transcript, confidence },
          }),
          0: {
            length: 1,
            item: () => ({ transcript, confidence }),
            isFinal: true,
            0: { transcript, confidence },
          },
        },
      } as unknown as SpeechRecognitionEvent

      this.onresult?.(event)
    }

    /**
     * Simulate an error
     */
    simulateError(error: string) {
      const event = {
        error,
        message: `Speech recognition error: ${error}`,
      } as unknown as SpeechRecognitionErrorEvent

      this.onerror?.(event)
    }
  }
}

/**
 * Install mock SpeechRecognition on window
 */
export function installMockSpeechRecognition(): ReturnType<typeof createMockSpeechRecognitionClass> {
  const MockClass = createMockSpeechRecognitionClass()
  Object.defineProperty(window, 'SpeechRecognition', {
    value: MockClass,
    writable: true,
    configurable: true,
  })
  Object.defineProperty(window, 'webkitSpeechRecognition', {
    value: MockClass,
    writable: true,
    configurable: true,
  })
  return MockClass
}

// ============================================================================
// Reset Helpers
// ============================================================================

/**
 * Reset the mapping ID counter (useful between tests)
 */
export function resetMockCounters(): void {
  mappingIdCounter = 0
}
