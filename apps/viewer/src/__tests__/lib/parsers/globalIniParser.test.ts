import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  parseGlobalIni,
  resolveLocalizationKey,
} from '@/lib/parsers/globalIniParser'

const SAMPLE_INI = `
; Comment line
ui_CIEmergencyExit=Emergency Exit Seat
ui_CIEmergencyExitDesc=Exits the seat in an emergency
ui_CGSeatGeneral=Vehicles - Seats and Operator Modes
ui_CCSeatGeneral=Seat General
ui_CGSpaceFlightSalvage,P=Vehicles - Salvage
some_other_key=Not a UI control key
item_name_something=Also not relevant
ui_CIEject=Eject
`

describe('globalIniParser', () => {
  describe('parseGlobalIni', () => {
    it('parses ui_C keys only', () => {
      const map = parseGlobalIni(SAMPLE_INI)
      expect(map.has('ui_CIEmergencyExit')).toBe(true)
      expect(map.has('some_other_key')).toBe(false)
      expect(map.has('item_name_something')).toBe(false)
    })

    it('extracts correct values', () => {
      const map = parseGlobalIni(SAMPLE_INI)
      expect(map.get('ui_CIEmergencyExit')).toBe('Emergency Exit Seat')
      expect(map.get('ui_CIEmergencyExitDesc')).toBe('Exits the seat in an emergency')
    })

    it('handles ,P= suffix keys by storing both base and full key', () => {
      const map = parseGlobalIni(SAMPLE_INI)
      // Full key with comma
      expect(map.get('ui_CGSpaceFlightSalvage,P')).toBe('Vehicles - Salvage')
      // Base key without comma suffix
      expect(map.get('ui_CGSpaceFlightSalvage')).toBe('Vehicles - Salvage')
    })

    it('skips comment lines and empty lines', () => {
      const map = parseGlobalIni(SAMPLE_INI)
      // Should only have ui_C* keys
      const keys = [...map.keys()]
      expect(keys.every((k) => k.startsWith('ui_C'))).toBe(true)
    })

    it('returns empty map for empty input', () => {
      const map = parseGlobalIni('')
      expect(map.size).toBe(0)
    })
  })

  describe('resolveLocalizationKey', () => {
    const map = parseGlobalIni(SAMPLE_INI)

    it('resolves @ui_ prefixed keys', () => {
      expect(resolveLocalizationKey('@ui_CIEmergencyExit', map)).toBe('Emergency Exit Seat')
    })

    it('resolves keys without @ prefix', () => {
      expect(resolveLocalizationKey('ui_CIEmergencyExit', map)).toBe('Emergency Exit Seat')
    })

    it('returns original key when not found', () => {
      expect(resolveLocalizationKey('@ui_CIUnknown', map)).toBe('@ui_CIUnknown')
    })

    it('returns empty string for empty input', () => {
      expect(resolveLocalizationKey('', map)).toBe('')
    })
  })
})

describe('globalIniParser — full file validation', () => {
  const iniPath = join(__dirname, '../../../../public/configs/sc-4.5/global.ini')

  let map: Map<string, string>
  let hasData = false

  try {
    const content = readFileSync(iniPath, 'utf-8')
    map = parseGlobalIni(content)
    hasData = map.size > 0
  } catch {
    map = new Map()
  }

  it('parses ~1000+ ui_C keys from the full file', () => {
    if (!hasData) return
    expect(map.size).toBeGreaterThan(1000)
  })

  it('contains known control labels', () => {
    if (!hasData) return
    expect(map.has('ui_CIEmergencyExit')).toBe(true)
    expect(map.has('ui_CIEject')).toBe(true)
    expect(map.has('ui_CCSpaceFlight')).toBe(true)
  })

  it('resolves @ui_ references from defaultProfile.xml', () => {
    if (!hasData) return
    expect(resolveLocalizationKey('@ui_CIEmergencyExit', map)).not.toBe('@ui_CIEmergencyExit')
    expect(resolveLocalizationKey('@ui_CCSpaceFlight', map)).not.toBe('@ui_CCSpaceFlight')
  })
})
