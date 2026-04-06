import type { GameplayMode } from '@/lib/types/binding';

/** Maps gameplay modes to their sub-groupings by action map. */
const MODE_SUBCATEGORIES: Partial<Record<GameplayMode, Record<string, string[]>>> = {
  Flight: {
    'Movement':  ['spaceship_movement'],
    'Weapons':   ['spaceship_weapons', 'spaceship_missiles'],
    'Targeting': ['spaceship_targeting', 'spaceship_target_hailing'],
    'Defense':   ['spaceship_defensive'],
    'Power':     ['spaceship_power', 'spaceship_shields'],
    'HUD':       ['spaceship_hud', 'spaceship_radar'],
    'General':   ['spaceship_general', 'spaceship_quantum'],
  },
  FPS: {
    'Movement':    ['fps_movement'],
    'Combat':      ['fps_combat', 'fps_weapons'],
    'View':        ['fps_view'],
    'Interaction': ['fps_interaction', 'fps_ineraction', 'fps_inerraction'],
  },
  EVA: {
    'Movement':  ['eva_movement', 'eva', 'zero_gravity_eva'],
  },
  Vehicle: {
    'General':   ['vehicle_general'],
    'Driving':   ['vehicle_driver'],
  },
  Mining: {
    'Mining':    ['spaceship_mining'],
  },
  Salvage: {
    'Salvage':   ['spaceship_salvage'],
  },
  Scanning: {
    'Scanning':  ['spaceship_scanning'],
  },
  Turret: {
    'Controls':  ['turret_main', 'turret_movement', 'turret_advanced'],
  },
};

/**
 * Get the subcategory name for an action map within a gameplay mode.
 * Falls back to "Other" if no mapping exists.
 */
export function getSubcategory(mode: GameplayMode, actionMap: string): string {
  const subs = MODE_SUBCATEGORIES[mode];
  if (subs) {
    for (const [category, maps] of Object.entries(subs)) {
      if (maps.includes(actionMap)) return category;
    }
  }
  return 'Other';
}

/**
 * Get ordered subcategory names for a mode.
 * Returns the defined order, which is more logical than alphabetical.
 */
export function getSubcategoryOrder(mode: GameplayMode): string[] {
  const subs = MODE_SUBCATEGORIES[mode];
  return subs ? Object.keys(subs) : [];
}
