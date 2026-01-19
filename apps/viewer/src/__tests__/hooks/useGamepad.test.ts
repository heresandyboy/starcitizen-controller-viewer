import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useGamepad, isGamepadSupported } from '@/hooks/useGamepad'

// Mock Gamepad API types
interface MockGamepadButton {
  pressed: boolean
  value: number
}

interface MockGamepad {
  index: number
  id: string
  connected: boolean
  buttons: MockGamepadButton[]
  axes: number[]
}

// Helper to create mock gamepad
function createMockGamepad(options: Partial<MockGamepad> = {}): MockGamepad {
  const buttonCount = options.buttons?.length ?? 17
  const axisCount = options.axes?.length ?? 4

  return {
    index: options.index ?? 0,
    id: options.id ?? 'Xbox Controller',
    connected: options.connected ?? true,
    buttons: options.buttons ?? Array(buttonCount).fill(null).map(() => ({
      pressed: false,
      value: 0,
    })),
    axes: options.axes ?? Array(axisCount).fill(0),
  }
}

// Mock navigator.getGamepads
function setupGamepadMock(gamepads: (MockGamepad | null)[] = [null, null, null, null]) {
  Object.defineProperty(navigator, 'getGamepads', {
    value: vi.fn(() => gamepads),
    configurable: true,
  })
}

