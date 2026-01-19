'use client';

import { useState, useCallback, useMemo } from 'react';
import { useGamepad, isGamepadSupported } from '@/hooks/useGamepad';
import { getButtonDisplayName } from '@/lib/constants/gamepadButtons';
import type { UnifiedMapping } from '@/lib/types/unified';
import type { ButtonState } from '@/hooks/useGamepad';

// ============================================================================
// Types
// ============================================================================

interface ControllerInputProps {
  /** All available mappings to search through */
  mappings: UnifiedMapping[];
  /** Callback when button press matches mappings */
  onMappingsFound?: (mappings: UnifiedMapping[], buttonCombo: string) => void;
  /** Whether to show detailed gamepad info */
  showDetails?: boolean;
  /** Custom class name */
  className?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Find mappings that match the pressed button combination
 */
function findMatchingMappings(
  mappings: UnifiedMapping[],
  pressedButtons: string[]
): UnifiedMapping[] {
  if (pressedButtons.length === 0) return [];

  // Sort pressed buttons to normalize comparison
  const sortedPressed = [...pressedButtons].sort();

  return mappings.filter(mapping => {
    // Build expected button combo for this mapping
    const expectedButtons: string[] = [mapping.controllerButton];
    if (mapping.modifier) {
      expectedButtons.push(mapping.modifier);
    }
    expectedButtons.sort();

    // Check if they match
    if (expectedButtons.length !== sortedPressed.length) return false;
    return expectedButtons.every((btn, i) => btn === sortedPressed[i]);
  });
}

/**
 * Format pressed buttons as a display string
 */
function formatButtonCombo(pressedButtons: string[]): string {
  if (pressedButtons.length === 0) return '';
  if (pressedButtons.length === 1) return pressedButtons[0];

  // Put modifier first if present
  const modifiers = ['LB', 'RB', 'LT', 'RT'];
  const sorted = [...pressedButtons].sort((a, b) => {
    const aIsMod = modifiers.includes(a);
    const bIsMod = modifiers.includes(b);
    if (aIsMod && !bIsMod) return -1;
    if (!aIsMod && bIsMod) return 1;
    return 0;
  });

  return sorted.join(' + ');
}

// ============================================================================
// Component
// ============================================================================

export function ControllerInput({
  mappings,
  onMappingsFound,
  showDetails = false,
  className = '',
}: ControllerInputProps) {
  const [lastCombo, setLastCombo] = useState<string>('');
  const [matchCount, setMatchCount] = useState<number>(0);

  const handleButtonDown = useCallback(
    (button: ButtonState) => {
      // We'll handle this in the effect that watches pressedButtons
    },
    []
  );

  const {
    gamepad,
    gamepads,
    pressedButtons,
    axes,
  } = useGamepad({
    onButtonDown: handleButtonDown,
  });

  // Find matching mappings when buttons change
  useMemo(() => {
    if (pressedButtons.length === 0) return;

    const combo = formatButtonCombo(pressedButtons);
    const matches = findMatchingMappings(mappings, pressedButtons);

    if (combo !== lastCombo) {
      setLastCombo(combo);
      setMatchCount(matches.length);

      if (onMappingsFound && matches.length > 0) {
        onMappingsFound(matches, combo);
      }
    }
  }, [pressedButtons, mappings, onMappingsFound, lastCombo]);

  const isSupported = isGamepadSupported();

  if (!isSupported) {
    return (
      <div className={`p-4 rounded-lg bg-zinc-100 dark:bg-zinc-800 ${className}`}>
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <ControllerIcon className="w-5 h-5" />
          <span>Gamepad API not supported in this browser</span>
        </div>
      </div>
    );
  }

  if (!gamepad) {
    return (
      <div className={`p-4 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 ${className}`}>
        <div className="flex flex-col items-center gap-2 text-zinc-500 dark:text-zinc-400">
          <ControllerIcon className="w-8 h-8 animate-pulse" />
          <span>Connect a controller and press any button</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ControllerIcon className="w-5 h-5 text-green-500" />
            <span className="font-medium text-zinc-900 dark:text-zinc-100">
              Controller Connected
            </span>
          </div>
          {gamepads.length > 1 && (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {gamepads.length} controllers
            </span>
          )}
        </div>
        {showDetails && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">
            {gamepad.id}
          </p>
        )}
      </div>

      {/* Button display */}
      <div className="p-4">
        {pressedButtons.length > 0 ? (
          <div className="space-y-3">
            {/* Current combo */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {pressedButtons.map((btn) => (
                  <span
                    key={btn}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-500 text-white font-mono text-sm font-medium"
                  >
                    {btn}
                  </span>
                ))}
              </div>
            </div>

            {/* Match indicator */}
            {matchCount > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {matchCount} mapping{matchCount !== 1 ? 's' : ''} found
              </p>
            )}
          </div>
        ) : (
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Press buttons to see mappings...
          </p>
        )}

        {/* Last combo */}
        {!pressedButtons.length && lastCombo && (
          <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              Last: <span className="font-mono">{lastCombo}</span>
              {matchCount > 0 && (
                <span className="ml-2 text-green-500">
                  ({matchCount} match{matchCount !== 1 ? 'es' : ''})
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Axes display (optional) */}
      {showDetails && axes.length > 0 && (
        <div className="px-4 pb-4">
          <div className="grid grid-cols-4 gap-2">
            {axes.slice(0, 4).map((axis, i) => (
              <div key={i} className="text-center">
                <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-1">
                  {i < 2 ? 'L' : 'R'}{i % 2 === 0 ? 'X' : 'Y'}
                </div>
                <div className="h-1 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{
                      width: `${Math.abs(axis.value) * 50}%`,
                      marginLeft: axis.value < 0 ? `${50 - Math.abs(axis.value) * 50}%` : '50%',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Icons
// ============================================================================

function ControllerIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M21.58 16.09l-1.09-7.66A3.996 3.996 0 0016.53 5H7.47a3.996 3.996 0 00-3.96 3.43l-1.09 7.66C2.15 17.79 3.39 19 4.94 19c.68 0 1.32-.27 1.8-.75L9 16h6l2.25 2.25c.48.48 1.13.75 1.8.75 1.56 0 2.8-1.21 2.53-2.91zM11 11H9v2H8v-2H6v-1h2V8h1v2h2v1zm4-1c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
    </svg>
  );
}

export default ControllerInput;
