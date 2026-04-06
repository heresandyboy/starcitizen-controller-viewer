import { describe, it, expect } from 'vitest'
import { getSubcategory, getSubcategoryOrder } from '@/components/ModeCheatSheet/subcategories'

describe('subcategories', () => {
  describe('getSubcategory', () => {
    it('maps Flight action maps to correct subcategories', () => {
      expect(getSubcategory('Flight', 'spaceship_movement')).toBe('Movement')
      expect(getSubcategory('Flight', 'spaceship_weapons')).toBe('Weapons')
      expect(getSubcategory('Flight', 'spaceship_missiles')).toBe('Weapons')
      expect(getSubcategory('Flight', 'spaceship_targeting')).toBe('Targeting')
      expect(getSubcategory('Flight', 'spaceship_defensive')).toBe('Defense')
      expect(getSubcategory('Flight', 'spaceship_power')).toBe('Power')
      expect(getSubcategory('Flight', 'spaceship_hud')).toBe('HUD')
      expect(getSubcategory('Flight', 'spaceship_general')).toBe('General')
      expect(getSubcategory('Flight', 'spaceship_quantum')).toBe('General')
    })

    it('maps FPS action maps to correct subcategories', () => {
      expect(getSubcategory('FPS', 'fps_movement')).toBe('Movement')
      expect(getSubcategory('FPS', 'fps_combat')).toBe('Combat')
      expect(getSubcategory('FPS', 'fps_weapons')).toBe('Combat')
      expect(getSubcategory('FPS', 'fps_view')).toBe('View')
      expect(getSubcategory('FPS', 'fps_interaction')).toBe('Interaction')
    })

    it('maps EVA action maps correctly', () => {
      expect(getSubcategory('EVA', 'eva_movement')).toBe('Movement')
      expect(getSubcategory('EVA', 'zero_gravity_eva')).toBe('Movement')
    })

    it('maps Vehicle action maps correctly', () => {
      expect(getSubcategory('Vehicle', 'vehicle_general')).toBe('General')
      expect(getSubcategory('Vehicle', 'vehicle_driver')).toBe('Driving')
    })

    it('returns "Other" for unknown action maps', () => {
      expect(getSubcategory('Flight', 'unknown_map')).toBe('Other')
      expect(getSubcategory('FPS', 'spaceship_movement')).toBe('Other')
    })

    it('returns "Other" for unknown modes', () => {
      expect(getSubcategory('Unknown', 'anything')).toBe('Other')
    })
  })

  describe('getSubcategoryOrder', () => {
    it('returns ordered subcategories for Flight', () => {
      const order = getSubcategoryOrder('Flight')
      expect(order).toContain('Movement')
      expect(order).toContain('Weapons')
      expect(order).toContain('General')
      expect(order.indexOf('Movement')).toBeLessThan(order.indexOf('Weapons'))
    })

    it('returns ordered subcategories for FPS', () => {
      const order = getSubcategoryOrder('FPS')
      expect(order).toContain('Movement')
      expect(order).toContain('Combat')
    })

    it('returns empty array for unknown modes', () => {
      expect(getSubcategoryOrder('Unknown')).toEqual([])
    })
  })
})
