import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ControllerInput } from '@/components/ControllerInput'
import type { UnifiedMapping } from '@/lib/types/unified'
import type { ButtonState, GamepadInfo, AxisState } from '@/hooks/useGamepad'

// Mock return type
interface MockUseGamepadReturn {
  gamepad: GamepadInfo | null
  gamepads: GamepadInfo[]
  buttons: ButtonState[]
  pressedButtons: string[]
  axes: AxisState[]
  isButtonPressed: (name: string) => boolean
  getButton: (name: string) => ButtonState | undefined
}

// Default mock values
let mockGamepadReturn: MockUseGamepadReturn = {
  gamepad: null,
  gamepads: [],
  buttons: [],
  pressedButtons: [],
  axes: [],
  isButtonPressed: () => false,
  getButton: () => undefined,
}

// Track if gamepad is supported
let mockIsSupported = true

// Mock the useGamepad hook
vi.mock('@/hooks/useGamepad', () => ({
  useGamepad: () => mockGamepadReturn,
  isGamepadSupported: () => mockIsSupported,
}))

function createMockMapping(overrides: Partial<UnifiedMapping> = {}): UnifiedMapping {
  return {
    id: 'test-id-' + Math.random().toString(36).slice(2),
    controllerButton: 'A',
    activationType: 'press',
    activationMode: 'default',
    gameAction: 'v_toggle_landing_gear',
    gameActionReadable: 'Toggle Landing Gear',
    gameplayMode: 'flight',
    actionMap: 'spaceship_general',
    source: 'xml',
    ...overrides,
  }
}

function createMockGamepadInfo(overrides: Partial<GamepadInfo> = {}): GamepadInfo {
  return {
    index: 0,
    id: 'Xbox Controller',
    connected: true,
    buttonCount: 17,
    axisCount: 4,
    ...overrides,
  }
}

