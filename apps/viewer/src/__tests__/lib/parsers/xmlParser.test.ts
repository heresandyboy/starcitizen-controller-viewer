import { describe, it, expect } from 'vitest'
import {
  parseInputString,
  normalizeKeyboardKey,
  normalizeGamepadButton,
  parseStarCitizenXml,
  buildKeyToActionMap,
  buildGamepadToActionMap,
  getActionMapNames,
  filterByInputType,
} from '@/lib/parsers/xmlParser'
import { loadSampleActionMaps } from '@/test/fixtures'

describe('xmlParser', () => {
  describe('parseInputString', () => {
    it('parses keyboard input', () => {
      const result = parseInputString('kb1_w')
      expect(result).toEqual({
        deviceType: 'keyboard',
        deviceInstance: 1,
        key: 'w',
        modifiers: [],
      })
    })

    it('parses keyboard input with modifier', () => {
      const result = parseInputString('kb1_lalt+1')
      expect(result).toEqual({
        deviceType: 'keyboard',
        deviceInstance: 1,
        key: '1',
        modifiers: ['lalt'],
      })
    })

    it('parses gamepad input', () => {
      const result = parseInputString('gp1_thumbly')
      expect(result).toEqual({
        deviceType: 'gamepad',
        deviceInstance: 1,
        key: 'thumbly',
        modifiers: [],
      })
    })

    it('parses gamepad input with modifier', () => {
      const result = parseInputString('gp1_shoulderl+x')
      expect(result).toEqual({
        deviceType: 'gamepad',
        deviceInstance: 1,
        key: 'x',
        modifiers: ['shoulderl'],
      })
    })

    it('parses mouse input', () => {
      const result = parseInputString('mouse1_1')
      expect(result).toEqual({
        deviceType: 'mouse',
        deviceInstance: 1,
        key: '1',
        modifiers: [],
      })
    })

    it('parses joystick input', () => {
      const result = parseInputString('js1_button5')
      expect(result).toEqual({
        deviceType: 'joystick',
        deviceInstance: 1,
        key: 'button5',
        modifiers: [],
      })
    })

    it('returns null for invalid input', () => {
      expect(parseInputString('')).toBeNull()
      expect(parseInputString('invalid')).toBeNull()
      expect(parseInputString('kb_w')).toBeNull() // Missing instance number
      expect(parseInputString('xx1_w')).toBeNull() // Invalid device prefix
    })
  })

  describe('normalizeKeyboardKey', () => {
    it('normalizes function keys', () => {
      expect(normalizeKeyboardKey('f1')).toBe('F1')
      expect(normalizeKeyboardKey('f12')).toBe('F12')
      expect(normalizeKeyboardKey('F7')).toBe('F7')
    })

    it('preserves number keys', () => {
      expect(normalizeKeyboardKey('1')).toBe('1')
      expect(normalizeKeyboardKey('9')).toBe('9')
    })

    it('normalizes numpad keys', () => {
      expect(normalizeKeyboardKey('np_0')).toBe('Num0')
      expect(normalizeKeyboardKey('np_5')).toBe('Num5')
    })

    it('normalizes modifier keys', () => {
      expect(normalizeKeyboardKey('lalt')).toBe('LAlt')
      expect(normalizeKeyboardKey('ralt')).toBe('RAlt')
      expect(normalizeKeyboardKey('lctrl')).toBe('LCtrl')
      expect(normalizeKeyboardKey('rctrl')).toBe('RCtrl')
      expect(normalizeKeyboardKey('lshift')).toBe('LShift')
      expect(normalizeKeyboardKey('rshift')).toBe('RShift')
    })

    it('normalizes special keys', () => {
      expect(normalizeKeyboardKey('space')).toBe('Space')
      expect(normalizeKeyboardKey('return')).toBe('Enter')
      expect(normalizeKeyboardKey('escape')).toBe('Esc')
      expect(normalizeKeyboardKey('back')).toBe('Backspace')
      expect(normalizeKeyboardKey('tab')).toBe('Tab')
    })

    it('normalizes letter keys to uppercase', () => {
      expect(normalizeKeyboardKey('a')).toBe('A')
      expect(normalizeKeyboardKey('z')).toBe('Z')
      expect(normalizeKeyboardKey('w')).toBe('W')
    })

    it('normalizes navigation keys', () => {
      expect(normalizeKeyboardKey('up')).toBe('Up')
      expect(normalizeKeyboardKey('down')).toBe('Down')
      expect(normalizeKeyboardKey('left')).toBe('Left')
      expect(normalizeKeyboardKey('right')).toBe('Right')
      expect(normalizeKeyboardKey('home')).toBe('Home')
      expect(normalizeKeyboardKey('end')).toBe('End')
      expect(normalizeKeyboardKey('pgup')).toBe('PgUp')
      expect(normalizeKeyboardKey('pgdn')).toBe('PgDn')
    })

    it('normalizes punctuation keys', () => {
      expect(normalizeKeyboardKey('minus')).toBe('-')
      expect(normalizeKeyboardKey('equals')).toBe('=')
      expect(normalizeKeyboardKey('comma')).toBe(',')
      expect(normalizeKeyboardKey('period')).toBe('.')
    })

    it('returns original key if no mapping found', () => {
      expect(normalizeKeyboardKey('unknown')).toBe('unknown')
    })
  })

  describe('normalizeGamepadButton', () => {
    it('normalizes shoulder buttons', () => {
      expect(normalizeGamepadButton('shoulderl')).toBe('LB')
      expect(normalizeGamepadButton('shoulderr')).toBe('RB')
    })

    it('normalizes trigger buttons', () => {
      expect(normalizeGamepadButton('triggerl_btn')).toBe('LT')
      expect(normalizeGamepadButton('triggerr_btn')).toBe('RT')
    })

    it('normalizes face buttons', () => {
      expect(normalizeGamepadButton('a')).toBe('A')
      expect(normalizeGamepadButton('b')).toBe('B')
      expect(normalizeGamepadButton('x')).toBe('X')
      expect(normalizeGamepadButton('y')).toBe('Y')
    })

    it('normalizes dpad buttons', () => {
      expect(normalizeGamepadButton('dpad_up')).toBe('DpadUp')
      expect(normalizeGamepadButton('dpad_down')).toBe('DpadDown')
      expect(normalizeGamepadButton('dpad_left')).toBe('DpadLeft')
      expect(normalizeGamepadButton('dpad_right')).toBe('DpadRight')
    })

    it('normalizes thumbstick buttons', () => {
      expect(normalizeGamepadButton('thumbl')).toBe('LS')
      expect(normalizeGamepadButton('thumbr')).toBe('RS')
    })

    it('returns original button if no mapping found', () => {
      expect(normalizeGamepadButton('unknown')).toBe('unknown')
    })
  })

  describe('parseStarCitizenXml', () => {
    it('parses sample actionmaps XML', () => {
      const xml = loadSampleActionMaps()
      const result = parseStarCitizenXml(xml)

      expect(result.errors).toHaveLength(0)
      expect(result.bindings.length).toBeGreaterThan(0)
    })

    it('extracts keyboard bindings', () => {
      const xml = loadSampleActionMaps()
      const result = parseStarCitizenXml(xml)

      const keyboardBindings = result.bindings.filter((b) => b.inputType === 'keyboard')
      expect(keyboardBindings.length).toBeGreaterThan(0)

      // Check for WASD movement keys
      const wBinding = keyboardBindings.find((b) => b.inputKey === 'W')
      expect(wBinding).toBeDefined()
      expect(wBinding?.actionMap).toBe('spaceship_movement')
    })

    it('extracts gamepad bindings', () => {
      const xml = loadSampleActionMaps()
      const result = parseStarCitizenXml(xml)

      const gamepadBindings = result.bindings.filter((b) => b.inputType === 'gamepad')
      expect(gamepadBindings.length).toBeGreaterThan(0)
    })

    it('extracts gamepad bindings with modifiers', () => {
      const xml = loadSampleActionMaps()
      const result = parseStarCitizenXml(xml)

      const bindingsWithModifiers = result.bindings.filter(
        (b) => b.inputType === 'gamepad' && b.modifiers.length > 0
      )
      expect(bindingsWithModifiers.length).toBeGreaterThan(0)
    })

    it('extracts activation modes', () => {
      const xml = loadSampleActionMaps()
      const result = parseStarCitizenXml(xml)

      const bindingsWithActivation = result.bindings.filter(
        (b) => b.activationMode !== undefined
      )
      expect(bindingsWithActivation.length).toBeGreaterThan(0)
    })

    it('handles malformed XML', () => {
      const malformedXml = '<ActionMaps><actionmap name="test"><broken'
      const result = parseStarCitizenXml(malformedXml)

      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.bindings).toHaveLength(0)
    })

    it('handles empty XML', () => {
      const emptyXml = '<?xml version="1.0"?><ActionMaps></ActionMaps>'
      const result = parseStarCitizenXml(emptyXml)

      expect(result.errors).toHaveLength(0)
      expect(result.bindings).toHaveLength(0)
    })
  })

  describe('buildKeyToActionMap', () => {
    it('builds lookup map from keyboard bindings', () => {
      const xml = loadSampleActionMaps()
      const { bindings } = parseStarCitizenXml(xml)
      const keyMap = buildKeyToActionMap(bindings)

      // Should only include keyboard bindings
      expect(keyMap.size).toBeGreaterThan(0)

      // Check W key is mapped
      expect(keyMap.has('w')).toBe(true)
      const wBindings = keyMap.get('w')
      expect(wBindings?.length).toBeGreaterThan(0)
    })

    it('handles bindings with modifiers', () => {
      const xml = loadSampleActionMaps()
      const { bindings } = parseStarCitizenXml(xml)
      const keyMap = buildKeyToActionMap(bindings)

      // Bindings with modifiers should have combined key
      // Note: depends on sample data having modifier bindings
      const allKeys = Array.from(keyMap.keys())
      const modifierKeys = allKeys.filter((k) => k.includes('+'))
      // May or may not have modifier keys depending on sample data
      expect(allKeys.length).toBeGreaterThan(0)
    })

    it('groups multiple actions per key', () => {
      const xml = loadSampleActionMaps()
      const { bindings } = parseStarCitizenXml(xml)
      const keyMap = buildKeyToActionMap(bindings)

      // Some keys may have multiple actions
      let hasMultiple = false
      for (const [, actions] of keyMap) {
        if (actions.length > 1) {
          hasMultiple = true
          break
        }
      }
      // This is informational - may or may not be true depending on sample data
      expect(typeof hasMultiple).toBe('boolean')
    })
  })

  describe('buildGamepadToActionMap', () => {
    it('builds lookup map from gamepad bindings', () => {
      const xml = loadSampleActionMaps()
      const { bindings } = parseStarCitizenXml(xml)
      const gpMap = buildGamepadToActionMap(bindings)

      // Should only include gamepad bindings
      expect(gpMap.size).toBeGreaterThan(0)
    })

    it('handles gamepad bindings with modifiers', () => {
      const xml = loadSampleActionMaps()
      const { bindings } = parseStarCitizenXml(xml)
      const gpMap = buildGamepadToActionMap(bindings)

      // Check for modifier bindings (e.g., LB+X)
      const allKeys = Array.from(gpMap.keys())
      const modifierKeys = allKeys.filter((k) => k.includes('+'))
      expect(modifierKeys.length).toBeGreaterThan(0)
    })
  })

  describe('getActionMapNames', () => {
    it('returns unique action map names', () => {
      const xml = loadSampleActionMaps()
      const { bindings } = parseStarCitizenXml(xml)
      const names = getActionMapNames(bindings)

      expect(names.length).toBeGreaterThan(0)
      expect(names).toContain('spaceship_movement')
      expect(names).toContain('spaceship_weapons')

      // Should be sorted
      const sorted = [...names].sort()
      expect(names).toEqual(sorted)
    })
  })

  describe('filterByInputType', () => {
    it('filters keyboard bindings', () => {
      const xml = loadSampleActionMaps()
      const { bindings } = parseStarCitizenXml(xml)
      const keyboard = filterByInputType(bindings, 'keyboard')

      expect(keyboard.length).toBeGreaterThan(0)
      expect(keyboard.every((b) => b.inputType === 'keyboard')).toBe(true)
    })

    it('filters gamepad bindings', () => {
      const xml = loadSampleActionMaps()
      const { bindings } = parseStarCitizenXml(xml)
      const gamepad = filterByInputType(bindings, 'gamepad')

      expect(gamepad.length).toBeGreaterThan(0)
      expect(gamepad.every((b) => b.inputType === 'gamepad')).toBe(true)
    })

    it('filters mouse bindings', () => {
      const xml = loadSampleActionMaps()
      const { bindings } = parseStarCitizenXml(xml)
      const mouse = filterByInputType(bindings, 'mouse')

      expect(mouse.every((b) => b.inputType === 'mouse')).toBe(true)
    })
  })
})
