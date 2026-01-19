import { describe, it, expect } from 'vitest'
import {
  parseRewasdConfig,
  parseRewasdJson,
  buildKeyToButtonMap,
  formatMappingDescription,
} from '@/lib/parsers/rewasdParser'
import type { RewasdConfig } from '@/lib/types/rewasd'
import { loadSampleRewasd, loadFixture } from '@/test/fixtures'

describe('rewasdParser', () => {
  describe('parseRewasdConfig', () => {
    it('parses sample rewasd config', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const result = parseRewasdConfig(config)

      expect(result.errors).toHaveLength(0)
      expect(result.mappings.length).toBeGreaterThan(0)
    })

    it('extracts shifts', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const result = parseRewasdConfig(config)

      expect(result.shifts.length).toBeGreaterThan(0)
      expect(result.shifts[0]).toHaveProperty('id')
      expect(result.shifts[0]).toHaveProperty('description')
    })

    it('extracts button names from masks', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const result = parseRewasdConfig(config)

      // All mappings should have a buttonName
      expect(result.mappings.every((m) => m.buttonName)).toBe(true)
    })

    it('extracts output keyboard keys', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const result = parseRewasdConfig(config)

      // All mappings should have output keys
      expect(result.mappings.every((m) => m.outputKeys.length > 0)).toBe(true)

      // Check for expected key outputs from fixture
      const wMapping = result.mappings.find((m) => m.outputKeys.includes('W'))
      expect(wMapping).toBeDefined()
    })

    it('extracts activator types', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const result = parseRewasdConfig(config)

      // Check for various activator types
      const singleMappings = result.mappings.filter((m) => m.activatorType === 'single')
      expect(singleMappings.length).toBeGreaterThan(0)

      const longMappings = result.mappings.filter((m) => m.activatorType === 'long')
      expect(longMappings.length).toBeGreaterThan(0)
    })

    it('extracts activator modes', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const result = parseRewasdConfig(config)

      // Check for hold_until_release mode
      const holdMappings = result.mappings.filter((m) => m.activatorMode === 'hold_until_release')
      expect(holdMappings.length).toBeGreaterThan(0)
    })

    it('associates shift info with mappings', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const result = parseRewasdConfig(config)

      // Mappings should have shift info
      const mappingWithShift = result.mappings.find((m) => m.shiftName !== undefined)
      expect(mappingWithShift).toBeDefined()
      expect(mappingWithShift?.shiftId).toBeDefined()
    })

    it('skips layer jump mappings', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const result = parseRewasdConfig(config)

      // Layer jump mapping should not be in results
      const jumpMapping = result.mappings.find(
        (m) => m.description?.includes('Layer jump')
      )
      expect(jumpMapping).toBeUndefined()
    })

    it('handles multiple keys per mapping (macros)', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const result = parseRewasdConfig(config)

      // Find the LB+A mapping that outputs LShift+W
      const multiKeyMapping = result.mappings.find(
        (m) => m.outputKeys.length > 1
      )
      expect(multiKeyMapping).toBeDefined()
      expect(multiKeyMapping?.outputKeys).toContain('LShift')
      expect(multiKeyMapping?.outputKeys).toContain('W')
    })

    it('preserves description from mapping', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const result = parseRewasdConfig(config)

      const mappingWithDesc = result.mappings.find((m) => m.description)
      expect(mappingWithDesc).toBeDefined()
      expect(typeof mappingWithDesc?.description).toBe('string')
    })

    it('handles empty config', () => {
      const emptyConfig: RewasdConfig = {
        schemaVersion: 1,
        appVersion: '5.0.0',
        config: {},
        devices: {},
        radialMenuCircles: [],
        radialMenuSectors: [],
        crosshairs: [],
        shifts: [],
        masks: [],
        mappings: [],
      }
      const result = parseRewasdConfig(emptyConfig)

      expect(result.errors).toHaveLength(0)
      expect(result.mappings).toHaveLength(0)
    })
  })

  describe('parseRewasdJson', () => {
    it('parses valid JSON string', () => {
      const jsonString = loadFixture('sample.rewasd')
      const result = parseRewasdJson(jsonString)

      expect(result.errors).toHaveLength(0)
      expect(result.mappings.length).toBeGreaterThan(0)
    })

    it('handles invalid JSON', () => {
      const invalidJson = '{ invalid json }'
      const result = parseRewasdJson(invalidJson)

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.mappings).toHaveLength(0)
    })

    it('handles empty string', () => {
      const result = parseRewasdJson('')

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.mappings).toHaveLength(0)
    })
  })

  describe('buildKeyToButtonMap', () => {
    it('builds lookup map from rewasd mappings', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const { mappings } = parseRewasdConfig(config)
      const keyMap = buildKeyToButtonMap(mappings)

      expect(keyMap.size).toBeGreaterThan(0)
    })

    it('uses lowercase keys', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const { mappings } = parseRewasdConfig(config)
      const keyMap = buildKeyToButtonMap(mappings)

      // All keys should be lowercase
      for (const key of keyMap.keys()) {
        expect(key).toBe(key.toLowerCase())
      }
    })

    it('maps W key to button', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const { mappings } = parseRewasdConfig(config)
      const keyMap = buildKeyToButtonMap(mappings)

      expect(keyMap.has('w')).toBe(true)
      const wMappings = keyMap.get('w')
      expect(wMappings?.length).toBeGreaterThan(0)
    })

    it('handles multiple mappings per key', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const { mappings } = parseRewasdConfig(config)
      const keyMap = buildKeyToButtonMap(mappings)

      // W key appears in multiple mappings (A button and LB+A macro)
      const wMappings = keyMap.get('w')
      expect(wMappings?.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe('formatMappingDescription', () => {
    it('formats simple button mapping', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const { mappings } = parseRewasdConfig(config)

      const simpleMapping = mappings.find(
        (m) => m.activatorType === 'single' && m.outputKeys.length === 1 && !m.shiftName
      )

      if (simpleMapping) {
        const desc = formatMappingDescription(simpleMapping)
        expect(desc).toContain(simpleMapping.buttonName)
        expect(desc).toContain('→')
        expect(desc).toContain(simpleMapping.outputKeys[0])
      }
    })

    it('includes shift name when present', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const { mappings } = parseRewasdConfig(config)

      const shiftMapping = mappings.find((m) => m.shiftName !== undefined)

      if (shiftMapping) {
        const desc = formatMappingDescription(shiftMapping)
        expect(desc).toContain(shiftMapping.shiftName!)
        expect(desc).toContain('+')
      }
    })

    it('includes activator type when not single', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const { mappings } = parseRewasdConfig(config)

      const longMapping = mappings.find((m) => m.activatorType === 'long')

      if (longMapping) {
        const desc = formatMappingDescription(longMapping)
        expect(desc).toContain('(long)')
      }
    })

    it('formats multiple output keys', () => {
      const config = loadSampleRewasd() as RewasdConfig
      const { mappings } = parseRewasdConfig(config)

      const multiKeyMapping = mappings.find((m) => m.outputKeys.length > 1)

      if (multiKeyMapping) {
        const desc = formatMappingDescription(multiKeyMapping)
        expect(desc).toContain(' + ')
      }
    })
  })
})
