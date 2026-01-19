import { describe, it, expect } from 'vitest'
import {
  DIK_CODES,
  DIK_NAMES,
  dikToKeyName,
  dikCodeToKeyName,
} from '@/lib/constants/dikKeys'

describe('dikKeys', () => {
  describe('DIK_CODES', () => {
    it('maps number row keys correctly', () => {
      expect(DIK_CODES[2]).toBe('1')
      expect(DIK_CODES[3]).toBe('2')
      expect(DIK_CODES[11]).toBe('0')
    })

    it('maps QWERTY row keys correctly', () => {
      expect(DIK_CODES[16]).toBe('Q')
      expect(DIK_CODES[17]).toBe('W')
      expect(DIK_CODES[18]).toBe('E')
      expect(DIK_CODES[19]).toBe('R')
      expect(DIK_CODES[20]).toBe('T')
      expect(DIK_CODES[21]).toBe('Y')
    })

    it('maps ASDF row keys correctly', () => {
      expect(DIK_CODES[30]).toBe('A')
      expect(DIK_CODES[31]).toBe('S')
      expect(DIK_CODES[32]).toBe('D')
      expect(DIK_CODES[33]).toBe('F')
    })

    it('maps modifier keys correctly', () => {
      expect(DIK_CODES[29]).toBe('LCtrl')
      expect(DIK_CODES[42]).toBe('LShift')
      expect(DIK_CODES[54]).toBe('RShift')
      expect(DIK_CODES[56]).toBe('LAlt')
      expect(DIK_CODES[157]).toBe('RCtrl')
      expect(DIK_CODES[184]).toBe('RAlt')
    })

    it('maps function keys correctly', () => {
      expect(DIK_CODES[59]).toBe('F1')
      expect(DIK_CODES[60]).toBe('F2')
      expect(DIK_CODES[68]).toBe('F10')
      expect(DIK_CODES[87]).toBe('F11')
      expect(DIK_CODES[88]).toBe('F12')
    })

    it('maps navigation keys correctly', () => {
      expect(DIK_CODES[199]).toBe('Home')
      expect(DIK_CODES[200]).toBe('Up')
      expect(DIK_CODES[201]).toBe('PgUp')
      expect(DIK_CODES[203]).toBe('Left')
      expect(DIK_CODES[205]).toBe('Right')
      expect(DIK_CODES[207]).toBe('End')
      expect(DIK_CODES[208]).toBe('Down')
      expect(DIK_CODES[209]).toBe('PgDn')
    })

    it('maps numpad keys correctly', () => {
      expect(DIK_CODES[71]).toBe('Num7')
      expect(DIK_CODES[79]).toBe('Num1')
      expect(DIK_CODES[82]).toBe('Num0')
      expect(DIK_CODES[78]).toBe('NumPlus')
      expect(DIK_CODES[74]).toBe('NumMinus')
      expect(DIK_CODES[55]).toBe('NumMult')
      expect(DIK_CODES[156]).toBe('NumEnter')
    })

    it('maps special keys correctly', () => {
      expect(DIK_CODES[57]).toBe('Space')
      expect(DIK_CODES[28]).toBe('Enter')
      expect(DIK_CODES[14]).toBe('Backspace')
      expect(DIK_CODES[15]).toBe('Tab')
      expect(DIK_CODES[58]).toBe('CapsLock')
      expect(DIK_CODES[210]).toBe('Insert')
      expect(DIK_CODES[211]).toBe('Delete')
    })
  })

  describe('DIK_NAMES', () => {
    it('maps DIK number names correctly', () => {
      expect(DIK_NAMES['DIK_1']).toBe('1')
      expect(DIK_NAMES['DIK_5']).toBe('5')
      expect(DIK_NAMES['DIK_0']).toBe('0')
    })

    it('maps DIK letter names correctly', () => {
      expect(DIK_NAMES['DIK_A']).toBe('A')
      expect(DIK_NAMES['DIK_W']).toBe('W')
      expect(DIK_NAMES['DIK_Z']).toBe('Z')
    })

    it('maps DIK function key names correctly', () => {
      expect(DIK_NAMES['DIK_F1']).toBe('F1')
      expect(DIK_NAMES['DIK_F7']).toBe('F7')
      expect(DIK_NAMES['DIK_F12']).toBe('F12')
    })

    it('maps DIK modifier names correctly', () => {
      expect(DIK_NAMES['DIK_LSHIFT']).toBe('LShift')
      expect(DIK_NAMES['DIK_RSHIFT']).toBe('RShift')
      expect(DIK_NAMES['DIK_LCONTROL']).toBe('LCtrl')
      expect(DIK_NAMES['DIK_RCONTROL']).toBe('RCtrl')
      expect(DIK_NAMES['DIK_LMENU']).toBe('LAlt')
      expect(DIK_NAMES['DIK_RMENU']).toBe('RAlt')
    })

    it('maps DIK special key names correctly', () => {
      expect(DIK_NAMES['DIK_SPACE']).toBe('Space')
      expect(DIK_NAMES['DIK_RETURN']).toBe('Enter')
      expect(DIK_NAMES['DIK_ESCAPE']).toBe('Esc')
      expect(DIK_NAMES['DIK_BACK']).toBe('Backspace')
      expect(DIK_NAMES['DIK_TAB']).toBe('Tab')
    })

    it('maps DIK navigation names correctly', () => {
      expect(DIK_NAMES['DIK_UP']).toBe('Up')
      expect(DIK_NAMES['DIK_DOWN']).toBe('Down')
      expect(DIK_NAMES['DIK_LEFT']).toBe('Left')
      expect(DIK_NAMES['DIK_RIGHT']).toBe('Right')
      expect(DIK_NAMES['DIK_HOME']).toBe('Home')
      expect(DIK_NAMES['DIK_END']).toBe('End')
      expect(DIK_NAMES['DIK_PRIOR']).toBe('PgUp')
      expect(DIK_NAMES['DIK_NEXT']).toBe('PgDn')
    })

    it('maps DIK numpad names correctly', () => {
      expect(DIK_NAMES['DIK_NUMPAD0']).toBe('Num0')
      expect(DIK_NAMES['DIK_NUMPAD5']).toBe('Num5')
      expect(DIK_NAMES['DIK_NUMPAD9']).toBe('Num9')
      expect(DIK_NAMES['DIK_NUMPADENTER']).toBe('NumEnter')
      expect(DIK_NAMES['DIK_NUMPADPLUS']).toBe('NumPlus')
      expect(DIK_NAMES['DIK_NUMPADMINUS']).toBe('NumMinus')
    })

    it('maps DIK punctuation names correctly', () => {
      expect(DIK_NAMES['DIK_MINUS']).toBe('-')
      expect(DIK_NAMES['DIK_EQUALS']).toBe('=')
      expect(DIK_NAMES['DIK_LBRACKET']).toBe('[')
      expect(DIK_NAMES['DIK_RBRACKET']).toBe(']')
      expect(DIK_NAMES['DIK_COMMA']).toBe(',')
      expect(DIK_NAMES['DIK_PERIOD']).toBe('.')
      expect(DIK_NAMES['DIK_SLASH']).toBe('/')
    })
  })

  describe('dikToKeyName', () => {
    it('returns exact match from DIK_NAMES', () => {
      expect(dikToKeyName('DIK_W')).toBe('W')
      expect(dikToKeyName('DIK_SPACE')).toBe('Space')
      expect(dikToKeyName('DIK_F7')).toBe('F7')
    })

    it('handles case variations with DIK_ prefix', () => {
      // The function tries toUpperCase conversion
      expect(dikToKeyName('DIK_w')).toBe('W')
      expect(dikToKeyName('DIK_space')).toBe('Space')
    })

    it('returns description without prefix for unknown keys', () => {
      expect(dikToKeyName('DIK_UNKNOWN')).toBe('UNKNOWN')
      expect(dikToKeyName('DIK_CUSTOM')).toBe('CUSTOM')
    })

    it('handles input without DIK_ prefix', () => {
      // Falls back to returning without prefix
      expect(dikToKeyName('W')).toBe('W')
      expect(dikToKeyName('SPACE')).toBe('Space')
    })
  })

  describe('dikCodeToKeyName', () => {
    it('returns key name for known DIK codes', () => {
      expect(dikCodeToKeyName(17)).toBe('W')
      expect(dikCodeToKeyName(57)).toBe('Space')
      expect(dikCodeToKeyName(28)).toBe('Enter')
      expect(dikCodeToKeyName(65)).toBe('F7')
    })

    it('returns fallback for unknown DIK codes', () => {
      expect(dikCodeToKeyName(999)).toBe('Key999')
      expect(dikCodeToKeyName(0)).toBe('Key0')
      expect(dikCodeToKeyName(-1)).toBe('Key-1')
    })

    it('handles all number row codes', () => {
      expect(dikCodeToKeyName(2)).toBe('1')
      expect(dikCodeToKeyName(3)).toBe('2')
      expect(dikCodeToKeyName(4)).toBe('3')
      expect(dikCodeToKeyName(5)).toBe('4')
      expect(dikCodeToKeyName(6)).toBe('5')
      expect(dikCodeToKeyName(7)).toBe('6')
      expect(dikCodeToKeyName(8)).toBe('7')
      expect(dikCodeToKeyName(9)).toBe('8')
      expect(dikCodeToKeyName(10)).toBe('9')
      expect(dikCodeToKeyName(11)).toBe('0')
    })

    it('handles modifier key codes', () => {
      expect(dikCodeToKeyName(29)).toBe('LCtrl')
      expect(dikCodeToKeyName(42)).toBe('LShift')
      expect(dikCodeToKeyName(56)).toBe('LAlt')
      expect(dikCodeToKeyName(157)).toBe('RCtrl')
      expect(dikCodeToKeyName(54)).toBe('RShift')
      expect(dikCodeToKeyName(184)).toBe('RAlt')
    })
  })

  describe('consistency checks', () => {
    it('DIK_CODES has no duplicate values', () => {
      const values = Object.values(DIK_CODES)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('DIK_NAMES has no duplicate values', () => {
      const values = Object.values(DIK_NAMES)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('DIK_NAMES keys all start with DIK_', () => {
      const keys = Object.keys(DIK_NAMES)
      expect(keys.every(key => key.startsWith('DIK_'))).toBe(true)
    })

    it('DIK_CODES keys are all numbers', () => {
      const keys = Object.keys(DIK_CODES)
      expect(keys.every(key => !isNaN(parseInt(key, 10)))).toBe(true)
    })
  })
})