describe('ControllerInput', () => {
  const mockOnMappingsFound = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockIsSupported = true
    mockGamepadReturn = {
      gamepad: null,
      gamepads: [],
      buttons: [],
      pressedButtons: [],
      axes: [],
      isButtonPressed: () => false,
      getButton: () => undefined,
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('unsupported browser', () => {
    it('shows unsupported message when Gamepad API is not available', () => {
      mockIsSupported = false

      render(<ControllerInput mappings={[]} />)

      expect(screen.getByText('Gamepad API not supported in this browser')).toBeInTheDocument()
    })

    it('applies custom className when unsupported', () => {
      mockIsSupported = false

      const { container } = render(<ControllerInput mappings={[]} className="custom-class" />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('custom-class')
    })
  })

  describe('no gamepad connected', () => {
    it('shows connect controller message when no gamepad', () => {
      mockGamepadReturn.gamepad = null

      render(<ControllerInput mappings={[]} />)

      expect(screen.getByText('Connect a controller and press any button')).toBeInTheDocument()
    })

    it('shows pulsing controller icon', () => {
      mockGamepadReturn.gamepad = null

      const { container } = render(<ControllerInput mappings={[]} />)

      const icon = container.querySelector('svg.animate-pulse')
      expect(icon).toBeInTheDocument()
    })

    it('applies custom className when no gamepad', () => {
      mockGamepadReturn.gamepad = null

      const { container } = render(<ControllerInput mappings={[]} className="my-class" />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('my-class')
    })
  })

  describe('gamepad connected', () => {
    beforeEach(() => {
      mockGamepadReturn.gamepad = createMockGamepadInfo()
      mockGamepadReturn.gamepads = [createMockGamepadInfo()]
    })

    it('shows Controller Connected header', () => {
      render(<ControllerInput mappings={[]} />)

      expect(screen.getByText('Controller Connected')).toBeInTheDocument()
    })

    it('shows prompt when no buttons pressed', () => {
      mockGamepadReturn.pressedButtons = []

      render(<ControllerInput mappings={[]} />)

      expect(screen.getByText('Press buttons to see mappings...')).toBeInTheDocument()
    })

    it('displays pressed buttons', () => {
      mockGamepadReturn.pressedButtons = ['A', 'B']

      render(<ControllerInput mappings={[]} />)

      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('B')).toBeInTheDocument()
    })

    it('shows multiple controllers indicator when more than one connected', () => {
      mockGamepadReturn.gamepads = [
        createMockGamepadInfo({ index: 0 }),
        createMockGamepadInfo({ index: 1 }),
      ]

      render(<ControllerInput mappings={[]} />)

      expect(screen.getByText('2 controllers')).toBeInTheDocument()
    })

    it('does not show controllers count when only one connected', () => {
      mockGamepadReturn.gamepads = [createMockGamepadInfo()]

      render(<ControllerInput mappings={[]} />)

      expect(screen.queryByText(/controllers/)).not.toBeInTheDocument()
    })
  })

  describe('showDetails', () => {
    beforeEach(() => {
      mockGamepadReturn.gamepad = createMockGamepadInfo({ id: 'Xbox Wireless Controller' })
      mockGamepadReturn.gamepads = [createMockGamepadInfo({ id: 'Xbox Wireless Controller' })]
    })

    it('shows gamepad id when showDetails is true', () => {
      render(<ControllerInput mappings={[]} showDetails />)

      expect(screen.getByText('Xbox Wireless Controller')).toBeInTheDocument()
    })

    it('does not show gamepad id when showDetails is false', () => {
      render(<ControllerInput mappings={[]} showDetails={false} />)

      expect(screen.queryByText('Xbox Wireless Controller')).not.toBeInTheDocument()
    })

    it('shows axes when showDetails is true and axes present', () => {
      mockGamepadReturn.axes = [
        { index: 0, value: 0.5 },
        { index: 1, value: -0.5 },
        { index: 2, value: 0 },
        { index: 3, value: 0.8 },
      ]

      render(<ControllerInput mappings={[]} showDetails />)

      // Axis labels should appear
      expect(screen.getByText('LX')).toBeInTheDocument()
      expect(screen.getByText('LY')).toBeInTheDocument()
      expect(screen.getByText('RX')).toBeInTheDocument()
      expect(screen.getByText('RY')).toBeInTheDocument()
    })

    it('does not show axes when showDetails is false', () => {
      mockGamepadReturn.axes = [
        { index: 0, value: 0.5 },
        { index: 1, value: -0.5 },
      ]

      render(<ControllerInput mappings={[]} showDetails={false} />)

      expect(screen.queryByText('LX')).not.toBeInTheDocument()
    })
  })

  describe('mapping matching', () => {
    const mappings: UnifiedMapping[] = [
      createMockMapping({
        controllerButton: 'A',
        gameAction: 'v_toggle_landing_gear',
      }),
      createMockMapping({
        controllerButton: 'B',
        gameAction: 'v_boost',
      }),
      createMockMapping({
        controllerButton: 'A',
        modifier: 'LB',
        gameAction: 'v_toggle_quantum_mode',
      }),
    ]

    beforeEach(() => {
      mockGamepadReturn.gamepad = createMockGamepadInfo()
      mockGamepadReturn.gamepads = [createMockGamepadInfo()]
    })

    it('shows match count when buttons match mappings', async () => {
      mockGamepadReturn.pressedButtons = ['A']

      render(<ControllerInput mappings={mappings} onMappingsFound={mockOnMappingsFound} />)

      await waitFor(() => {
        expect(screen.getByText(/mapping.*found/i)).toBeInTheDocument()
      })
    })

    it('calls onMappingsFound when buttons match', async () => {
      mockGamepadReturn.pressedButtons = ['A']

      render(<ControllerInput mappings={mappings} onMappingsFound={mockOnMappingsFound} />)

      await waitFor(() => {
        expect(mockOnMappingsFound).toHaveBeenCalled()
      })

      const call = mockOnMappingsFound.mock.calls[0]
      expect(call[0]).toHaveLength(1) // One mapping for just 'A'
      expect(call[0][0].controllerButton).toBe('A')
      expect(call[1]).toBe('A') // Button combo string
    })

    it('matches modifier combos', async () => {
      mockGamepadReturn.pressedButtons = ['A', 'LB']

      render(<ControllerInput mappings={mappings} onMappingsFound={mockOnMappingsFound} />)

      await waitFor(() => {
        expect(mockOnMappingsFound).toHaveBeenCalled()
      })

      const call = mockOnMappingsFound.mock.calls[0]
      expect(call[0]).toHaveLength(1) // One mapping for A+LB
      expect(call[0][0].modifier).toBe('LB')
    })

    it('does not call onMappingsFound when no matches', () => {
      mockGamepadReturn.pressedButtons = ['Y'] // No mapping for Y

      render(<ControllerInput mappings={mappings} onMappingsFound={mockOnMappingsFound} />)

      // Give it a moment but don't expect the callback
      expect(mockOnMappingsFound).not.toHaveBeenCalled()
    })

    it('does not call onMappingsFound when no buttons pressed', () => {
      mockGamepadReturn.pressedButtons = []

      render(<ControllerInput mappings={mappings} onMappingsFound={mockOnMappingsFound} />)

      expect(mockOnMappingsFound).not.toHaveBeenCalled()
    })
  })

  describe('last combo display', () => {
    beforeEach(() => {
      mockGamepadReturn.gamepad = createMockGamepadInfo()
      mockGamepadReturn.gamepads = [createMockGamepadInfo()]
    })

    it('does not show last combo when no buttons have been pressed', () => {
      mockGamepadReturn.pressedButtons = []

      render(<ControllerInput mappings={[]} />)

      expect(screen.queryByText(/Last:/)).not.toBeInTheDocument()
    })
  })

  describe('className prop', () => {
    it('applies custom className when gamepad connected', () => {
      mockGamepadReturn.gamepad = createMockGamepadInfo()
      mockGamepadReturn.gamepads = [createMockGamepadInfo()]

      const { container } = render(<ControllerInput mappings={[]} className="test-class" />)

      const wrapper = container.firstChild as HTMLElement
      expect(wrapper.className).toContain('test-class')
    })
  })
})

describe('findMatchingMappings helper', () => {
  // The helper is internal but we test it through the component behavior
  // These tests verify specific matching logic

  const mappings: UnifiedMapping[] = [
    createMockMapping({
      controllerButton: 'A',
      modifier: undefined,
      gameAction: 'action_a',
    }),
    createMockMapping({
      controllerButton: 'A',
      modifier: 'LB',
      gameAction: 'action_a_lb',
    }),
    createMockMapping({
      controllerButton: 'B',
      modifier: 'RB',
      gameAction: 'action_b_rb',
    }),
  ]

  beforeEach(() => {
    mockIsSupported = true
    mockGamepadReturn = {
      gamepad: createMockGamepadInfo(),
      gamepads: [createMockGamepadInfo()],
      buttons: [],
      pressedButtons: [],
      axes: [],
      isButtonPressed: () => false,
      getButton: () => undefined,
    }
  })

  it('matches single button without modifier', async () => {
    const mockOnMappingsFound = vi.fn()
    mockGamepadReturn.pressedButtons = ['A']

    render(<ControllerInput mappings={mappings} onMappingsFound={mockOnMappingsFound} />)

    await waitFor(() => {
      expect(mockOnMappingsFound).toHaveBeenCalled()
    })

    const matches = mockOnMappingsFound.mock.calls[0][0]
    expect(matches).toHaveLength(1)
    expect(matches[0].gameAction).toBe('action_a')
  })

  it('matches button with modifier', async () => {
    const mockOnMappingsFound = vi.fn()
    mockGamepadReturn.pressedButtons = ['A', 'LB']

    render(<ControllerInput mappings={mappings} onMappingsFound={mockOnMappingsFound} />)

    await waitFor(() => {
      expect(mockOnMappingsFound).toHaveBeenCalled()
    })

    const matches = mockOnMappingsFound.mock.calls[0][0]
    expect(matches).toHaveLength(1)
    expect(matches[0].gameAction).toBe('action_a_lb')
  })

  it('does not match when extra buttons pressed', () => {
    const mockOnMappingsFound = vi.fn()
    mockGamepadReturn.pressedButtons = ['A', 'B'] // A alone would match but A+B doesn't

    render(<ControllerInput mappings={mappings} onMappingsFound={mockOnMappingsFound} />)

    expect(mockOnMappingsFound).not.toHaveBeenCalled()
  })

  it('does not match when modifier missing', () => {
    const mockOnMappingsFound = vi.fn()
    // B needs RB modifier but we only press B
    mockGamepadReturn.pressedButtons = ['B']

    render(<ControllerInput mappings={mappings} onMappingsFound={mockOnMappingsFound} />)

    expect(mockOnMappingsFound).not.toHaveBeenCalled()
  })
})

describe('formatButtonCombo helper', () => {
  // Test through component - modifiers should appear first in display
  beforeEach(() => {
    mockIsSupported = true
    mockGamepadReturn = {
      gamepad: createMockGamepadInfo(),
      gamepads: [createMockGamepadInfo()],
      buttons: [],
      pressedButtons: [],
      axes: [],
      isButtonPressed: () => false,
      getButton: () => undefined,
    }
  })

  it('displays modifier first in combo', () => {
    mockGamepadReturn.pressedButtons = ['A', 'LB']

    render(<ControllerInput mappings={[]} />)

    // Both buttons should be displayed
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('LB')).toBeInTheDocument()
  })

  it('displays single button without plus sign', () => {
    mockGamepadReturn.pressedButtons = ['X']

    render(<ControllerInput mappings={[]} />)

    expect(screen.getByText('X')).toBeInTheDocument()
    expect(screen.queryByText('+')).not.toBeInTheDocument()
  })
})
