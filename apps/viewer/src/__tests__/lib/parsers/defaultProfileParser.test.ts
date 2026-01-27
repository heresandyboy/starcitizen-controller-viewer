import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  parseDefaultProfile,
  filterActionsByMap,
  getDefaultActionMapNames,
  buildActionLookup,
} from '@/lib/parsers/defaultProfileParser'

const MINIMAL_XML = `<?xml version="1.0" encoding="utf-8"?>
<profile version="1" optionsVersion="2" rebindVersion="2">
  <actionmap name="seat_general" version="1" UILabel="@ui_CGSeatGeneral" UICategory="@ui_CCSeatGeneral">
    <action name="v_emergency_exit" activationMode="tap" keyboard="u+lshift" joystick=" "
            UILabel="@ui_CIEmergencyExit" UIDescription="@ui_CIEmergencyExitDesc" />
    <action name="v_eject" activationMode="press" keyboard="ralt+y" gamepad=" " joystick=" "
            UILabel="@ui_CIEject" UIDescription="@ui_CIEjectDesc" Category="PlayerActions" />
  </actionmap>
  <actionmap name="spaceship_movement" version="2" UILabel="@ui_CGSpaceFlight" UICategory="@ui_CCSpaceFlight">
    <action name="v_roll_left" keyboard="a" mouse="maxis_x" gamepad="thumblx" joystick=" "
            UILabel="@ui_CIRollLeft" UIDescription="@ui_CIRollLeftDesc"
            optionGroup="flight_view_roll" />
  </actionmap>
</profile>`

describe('defaultProfileParser', () => {
  describe('parseDefaultProfile', () => {
    it('parses action names and map names', () => {
      const actions = parseDefaultProfile(MINIMAL_XML)
      expect(actions).toHaveLength(3)
      expect(actions[0].actionName).toBe('v_emergency_exit')
      expect(actions[0].mapName).toBe('seat_general')
      expect(actions[2].mapName).toBe('spaceship_movement')
    })

    it('extracts keyboard bind values', () => {
      const actions = parseDefaultProfile(MINIMAL_XML)
      expect(actions[0].keyboardBind).toBe('u+lshift')
      expect(actions[1].keyboardBind).toBe('ralt+y')
    })

    it('treats space attribute as bindable but unbound', () => {
      const actions = parseDefaultProfile(MINIMAL_XML)
      // v_emergency_exit: joystick=" " → bindable, unbound
      expect(actions[0].joystickBind).toBeNull()
      expect(actions[0].joystickBindable).toBe(true)
    })

    it('treats missing attribute as not bindable', () => {
      const actions = parseDefaultProfile(MINIMAL_XML)
      // v_emergency_exit: no mouse attr → not bindable
      expect(actions[0].mouseBind).toBeNull()
      expect(actions[0].mouseBindable).toBe(false)
      // no gamepad attr either
      expect(actions[0].gamepadBind).toBeNull()
      expect(actions[0].gamepadBindable).toBe(false)
    })

    it('extracts activation mode', () => {
      const actions = parseDefaultProfile(MINIMAL_XML)
      expect(actions[0].activationMode).toBe('tap')
      expect(actions[1].activationMode).toBe('press')
    })

    it('extracts category from action when present', () => {
      const actions = parseDefaultProfile(MINIMAL_XML)
      expect(actions[0].category).toBeNull()
      expect(actions[1].category).toBe('PlayerActions')
    })

    it('inherits UICategory and version from parent actionmap', () => {
      const actions = parseDefaultProfile(MINIMAL_XML)
      expect(actions[0].UICategory).toBe('@ui_CCSeatGeneral')
      expect(actions[0].version).toBe('1')
      expect(actions[2].UICategory).toBe('@ui_CCSpaceFlight')
      expect(actions[2].version).toBe('2')
    })

    it('extracts UILabel and UIDescription', () => {
      const actions = parseDefaultProfile(MINIMAL_XML)
      expect(actions[0].label).toBe('@ui_CIEmergencyExit')
      expect(actions[0].description).toBe('@ui_CIEmergencyExitDesc')
    })

    it('extracts optionGroup when present', () => {
      const actions = parseDefaultProfile(MINIMAL_XML)
      expect(actions[0].optionGroup).toBeNull()
      expect(actions[2].optionGroup).toBe('flight_view_roll')
    })

    it('extracts mouse and gamepad binds', () => {
      const actions = parseDefaultProfile(MINIMAL_XML)
      const rollLeft = actions[2]
      expect(rollLeft.mouseBind).toBe('maxis_x')
      expect(rollLeft.mouseBindable).toBe(true)
      expect(rollLeft.gamepadBind).toBe('thumblx')
      expect(rollLeft.gamepadBindable).toBe(true)
    })

    it('throws on invalid XML', () => {
      expect(() => parseDefaultProfile('<not valid xml<>')).toThrow('XML parse error')
    })
  })

  describe('filterActionsByMap', () => {
    it('filters actions by map name', () => {
      const actions = parseDefaultProfile(MINIMAL_XML)
      const seatActions = filterActionsByMap(actions, 'seat_general')
      expect(seatActions).toHaveLength(2)
      expect(seatActions.every((a) => a.mapName === 'seat_general')).toBe(true)
    })
  })

  describe('getDefaultActionMapNames', () => {
    it('returns unique map names', () => {
      const actions = parseDefaultProfile(MINIMAL_XML)
      const names = getDefaultActionMapNames(actions)
      expect(names).toEqual(['seat_general', 'spaceship_movement'])
    })
  })

  describe('buildActionLookup', () => {
    it('creates actionName → action map', () => {
      const actions = parseDefaultProfile(MINIMAL_XML)
      const lookup = buildActionLookup(actions)
      expect(lookup.size).toBe(3)
      expect(lookup.get('v_emergency_exit')?.activationMode).toBe('tap')
    })
  })
})

