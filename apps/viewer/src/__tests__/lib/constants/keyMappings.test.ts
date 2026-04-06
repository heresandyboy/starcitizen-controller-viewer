import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  KEY_TO_SC_KEYBOARD,
  keyToScKeyboard,
  keyToScKeyboardFull,
  REWASD_GP_OUTPUT_TO_SC,
  REWASD_GP_OUTPUT_NAMES,
  rewasdGpOutputToScFull,
} from '@/lib/constants/keyMappings'
import { DIK_CODES, DIK_NAMES, dikCodeToKeyName } from '@/lib/constants/dikKeys'

describe('keyMappings', () => {
  describe('KEY_TO_SC_KEYBOARD', () => {
    it('maps letters to lowercase SC names', () => {
      expect(KEY_TO_SC_KEYBOARD['A']).toBe('a')
      expect(KEY_TO_SC_KEYBOARD['Z']).toBe('z')
    })

    it('maps function keys correctly', () => {
      expect(KEY_TO_SC_KEYBOARD['F1']).toBe('f1')
      expect(KEY_TO_SC_KEYBOARD['F12']).toBe('f12')
    })

    it('maps modifiers to SC names', () => {
      expect(KEY_TO_SC_KEYBOARD['LShift']).toBe('lshift')
      expect(KEY_TO_SC_KEYBOARD['RCtrl']).toBe('rctrl')
      expect(KEY_TO_SC_KEYBOARD['LAlt']).toBe('lalt')
      expect(KEY_TO_SC_KEYBOARD['RAlt']).toBe('ralt')
    })

    it('maps navigation keys to SC names', () => {
      expect(KEY_TO_SC_KEYBOARD['Insert']).toBe('insert')
      expect(KEY_TO_SC_KEYBOARD['Delete']).toBe('delete')
      expect(KEY_TO_SC_KEYBOARD['PgUp']).toBe('pgup')
      expect(KEY_TO_SC_KEYBOARD['PgDn']).toBe('pgdn')
    })

    it('maps numpad keys to SC np_ prefix', () => {
      expect(KEY_TO_SC_KEYBOARD['Num0']).toBe('np_0')
      expect(KEY_TO_SC_KEYBOARD['Num9']).toBe('np_9')
      expect(KEY_TO_SC_KEYBOARD['NumPlus']).toBe('np_add')
      expect(KEY_TO_SC_KEYBOARD['NumMinus']).toBe('np_subtract')
      expect(KEY_TO_SC_KEYBOARD['NumMult']).toBe('np_multiply')
      expect(KEY_TO_SC_KEYBOARD['NumDiv']).toBe('np_divide')
      expect(KEY_TO_SC_KEYBOARD['NumDot']).toBe('np_period')
    })

    it('maps special keys with SC-specific names', () => {
      expect(KEY_TO_SC_KEYBOARD['Enter']).toBe('return')
      expect(KEY_TO_SC_KEYBOARD['Esc']).toBe('escape')
      expect(KEY_TO_SC_KEYBOARD['Space']).toBe('space')
      expect(KEY_TO_SC_KEYBOARD['CapsLock']).toBe('capslock')
    })

    it('maps punctuation to SC names', () => {
      expect(KEY_TO_SC_KEYBOARD['-']).toBe('minus')
      expect(KEY_TO_SC_KEYBOARD['=']).toBe('equals')
      expect(KEY_TO_SC_KEYBOARD[';']).toBe('semicolon')
      expect(KEY_TO_SC_KEYBOARD["'"]).toBe('apostrophe')
      expect(KEY_TO_SC_KEYBOARD['.']).toBe('period')
      expect(KEY_TO_SC_KEYBOARD['/']).toBe('slash')
    })
  })

  describe('keyToScKeyboard / keyToScKeyboardFull', () => {
    it('returns SC key name without prefix', () => {
      expect(keyToScKeyboard('Insert')).toBe('insert')
      expect(keyToScKeyboard('F7')).toBe('f7')
    })

    it('returns full SC input string with kb1_ prefix', () => {
      expect(keyToScKeyboardFull('Insert')).toBe('kb1_insert')
      expect(keyToScKeyboardFull('F7')).toBe('kb1_f7')
      expect(keyToScKeyboardFull('NumPlus')).toBe('kb1_np_add')
    })

    it('returns undefined for unknown keys', () => {
      expect(keyToScKeyboard('UnknownKey')).toBeUndefined()
      expect(keyToScKeyboardFull('UnknownKey')).toBeUndefined()
    })
  })

  describe('REWASD_GP_OUTPUT_TO_SC', () => {
    it('maps face buttons to SC names', () => {
      expect(REWASD_GP_OUTPUT_TO_SC[1]).toBe('a')
      expect(REWASD_GP_OUTPUT_TO_SC[2]).toBe('b')
      expect(REWASD_GP_OUTPUT_TO_SC[3]).toBe('x')
      expect(REWASD_GP_OUTPUT_TO_SC[4]).toBe('y')
    })

    it('maps bumpers to SC shoulder names', () => {
      expect(REWASD_GP_OUTPUT_TO_SC[5]).toBe('shoulderl')
      expect(REWASD_GP_OUTPUT_TO_SC[6]).toBe('shoulderr')
    })

    it('maps stick clicks to SC thumb names', () => {
      expect(REWASD_GP_OUTPUT_TO_SC[9]).toBe('thumbl')
      expect(REWASD_GP_OUTPUT_TO_SC[10]).toBe('thumbr')
    })

    it('maps D-pad to SC dpad names', () => {
      expect(REWASD_GP_OUTPUT_TO_SC[33]).toBe('dpad_up')
      expect(REWASD_GP_OUTPUT_TO_SC[34]).toBe('dpad_down')
      expect(REWASD_GP_OUTPUT_TO_SC[35]).toBe('dpad_left')
      expect(REWASD_GP_OUTPUT_TO_SC[36]).toBe('dpad_right')
    })

    it('maps triggers to SC trigger button names', () => {
      expect(REWASD_GP_OUTPUT_TO_SC[51]).toBe('triggerl_btn')
      expect(REWASD_GP_OUTPUT_TO_SC[55]).toBe('triggerr_btn')
    })

    it('maps stick zones to SC axis names', () => {
      expect(REWASD_GP_OUTPUT_TO_SC[40]).toBe('thumbly')
      expect(REWASD_GP_OUTPUT_TO_SC[42]).toBe('thumblx')
      expect(REWASD_GP_OUTPUT_TO_SC[47]).toBe('thumbry')
      expect(REWASD_GP_OUTPUT_TO_SC[49]).toBe('thumbrx')
    })
  })

  describe('rewasdGpOutputToScFull', () => {
    it('returns full SC gamepad input string', () => {
      expect(rewasdGpOutputToScFull(1)).toBe('gp1_a')
      expect(rewasdGpOutputToScFull(33)).toBe('gp1_dpad_up')
      expect(rewasdGpOutputToScFull(51)).toBe('gp1_triggerl_btn')
    })

    it('returns undefined for unknown button IDs', () => {
      expect(rewasdGpOutputToScFull(999)).toBeUndefined()
    })
  })

  describe('REWASD_GP_OUTPUT_NAMES', () => {
    it('has a display name for every mapped button', () => {
      for (const id of Object.keys(REWASD_GP_OUTPUT_TO_SC)) {
        expect(REWASD_GP_OUTPUT_NAMES[Number(id)]).toBeDefined()
      }
    })
  })

  // -----------------------------------------------------------------------
  // Fixture validation: every DIK code in GCO 4.7 must resolve to an SC key
  // -----------------------------------------------------------------------

  describe('GCO 4.7 fixture coverage', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fixtureData: any

    function collectKeyboardOutputs(obj: unknown): Set<number> {
      const codes = new Set<number>()
      if (typeof obj === 'object' && obj !== null) {
        if ('keyboard' in obj && typeof (obj as Record<string, unknown>).keyboard === 'object') {
          const kb = (obj as Record<string, Record<string, unknown>>).keyboard
          if (typeof kb.buttonId === 'number') {
            codes.add(kb.buttonId)
          }
        }
        for (const v of Object.values(obj as Record<string, unknown>)) {
          for (const c of collectKeyboardOutputs(v)) codes.add(c)
        }
      }
      if (Array.isArray(obj)) {
        for (const item of obj) {
          for (const c of collectKeyboardOutputs(item)) codes.add(c)
        }
      }
      return codes
    }

    function collectGamepadOutputs(obj: unknown): Set<number> {
      const ids = new Set<number>()
      if (typeof obj === 'object' && obj !== null) {
        if ('gamepad' in obj && typeof (obj as Record<string, unknown>).gamepad === 'object') {
          const gp = (obj as Record<string, Record<string, unknown>>).gamepad
          if (typeof gp.buttonId === 'number') {
            ids.add(gp.buttonId)
          }
        }
        for (const v of Object.values(obj as Record<string, unknown>)) {
          for (const c of collectGamepadOutputs(v)) ids.add(c)
        }
      }
      if (Array.isArray(obj)) {
        for (const item of obj) {
          for (const c of collectGamepadOutputs(item)) ids.add(c)
        }
      }
      return ids
    }

    try {
      const fixturePath = join(__dirname, '../../../../public/configs/GCO 4.7 HOTAS.rewasd')
      fixtureData = JSON.parse(readFileSync(fixturePath, 'utf-8'))
    } catch {
      // Fixture not available in CI — skip these tests
    }

    it('every DIK code in fixture has a mapping in DIK_CODES', () => {
      if (!fixtureData) return
      const codes = collectKeyboardOutputs(fixtureData)
      const unmapped: number[] = []
      for (const code of codes) {
        if (!DIK_CODES[code]) unmapped.push(code)
      }
      expect(unmapped).toEqual([])
    })

    it('every DIK code in fixture resolves to an SC keyboard key', () => {
      if (!fixtureData) return
      const codes = collectKeyboardOutputs(fixtureData)
      const unresolved: string[] = []
      for (const code of codes) {
        const keyName = dikCodeToKeyName(code)
        if (keyName.startsWith('Key')) {
          unresolved.push(`DIK code ${code} → ${keyName} (no DIK_CODES entry)`)
          continue
        }
        const scKey = keyToScKeyboard(keyName)
        if (!scKey) {
          unresolved.push(`DIK code ${code} → ${keyName} → (no SC key mapping)`)
        }
      }
      expect(unresolved).toEqual([])
    })

    it('every DIK description in fixture has a mapping in DIK_NAMES', () => {
      if (!fixtureData) return
      // Walk the fixture to collect all DIK description strings
      const descriptions = new Set<string>()
      function collectDescriptions(obj: unknown) {
        if (typeof obj === 'object' && obj !== null) {
          if ('keyboard' in obj && typeof (obj as Record<string, unknown>).keyboard === 'object') {
            const kb = (obj as Record<string, Record<string, unknown>>).keyboard
            if (typeof kb.description === 'string' && kb.description.startsWith('DIK_')) {
              descriptions.add(kb.description)
            }
          }
          for (const v of Object.values(obj as Record<string, unknown>)) {
            collectDescriptions(v)
          }
        }
        if (Array.isArray(obj)) {
          for (const item of obj) collectDescriptions(item)
        }
      }
      collectDescriptions(fixtureData)

      const unmapped: string[] = []
      for (const desc of descriptions) {
        if (!DIK_NAMES[desc]) unmapped.push(desc)
      }
      expect(unmapped).toEqual([])
    })

    it('every gamepad output in fixture has an SC mapping', () => {
      if (!fixtureData) return
      const ids = collectGamepadOutputs(fixtureData)
      const unmapped: number[] = []
      for (const id of ids) {
        if (!REWASD_GP_OUTPUT_TO_SC[id]) unmapped.push(id)
      }
      expect(unmapped).toEqual([])
    })
  })
})
