import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { parseRewasdConfigV2, parseRewasdJsonV2 } from '@/lib/parsers/rewasdParser'
import type { RewasdConfig } from '@/lib/types/rewasd'
import { loadSampleRewasd } from '@/test/fixtures'

// Load the full GCO 4.7 fixture if available
function loadGcoFixture(): RewasdConfig | null {
  try {
    const path = join(__dirname, '../../../../public/configs/GCO 4.7 HOTAS.rewasd')
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return null
  }
}

describe('rewasdParser V2', () => {
  describe('parseRewasdConfigV2 with sample fixture', () => {
    it('parses sample config with no errors', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const result = parseRewasdConfigV2(config)
      expect(result.errors).toHaveLength(0)
      expect(result.mappings.length).toBeGreaterThan(0)
    })

    it('builds layers including Main (id=0)', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const result = parseRewasdConfigV2(config)
      const mainLayer = result.layers.find(l => l.id === 0)
      expect(mainLayer).toBeDefined()
      expect(mainLayer!.isDefault).toBe(true)
      expect(mainLayer!.name).toBe('Main')
    })

    it('produces MacroSequence with steps', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const result = parseRewasdConfigV2(config)
      const withSteps = result.mappings.filter(m => m.macro.steps.length > 0)
      expect(withSteps.length).toBeGreaterThan(0)
    })
  })

  describe('parseRewasdConfigV2 with GCO 4.7 fixture', () => {
    const config = loadGcoFixture()
    if (!config) {
      it.skip('GCO fixture not available', () => {})
      return
    }

    const result = parseRewasdConfigV2(config)

    it('parses with no errors', () => {
      expect(result.errors).toHaveLength(0)
    })

    it('extracts all 11 shift layers plus Main', () => {
      expect(result.layers.length).toBe(12) // 11 shifts + Main
      expect(result.layers[0].id).toBe(0)
      expect(result.layers[0].isDefault).toBe(true)
    })

    it('extracts layer names correctly', () => {
      const names = result.layers.map(l => l.name)
      expect(names).toContain('Main')
      expect(names).toContain('LB')
      expect(names).toContain('Y')
      expect(names).toContain('Menu')
    })

    it('extracts layer trigger buttons', () => {
      const lb = result.layers.find(l => l.name === 'LB')
      expect(lb?.triggerButton).toBe('LB')
      const y = result.layers.find(l => l.name === 'Y')
      expect(y?.triggerButton).toBe('Y')
    })

    it('captures unheritableMasks for Select layer', () => {
      const select = result.layers.find(l => l.name === 'Select')
      expect(select).toBeDefined()
      expect(select!.unheritableMasks).toBeDefined()
      expect(select!.unheritableMasks!.length).toBeGreaterThan(0)
    })

    it('captures radialMenu layer type', () => {
      const mainMenu = result.layers.find(l => l.name === 'MAIN MENU')
      expect(mainMenu).toBeDefined()
      expect(mainMenu!.triggerType).toBe('radialMenu')
    })

    // Test case 1: Simple remap (isSimple = true)
    it('identifies simple single-key remaps', () => {
      const simple = result.mappings.filter(m => m.macro.isSimple)
      expect(simple.length).toBeGreaterThan(0)
      // Simple mappings should have exactly 1 keyboard or gamepad key output
      for (const m of simple) {
        const totalOutputs = m.macro.keyboardKeysOutput.length + m.macro.gamepadButtonsOutput.length
        expect(totalOutputs).toBe(1)
        // Steps may include rumble/passive steps alongside the key press
        const actionSteps = m.macro.steps.filter(s => s.type !== 'pause' && s.type !== 'rumble')
        expect(actionSteps.length).toBeLessThanOrEqual(2)
      }
    })

    // Test case 2: Multi-key macro with pauses
    it('preserves multi-step macros with pauses', () => {
      const withPauses = result.mappings.filter(m =>
        m.macro.steps.some(s => s.type === 'pause' && s.durationMs && s.durationMs > 0)
      )
      expect(withPauses.length).toBeGreaterThan(0)
      // These should NOT be marked as simple
      for (const m of withPauses) {
        expect(m.macro.isSimple).toBe(false)
      }
    })

    // Test case 3: Gamepad output steps captured
    it('captures gamepad output steps in macros', () => {
      const withGamepad = result.mappings.filter(m =>
        m.macro.steps.some(s => s.type === 'gamepad')
      )
      expect(withGamepad.length).toBeGreaterThan(0)
      // Should have gamepad buttons in the output list
      for (const m of withGamepad) {
        expect(m.macro.gamepadButtonsOutput.length).toBeGreaterThan(0)
      }
    })

    // Test case 4: Mixed keyboard + gamepad macros
    it('captures mixed keyboard+gamepad macros', () => {
      const mixed = result.mappings.filter(m =>
        m.macro.keyboardKeysOutput.length > 0 && m.macro.gamepadButtonsOutput.length > 0
      )
      expect(mixed.length).toBeGreaterThan(0)
    })

    // Test case 5: Activator timing params
    it('captures activator timing parameters', () => {
      const withParams = result.mappings.filter(m => m.activator.params)
      expect(withParams.length).toBeGreaterThan(0)

      // Long press should have longPressMs
      const longPress = result.mappings.find(m =>
        m.activator.type === 'long' && m.activator.params?.longPressMs
      )
      expect(longPress).toBeDefined()
      expect(longPress!.activator.params!.longPressMs).toBeGreaterThan(0)
    })

    // Test case 6: Total counts
    it('captures significantly more mappings than v1 (includes gamepad-only)', () => {
      // V2 includes gamepad-only outputs that v1 skipped
      expect(result.mappings.length).toBeGreaterThan(200)
    })

    it('has correct macro step ordering', () => {
      // Find a multi-step macro and verify steps alternate down/up
      const multiStep = result.mappings.find(m =>
        m.macro.steps.length > 4 &&
        m.macro.steps.every(s => s.type === 'keyboard')
      )
      if (multiStep) {
        // Should have down/up pairs
        const downCount = multiStep.macro.steps.filter(s => s.action === 'down').length
        const upCount = multiStep.macro.steps.filter(s => s.action === 'up').length
        expect(downCount).toBe(upCount)
      }
    })
  })

  describe('parseRewasdJsonV2', () => {
    it('parses valid JSON string', () => {
      const config = loadGcoFixture()
      if (!config) return
      const json = JSON.stringify(config)
      const result = parseRewasdJsonV2(json)
      expect(result.errors).toHaveLength(0)
      expect(result.mappings.length).toBeGreaterThan(0)
    })

    it('returns error for invalid JSON', () => {
      const result = parseRewasdJsonV2('not json')
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.mappings).toHaveLength(0)
    })
  })
})
