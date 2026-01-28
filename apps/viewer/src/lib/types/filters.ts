/**
 * Filter state types for the Unified Filter Bar.
 * Shared across all views (Table, Card, Controller Visual, Comparison).
 */

export type InputType = 'keyboard' | 'mouse' | 'gamepad' | 'joystick';

export type BindingState = 'all' | 'bound' | 'unbound';

export type ViewMode = 'table' | 'card' | 'controller';

/** Complete filter state managed by useFilterState */
export type FilterState = {
  /** Free-text search across action names, labels, descriptions, map names, bindings */
  searchQuery: string;
  /** Which input device columns to show. All selected = show all. */
  inputTypes: Set<InputType>;
  /** Which action maps to include. Empty set = all maps (no filter). */
  actionMaps: Set<string>;
  /** Tri-state: show all, only bound, or only unbound actions */
  bindingState: BindingState;
  /** Current view mode */
  activeView: ViewMode;
};

/** Actions to mutate filter state */
export type FilterActions = {
  setSearchQuery: (query: string) => void;
  toggleInputType: (type: InputType) => void;
  setAllInputTypes: (enabled: boolean) => void;
  toggleActionMap: (mapName: string) => void;
  selectAllActionMaps: () => void;
  clearAllActionMaps: () => void;
  selectActionMapsByCategory: (category: string, mapNames: string[]) => void;
  clearActionMapsByCategory: (mapNames: string[]) => void;
  setBindingState: (state: BindingState) => void;
  setActiveView: (view: ViewMode) => void;
  clearAllFilters: () => void;
};

/** Derived filter metadata */
export type FilterMeta = {
  /** Whether any filter is active (not at default state) */
  hasActiveFilters: boolean;
  /** Number of active filter dimensions */
  activeFilterCount: number;
};

/** All input types in display order */
export const ALL_INPUT_TYPES: InputType[] = ['keyboard', 'mouse', 'gamepad', 'joystick'];

/** Display labels for input types */
export const INPUT_TYPE_LABELS: Record<InputType, string> = {
  keyboard: 'Keyboard',
  mouse: 'Mouse',
  gamepad: 'Gamepad',
  joystick: 'Joystick',
};

/** Display labels for binding states */
export const BINDING_STATE_LABELS: Record<BindingState, string> = {
  all: 'All',
  bound: 'Bound',
  unbound: 'Unbound',
};

/** Display labels for view modes */
export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  table: 'Table',
  card: 'Cards',
  controller: 'Controller',
};
