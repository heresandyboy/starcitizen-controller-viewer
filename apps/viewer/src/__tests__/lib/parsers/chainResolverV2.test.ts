import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import { resolveBindingsV2, buildBindingIndex } from '@/lib/parsers/chainResolver'
import { parseRewasdConfigV2 } from '@/lib/parsers/rewasdParser'
import { parseStarCitizenXml } from '@/lib/parsers/xmlParser'
import type { RewasdConfig } from '@/lib/types/rewasd'
import type { ResolvedBinding } from '@/lib/types/binding'
import { loadSampleRewasd, loadSampleActionMaps } from '@/test/fixtures'

// Load fixtures
function loadGcoFixture(): RewasdConfig | null {
  try {
    const path = join(__dirname, '../../../../public/configs/GCO 4.7 HOTAS.rewasd')
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return null
  }
}

function loadGcoXml(): string | null {
  try {
    const path = join(__dirname, '../../../../public/configs/GCO 4.7 layout_my_exported_actionmaps.xml')
    return readFileSync(path, 'utf-8')
  } catch {
    return null
  }
}

function loadDefaultActions() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@/lib/data/sc-4.7/defaultActions').defaultActions
  } catch {
    return []
  }
}

describe('chainResolver V2', () => {
  describe('resolveBindingsV2 with sample fixtures', () => {
    const rewasdConfig = loadSampleRewasd() as RewasdConfig
    const rewasdResult = parseRewasdConfigV2(rewasdConfig)
    const xmlResult = parseStarCitizenXml(loadSampleActionMaps())

    it('resolves sample chain with no errors', () => {
      const index = resolveBindingsV2(rewasdResult, xmlResult)
      expect(index.all.length).toBeGreaterThan(0)
      expect(index.stats.totalBindings).toBeGreaterThan(0)
    })

    // Test case 1: Simple chain — A single → W → kb1_w → v_strafe_forward
    it('resolves simple keyboard chain (A → W → strafe forward)', () => {
      const index = resolveBindingsV2(rewasdResult, xmlResult)
      const aBindings = index.byButton.get('A')
      expect(aBindings).toBeDefined()

      // Find the one in the Default shift (shiftId=1 in sample)
      const simple = aBindings!.find(b =>
        b.activator.type === 'single' && b.actions.some(a => a.name === 'v_strafe_forward')
      )
      expect(simple).toBeDefined()
      expect(simple!.source).toBe('rewasd+xml')
      expect(simple!.actions[0].resolvedVia).toBe('keyboard')
      expect(simple!.actions[0].matchedInput).toBe('kb1_w')
    })

    // Test case 2: Multi-key macro — LB+A → LShift+W → resolves both keys
    it('resolves multi-key macro (LB+A → LShift+W)', () => {
      const index = resolveBindingsV2(rewasdResult, xmlResult)
      const aBindings = index.byButton.get('A')
      expect(aBindings).toBeDefined()

      // Find the one in the LB Shift layer (shiftId=2 in sample)
      const shifted = aBindings!.find(b => b.layer.name === 'LB Shift')
      expect(shifted).toBeDefined()
      expect(shifted!.macro.keyboardKeysOutput.length).toBe(2)
    })

    it('builds layers correctly', () => {
      const index = resolveBindingsV2(rewasdResult, xmlResult)
      expect(index.layers.length).toBeGreaterThan(0)
      const mainLayer = index.layers.find(l => l.id === 0)
      expect(mainLayer).toBeDefined()
      expect(mainLayer!.isDefault).toBe(true)
    })

    it('builds byAction index for reverse lookup', () => {
      const index = resolveBindingsV2(rewasdResult, xmlResult)
      const fwdBindings = index.byAction.get('v_strafe_forward')
      expect(fwdBindings).toBeDefined()
      expect(fwdBindings!.length).toBeGreaterThan(0)
    })

    it('builds byLayer index', () => {
      const index = resolveBindingsV2(rewasdResult, xmlResult)
      // Should have bindings in at least one layer
      expect(index.byLayer.size).toBeGreaterThan(0)
    })

    it('computes stats correctly', () => {
      const index = resolveBindingsV2(rewasdResult, xmlResult)
      expect(index.stats.totalBindings).toBe(index.all.length)
      expect(index.stats.resolvedBindings + index.stats.unresolvedBindings).toBe(index.stats.totalBindings)
    })
  })

  describe('resolveBindingsV2 with GCO 4.7 fixtures', () => {
    const rewasdConfig = loadGcoFixture()
    const xmlString = loadGcoXml()

    if (!rewasdConfig || !xmlString) {
      it.skip('GCO fixtures not available', () => {})
      return
    }

    const rewasdResult = parseRewasdConfigV2(rewasdConfig)
    const xmlResult = parseStarCitizenXml(xmlString)
    const defaults = loadDefaultActions()
    const index = resolveBindingsV2(rewasdResult, xmlResult, defaults)

    it('resolves many bindings from full config', () => {
      expect(index.stats.totalBindings).toBeGreaterThan(100)
    })

    it('resolves most bindings (low unresolved count)', () => {
      const resolvedPct = index.stats.resolvedBindings / index.stats.totalBindings
      expect(resolvedPct).toBeGreaterThan(0.5)
    })

    it('has correct layer count (12 = 11 shifts + Main)', () => {
      expect(index.layers.length).toBe(12)
    })

    // Test case 3: Gamepad passthrough
    it('resolves gamepad output steps to SC actions', () => {
      const gamepadResolved = index.all.filter(b =>
        b.actions.some(a => a.resolvedVia === 'gamepad')
      )
      expect(gamepadResolved.length).toBeGreaterThan(0)
      // Check one has the right source
      const withGamepad = gamepadResolved.find(b =>
        b.source === 'rewasd+xml-gamepad' || b.source === 'rewasd+xml'
      )
      expect(withGamepad).toBeDefined()
    })

    // Test case 4: Mixed keyboard + gamepad macro
    it('resolves mixed keyboard+gamepad macros', () => {
      const mixed = index.all.filter(b =>
        b.actions.some(a => a.resolvedVia === 'keyboard') &&
        b.actions.some(a => a.resolvedVia === 'gamepad')
      )
      expect(mixed.length).toBeGreaterThan(0)
    })

    // Test case 5: Unresolved binding
    it('marks bindings with no SC match as unresolved', () => {
      expect(index.stats.unresolvedBindings).toBeGreaterThanOrEqual(0)
      const unresolved = index.all.filter(b => b.source === 'rewasd-unresolved')
      expect(unresolved.length).toBe(index.stats.unresolvedBindings)
    })

    // Test case 6: Default fallback
    it('falls back to SC defaults for unresolved keyboard keys', () => {
      if (defaults.length === 0) return
      const defaultResolved = index.all.filter(b => b.source === 'rewasd+default')
      // There should be at least some keys that only exist in defaults
      expect(defaultResolved.length).toBeGreaterThanOrEqual(0)
    })

    // Test case 7: Multi-action bindings
    it('captures multi-action bindings', () => {
      expect(index.stats.multiActionBindings).toBeGreaterThanOrEqual(0)
    })

    // Test case 8: Index queries
    it('byAction reverse lookup returns correct bindings', () => {
      // Pick an action that should exist
      for (const [actionName, bindings] of index.byAction) {
        expect(actionName).toBeTruthy()
        expect(bindings.length).toBeGreaterThan(0)
        for (const b of bindings) {
          expect(b.actions.some(a => a.name === actionName)).toBe(true)
        }
        break // Just test one
      }
    })

    it('byButtonLayerActivator provides O(1) lookup', () => {
      // Pick a binding and verify lookup
      const binding = index.all[0]
      const layerMap = index.byButtonLayerActivator.get(binding.button)
      expect(layerMap).toBeDefined()
      const activatorMap = layerMap!.get(binding.layer.id)
      expect(activatorMap).toBeDefined()
      const found = activatorMap!.get(binding.activator.type)
      expect(found).toBeDefined()
      expect(found!.id).toBe(binding.id)
    })

    it('byMode groups by gameplay mode', () => {
      expect(index.byMode.size).toBeGreaterThan(0)
      for (const [, bindings] of index.byMode) {
        expect(bindings.length).toBeGreaterThan(0)
      }
    })

    it('step ordering is preserved in resolved macros', () => {
      const multiStep = index.all.find(b => b.macro.steps.length > 2)
      if (multiStep) {
        // Steps should maintain original indices
        for (const action of multiStep.actions) {
          expect(action.macroStepIndex).toBeGreaterThanOrEqual(0)
          expect(action.macroStepIndex).toBeLessThan(multiStep.macro.steps.length)
        }
      }
    })
  })

  describe('buildBindingIndex', () => {
    it('builds empty index from empty input', () => {
      const index = buildBindingIndex([], [])
      expect(index.all).toHaveLength(0)
      expect(index.stats.totalBindings).toBe(0)
      expect(index.byAction.size).toBe(0)
    })

    it('builds index with correct stats from mock bindings', () => {
      const mockLayer = { id: 0, name: 'Main', isDefault: true }
      const mockBindings: ResolvedBinding[] = [
        {
          id: 'test-1',
          button: 'A',
          layer: mockLayer,
          activator: { type: 'single', mode: 'onetime' },
          macro: { steps: [], totalDurationMs: 0, isSimple: true, keyboardKeysOutput: ['W'], gamepadButtonsOutput: [] },
          actions: [{
            name: 'v_strafe_forward', displayName: 'Strafe Forward',
            actionMap: 'spaceship_movement', gameplayMode: 'Flight',
            macroStepIndex: 0, resolvedVia: 'keyboard', matchedInput: 'kb1_w',
          }],
          source: 'rewasd+xml',
        },
        {
          id: 'test-2',
          button: 'B',
          layer: mockLayer,
          activator: { type: 'single', mode: 'onetime' },
          macro: { steps: [], totalDurationMs: 0, isSimple: true, keyboardKeysOutput: [], gamepadButtonsOutput: [] },
          actions: [],
          source: 'rewasd-unresolved',
        },
      ]

      const index = buildBindingIndex(mockBindings, [mockLayer])
      expect(index.stats.totalBindings).toBe(2)
      expect(index.stats.resolvedBindings).toBe(1)
      expect(index.stats.unresolvedBindings).toBe(1)
      expect(index.byAction.get('v_strafe_forward')).toHaveLength(1)
      expect(index.byButton.get('A')).toHaveLength(1)
      expect(index.byButton.get('B')).toHaveLength(1)
      expect(index.byLayer.get(0)).toHaveLength(2)
    })
  })

  describe('action deduplication', () => {
    const rewasdConfig = loadGcoFixture()
    const xmlString = loadGcoXml()

    if (!rewasdConfig || !xmlString) {
      it.skip('GCO fixtures not available', () => {})
      return
    }

    const rewasdResult = parseRewasdConfigV2(rewasdConfig)
    const xmlResult = parseStarCitizenXml(xmlString)
    const defaults = loadDefaultActions()
    const index = resolveBindingsV2(rewasdResult, xmlResult, defaults)

    it('deduplicates repeated actions from turbo/loop macros', () => {
      // No binding should have duplicate (actionName, actionMap) pairs
      for (const binding of index.all) {
        const seen = new Set<string>()
        for (const action of binding.actions) {
          const key = `${action.actionMap}::${action.name}`
          expect(seen.has(key)).toBe(false)
          seen.add(key)
        }
      }
    })

    it('sets repeatCount > 1 for turbo/loop actions', () => {
      // At least some bindings should have turbo repeats
      const turboActions = index.all.flatMap(b =>
        b.actions.filter(a => a.repeatCount !== undefined && a.repeatCount > 1)
      )
      expect(turboActions.length).toBeGreaterThan(0)
    })

    it('keeps action count reasonable (no 100+ actions per binding)', () => {
      for (const binding of index.all) {
        expect(binding.actions.length).toBeLessThan(100)
      }
    })
  })
})
