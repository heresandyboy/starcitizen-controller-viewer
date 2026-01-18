/**
 * Star Citizen action name translations and categorization
 * Maps internal action names to human-readable names and gameplay modes
 */

import type { GameplayMode } from '../types/unified';

// ============================================================================
// Action Name Translations
// ============================================================================

export const SC_ACTION_NAMES: Record<string, string> = {
  // Flight - General
  'v_flightready': 'Flight Ready',
  'v_view_mode': 'Cycle Camera View',
  'v_view_cycle_fwd': 'Cycle View Forward',
  'v_view_yaw_left': 'Look Left',
  'v_view_yaw_right': 'Look Right',
  'v_view_pitch_up': 'Look Up',
  'v_view_pitch_down': 'Look Down',

  // Flight - Movement
  'v_ifcs_speed_limiter_toggle': 'Toggle Speed Limiter',
  'v_ifcs_vector_decoupling_toggle': 'Toggle Decoupled Mode',
  'v_strafe_up': 'Strafe Up',
  'v_strafe_down': 'Strafe Down',
  'v_strafe_left': 'Strafe Left',
  'v_strafe_right': 'Strafe Right',
  'v_strafe_forward': 'Strafe Forward',
  'v_strafe_back': 'Strafe Back',
  'v_roll_left': 'Roll Left',
  'v_roll_right': 'Roll Right',
  'v_pitch_up': 'Pitch Up',
  'v_pitch_down': 'Pitch Down',
  'v_yaw_left': 'Yaw Left',
  'v_yaw_right': 'Yaw Right',
  'v_afterburner': 'Afterburner',
  'v_boost': 'Boost',
  'v_brake': 'Brake / Space Brake',

  // Flight - Landing
  'v_deploy_landing_system': 'Toggle Landing Gear',
  'v_autoland': 'Auto Land',
  'v_toggle_vtol': 'Toggle VTOL',

  // Flight - Power
  'v_power_toggle': 'Toggle Power',
  'v_power_reset_focus': 'Reset Power',
  'v_shield_reset_focus': 'Reset Shields',

  // Weapons
  'v_attack1': 'Fire Group 1',
  'v_attack2': 'Fire Group 2',
  'v_attack1_group1': 'Fire Weapon Group 1',
  'v_attack1_group2': 'Fire Weapon Group 2',
  'v_weapon_cycle_fwd': 'Cycle Weapons Forward',
  'v_weapon_cycle_back': 'Cycle Weapons Back',
  'v_weapon_arm_missile': 'Arm Missiles',
  'v_weapon_launch_missile': 'Launch Missile',
  'v_weapon_cycle_missile_fwd': 'Cycle Missiles Forward',
  'v_weapon_cycle_missile_back': 'Cycle Missiles Back',

  // Targeting
  'v_target_cycle_hostile_fwd': 'Cycle Hostile Targets',
  'v_target_cycle_hostile_back': 'Cycle Hostile Back',
  'v_target_cycle_friendly_fwd': 'Cycle Friendly Targets',
  'v_target_cycle_friendly_back': 'Cycle Friendly Back',
  'v_target_cycle_all_fwd': 'Cycle All Targets',
  'v_target_cycle_all_back': 'Cycle All Back',
  'v_target_cycle_subitem_fwd': 'Cycle Subtargets',
  'v_target_nearest_hostile': 'Target Nearest Hostile',
  'v_target_reticle_focus': 'Target Under Reticle',
  'v_target_unlock': 'Unlock Target',
  'v_target_toggle_pin_focus_index_1': 'Pin Target 1',
  'v_target_toggle_pin_focus_index_2': 'Pin Target 2',
  'v_target_toggle_pin_focus_index_3': 'Pin Target 3',

  // Countermeasures
  'v_weapon_countermeasure_launch_all': 'Launch All Countermeasures',
  'v_weapon_countermeasure_launch_decoy': 'Launch Decoys',
  'v_weapon_countermeasure_launch_noise': 'Launch Noise',
  'v_weapon_countermeasure_cycle_fwd': 'Cycle Countermeasures',

  // Mining
  'v_toggle_mining_mode': 'Toggle Mining Mode',
  'v_mining_throttle_up': 'Mining Throttle Up',
  'v_mining_throttle_down': 'Mining Throttle Down',
  'v_mining_laser_fire': 'Fire Mining Laser',
  'v_toggle_mining_laser_type': 'Toggle Mining Laser Type',

  // Salvage
  'v_toggle_salvage_mode': 'Toggle Salvage Mode',
  'v_salvage_throttle_up': 'Salvage Throttle Up',
  'v_salvage_throttle_down': 'Salvage Throttle Down',

  // Scanning
  'v_toggle_scan_mode': 'Toggle Scan Mode',
  'v_scan_trigger_scan': 'Ping / Scan',
  'v_scanning_trigger_scan': 'Trigger Scan',

  // Quantum
  'v_toggle_quantum_mode': 'Toggle Quantum Mode',
  'v_quantum_system_map': 'Open Starmap',
  'v_starmap': 'Open Starmap',

  // Interaction
  'v_interaction_default': 'Interact',
  'v_inner_thought_focus': 'Inner Thought',

  // FPS - Movement
  'fps_jump': 'Jump',
  'fps_crouch': 'Crouch',
  'fps_prone': 'Prone',
  'fps_sprint': 'Sprint',
  'fps_walk': 'Walk',
  'fps_moveforward': 'Move Forward',
  'fps_moveback': 'Move Back',
  'fps_moveleft': 'Strafe Left',
  'fps_moveright': 'Strafe Right',
  'fps_lean_left': 'Lean Left',
  'fps_lean_right': 'Lean Right',

  // FPS - Combat
  'fps_attack1': 'Fire Weapon',
  'fps_attack2': 'Secondary Fire / ADS',
  'fps_reload': 'Reload',
  'fps_weapon_cycle_fwd': 'Cycle Weapons',
  'fps_holster': 'Holster Weapon',
  'fps_grenade': 'Throw Grenade',
  'fps_melee': 'Melee Attack',

  // FPS - Interaction
  'fps_interact': 'Interact',
  'fps_use': 'Use',
  'fps_inspect': 'Inspect',

  // EVA
  'eva_strafe_up': 'EVA Up',
  'eva_strafe_down': 'EVA Down',
  'eva_strafe_left': 'EVA Left',
  'eva_strafe_right': 'EVA Right',
  'eva_strafe_forward': 'EVA Forward',
  'eva_strafe_back': 'EVA Back',
  'eva_roll_left': 'EVA Roll Left',
  'eva_roll_right': 'EVA Roll Right',
  'eva_boost': 'EVA Boost',
  'eva_brake': 'EVA Brake',

  // Vehicle (Ground)
  'vehicle_brake': 'Vehicle Brake',
  'vehicle_horn': 'Horn',

  // Inventory / MobiGlas
  'mobiglas': 'Open MobiGlas',
  'personal_inventory': 'Personal Inventory',
  'v_toggle_flashlight': 'Toggle Flashlight',

  // Social
  'foip_pushtotalk': 'Push to Talk',
  'foip_viewownplayer': 'View Own Player',
  'foip_recalibrate': 'Recalibrate FOIP',

  // Emotes
  'emote_agree': 'Emote: Agree',
  'emote_disagree': 'Emote: Disagree',
  'emote_wave': 'Emote: Wave',
  'emote_salute': 'Emote: Salute',
};

