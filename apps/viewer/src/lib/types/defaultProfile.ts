/**
 * Types for Star Citizen defaultProfile.xml parsed data
 * Matches the output format of StarBinder's MappedActions.js
 */

/** All known activation modes from defaultProfile.xml ActivationModes section */
export type SCActivationMode =
  | 'tap'
  | 'press'
  | 'hold'
  | 'double_tap'
  | 'delayed_hold'
  | 'delayed_hold_no_retrigger'
  | 'delayed_press'
  | 'delayed_press_medium'
  | 'delayed_press_long'
  | 'delayed_press_medium_no_retrigger'
  | 'delayed_press_long_no_retrigger'
  | 'release'
  | 'always'
  | 'toggle_on_press'
  | 'toggle_on_release'
  | 'tap_hold'
  | 'double_tap_hold'
  | 'analog';

/**
 * A single parsed action from defaultProfile.xml.
 * Mirrors the StarBinder MappedActions.js output format exactly.
 */
export type SCDefaultAction = {
  actionName: string;
  mapName: string;
  keyboardBind: string | null;
  mouseBind: string | null;
  gamepadBind: string | null;
  joystickBind: string | null;
  keyboardBindable: boolean;
  mouseBindable: boolean;
  gamepadBindable: boolean;
  joystickBindable: boolean;
  activationMode: SCActivationMode | null;
  category: string | null;
  UICategory: string | null;
  label: string;
  description: string | null;
  version: string | null;
  optionGroup: string | null;
};

/** Map of localization keys to their resolved text values */
export type SCLocalizationMap = Map<string, string>;