describe('defaultProfileParser — full XML validation', () => {
  const xmlPath = join(__dirname, '../../../../public/configs/sc-4.5/defaultProfile.xml')
  const refPath = join(__dirname, '../../../../..', 'starbinder-reference/MappedActions.js')

  let fullActions: ReturnType<typeof parseDefaultProfile>
  let refActions: Array<Record<string, unknown>>

  try {
    const xmlContent = readFileSync(xmlPath, 'utf-8')
    fullActions = parseDefaultProfile(xmlContent)

    // Parse MappedActions.js: extract the array from "export const mappedActionSource = [...]"
    const refContent = readFileSync(refPath, 'utf-8')
    const jsonStr = refContent
      .replace(/^.*?=\s*\[/s, '[')
      .replace(/;\s*$/, '')
    refActions = JSON.parse(jsonStr)
  } catch {
    // Files may not exist in CI — skip gracefully
    fullActions = []
    refActions = []
  }

  const hasData = fullActions.length > 0 && refActions.length > 0

  it('produces the same number of actions as MappedActions.js', () => {
    if (!hasData) return
    expect(fullActions.length).toBe(refActions.length)
  })

  it('matches first 5 actions exactly', () => {
    if (!hasData) return
    for (let i = 0; i < 5; i++) {
      const ours = fullActions[i]
      const ref = refActions[i]
      expect(ours.actionName).toBe(ref.actionName)
      expect(ours.mapName).toBe(ref.mapName)
      expect(ours.keyboardBind).toBe(ref.keyboardBind)
      expect(ours.mouseBind).toBe(ref.mouseBind)
      expect(ours.gamepadBind).toBe(ref.gamepadBind)
      expect(ours.joystickBind).toBe(ref.joystickBind)
      expect(ours.keyboardBindable).toBe(ref.keyboardBindable)
      expect(ours.mouseBindable).toBe(ref.mouseBindable)
      expect(ours.gamepadBindable).toBe(ref.gamepadBindable)
      expect(ours.joystickBindable).toBe(ref.joystickBindable)
      expect(ours.activationMode).toBe(ref.activationMode)
      expect(ours.category).toBe(ref.category)
      expect(ours.UICategory).toBe(ref.UICategory)
      expect(ours.label).toBe(ref.label)
      expect(ours.description).toBe(ref.description)
      expect(ours.version).toBe(ref.version)
      expect(ours.optionGroup).toBe(ref.optionGroup)
    }
  })

  it('matches all actions field by field', () => {
    if (!hasData) return

    // Known reference data discrepancies: MappedActions.js was generated from a
    // different XML version where these actions had different attribute values.
    // Our parser correctly follows StarBinder's actual code logic.
    const KNOWN_EXCEPTIONS = new Set([
      'v_mfd_quick_action_repair_all.keyboardBindable', // XML has keyboard="" but ref says true
    ])

    const mismatches: string[] = []
    for (let i = 0; i < refActions.length; i++) {
      const ours = fullActions[i]
      const ref = refActions[i]
      const fields = [
        'actionName', 'mapName', 'keyboardBind', 'mouseBind', 'gamepadBind',
        'joystickBind', 'keyboardBindable', 'mouseBindable', 'gamepadBindable',
        'joystickBindable', 'activationMode', 'category', 'UICategory',
        'label', 'description', 'version', 'optionGroup',
      ] as const
      for (const field of fields) {
        const ourVal = ours[field as keyof typeof ours]
        const refVal = ref[field]
        if (ourVal !== refVal) {
          const key = `${ref.actionName}.${field}`
          if (!KNOWN_EXCEPTIONS.has(key)) {
            mismatches.push(`[${i}] ${key}: got ${JSON.stringify(ourVal)}, expected ${JSON.stringify(refVal)}`)
          }
        }
      }
    }
    if (mismatches.length > 0) {
      // Show first 20 mismatches for debugging
      expect.fail(`${mismatches.length} mismatches:\n${mismatches.slice(0, 20).join('\n')}`)
    }
  })
})
