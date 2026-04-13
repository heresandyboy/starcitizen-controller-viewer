/**
 * SC Context Groups — groups of action maps that are active simultaneously
 * based on the current game state.
 *
 * Derived from UICategory in defaultProfile.xml. The game engine determines
 * which action maps are active — this is our best-effort approximation based
 * on UICategory groupings and naming conventions.
 *
 * See docs/plan/research-06-sc-context-resolution.md for full research.
 */

export interface ScContextGroup {
  /** Display label for the context (e.g., "Piloting") */
  label: string;
  /** Action maps active in this context */
  actionMaps: string[];
  /** Short description of when this context is active */
  description: string;
}

/**
 * Context groups ordered by typical gameplay relevance.
 * "Always" actions are shown in every context.
 */
export const SC_CONTEXT_GROUPS: Record<string, ScContextGroup> = {
  piloting: {
    label: 'Piloting',
    actionMaps: [
      'spaceship_general',
      'spaceship_movement',
      'spaceship_view',
      'spaceship_quantum',
      'spaceship_targeting',
      'spaceship_targeting_advanced',
      'spaceship_target_hailing',
      'spaceship_weapons',
      'spaceship_auto_weapons',
      'spaceship_missiles',
      'spaceship_defensive',
      'spaceship_power',
      'spaceship_radar',
      'spaceship_hud',
      'spaceship_docking',
      'vehicle_mfd',
      'vehicle_mobiglas',
    ],
    description: 'Flying a ship or sitting in a cockpit',
  },
  onFoot: {
    label: 'On Foot',
    actionMaps: [
      'player',
      'prone',
      'player_emotes',
      'tractor_beam',
      'incapacitated',
    ],
    description: 'Walking, running, FPS combat',
  },
  vehicle: {
    label: 'Vehicle',
    actionMaps: [
      'vehicle_general',
      'vehicle_driver',
    ],
    description: 'Driving a ground vehicle',
  },
  turret: {
    label: 'Turret',
    actionMaps: [
      'turret_movement',
      'turret_advanced',
    ],
    description: 'Manning a turret',
  },
  eva: {
    label: 'EVA',
    actionMaps: [
      'zero_gravity_eva',
      'zero_gravity_traversal',
    ],
    description: 'Floating in zero-G or EVA traversal',
  },
  mining: {
    label: 'Mining',
    actionMaps: [
      'spaceship_mining',
      'mining',
    ],
    description: 'Ship mining mode or FPS hand mining',
  },
  salvage: {
    label: 'Salvage',
    actionMaps: [
      'spaceship_salvage',
    ],
    description: 'Ship salvage mode',
  },
  scanning: {
    label: 'Scanning',
    actionMaps: [
      'spaceship_scanning',
    ],
    description: 'Ship scanning mode',
  },
  camera: {
    label: 'Camera',
    actionMaps: [
      'view_director_mode',
      'flycam',
      'spectator',
    ],
    description: 'Director camera, flycam, or spectating',
  },
  always: {
    label: 'Always',
    actionMaps: [
      'default',
      'seat_general',
      'player_choice',
      'player_input_optical_tracking',
      'lights_controller',
      'ui_textfield',
      'ui_notification',
      'mapui',
      'character_customizer',
      'hacking',
    ],
    description: 'Available in all or most game states',
  },
};

/** Context group key type — keys of SC_CONTEXT_GROUPS */
export type ContextGroupKey = keyof typeof SC_CONTEXT_GROUPS;

/** All valid context group keys */
export const CONTEXT_GROUP_KEYS = Object.keys(SC_CONTEXT_GROUPS) as ContextGroupKey[];

/** Pre-computed Set<string> of action maps per context group (avoids creating Sets per render). */
export const CONTEXT_GROUP_SETS: Record<string, Set<string>> = {};
for (const [groupKey, group] of Object.entries(SC_CONTEXT_GROUPS)) {
  CONTEXT_GROUP_SETS[groupKey] = new Set(group.actionMaps);
}

/**
 * Reverse lookup: given an action map name, return its context group key.
 * Returns undefined for unmapped action maps (debug, IFCS_controls, etc.).
 */
export const ACTION_MAP_TO_CONTEXT: Record<string, string> = {};
for (const [groupKey, group] of Object.entries(SC_CONTEXT_GROUPS)) {
  for (const am of group.actionMaps) {
    ACTION_MAP_TO_CONTEXT[am] = groupKey;
  }
}

/**
 * Get the context group label for an action map.
 * Returns the group label or undefined if not mapped.
 */
export function getContextLabel(actionMapName: string): string | undefined {
  const groupKey = ACTION_MAP_TO_CONTEXT[actionMapName];
  return groupKey ? SC_CONTEXT_GROUPS[groupKey]?.label : undefined;
}

/**
 * Get the precomputed Set for a context group key.
 * Returns undefined if the key isn't a valid context group.
 */
export function getContextGroupSet(key: string): Set<string> | undefined {
  return CONTEXT_GROUP_SETS[key];
}
