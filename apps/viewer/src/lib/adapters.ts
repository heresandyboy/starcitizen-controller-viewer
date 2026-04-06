import type { SCDefaultAction } from './types/defaultProfile';
import type { GameAction } from './types/unified';

/**
 * Convert GameAction[] (from xmlParser) to SCDefaultAction[] so the
 * DefaultActionBrowser filter/display system can render custom XML configs.
 *
 * Notes:
 * - Only the first binding per device type is used (SCDefaultAction is single-bind)
 * - label is already a resolved display name, not a @ui_ key
 * - joystickBind is always null — joystick inputs from the custom XML are
 *   stored under gamepad in GameAction and would need a separate pass if needed
 */
export function adaptGameActionsToSCDefaultActions(actions: GameAction[]): SCDefaultAction[] {
  return actions.map((action) => {
    const kb = action.bindings.keyboard?.[0];
    const mouse = action.bindings.mouse?.[0];
    const gp = action.bindings.gamepad?.[0];

    return {
      actionName: action.name,
      mapName: action.actionMap,
      keyboardBind: kb
        ? kb.modifier ? `${kb.modifier}+${kb.key}` : kb.key
        : null,
      mouseBind: mouse
        ? mouse.modifier ? `${mouse.modifier}+${mouse.input}` : mouse.input
        : null,
      gamepadBind: gp
        ? gp.modifier ? `${gp.modifier}+${gp.input}` : gp.input
        : null,
      joystickBind: null,
      keyboardBindable: true,
      mouseBindable: true,
      gamepadBindable: true,
      joystickBindable: false,
      activationMode: null,
      category: null,
      UICategory: null,
      label: action.displayName,
      description: null,
      version: null,
      optionGroup: null,
    };
  });
}
