'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { GAMEPAD_API_BUTTONS } from '@/lib/constants/gamepadButtons';

// ============================================================================
// Types
// ============================================================================

export interface GamepadInfo {
  /** Gamepad index */
  index: number;
  /** Gamepad ID string */
  id: string;
  /** Whether the gamepad is connected */
  connected: boolean;
  /** Number of buttons */
  buttonCount: number;
  /** Number of axes */
  axisCount: number;
}

export interface ButtonState {
  /** Button name (e.g., 'A', 'LB') */
  name: string;
  /** Button index in the Gamepad API */
  index: number;
  /** Whether the button is currently pressed */
  pressed: boolean;
  /** Button value (0-1, useful for triggers) */
  value: number;
}

export interface AxisState {
  /** Axis index */
  index: number;
  /** Axis value (-1 to 1) */
  value: number;
}

export interface UseGamepadOptions {
  /** Gamepad index to monitor (default: 0) */
  gamepadIndex?: number;
  /** Polling rate in ms (default: 16 ~= 60fps) */
  pollRate?: number;
  /** Dead zone threshold for axes (default: 0.1) */
  deadZone?: number;
  /** Whether to track axes (default: true) */
  trackAxes?: boolean;
  /** Callback when a button is pressed */
  onButtonDown?: (button: ButtonState) => void;
  /** Callback when a button is released */
  onButtonUp?: (button: ButtonState) => void;
  /** Callback when axes change */
  onAxisChange?: (axes: AxisState[]) => void;
}

