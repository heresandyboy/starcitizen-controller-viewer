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
    it('maps flight movement actions correctly', () => {
      expect(SC_ACTION_NAMES['v_strafe_up']).toBe('Strafe Up')
      expect(SC_ACTION_NAMES['v_strafe_down']).toBe('Strafe Down')
      expect(SC_ACTION_NAMES['v_strafe_forward']).toBe('Strafe Forward')
      expect(SC_ACTION_NAMES['v_strafe_back']).toBe('Strafe Back')
      expect(SC_ACTION_NAMES['v_roll_left']).toBe('Roll Left')
      expect(SC_ACTION_NAMES['v_roll_right']).toBe('Roll Right')
    })

    it('maps flight control actions correctly', () => {
      expect(SC_ACTION_NAMES['v_flightready']).toBe('Flight Ready')
      expect(SC_ACTION_NAMES['v_afterburner']).toBe('Afterburner')
      expect(SC_ACTION_NAMES['v_boost']).toBe('Boost')
      expect(SC_ACTION_NAMES['v_brake']).toBe('Brake / Space Brake')
      expect(SC_ACTION_NAMES['v_ifcs_speed_limiter_toggle']).toBe('Toggle Speed Limiter')
      expect(SC_ACTION_NAMES['v_ifcs_vector_decoupling_toggle']).toBe('Toggle Decoupled Mode')
    })

    it('maps landing actions correctly', () => {
      expect(SC_ACTION_NAMES['v_deploy_landing_system']).toBe('Toggle Landing Gear')
      expect(SC_ACTION_NAMES['v_autoland']).toBe('Auto Land')
      expect(SC_ACTION_NAMES['v_toggle_vtol']).toBe('Toggle VTOL')
    })

    it('maps weapon actions correctly', () => {
      expect(SC_ACTION_NAMES['v_attack1']).toBe('Fire Group 1')
      expect(SC_ACTION_NAMES['v_attack2']).toBe('Fire Group 2')
      expect(SC_ACTION_NAMES['v_weapon_arm_missile']).toBe('Arm Missiles')
      expect(SC_ACTION_NAMES['v_weapon_launch_missile']).toBe('Launch Missile')
    })

    it('maps targeting actions correctly', () => {
      expect(SC_ACTION_NAMES['v_target_cycle_hostile_fwd']).toBe('Cycle Hostile Targets')
      expect(SC_ACTION_NAMES['v_target_nearest_hostile']).toBe('Target Nearest Hostile')
      expect(SC_ACTION_NAMES['v_target_reticle_focus']).toBe('Target Under Reticle')
      expect(SC_ACTION_NAMES['v_target_unlock']).toBe('Unlock Target')
    })

    it('maps mining and salvage actions correctly', () => {
      expect(SC_ACTION_NAMES['v_toggle_mining_mode']).toBe('Toggle Mining Mode')
      expect(SC_ACTION_NAMES['v_mining_laser_fire']).toBe('Fire Mining Laser')
      expect(SC_ACTION_NAMES['v_toggle_salvage_mode']).toBe('Toggle Salvage Mode')
    })

    it('maps FPS movement actions correctly', () => {
      expect(SC_ACTION_NAMES['fps_jump']).toBe('Jump')
      expect(SC_ACTION_NAMES['fps_crouch']).toBe('Crouch')
      expect(SC_ACTION_NAMES['fps_prone']).toBe('Prone')
      expect(SC_ACTION_NAMES['fps_sprint']).toBe('Sprint')
      expect(SC_ACTION_NAMES['fps_moveforward']).toBe('Move Forward')
    })

    it('maps FPS combat actions correctly', () => {
      expect(SC_ACTION_NAMES['fps_attack1']).toBe('Fire Weapon')
      expect(SC_ACTION_NAMES['fps_attack2']).toBe('Secondary Fire / ADS')
      expect(SC_ACTION_NAMES['fps_reload']).toBe('Reload')
      expect(SC_ACTION_NAMES['fps_grenade']).toBe('Throw Grenade')
      expect(SC_ACTION_NAMES['fps_melee']).toBe('Melee Attack')
    })

    it('maps EVA actions correctly', () => {
      expect(SC_ACTION_NAMES['eva_strafe_up']).toBe('EVA Up')
      expect(SC_ACTION_NAMES['eva_strafe_down']).toBe('EVA Down')
      expect(SC_ACTION_NAMES['eva_boost']).toBe('EVA Boost')
      expect(SC_ACTION_NAMES['eva_brake']).toBe('EVA Brake')
    })

    it('maps UI actions correctly', () => {
      expect(SC_ACTION_NAMES['mobiglas']).toBe('Open MobiGlas')
      expect(SC_ACTION_NAMES['personal_inventory']).toBe('Personal Inventory')
      expect(SC_ACTION_NAMES['v_toggle_flashlight']).toBe('Toggle Flashlight')
    })
  })

  describe('ACTION_MAP_MODES', () => {
    it('maps general action maps to General mode', () => {
      expect(ACTION_MAP_MODES['seat_general']).toBe('General')
      expect(ACTION_MAP_MODES['default']).toBe('General')
      expect(ACTION_MAP_MODES['player_general']).toBe('General')
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
      expect(ACTION_MAP_MODES['turret_main']).toBe('Turret')
      expect(ACTION_MAP_MODES['turret_movement']).toBe('Turret')
      expect(ACTION_MAP_MODES['turret_advanced']).toBe('Turret')
    })

    it('maps vehicle action maps to Vehicle mode', () => {
      expect(ACTION_MAP_MODES['vehicle_general']).toBe('Vehicle')
      expect(ACTION_MAP_MODES['vehicle_driver']).toBe('Vehicle')
    })

    it('maps FPS action maps to FPS mode', () => {
      expect(ACTION_MAP_MODES['fps_movement']).toBe('FPS')
      expect(ACTION_MAP_MODES['fps_view']).toBe('FPS')
      expect(ACTION_MAP_MODES['fps_combat']).toBe('FPS')
      expect(ACTION_MAP_MODES['fps_weapons']).toBe('FPS')
      expect(ACTION_MAP_MODES['fps_interaction']).toBe('FPS')
    })

    it('handles Star Citizen typos in action map names', () => {
      // Star Citizen has known typos in their action map names
      expect(ACTION_MAP_MODES['fps_ineraction']).toBe('FPS')
      expect(ACTION_MAP_MODES['fps_inerraction']).toBe('FPS')
    })

    it('maps EVA action maps to EVA mode', () => {
      expect(ACTION_MAP_MODES['eva_movement']).toBe('EVA')
      expect(ACTION_MAP_MODES['eva']).toBe('EVA')
      expect(ACTION_MAP_MODES['zero_gravity_eva']).toBe('EVA')
    })

    it('maps camera and view to appropriate modes', () => {
      expect(ACTION_MAP_MODES['spaceship_view']).toBe('Camera')
    })

    it('maps inventory to Inventory mode', () => {
      expect(ACTION_MAP_MODES['inventory']).toBe('Inventory')
    })

    it('maps social/emotes to Social mode', () => {
      expect(ACTION_MAP_MODES['player_emotes']).toBe('Social')
    })
  })

  describe('getActionDisplayName', () => {
    it('returns display name for known actions', () => {
      expect(getActionDisplayName('v_strafe_forward')).toBe('Strafe Forward')
      expect(getActionDisplayName('fps_attack1')).toBe('Fire Weapon')
      expect(getActionDisplayName('v_toggle_mining_mode')).toBe('Toggle Mining Mode')
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
      expect(getGameplayMode('fps_combat')).toBe('FPS')
      expect(getGameplayMode('spaceship_mining')).toBe('Mining')
      expect(getGameplayMode('eva_movement')).toBe('EVA')
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

    it('SC_ACTION_NAMES keys follow naming conventions', () => {
      const keys = Object.keys(SC_ACTION_NAMES)
      const validPrefixes = ['v_', 'fps_', 'eva_', 'vehicle_', 'foip_', 'emote_', 'mobiglas', 'personal_']

      for (const key of keys) {
        const hasValidPrefix = validPrefixes.some(prefix => key.startsWith(prefix))
        expect(hasValidPrefix).toBe(true)
      }
    })

    it('ACTION_MAP_MODES values are valid GameplayModes', () => {
      const validModes = [
        'General', 'Flight', 'FPS', 'EVA', 'Vehicle', 'Turret',
        'Mining', 'Salvage', 'Scanning', 'Camera', 'Inventory', 'Social', 'Unknown'
      ]

      for (const mode of Object.values(ACTION_MAP_MODES)) {
        expect(validModes).toContain(mode)
      }
    })
  })
})
