import { describe, it, expect } from 'vitest'
import {
  REWASD_BUTTONS,
  REWASD_BUTTON_IDS,
  BUTTON_DISPLAY_NAMES,
  GAMEPAD_API_BUTTONS,
  rewasdButtonToName,
  getButtonDisplayName,
  parseRewasdButtonDescription,
} from '@/lib/constants/gamepadButtons'

describe('gamepadButtons', () => {
  describe('REWASD_BUTTONS', () => {
    it('maps face buttons correctly', () => {
      expect(REWASD_BUTTONS[1]).toBe('A')
      expect(REWASD_BUTTONS[2]).toBe('B')
      expect(REWASD_BUTTONS[3]).toBe('X')
      expect(REWASD_BUTTONS[4]).toBe('Y')
    })

    it('maps bumpers correctly', () => {
      expect(REWASD_BUTTONS[5]).toBe('LB')
      expect(REWASD_BUTTONS[6]).toBe('RB')
    })

    it('maps special buttons correctly', () => {
      expect(REWASD_BUTTONS[7]).toBe('View')
      expect(REWASD_BUTTONS[8]).toBe('Menu')
      expect(REWASD_BUTTONS[9]).toBe('LS')
      expect(REWASD_BUTTONS[10]).toBe('RS')
      expect(REWASD_BUTTONS[11]).toBe('Xbox')
    })

    it('maps Xbox Elite paddles correctly', () => {
      expect(REWASD_BUTTONS[29]).toBe('P1')
      expect(REWASD_BUTTONS[30]).toBe('P2')
      expect(REWASD_BUTTONS[31]).toBe('P3')
      expect(REWASD_BUTTONS[32]).toBe('P4')
    })

    it('maps D-Pad correctly', () => {
      expect(REWASD_BUTTONS[33]).toBe('DpadUp')
      expect(REWASD_BUTTONS[34]).toBe('DpadDown')
      expect(REWASD_BUTTONS[35]).toBe('DpadLeft')
      expect(REWASD_BUTTONS[36]).toBe('DpadRight')
    })

    it('maps left stick zones correctly', () => {
      expect(REWASD_BUTTONS[37]).toBe('LSUp')
      expect(REWASD_BUTTONS[38]).toBe('LSDown')
      expect(REWASD_BUTTONS[39]).toBe('LSLeft')
      expect(REWASD_BUTTONS[40]).toBe('LSRight')
      expect(REWASD_BUTTONS[41]).toBe('LSUpLeft')
      expect(REWASD_BUTTONS[42]).toBe('LSUpRight')
    })

    it('maps triggers correctly', () => {
      expect(REWASD_BUTTONS[51]).toBe('LT')
      expect(REWASD_BUTTONS[52]).toBe('RT')
    })

    it('maps right stick zones correctly', () => {
      expect(REWASD_BUTTONS[113]).toBe('RSUp')
      expect(REWASD_BUTTONS[114]).toBe('RSDown')
      expect(REWASD_BUTTONS[115]).toBe('RSLeft')
      expect(REWASD_BUTTONS[116]).toBe('RSRight')
    })
  })

  describe('REWASD_BUTTON_IDS', () => {
    it('is the inverse of REWASD_BUTTONS', () => {
      for (const [id, name] of Object.entries(REWASD_BUTTONS)) {
        expect(REWASD_BUTTON_IDS[name]).toBe(parseInt(id, 10))
      }
    })

    it('maps button names to IDs correctly', () => {
      expect(REWASD_BUTTON_IDS['A']).toBe(1)
      expect(REWASD_BUTTON_IDS['LB']).toBe(5)
      expect(REWASD_BUTTON_IDS['DpadUp']).toBe(33)
      expect(REWASD_BUTTON_IDS['P1']).toBe(29)
    })

    it('has the same number of entries as REWASD_BUTTONS', () => {
      expect(Object.keys(REWASD_BUTTON_IDS).length).toBe(
        Object.keys(REWASD_BUTTONS).length
      )
    })
  })

  describe('BUTTON_DISPLAY_NAMES', () => {
    it('provides display names for face buttons', () => {
      expect(BUTTON_DISPLAY_NAMES['A']).toBe('A Button')
      expect(BUTTON_DISPLAY_NAMES['B']).toBe('B Button')
      expect(BUTTON_DISPLAY_NAMES['X']).toBe('X Button')
      expect(BUTTON_DISPLAY_NAMES['Y']).toBe('Y Button')
    })

    it('provides display names for bumpers and triggers', () => {
      expect(BUTTON_DISPLAY_NAMES['LB']).toBe('Left Bumper')
      expect(BUTTON_DISPLAY_NAMES['RB']).toBe('Right Bumper')
      expect(BUTTON_DISPLAY_NAMES['LT']).toBe('Left Trigger')
      expect(BUTTON_DISPLAY_NAMES['RT']).toBe('Right Trigger')
    })

    it('provides display names for stick clicks', () => {
      expect(BUTTON_DISPLAY_NAMES['LS']).toBe('Left Stick Click')
      expect(BUTTON_DISPLAY_NAMES['RS']).toBe('Right Stick Click')
    })

    it('provides display names for paddles', () => {
      expect(BUTTON_DISPLAY_NAMES['P1']).toBe('Upper Left Paddle')
      expect(BUTTON_DISPLAY_NAMES['P2']).toBe('Upper Right Paddle')
      expect(BUTTON_DISPLAY_NAMES['P3']).toBe('Lower Left Paddle')
      expect(BUTTON_DISPLAY_NAMES['P4']).toBe('Lower Right Paddle')
    })

    it('provides display names for D-Pad', () => {
      expect(BUTTON_DISPLAY_NAMES['DpadUp']).toBe('D-Pad Up')
      expect(BUTTON_DISPLAY_NAMES['DpadDown']).toBe('D-Pad Down')
      expect(BUTTON_DISPLAY_NAMES['DpadLeft']).toBe('D-Pad Left')
      expect(BUTTON_DISPLAY_NAMES['DpadRight']).toBe('D-Pad Right')
    })

    it('provides display names for stick directions', () => {
      expect(BUTTON_DISPLAY_NAMES['LSUp']).toBe('Left Stick Up')
      expect(BUTTON_DISPLAY_NAMES['RSDown']).toBe('Right Stick Down')
    })
  })

  describe('GAMEPAD_API_BUTTONS', () => {
    it('maps standard Gamepad API indices', () => {
      expect(GAMEPAD_API_BUTTONS[0]).toBe('A')
      expect(GAMEPAD_API_BUTTONS[1]).toBe('B')
      expect(GAMEPAD_API_BUTTONS[2]).toBe('X')
      expect(GAMEPAD_API_BUTTONS[3]).toBe('Y')
      expect(GAMEPAD_API_BUTTONS[4]).toBe('LB')
      expect(GAMEPAD_API_BUTTONS[5]).toBe('RB')
      expect(GAMEPAD_API_BUTTONS[6]).toBe('LT')
      expect(GAMEPAD_API_BUTTONS[7]).toBe('RT')
    })

    it('maps special buttons correctly', () => {
      expect(GAMEPAD_API_BUTTONS[8]).toBe('View')
      expect(GAMEPAD_API_BUTTONS[9]).toBe('Menu')
      expect(GAMEPAD_API_BUTTONS[10]).toBe('LS')
      expect(GAMEPAD_API_BUTTONS[11]).toBe('RS')
      expect(GAMEPAD_API_BUTTONS[16]).toBe('Xbox')
    })

    it('maps D-Pad correctly', () => {
      expect(GAMEPAD_API_BUTTONS[12]).toBe('DpadUp')
      expect(GAMEPAD_API_BUTTONS[13]).toBe('DpadDown')
      expect(GAMEPAD_API_BUTTONS[14]).toBe('DpadLeft')
      expect(GAMEPAD_API_BUTTONS[15]).toBe('DpadRight')
    })

    it('maps Elite paddles at extended indices', () => {
      expect(GAMEPAD_API_BUTTONS[17]).toBe('P1')
      expect(GAMEPAD_API_BUTTONS[18]).toBe('P2')
      expect(GAMEPAD_API_BUTTONS[19]).toBe('P3')
      expect(GAMEPAD_API_BUTTONS[20]).toBe('P4')
    })
  })

  describe('rewasdButtonToName', () => {
    it('returns button name for known IDs', () => {
      expect(rewasdButtonToName(1)).toBe('A')
      expect(rewasdButtonToName(5)).toBe('LB')
      expect(rewasdButtonToName(33)).toBe('DpadUp')
      expect(rewasdButtonToName(51)).toBe('LT')
    })

    it('returns fallback for unknown IDs', () => {
      expect(rewasdButtonToName(999)).toBe('Button999')
      expect(rewasdButtonToName(0)).toBe('Button0')
      expect(rewasdButtonToName(-1)).toBe('Button-1')
    })
  })

  describe('getButtonDisplayName', () => {
    it('returns display name for known buttons', () => {
      expect(getButtonDisplayName('A')).toBe('A Button')
      expect(getButtonDisplayName('LB')).toBe('Left Bumper')
      expect(getButtonDisplayName('DpadUp')).toBe('D-Pad Up')
    })

    it('returns the input name for unknown buttons', () => {
      expect(getButtonDisplayName('Unknown')).toBe('Unknown')
      expect(getButtonDisplayName('CustomButton')).toBe('CustomButton')
    })
  })

  describe('parseRewasdButtonDescription', () => {
    it('handles XB: prefix', () => {
      expect(parseRewasdButtonDescription('XB: A')).toBe('A')
      expect(parseRewasdButtonDescription('XB: LB')).toBe('LB')
      expect(parseRewasdButtonDescription('XB: DpadUp')).toBe('DpadUp')
    })

    it('handles descriptions without prefix', () => {
      expect(parseRewasdButtonDescription('A')).toBe('A')
      expect(parseRewasdButtonDescription('LB')).toBe('LB')
      expect(parseRewasdButtonDescription('DpadUp')).toBe('DpadUp')
    })

    it('maps alternate button names', () => {
      expect(parseRewasdButtonDescription('Left Stick')).toBe('LS')
      expect(parseRewasdButtonDescription('Right Stick')).toBe('RS')
      expect(parseRewasdButtonDescription('Guide')).toBe('Xbox')
    })

    it('maps D-Pad with space variations', () => {
      expect(parseRewasdButtonDescription('Dpad Up')).toBe('DpadUp')
      expect(parseRewasdButtonDescription('Dpad Down')).toBe('DpadDown')
      expect(parseRewasdButtonDescription('Dpad Left')).toBe('DpadLeft')
      expect(parseRewasdButtonDescription('Dpad Right')).toBe('DpadRight')
    })

    it('returns cleaned input for unknown descriptions', () => {
      expect(parseRewasdButtonDescription('XB: Custom')).toBe('Custom')
      expect(parseRewasdButtonDescription('Unknown Button')).toBe('Unknown Button')
    })

    it('trims whitespace', () => {
      expect(parseRewasdButtonDescription('  A  ')).toBe('A')
      expect(parseRewasdButtonDescription('XB:   LB  ')).toBe('LB')
    })
  })

  describe('consistency checks', () => {
    it('REWASD_BUTTONS has no duplicate values', () => {
      const values = Object.values(REWASD_BUTTONS)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('GAMEPAD_API_BUTTONS has no duplicate values', () => {
      const values = Object.values(GAMEPAD_API_BUTTONS)
      const uniqueValues = new Set(values)
      expect(uniqueValues.size).toBe(values.length)
    })

    it('all BUTTON_DISPLAY_NAMES keys match reWASD or Gamepad API buttons', () => {
      const rewasdButtons = new Set(Object.values(REWASD_BUTTONS))
      const gamepadButtons = new Set(Object.values(GAMEPAD_API_BUTTONS))
      const allButtons = new Set([...rewasdButtons, ...gamepadButtons])

      for (const key of Object.keys(BUTTON_DISPLAY_NAMES)) {
        expect(allButtons.has(key)).toBe(true)
      }
    })
  })
})
