/**
 * Custom Vitest matchers for mapping assertions
 */

import { expect } from 'vitest'
import type { UnifiedMapping, GameplayMode, MappingSource } from '@/lib/types/unified'

interface MappingMatcherOptions {
  controllerButton?: string
  modifier?: string | null
  gameAction?: string
  gameplayMode?: GameplayMode
  source?: MappingSource
  keyboardKeys?: string[]
}

declare module 'vitest' {
  interface Assertion<T = unknown> {
    toBeValidMapping(): T
    toMatchMappingCriteria(criteria: MappingMatcherOptions): T
    toHaveControllerInput(button: string, modifier?: string | null): T
    toHaveGameAction(action: string): T
    toHaveKeyboardChain(keys: string[]): T
  }

  interface AsymmetricMatchersContaining {
    toBeValidMapping(): unknown
    toMatchMappingCriteria(criteria: MappingMatcherOptions): unknown
    toHaveControllerInput(button: string, modifier?: string | null): unknown
    toHaveGameAction(action: string): unknown
    toHaveKeyboardChain(keys: string[]): unknown
  }
}

expect.extend({
  /**
   * Check if a mapping has all required fields
   */
  toBeValidMapping(received: unknown) {
    const mapping = received as UnifiedMapping

    const requiredFields = [
      'id',
      'controllerButton',
      'activationType',
      'activationMode',
      'gameAction',
      'gameActionReadable',
      'gameplayMode',
      'actionMap',
      'source',
    ] as const

    const missingFields = requiredFields.filter(
      (field) => mapping[field] === undefined || mapping[field] === null
    )

    if (missingFields.length > 0) {
      return {
        message: () =>
          `Expected mapping to have all required fields, but missing: ${missingFields.join(', ')}`,
        pass: false,
      }
    }

    return {
      message: () => 'Expected mapping to be missing required fields',
      pass: true,
    }
  },

  /**
   * Check if a mapping matches specific criteria
   */
  toMatchMappingCriteria(received: unknown, criteria: MappingMatcherOptions) {
    const mapping = received as UnifiedMapping
    const failures: string[] = []

    if (criteria.controllerButton !== undefined && mapping.controllerButton !== criteria.controllerButton) {
      failures.push(`controllerButton: expected "${criteria.controllerButton}", got "${mapping.controllerButton}"`)
    }

    if (criteria.modifier !== undefined) {
      if (criteria.modifier === null && mapping.modifier !== undefined) {
        failures.push(`modifier: expected no modifier, got "${mapping.modifier}"`)
      } else if (criteria.modifier !== null && mapping.modifier !== criteria.modifier) {
        failures.push(`modifier: expected "${criteria.modifier}", got "${mapping.modifier ?? 'none'}"`)
      }
    }

    if (criteria.gameAction !== undefined && mapping.gameAction !== criteria.gameAction) {
      failures.push(`gameAction: expected "${criteria.gameAction}", got "${mapping.gameAction}"`)
    }

    if (criteria.gameplayMode !== undefined && mapping.gameplayMode !== criteria.gameplayMode) {
      failures.push(`gameplayMode: expected "${criteria.gameplayMode}", got "${mapping.gameplayMode}"`)
    }

    if (criteria.source !== undefined && mapping.source !== criteria.source) {
      failures.push(`source: expected "${criteria.source}", got "${mapping.source}"`)
    }

    if (criteria.keyboardKeys !== undefined) {
      const expected = criteria.keyboardKeys.sort().join(',')
      const actual = (mapping.keyboardKeys ?? []).sort().join(',')
      if (expected !== actual) {
        failures.push(`keyboardKeys: expected [${expected}], got [${actual}]`)
      }
    }

    if (failures.length > 0) {
      return {
        message: () => `Mapping did not match criteria:\n  ${failures.join('\n  ')}`,
        pass: false,
      }
    }

    return {
      message: () => 'Expected mapping not to match criteria',
      pass: true,
    }
  },

  /**
   * Check if a mapping has a specific controller input
   */
  toHaveControllerInput(received: unknown, button: string, modifier?: string | null) {
    const mapping = received as UnifiedMapping

    const buttonMatch = mapping.controllerButton === button
    const modifierMatch =
      modifier === undefined ||
      (modifier === null && mapping.modifier === undefined) ||
      mapping.modifier === modifier

    if (buttonMatch && modifierMatch) {
      return {
        message: () =>
          `Expected mapping not to have controller input ${button}${modifier ? `+${modifier}` : ''}`,
        pass: true,
      }
    }

    return {
      message: () =>
        `Expected mapping to have controller input ${button}${modifier ? `+${modifier}` : ''}, ` +
        `but got ${mapping.controllerButton}${mapping.modifier ? `+${mapping.modifier}` : ''}`,
      pass: false,
    }
  },

  /**
   * Check if a mapping maps to a specific game action
   */
  toHaveGameAction(received: unknown, action: string) {
    const mapping = received as UnifiedMapping

    if (mapping.gameAction === action) {
      return {
        message: () => `Expected mapping not to have game action "${action}"`,
        pass: true,
      }
    }

    return {
      message: () => `Expected mapping to have game action "${action}", but got "${mapping.gameAction}"`,
      pass: false,
    }
  },

  /**
   * Check if a mapping uses a keyboard chain through reWASD
   */
  toHaveKeyboardChain(received: unknown, keys: string[]) {
    const mapping = received as UnifiedMapping
    const expected = keys.sort().join(',')
    const actual = (mapping.keyboardKeys ?? []).sort().join(',')

    if (expected === actual && (mapping.source === 'rewasd+xml' || mapping.source === 'rewasd')) {
      return {
        message: () => `Expected mapping not to have keyboard chain [${expected}]`,
        pass: true,
      }
    }

    if (!mapping.keyboardKeys || mapping.keyboardKeys.length === 0) {
      return {
        message: () => `Expected mapping to have keyboard chain [${expected}], but has no keyboard keys`,
        pass: false,
      }
    }

    return {
      message: () => `Expected mapping to have keyboard chain [${expected}], but got [${actual}]`,
      pass: false,
    }
  },
})
