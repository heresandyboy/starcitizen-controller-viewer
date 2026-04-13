import { describe, it, expect } from 'vitest'
import {
  SC_CONTEXT_GROUPS,
  ACTION_MAP_TO_CONTEXT,
  CONTEXT_GROUP_SETS,
  getContextLabel,
  getContextGroupSet,
} from '@/lib/constants/scContextGroups'
import { ACTION_MAP_MODES } from '@/lib/constants/scActions'

describe('scContextGroups', () => {
  describe('SC_CONTEXT_GROUPS', () => {
    it('has all expected context groups', () => {
      expect(SC_CONTEXT_GROUPS.piloting).toBeDefined()
      expect(SC_CONTEXT_GROUPS.onFoot).toBeDefined()
      expect(SC_CONTEXT_GROUPS.vehicle).toBeDefined()
      expect(SC_CONTEXT_GROUPS.turret).toBeDefined()
      expect(SC_CONTEXT_GROUPS.eva).toBeDefined()
      expect(SC_CONTEXT_GROUPS.mining).toBeDefined()
      expect(SC_CONTEXT_GROUPS.salvage).toBeDefined()
      expect(SC_CONTEXT_GROUPS.scanning).toBeDefined()
      expect(SC_CONTEXT_GROUPS.camera).toBeDefined()
      expect(SC_CONTEXT_GROUPS.always).toBeDefined()
    })

    it('has no duplicate action maps across groups', () => {
      const allActionMaps: string[] = []
      for (const group of Object.values(SC_CONTEXT_GROUPS)) {
        allActionMaps.push(...group.actionMaps)
      }
      const unique = new Set(allActionMaps)
      expect(allActionMaps.length).toBe(unique.size)
    })

    it('piloting group contains core spaceship maps', () => {
      const maps = SC_CONTEXT_GROUPS.piloting.actionMaps
      expect(maps).toContain('spaceship_movement')
      expect(maps).toContain('spaceship_weapons')
      expect(maps).toContain('spaceship_quantum')
    })

    it('onFoot group contains player map', () => {
      const maps = SC_CONTEXT_GROUPS.onFoot.actionMaps
      expect(maps).toContain('player')
      expect(maps).toContain('prone')
    })
  })

  describe('ACTION_MAP_TO_CONTEXT', () => {
    it('maps spaceship_movement to piloting', () => {
      expect(ACTION_MAP_TO_CONTEXT['spaceship_movement']).toBe('piloting')
    })

    it('maps player to onFoot', () => {
      expect(ACTION_MAP_TO_CONTEXT['player']).toBe('onFoot')
    })

    it('maps default to always', () => {
      expect(ACTION_MAP_TO_CONTEXT['default']).toBe('always')
    })

    it('covers all action maps that are in ACTION_MAP_MODES', () => {
      // Every action map in ACTION_MAP_MODES should ideally be in a context group
      const unmapped: string[] = []
      for (const am of Object.keys(ACTION_MAP_MODES)) {
        if (!ACTION_MAP_TO_CONTEXT[am]) {
          unmapped.push(am)
        }
      }
      // Allow a few unmapped (e.g., debug maps) but most should be covered
      expect(unmapped.length).toBeLessThan(5)
    })
  })

  describe('getContextLabel', () => {
    it('returns label for known action maps', () => {
      expect(getContextLabel('spaceship_weapons')).toBe('Piloting')
      expect(getContextLabel('player')).toBe('On Foot')
      expect(getContextLabel('zero_gravity_eva')).toBe('EVA')
      expect(getContextLabel('default')).toBe('Always')
    })

    it('returns undefined for unknown action maps', () => {
      expect(getContextLabel('debug')).toBeUndefined()
      expect(getContextLabel('nonexistent')).toBeUndefined()
    })
  })

  describe('CONTEXT_GROUP_SETS', () => {
    it('has a Set for every context group', () => {
      for (const key of Object.keys(SC_CONTEXT_GROUPS)) {
        expect(CONTEXT_GROUP_SETS[key]).toBeInstanceOf(Set)
      }
    })

    it('Set contents match actionMaps arrays', () => {
      for (const [key, group] of Object.entries(SC_CONTEXT_GROUPS)) {
        const set = CONTEXT_GROUP_SETS[key]
        expect(set.size).toBe(group.actionMaps.length)
        for (const am of group.actionMaps) {
          expect(set.has(am)).toBe(true)
        }
      }
    })

    it('getContextGroupSet returns correct set', () => {
      expect(getContextGroupSet('piloting')).toBe(CONTEXT_GROUP_SETS['piloting'])
      expect(getContextGroupSet('nonexistent')).toBeUndefined()
    })
  })
})