// ============================================================================
// Action Map to Gameplay Mode
// ============================================================================

export const ACTION_MAP_MODES: Record<string, GameplayMode> = {
  // General
  'seat_general': 'General',
  'default': 'General',
  'player_general': 'General',
  'player_emotes': 'Social',
  'player_input_optical_tracking': 'General',

  // Spaceship
  'spaceship_general': 'Flight',
  'spaceship_view': 'Camera',
  'spaceship_movement': 'Flight',
  'spaceship_quantum': 'Flight',
  'spaceship_targeting': 'Flight',
  'spaceship_target_hailing': 'Flight',
  'spaceship_weapons': 'Flight',
  'spaceship_missiles': 'Flight',
  'spaceship_defensive': 'Flight',
  'spaceship_power': 'Flight',
  'spaceship_shields': 'Flight',
  'spaceship_radar': 'Flight',
  'spaceship_hud': 'Flight',

  // Specialized modes
  'spaceship_mining': 'Mining',
  'spaceship_salvage': 'Salvage',
  'spaceship_scanning': 'Scanning',
  'spaceship_tractor_beam': 'General',

  // Turret
  'turret_main': 'Turret',
  'turret_movement': 'Turret',
  'turret_advanced': 'Turret',

  // Vehicle
  'vehicle_general': 'Vehicle',
  'vehicle_driver': 'Vehicle',

  // FPS
  'fps_movement': 'FPS',
  'fps_view': 'FPS',
  'fps_combat': 'FPS',
  'fps_weapons': 'FPS',
  'fps_interaction': 'FPS',
  'fps_ineraction': 'FPS', // Typo in SC
  'fps_inerraction': 'FPS', // Another typo

  // EVA
  'eva_movement': 'EVA',
  'eva': 'EVA',

  // UI / Inventory
  'ui_textfield': 'General',
  'ui_notification': 'General',
  'inventory': 'Inventory',
  'zero_gravity_eva': 'EVA',
};

/**
 * Get human-readable name for a Star Citizen action
 */
export function getActionDisplayName(actionName: string): string {
  return SC_ACTION_NAMES[actionName] ?? formatActionName(actionName);
}

/**
 * Format an action name into a readable string
 * e.g., "v_toggle_mining_mode" -> "Toggle Mining Mode"
 */
export function formatActionName(actionName: string): string {
  return actionName
    // Remove prefixes
    .replace(/^v_/, '')
    .replace(/^fps_/, '')
    .replace(/^eva_/, '')
    .replace(/^vehicle_/, '')
    // Convert underscores to spaces
    .replace(/_/g, ' ')
    // Capitalize words
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get gameplay mode for an action map name
 */
export function getGameplayMode(actionMapName: string): GameplayMode {
  return ACTION_MAP_MODES[actionMapName] ?? 'Unknown';
}