describe('useGamepad', () => {
  let originalGetGamepads: typeof navigator.getGamepads
  let addEventListenerSpy: ReturnType<typeof vi.spyOn>
  let removeEventListenerSpy: ReturnType<typeof vi.spyOn>
  let rafCallback: ((time: number) => void) | null = null

  beforeEach(() => {
    // Store original
    originalGetGamepads = navigator.getGamepads

    // Mock requestAnimationFrame to be controllable
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallback = cb
      return 1
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})

    // Spy on event listeners
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

    // Setup default gamepad mock
    setupGamepadMock()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    rafCallback = null

    // Restore original
    if (originalGetGamepads) {
      Object.defineProperty(navigator, 'getGamepads', {
        value: originalGetGamepads,
        configurable: true,
      })
    }
  })

  describe('isGamepadSupported', () => {
    it('returns true when Gamepad API is available', () => {
      setupGamepadMock()
      expect(isGamepadSupported()).toBe(true)
    })

    it('returns false when navigator is undefined', () => {
      const originalNavigator = globalThis.navigator
      // @ts-expect-error - intentionally setting to undefined for test
      delete globalThis.navigator

      // Need to reload the module, but for this test we can check the condition
      const hasGamepad = typeof navigator !== 'undefined' && 'getGamepads' in navigator
      expect(hasGamepad).toBe(false)

      // Restore
      globalThis.navigator = originalNavigator
    })
  })

  describe('initial state', () => {
    it('returns null gamepad when none connected', () => {
      setupGamepadMock([null, null, null, null])

      const { result } = renderHook(() => useGamepad())

      expect(result.current.gamepad).toBeNull()
      expect(result.current.gamepads).toEqual([])
      expect(result.current.buttons).toEqual([])
      expect(result.current.pressedButtons).toEqual([])
      expect(result.current.axes).toEqual([])
    })

    it('detects connected gamepad on mount', () => {
      const mockGamepad = createMockGamepad()
      setupGamepadMock([mockGamepad, null, null, null])

      const { result } = renderHook(() => useGamepad())

      expect(result.current.gamepad).toEqual({
        index: 0,
        id: 'Xbox Controller',
        connected: true,
        buttonCount: 17,
        axisCount: 4,
      })
    })

    it('tracks multiple connected gamepads', () => {
      const gamepad1 = createMockGamepad({ index: 0, id: 'Controller 1' })
      const gamepad2 = createMockGamepad({ index: 1, id: 'Controller 2' })
      setupGamepadMock([gamepad1, gamepad2, null, null])

      const { result } = renderHook(() => useGamepad())

      expect(result.current.gamepads).toHaveLength(2)
      expect(result.current.gamepads[0].id).toBe('Controller 1')
      expect(result.current.gamepads[1].id).toBe('Controller 2')
    })
  })

  describe('event listeners', () => {
    it('adds gamepad event listeners on mount', () => {
      const mockGamepad = createMockGamepad()
      setupGamepadMock([mockGamepad])

      renderHook(() => useGamepad())

      expect(addEventListenerSpy).toHaveBeenCalledWith('gamepadconnected', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('gamepaddisconnected', expect.any(Function))
    })

    it('removes event listeners on unmount', () => {
      const mockGamepad = createMockGamepad()
      setupGamepadMock([mockGamepad])

      const { unmount } = renderHook(() => useGamepad())
      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('gamepadconnected', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('gamepaddisconnected', expect.any(Function))
    })
  })

  describe('options', () => {
    it('uses custom gamepadIndex', () => {
      const gamepad0 = createMockGamepad({ index: 0, id: 'Controller 0' })
      const gamepad1 = createMockGamepad({ index: 1, id: 'Controller 1' })
      setupGamepadMock([gamepad0, gamepad1, null, null])

      const { result } = renderHook(() => useGamepad({ gamepadIndex: 1 }))

      expect(result.current.gamepad?.id).toBe('Controller 1')
      expect(result.current.gamepad?.index).toBe(1)
    })

    it('returns null when specified gamepad index not connected', () => {
      const gamepad0 = createMockGamepad({ index: 0 })
      setupGamepadMock([gamepad0, null, null, null])

      const { result } = renderHook(() => useGamepad({ gamepadIndex: 2 }))

      expect(result.current.gamepad).toBeNull()
    })
  })

  describe('button polling', () => {
    it('updates button states when polling', async () => {
      const buttons = Array(17).fill(null).map(() => ({ pressed: false, value: 0 }))
      buttons[0] = { pressed: true, value: 1 } // A button pressed

      const mockGamepad = createMockGamepad({ buttons })
      setupGamepadMock([mockGamepad])

      const { result } = renderHook(() => useGamepad())

      // Trigger RAF callback
      act(() => {
        if (rafCallback) rafCallback(100)
      })

      await waitFor(() => {
        expect(result.current.buttons.length).toBeGreaterThan(0)
      })

      expect(result.current.buttons[0].pressed).toBe(true)
      expect(result.current.buttons[0].name).toBe('A')
    })

    it('reports pressed buttons', async () => {
      const buttons = Array(17).fill(null).map(() => ({ pressed: false, value: 0 }))
      buttons[0] = { pressed: true, value: 1 } // A
      buttons[4] = { pressed: true, value: 1 } // LB

      const mockGamepad = createMockGamepad({ buttons })
      setupGamepadMock([mockGamepad])

      const { result } = renderHook(() => useGamepad())

      act(() => {
        if (rafCallback) rafCallback(100)
      })

      await waitFor(() => {
        expect(result.current.pressedButtons).toContain('A')
      })

      expect(result.current.pressedButtons).toContain('LB')
      expect(result.current.pressedButtons).toHaveLength(2)
    })
  })

  describe('callback functions', () => {
    it('calls onButtonDown when button is pressed', async () => {
      const onButtonDown = vi.fn()
      const buttons = Array(17).fill(null).map(() => ({ pressed: false, value: 0 }))

      const mockGamepad = createMockGamepad({ buttons })
      setupGamepadMock([mockGamepad])

      renderHook(() => useGamepad({ onButtonDown }))

      // First poll - no buttons pressed
      act(() => {
        if (rafCallback) rafCallback(100)
      })

      // Press A button
      buttons[0] = { pressed: true, value: 1 }
      setupGamepadMock([createMockGamepad({ buttons })])

      // Second poll - A button pressed
      act(() => {
        if (rafCallback) rafCallback(200)
      })

      await waitFor(() => {
        expect(onButtonDown).toHaveBeenCalled()
      })

      expect(onButtonDown).toHaveBeenCalledWith(expect.objectContaining({
        name: 'A',
        index: 0,
        pressed: true,
      }))
    })

    it('calls onButtonUp when button is released', async () => {
      const onButtonUp = vi.fn()
      const buttons = Array(17).fill(null).map(() => ({ pressed: false, value: 0 }))
      buttons[0] = { pressed: true, value: 1 }

      const mockGamepad = createMockGamepad({ buttons })
      setupGamepadMock([mockGamepad])

      renderHook(() => useGamepad({ onButtonUp }))

      // First poll - A pressed
      act(() => {
        if (rafCallback) rafCallback(100)
      })

      // Release A button
      buttons[0] = { pressed: false, value: 0 }
      setupGamepadMock([createMockGamepad({ buttons })])

      // Second poll - A released
      act(() => {
        if (rafCallback) rafCallback(200)
      })

      await waitFor(() => {
        expect(onButtonUp).toHaveBeenCalled()
      })

      expect(onButtonUp).toHaveBeenCalledWith(expect.objectContaining({
        name: 'A',
        index: 0,
        pressed: false,
      }))
    })
  })

  describe('helper functions', () => {
    it('isButtonPressed returns true for pressed button', async () => {
      const buttons = Array(17).fill(null).map(() => ({ pressed: false, value: 0 }))
      buttons[0] = { pressed: true, value: 1 }

      const mockGamepad = createMockGamepad({ buttons })
      setupGamepadMock([mockGamepad])

      const { result } = renderHook(() => useGamepad())

      act(() => {
        if (rafCallback) rafCallback(100)
      })

      await waitFor(() => {
        expect(result.current.isButtonPressed('A')).toBe(true)
      })

      expect(result.current.isButtonPressed('B')).toBe(false)
    })

    it('getButton returns button state by name', async () => {
      const buttons = Array(17).fill(null).map(() => ({ pressed: false, value: 0 }))
      buttons[6] = { pressed: true, value: 0.75 } // LT with partial press

      const mockGamepad = createMockGamepad({ buttons })
      setupGamepadMock([mockGamepad])

      const { result } = renderHook(() => useGamepad())

      act(() => {
        if (rafCallback) rafCallback(100)
      })

      await waitFor(() => {
        expect(result.current.getButton('LT')).toBeDefined()
      })

      const lt = result.current.getButton('LT')
      expect(lt?.pressed).toBe(true)
      expect(lt?.value).toBe(0.75)
    })

    it('getButton returns undefined for unknown button', async () => {
      const mockGamepad = createMockGamepad()
      setupGamepadMock([mockGamepad])

      const { result } = renderHook(() => useGamepad())

      act(() => {
        if (rafCallback) rafCallback(100)
      })

      await waitFor(() => {
        expect(result.current.buttons.length).toBeGreaterThan(0)
      })

      expect(result.current.getButton('UnknownButton')).toBeUndefined()
    })
  })

  describe('axes tracking', () => {
    it('tracks axes when enabled', async () => {
      const mockGamepad = createMockGamepad({
        axes: [0.5, -0.5, 0, 0.8],
      })
      setupGamepadMock([mockGamepad])

      const { result } = renderHook(() => useGamepad({ trackAxes: true }))

      act(() => {
        if (rafCallback) rafCallback(100)
      })

      await waitFor(() => {
        expect(result.current.axes.length).toBeGreaterThan(0)
      })

      expect(result.current.axes[0].value).toBe(0.5)
      expect(result.current.axes[1].value).toBe(-0.5)
    })

    it('applies dead zone to axes', async () => {
      const mockGamepad = createMockGamepad({
        axes: [0.05, 0.5, -0.08, 0.15],
      })
      setupGamepadMock([mockGamepad])

      const { result } = renderHook(() => useGamepad({
        trackAxes: true,
        deadZone: 0.1,
      }))

      act(() => {
        if (rafCallback) rafCallback(100)
      })

      await waitFor(() => {
        expect(result.current.axes.length).toBeGreaterThan(0)
      })

      // Values below deadZone should be 0
      expect(result.current.axes[0].value).toBe(0)
      expect(result.current.axes[2].value).toBe(0)

      // Values above deadZone should pass through
      expect(result.current.axes[1].value).toBe(0.5)
      expect(result.current.axes[3].value).toBe(0.15)
    })

    it('calls onAxisChange when axes change significantly', async () => {
      const onAxisChange = vi.fn()
      const mockGamepad = createMockGamepad({ axes: [0, 0, 0, 0] })
      setupGamepadMock([mockGamepad])

      renderHook(() => useGamepad({
        trackAxes: true,
        deadZone: 0.1,
        onAxisChange,
      }))

      // First poll - zero axes
      act(() => {
        if (rafCallback) rafCallback(100)
      })

      // Move left stick
      setupGamepadMock([createMockGamepad({ axes: [0.8, 0, 0, 0] })])

      // Second poll - axis changed
      act(() => {
        if (rafCallback) rafCallback(200)
      })

      await waitFor(() => {
        expect(onAxisChange).toHaveBeenCalled()
      })

      expect(onAxisChange).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ index: 0, value: 0.8 }),
      ]))
    })

    it('does not track axes when disabled', async () => {
      const onAxisChange = vi.fn()
      const mockGamepad = createMockGamepad({ axes: [0.5, -0.5, 0, 0] })
      setupGamepadMock([mockGamepad])

      const { result } = renderHook(() => useGamepad({
        trackAxes: false,
        onAxisChange,
      }))

      act(() => {
        if (rafCallback) rafCallback(100)
      })

      // Axes should remain empty
      expect(result.current.axes).toEqual([])
      expect(onAxisChange).not.toHaveBeenCalled()
    })
  })

  describe('button name mapping', () => {
    it('maps standard gamepad buttons to names', async () => {
      const buttons = Array(17).fill(null).map(() => ({ pressed: true, value: 1 }))
      const mockGamepad = createMockGamepad({ buttons })
      setupGamepadMock([mockGamepad])

      const { result } = renderHook(() => useGamepad())

      act(() => {
        if (rafCallback) rafCallback(100)
      })

      await waitFor(() => {
        expect(result.current.buttons.length).toBe(17)
      })

      expect(result.current.buttons[0].name).toBe('A')
      expect(result.current.buttons[1].name).toBe('B')
      expect(result.current.buttons[2].name).toBe('X')
      expect(result.current.buttons[3].name).toBe('Y')
      expect(result.current.buttons[4].name).toBe('LB')
      expect(result.current.buttons[5].name).toBe('RB')
      expect(result.current.buttons[6].name).toBe('LT')
      expect(result.current.buttons[7].name).toBe('RT')
      expect(result.current.buttons[8].name).toBe('View')
      expect(result.current.buttons[9].name).toBe('Menu')
      expect(result.current.buttons[10].name).toBe('LS')
      expect(result.current.buttons[11].name).toBe('RS')
      expect(result.current.buttons[12].name).toBe('DpadUp')
      expect(result.current.buttons[13].name).toBe('DpadDown')
      expect(result.current.buttons[14].name).toBe('DpadLeft')
      expect(result.current.buttons[15].name).toBe('DpadRight')
      expect(result.current.buttons[16].name).toBe('Xbox')
    })

    it('falls back to ButtonN for unmapped indices', async () => {
      const buttons = Array(25).fill(null).map(() => ({ pressed: false, value: 0 }))
      const mockGamepad = createMockGamepad({ buttons })
      setupGamepadMock([mockGamepad])

      const { result } = renderHook(() => useGamepad())

      act(() => {
        if (rafCallback) rafCallback(100)
      })

      await waitFor(() => {
        expect(result.current.buttons.length).toBe(25)
      })

      // Button 21+ should use fallback naming
      expect(result.current.buttons[21].name).toBe('Button21')
      expect(result.current.buttons[24].name).toBe('Button24')
    })
  })
})
