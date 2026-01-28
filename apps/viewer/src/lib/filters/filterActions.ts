/**
 * Pure filter logic for SCDefaultAction data.
 * No React dependencies — can be used in workers, tests, or server-side.
 */

import type { SCDefaultAction } from '../types/defaultProfile';
import type { FilterState, InputType } from '../types/filters';

/**
 * Apply all active filters to an array of actions.
 * Returns a new array containing only matching actions.
 *
 * Filter pipeline (short-circuits on first non-match):
 * 1. Text search (substring across multiple fields)
 * 2. Action map inclusion (set membership)
 * 3. Binding state (bound/unbound relative to selected input types)
 */
export function filterActions(
  actions: readonly SCDefaultAction[],
  filters: FilterState,
): SCDefaultAction[] {
  const query = filters.searchQuery.trim().toLowerCase();
  const hasQuery = query.length > 0;
  const hasMapFilter = filters.actionMaps.size > 0;
  const hasBindingFilter = filters.bindingState !== 'all';

  // Fast path: no filters active
  if (!hasQuery && !hasMapFilter && !hasBindingFilter) {
    return actions as SCDefaultAction[];
  }

  return actions.filter((action) => {
    // 1. Text search
    if (hasQuery && !matchesSearch(action, query)) {
      return false;
    }

    // 2. Action map filter (empty set = show all)
    if (hasMapFilter && !filters.actionMaps.has(action.mapName)) {
      return false;
    }

    // 3. Binding state filter
    if (hasBindingFilter) {
      const hasBinding = hasBindingForSelectedInputs(action, filters.inputTypes);
      if (filters.bindingState === 'bound' && !hasBinding) return false;
      if (filters.bindingState === 'unbound' && hasBinding) return false;
    }

    return true;
  });
}

/** Check if an action matches the text search query */
function matchesSearch(action: SCDefaultAction, query: string): boolean {
  // Check label, description, action name, map name
  if (action.label.toLowerCase().includes(query)) return true;
  if (action.actionName.toLowerCase().includes(query)) return true;
  if (action.mapName.toLowerCase().includes(query)) return true;
  if (action.description?.toLowerCase().includes(query)) return true;

  // Also check binding keys for reverse lookup (e.g., searching "f" finds actions bound to F key)
  if (action.keyboardBind?.toLowerCase().includes(query)) return true;
  if (action.mouseBind?.toLowerCase().includes(query)) return true;
  if (action.gamepadBind?.toLowerCase().includes(query)) return true;
  if (action.joystickBind?.toLowerCase().includes(query)) return true;

  return false;
}

/** Check if an action has a binding for any of the selected input types */
function hasBindingForSelectedInputs(
  action: SCDefaultAction,
  inputTypes: Set<InputType>,
): boolean {
  for (const type of inputTypes) {
    switch (type) {
      case 'keyboard':
        if (action.keyboardBind != null) return true;
        break;
      case 'mouse':
        if (action.mouseBind != null) return true;
        break;
      case 'gamepad':
        if (action.gamepadBind != null) return true;
        break;
      case 'joystick':
        if (action.joystickBind != null) return true;
        break;
    }
  }
  return false;
}

/**
 * Group actions by mapName, preserving order of first occurrence.
 * Returns entries as [mapName, actions[]] tuples.
 */
export function groupActionsByMap(
  actions: readonly SCDefaultAction[],
): [string, SCDefaultAction[]][] {
  const groups = new Map<string, SCDefaultAction[]>();
  for (const action of actions) {
    const existing = groups.get(action.mapName);
    if (existing) {
      existing.push(action);
    } else {
      groups.set(action.mapName, [action]);
    }
  }
  return Array.from(groups.entries());
}

/**
 * Extract unique action map names from the data, sorted alphabetically.
 */
export function getUniqueActionMaps(actions: readonly SCDefaultAction[]): string[] {
  const maps = new Set<string>();
  for (const action of actions) {
    maps.add(action.mapName);
  }
  return Array.from(maps).sort();
}