export interface UseGamepadReturn {
  /** Currently connected gamepad info */
  gamepad: GamepadInfo | null;
  /** All connected gamepads */
  gamepads: GamepadInfo[];
  /** Current button states */
  buttons: ButtonState[];
  /** Currently pressed button names */
  pressedButtons: string[];
  /** Current axis states */
  axes: AxisState[];
  /** Whether a specific button is pressed */
  isButtonPressed: (buttonName: string) => boolean;
  /** Get button state by name */
  getButton: (buttonName: string) => ButtonState | undefined;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert Gamepad API button index to button name
 */
function indexToButtonName(index: number): string {
  return GAMEPAD_API_BUTTONS[index] ?? `Button${index}`;
}

/**
 * Extract gamepad info from a Gamepad object
 */
function extractGamepadInfo(gamepad: Gamepad): GamepadInfo {
  return {
    index: gamepad.index,
    id: gamepad.id,
    connected: gamepad.connected,
    buttonCount: gamepad.buttons.length,
    axisCount: gamepad.axes.length,
  };
}

/**
 * Check if gamepad API is supported
 */
export function isGamepadSupported(): boolean {
  return typeof navigator !== 'undefined' && 'getGamepads' in navigator;
}

// ============================================================================
// Hook
// ============================================================================

export function useGamepad(options: UseGamepadOptions = {}): UseGamepadReturn {
  const {
    gamepadIndex = 0,
    pollRate = 16,
    deadZone = 0.1,
    trackAxes = true,
    onButtonDown,
    onButtonUp,
    onAxisChange,
  } = options;

  const [gamepad, setGamepad] = useState<GamepadInfo | null>(null);
  const [gamepads, setGamepads] = useState<GamepadInfo[]>([]);
  const [buttons, setButtons] = useState<ButtonState[]>([]);
  const [axes, setAxes] = useState<AxisState[]>([]);

  // Track previous state for detecting changes
  const prevButtonsRef = useRef<Map<number, boolean>>(new Map());
  const prevAxesRef = useRef<Map<number, number>>(new Map());

  // Stable callback refs
  const onButtonDownRef = useRef(onButtonDown);
  const onButtonUpRef = useRef(onButtonUp);
  const onAxisChangeRef = useRef(onAxisChange);

  useEffect(() => {
    onButtonDownRef.current = onButtonDown;
    onButtonUpRef.current = onButtonUp;
    onAxisChangeRef.current = onAxisChange;
  }, [onButtonDown, onButtonUp, onAxisChange]);

  // Handle gamepad connection/disconnection
  useEffect(() => {
    if (!isGamepadSupported()) return;

    const updateGamepads = () => {
      const pads = navigator.getGamepads();
      const connected: GamepadInfo[] = [];

      for (const pad of pads) {
        if (pad && pad.connected) {
          connected.push(extractGamepadInfo(pad));
        }
      }

      setGamepads(connected);

      // Update the target gamepad
      const target = connected.find(g => g.index === gamepadIndex);
      setGamepad(target ?? null);
    };

    const handleConnect = (event: GamepadEvent) => {
      updateGamepads();
    };

    const handleDisconnect = (event: GamepadEvent) => {
      updateGamepads();
    };

    window.addEventListener('gamepadconnected', handleConnect);
    window.addEventListener('gamepaddisconnected', handleDisconnect);

    // Initial check
    updateGamepads();

    return () => {
      window.removeEventListener('gamepadconnected', handleConnect);
      window.removeEventListener('gamepaddisconnected', handleDisconnect);
    };
  }, [gamepadIndex]);

  // Polling loop for button/axis state
  useEffect(() => {
    if (!isGamepadSupported() || !gamepad) return;

    let animationFrameId: number;
    let lastPollTime = 0;

    const poll = (timestamp: number) => {
      // Throttle to pollRate
      if (timestamp - lastPollTime >= pollRate) {
        lastPollTime = timestamp;

        const pads = navigator.getGamepads();
        const pad = pads[gamepadIndex];

        if (pad && pad.connected) {
          // Process buttons
          const newButtons: ButtonState[] = [];
          const prevButtons = prevButtonsRef.current;

          for (let i = 0; i < pad.buttons.length; i++) {
            const button = pad.buttons[i];
            const name = indexToButtonName(i);
            const state: ButtonState = {
              name,
              index: i,
              pressed: button.pressed,
              value: button.value,
            };

            newButtons.push(state);

            // Check for state changes
            const wasPressed = prevButtons.get(i) ?? false;
            if (button.pressed && !wasPressed) {
              onButtonDownRef.current?.(state);
            } else if (!button.pressed && wasPressed) {
              onButtonUpRef.current?.(state);
            }

            prevButtons.set(i, button.pressed);
          }

          setButtons(newButtons);

          // Process axes
          if (trackAxes) {
            const newAxes: AxisState[] = [];
            const prevAxes = prevAxesRef.current;
            let axesChanged = false;

            for (let i = 0; i < pad.axes.length; i++) {
              const value = Math.abs(pad.axes[i]) < deadZone ? 0 : pad.axes[i];
              newAxes.push({ index: i, value });

              const prevValue = prevAxes.get(i) ?? 0;
              if (Math.abs(value - prevValue) > deadZone) {
                axesChanged = true;
              }
              prevAxes.set(i, value);
            }

            if (axesChanged) {
              onAxisChangeRef.current?.(newAxes);
            }

            setAxes(newAxes);
          }
        }
      }

      animationFrameId = requestAnimationFrame(poll);
    };

    animationFrameId = requestAnimationFrame(poll);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gamepad, gamepadIndex, pollRate, deadZone, trackAxes]);

  // Derived state: currently pressed button names
  const pressedButtons = buttons.filter(b => b.pressed).map(b => b.name);

  // Helper functions
  const isButtonPressed = useCallback(
    (buttonName: string): boolean => {
      return buttons.some(b => b.name === buttonName && b.pressed);
    },
    [buttons]
  );

  const getButton = useCallback(
    (buttonName: string): ButtonState | undefined => {
      return buttons.find(b => b.name === buttonName);
    },
    [buttons]
  );

  return {
    gamepad,
    gamepads,
    buttons,
    pressedButtons,
    axes,
    isButtonPressed,
    getButton,
  };
}

export default useGamepad;
