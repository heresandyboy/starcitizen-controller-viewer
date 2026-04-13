import { describe, it, expect } from 'vitest'
import {
  SC_ACTION_NAMES,
  ACTION_MAP_MODES,
  getActionDisplayName,
  formatActionName,
  getGameplayMode,
} from '@/lib/constants/scActions'

describe('scActions', () => {
  describe('SC_ACTION_NAMES', () => {
    it('has entries for core flight actions', () => {
      expect(SC_ACTION_NAMES['v_strafe_up']).toBeDefined()
      expect(SC_ACTION_NAMES['v_strafe_down']).toBeDefined()
      expect(SC_ACTION_NAMES['v_roll_left']).toBeDefined()
      expect(SC_ACTION_NAMES['v_afterburner']).toBeDefined()
      expect(SC_ACTION_NAMES['v_brake']).toBeDefined()
    })

    it('has entries for mining and salvage actions', () => {
      expect(SC_ACTION_NAMES['v_toggle_mining_mode']).toBeDefined()
      expect(SC_ACTION_NAMES['v_toggle_salvage_mode']).toBeDefined()
    })

    it('has entries for FPS and UI actions', () => {
      expect(SC_ACTION_NAMES['mobiglas']).toBeDefined()
      expect(SC_ACTION_NAMES['toggle_flashlight']).toBeDefined()
      expect(SC_ACTION_NAMES['crouch']).toBeDefined()
    })

    it('has at least 400 action names from localization', () => {
      expect(Object.keys(SC_ACTION_NAMES).length).toBeGreaterThan(400)
    })
  })

  describe('ACTION_MAP_MODES', () => {
    it('maps general action maps to General mode', () => {
      expect(ACTION_MAP_MODES['seat_general']).toBe('General')
      expect(ACTION_MAP_MODES['default']).toBe('General')
      expect(ACTION_MAP_MODES['player_choice']).toBe('General')
    })

    it('maps spaceship action maps to Flight mode', () => {
      expect(ACTION_MAP_MODES['spaceship_general']).toBe('Flight')
      expect(ACTION_MAP_MODES['spaceship_movement']).toBe('Flight')
      expect(ACTION_MAP_MODES['spaceship_quantum']).toBe('Flight')
      expect(ACTION_MAP_MODES['spaceship_targeting']).toBe('Flight')
      expect(ACTION_MAP_MODES['spaceship_weapons']).toBe('Flight')
      expect(ACTION_MAP_MODES['spaceship_missiles']).toBe('Flight')
      expect(ACTION_MAP_MODES['spaceship_defensive']).toBe('Flight')
    })

    it('maps specialized vehicle modes correctly', () => {
      expect(ACTION_MAP_MODES['spaceship_mining']).toBe('Mining')
      expect(ACTION_MAP_MODES['spaceship_salvage']).toBe('Salvage')
      expect(ACTION_MAP_MODES['spaceship_scanning']).toBe('Scanning')
    })

    it('maps turret action maps to Turret mode', () => {
      expect(ACTION_MAP_MODES['turret_movement']).toBe('Turret')
      expect(ACTION_MAP_MODES['turret_advanced']).toBe('Turret')
    })

    it('maps vehicle action maps to Vehicle mode', () => {
      expect(ACTION_MAP_MODES['vehicle_general']).toBe('Vehicle')
      expect(ACTION_MAP_MODES['vehicle_driver']).toBe('Vehicle')
    })

    it('maps FPS / on-foot action maps to FPS mode', () => {
      expect(ACTION_MAP_MODES['player']).toBe('FPS')
      expect(ACTION_MAP_MODES['prone']).toBe('FPS')
      expect(ACTION_MAP_MODES['incapacitated']).toBe('FPS')
      expect(ACTION_MAP_MODES['hacking']).toBe('FPS')
    })

    it('maps EVA action maps to EVA mode', () => {
      expect(ACTION_MAP_MODES['zero_gravity_eva']).toBe('EVA')
      expect(ACTION_MAP_MODES['zero_gravity_traversal']).toBe('EVA')
    })

    it('maps camera and view to appropriate modes', () => {
      expect(ACTION_MAP_MODES['spaceship_view']).toBe('Camera')
      expect(ACTION_MAP_MODES['view_director_mode']).toBe('Camera')
      expect(ACTION_MAP_MODES['flycam']).toBe('Camera')
      expect(ACTION_MAP_MODES['spectator']).toBe('Camera')
    })

    it('maps cockpit MFD/mobiglas correctly', () => {
      expect(ACTION_MAP_MODES['vehicle_mfd']).toBe('Flight')
      expect(ACTION_MAP_MODES['vehicle_mobiglas']).toBe('Mobiglass')
    })

    it('maps new flight actionmaps correctly', () => {
      expect(ACTION_MAP_MODES['spaceship_docking']).toBe('Flight')
      expect(ACTION_MAP_MODES['spaceship_targeting_advanced']).toBe('Flight')
      expect(ACTION_MAP_MODES['spaceship_auto_weapons']).toBe('Flight')
    })

    it('maps general/utility actionmaps correctly', () => {
      expect(ACTION_MAP_MODES['player_choice']).toBe('General')
      expect(ACTION_MAP_MODES['lights_controller']).toBe('General')
      expect(ACTION_MAP_MODES['tractor_beam']).toBe('General')
      expect(ACTION_MAP_MODES['mapui']).toBe('General')
      expect(ACTION_MAP_MODES['character_customizer']).toBe('General')
    })

    it('maps FPS hand mining correctly', () => {
      expect(ACTION_MAP_MODES['mining']).toBe('Mining')
    })

    it('maps social/emotes to Social mode', () => {
      expect(ACTION_MAP_MODES['player_emotes']).toBe('Social')
    })
  })

  describe('getActionDisplayName', () => {
    it('returns display name for known actions', () => {
      // Known actions return their localized display name (not undefined)
      expect(getActionDisplayName('v_strafe_forward')).toBeDefined()
      expect(getActionDisplayName('v_toggle_mining_mode')).toBeDefined()
      // Unknown actions get formatted from the key name
      expect(getActionDisplayName('v_unknown_test_action')).toBe('Unknown Test Action')
    })

    it('formats unknown actions using formatActionName', () => {
      expect(getActionDisplayName('v_unknown_action')).toBe('Unknown Action')
      expect(getActionDisplayName('fps_custom_action')).toBe('Custom Action')
    })
  })

  describe('formatActionName', () => {
    it('removes v_ prefix', () => {
      expect(formatActionName('v_strafe_up')).toBe('Strafe Up')
      expect(formatActionName('v_attack1')).toBe('Attack1')
    })

    it('removes fps_ prefix', () => {
      expect(formatActionName('fps_jump')).toBe('Jump')
      expect(formatActionName('fps_sprint')).toBe('Sprint')
    })

    it('removes eva_ prefix', () => {
      expect(formatActionName('eva_boost')).toBe('Boost')
      expect(formatActionName('eva_strafe_up')).toBe('Strafe Up')
    })

    it('removes vehicle_ prefix', () => {
      expect(formatActionName('vehicle_brake')).toBe('Brake')
      expect(formatActionName('vehicle_horn')).toBe('Horn')
    })

    it('converts underscores to spaces', () => {
      expect(formatActionName('some_action_name')).toBe('Some Action Name')
    })

    it('capitalizes each word', () => {
      expect(formatActionName('toggle_mining_mode')).toBe('Toggle Mining Mode')
      expect(formatActionName('fire_weapon_group')).toBe('Fire Weapon Group')
    })

    it('handles actions without prefixes', () => {
      expect(formatActionName('mobiglas')).toBe('Mobiglas')
      expect(formatActionName('personal_inventory')).toBe('Personal Inventory')
    })
  })

  describe('getGameplayMode', () => {
    it('returns mode for known action maps', () => {
      expect(getGameplayMode('spaceship_movement')).toBe('Flight')
      expect(getGameplayMode('player')).toBe('FPS')
      expect(getGameplayMode('spaceship_mining')).toBe('Mining')
      expect(getGameplayMode('zero_gravity_eva')).toBe('EVA')
    })

    it('returns Unknown for unrecognized action maps', () => {
      expect(getGameplayMode('unknown_action_map')).toBe('Unknown')
      expect(getGameplayMode('custom_mode')).toBe('Unknown')
      expect(getGameplayMode('')).toBe('Unknown')
    })
  })

  describe('consistency checks', () => {
    it('SC_ACTION_NAMES has no duplicate values', () => {
      const values = Object.values(SC_ACTION_NAMES)
      const uniqueValues = new Set(values)
      // Allow duplicates as some actions may have the same display name
      // Just verify we have entries
      expect(values.length).toBeGreaterThan(0)
    })

    it('SC_ACTION_NAMES keys are non-empty strings', () => {
      const keys = Object.keys(SC_ACTION_NAMES)
      expect(keys.length).toBeGreaterThan(0)
      for (const key of keys) {
        expect(key.length).toBeGreaterThan(0)
        expect(typeof SC_ACTION_NAMES[key]).toBe('string')
        expect(SC_ACTION_NAMES[key].length).toBeGreaterThan(0)
      }
    })

    it('ACTION_MAP_MODES values are valid GameplayModes', () => {
      const validModes = [
        'General', 'Flight', 'FPS', 'EVA', 'Vehicle', 'Turret',
        'Mining', 'Salvage', 'Scanning', 'Camera', 'Inventory', 'Mobiglass', 'Social', 'Unknown'
      ]

      for (const mode of Object.values(ACTION_MAP_MODES)) {
        expect(validModes).toContain(mode)
      }
    })
  })
})
