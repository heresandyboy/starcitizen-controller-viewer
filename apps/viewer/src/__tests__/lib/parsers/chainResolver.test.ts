import { describe, it, expect, beforeEach } from 'vitest'
import {
  resolveChain,
  parseAndResolve,
  filterByMode,
  filterByModifier,
  filterByButton,
  getAvailableModes,
  getAvailableModifiers,
  groupByMode,
  groupByModifier,
  searchMappings,
} from '@/lib/parsers/chainResolver'
import { parseRewasdConfig } from '@/lib/parsers/rewasdParser'
import { parseStarCitizenXml } from '@/lib/parsers/xmlParser'
import type { RewasdConfig } from '@/lib/types/rewasd'
import { loadSampleRewasd, loadSampleActionMaps, loadFixture } from '@/test/fixtures'
import { mockMapping, mockMappings, resetMockCounters } from '@/test/mocks'

describe('chainResolver', () => {
  beforeEach(() => {
    resetMockCounters()
  })

  describe('resolveChain', () => {
    it('resolves chain from rewasd to xml', () => {
      const rewasdConfig = loadSampleRewasd() as RewasdConfig
      const rewasdResult = parseRewasdConfig(rewasdConfig)
      const xmlResult = parseStarCitizenXml(loadSampleActionMaps())

      const result = resolveChain(rewasdResult, xmlResult)

      expect(result.errors).toHaveLength(0)
      expect(result.mappings.length).toBeGreaterThan(0)
    })

    it('creates rewasd+xml mappings for resolved chains', () => {
      const rewasdConfig = loadSampleRewasd() as RewasdConfig
      const rewasdResult = parseRewasdConfig(rewasdConfig)
      const xmlResult = parseStarCitizenXml(loadSampleActionMaps())

      const result = resolveChain(rewasdResult, xmlResult)

      const resolvedMappings = result.mappings.filter(
        (m) => m.source === 'rewasd+xml'
      )
      expect(resolvedMappings.length).toBeGreaterThan(0)

      // Check that resolved mappings have both rewasd and xml info
      for (const mapping of resolvedMappings) {
        expect(mapping.controllerButton).toBeDefined()
        expect(mapping.keyboardKeys?.length).toBeGreaterThan(0)
        expect(mapping.gameAction).toBeDefined()
        expect(mapping.actionMap).toBeDefined()
      }
    })

    it('creates rewasd mappings for unresolved chains', () => {
      const rewasdConfig = loadSampleRewasd() as RewasdConfig
      const rewasdResult = parseRewasdConfig(rewasdConfig)
      const xmlResult = parseStarCitizenXml(loadSampleActionMaps())

      const result = resolveChain(rewasdResult, xmlResult)

      const unresolvedMappings = result.mappings.filter(
        (m) => m.source === 'rewasd'
      )
      // May or may not have unresolved mappings depending on fixture data
      expect(Array.isArray(unresolvedMappings)).toBe(true)

      for (const mapping of unresolvedMappings) {
        expect(mapping.controllerButton).toBeDefined()
        expect(mapping.keyboardKeys?.length).toBeGreaterThan(0)
        expect(mapping.gameplayMode).toBe('Unknown')
      }
    })

    it('creates xml-gamepad mappings for direct gamepad bindings', () => {
      const rewasdConfig = loadSampleRewasd() as RewasdConfig
      const rewasdResult = parseRewasdConfig(rewasdConfig)
      const xmlResult = parseStarCitizenXml(loadSampleActionMaps())

      const result = resolveChain(rewasdResult, xmlResult)

      const directMappings = result.mappings.filter(
        (m) => m.source === 'xml-gamepad'
      )
      expect(directMappings.length).toBeGreaterThan(0)

      // Direct gamepad mappings should not have keyboard keys
      for (const mapping of directMappings) {
        expect(mapping.keyboardKeys).toBeUndefined()
      }
    })

    it('returns stats about resolution', () => {
      const rewasdConfig = loadSampleRewasd() as RewasdConfig
      const rewasdResult = parseRewasdConfig(rewasdConfig)
      const xmlResult = parseStarCitizenXml(loadSampleActionMaps())

      const result = resolveChain(rewasdResult, xmlResult)

      expect(result.stats).toBeDefined()
      expect(typeof result.stats.totalRewasdMappings).toBe('number')
      expect(typeof result.stats.totalXmlBindings).toBe('number')
      expect(typeof result.stats.resolvedChains).toBe('number')
      expect(typeof result.stats.unresolvedRewasd).toBe('number')
      expect(typeof result.stats.directGamepadBindings).toBe('number')
    })

    it('collects errors from both parsers', () => {
      const rewasdResult = {
        mappings: [],
        shifts: [],
        errors: ['rewasd error'],
      }
      const xmlResult = {
        bindings: [],
        profileName: '',
        errors: ['xml error'],
      }

      const result = resolveChain(rewasdResult, xmlResult)

      expect(result.errors).toContain('rewasd error')
      expect(result.errors).toContain('xml error')
    })
  })

  describe('parseAndResolve', () => {
    it('parses and resolves from raw strings', () => {
      const rewasdJson = loadFixture('sample.rewasd')
      const xmlString = loadSampleActionMaps()

      const result = parseAndResolve(rewasdJson, xmlString)

      expect(result.errors).toHaveLength(0)
      expect(result.mappings.length).toBeGreaterThan(0)
    })

    it('resets mapping ID counter', () => {
      const rewasdJson = loadFixture('sample.rewasd')
      const xmlString = loadSampleActionMaps()

      // First parse
      const result1 = parseAndResolve(rewasdJson, xmlString)
      const firstIds = result1.mappings.map((m) => m.id)

      // Second parse should have same IDs (counter reset)
      const result2 = parseAndResolve(rewasdJson, xmlString)
      const secondIds = result2.mappings.map((m) => m.id)

      expect(firstIds).toEqual(secondIds)
    })
  })

  describe('filterByMode', () => {
    it('filters mappings by gameplay mode', () => {
      const mappings = [
        mockMapping({ gameplayMode: 'Flight' }),
        mockMapping({ gameplayMode: 'FPS' }),
        mockMapping({ gameplayMode: 'Flight' }),
        mockMapping({ gameplayMode: 'General' }),
      ]

      const flightMappings = filterByMode(mappings, 'Flight')

      expect(flightMappings).toHaveLength(2)
      expect(flightMappings.every((m) => m.gameplayMode === 'Flight')).toBe(true)
    })

    it('returns empty array if no matches', () => {
      const mappings = [
        mockMapping({ gameplayMode: 'Flight' }),
        mockMapping({ gameplayMode: 'FPS' }),
      ]

      const result = filterByMode(mappings, 'Mining')

      expect(result).toHaveLength(0)
    })
  })

  describe('filterByModifier', () => {
    it('filters mappings with specific modifier', () => {
      const mappings = [
        mockMapping({ modifier: 'LB' }),
        mockMapping({ modifier: 'RB' }),
        mockMapping({ modifier: 'LB' }),
        mockMapping({ modifier: undefined }),
      ]

      const lbMappings = filterByModifier(mappings, 'LB')

      expect(lbMappings).toHaveLength(2)
      expect(lbMappings.every((m) => m.modifier === 'LB')).toBe(true)
    })

    it('filters mappings with no modifier', () => {
      const mappings = [
        mockMapping({ modifier: 'LB' }),
        mockMapping({ modifier: undefined }),
        mockMapping({ modifier: undefined }),
      ]

      const noModifierMappings = filterByModifier(mappings, null)

      expect(noModifierMappings).toHaveLength(2)
      expect(noModifierMappings.every((m) => !m.modifier)).toBe(true)
    })
  })

  describe('filterByButton', () => {
    it('filters mappings by controller button', () => {
      const mappings = [
        mockMapping({ controllerButton: 'A' }),
        mockMapping({ controllerButton: 'B' }),
        mockMapping({ controllerButton: 'A' }),
      ]

      const aMappings = filterByButton(mappings, 'A')

      expect(aMappings).toHaveLength(2)
      expect(aMappings.every((m) => m.controllerButton === 'A')).toBe(true)
    })
  })

  describe('getAvailableModes', () => {
    it('returns unique gameplay modes', () => {
      const mappings = [
        mockMapping({ gameplayMode: 'Flight' }),
        mockMapping({ gameplayMode: 'FPS' }),
        mockMapping({ gameplayMode: 'Flight' }),
        mockMapping({ gameplayMode: 'General' }),
      ]

      const modes = getAvailableModes(mappings)

      expect(modes).toHaveLength(3)
      expect(modes).toContain('Flight')
      expect(modes).toContain('FPS')
      expect(modes).toContain('General')
    })

    it('returns sorted modes', () => {
      const mappings = [
        mockMapping({ gameplayMode: 'FPS' }),
        mockMapping({ gameplayMode: 'Flight' }),
        mockMapping({ gameplayMode: 'General' }),
      ]

      const modes = getAvailableModes(mappings)

      expect(modes).toEqual([...modes].sort())
    })
  })

  describe('getAvailableModifiers', () => {
    it('returns unique modifiers', () => {
      const mappings = [
        mockMapping({ modifier: 'LB' }),
        mockMapping({ modifier: 'RB' }),
        mockMapping({ modifier: 'LB' }),
        mockMapping({ modifier: undefined }),
      ]

      const modifiers = getAvailableModifiers(mappings)

      expect(modifiers).toHaveLength(2)
      expect(modifiers).toContain('LB')
      expect(modifiers).toContain('RB')
    })

    it('excludes undefined modifiers', () => {
      const mappings = [
        mockMapping({ modifier: undefined }),
        mockMapping({ modifier: 'LB' }),
      ]

      const modifiers = getAvailableModifiers(mappings)

      expect(modifiers).not.toContain(undefined)
    })

    it('returns sorted modifiers', () => {
      const mappings = [
        mockMapping({ modifier: 'RB' }),
        mockMapping({ modifier: 'LB' }),
        mockMapping({ modifier: 'Y' }),
      ]

      const modifiers = getAvailableModifiers(mappings)

      expect(modifiers).toEqual([...modifiers].sort())
    })
  })

  describe('groupByMode', () => {
    it('groups mappings by gameplay mode', () => {
      const mappings = [
        mockMapping({ gameplayMode: 'Flight' }),
        mockMapping({ gameplayMode: 'FPS' }),
        mockMapping({ gameplayMode: 'Flight' }),
      ]

      const groups = groupByMode(mappings)

      expect(groups.size).toBe(2)
      expect(groups.get('Flight')).toHaveLength(2)
      expect(groups.get('FPS')).toHaveLength(1)
    })
  })

  describe('groupByModifier', () => {
    it('groups mappings by modifier', () => {
      const mappings = [
        mockMapping({ modifier: 'LB' }),
        mockMapping({ modifier: undefined }),
        mockMapping({ modifier: 'LB' }),
      ]

      const groups = groupByModifier(mappings)

      expect(groups.size).toBe(2)
      expect(groups.get('LB')).toHaveLength(2)
      expect(groups.get(null)).toHaveLength(1)
    })
  })

  describe('searchMappings', () => {
    it('searches by game action name', () => {
      const mappings = [
        mockMapping({ gameAction: 'v_strafe_forward' }),
        mockMapping({ gameAction: 'v_strafe_back' }),
        mockMapping({ gameAction: 'v_attack1' }),
      ]

      const results = searchMappings(mappings, 'strafe')

      expect(results).toHaveLength(2)
    })

    it('searches by readable action name', () => {
      const mappings = [
        mockMapping({ gameActionReadable: 'Strafe Forward' }),
        mockMapping({ gameActionReadable: 'Fire Weapon' }),
        mockMapping({ gameActionReadable: 'Strafe Backward' }),
      ]

      const results = searchMappings(mappings, 'strafe')

      expect(results).toHaveLength(2)
    })

    it('searches by controller button', () => {
      const mappings = [
        mockMapping({ controllerButton: 'A' }),
        mockMapping({ controllerButton: 'B' }),
        mockMapping({ controllerButton: 'DpadUp' }),
      ]

      const results = searchMappings(mappings, 'dpad')

      expect(results).toHaveLength(1)
    })

    it('searches by modifier', () => {
      const mappings = [
        mockMapping({ modifier: 'LB' }),
        mockMapping({ modifier: 'RB' }),
        mockMapping({ modifier: undefined }),
      ]

      const results = searchMappings(mappings, 'lb')

      expect(results).toHaveLength(1)
    })

    it('searches by description', () => {
      const mappings = [
        mockMapping({ description: 'Forward thrust' }),
        mockMapping({ description: 'Backward thrust' }),
        mockMapping({ description: 'Fire weapons' }),
      ]

      const results = searchMappings(mappings, 'thrust')

      expect(results).toHaveLength(2)
    })

    it('is case insensitive', () => {
      const mappings = [
        mockMapping({ gameAction: 'v_strafe_FORWARD' }),
        mockMapping({ gameAction: 'V_STRAFE_BACK' }),
      ]

      const results = searchMappings(mappings, 'STRAFE')

      expect(results).toHaveLength(2)
    })

    it('returns empty array for no matches', () => {
      const mappings = [
        mockMapping({ gameAction: 'v_strafe_forward' }),
      ]

      const results = searchMappings(mappings, 'zzz')

      expect(results).toHaveLength(0)
    })
  })
})
