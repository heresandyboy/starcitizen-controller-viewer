/**
 * V2 Binding Types
 *
 * New type system centered on ResolvedBinding — the fully resolved chain from
 * physical controller button through reWASD layers/activators/macros to Star Citizen
 * game actions. Lives alongside the existing UnifiedMapping types until views are
 * migrated.
 *
 * Plan: docs/plan/01-data-types-v2.md
 * Beads: controller-6v9
 */

import type { ActivatorType, ActivatorMode } from './rewasd';
import type { GameplayMode } from './unified';

// Re-export for convenience — consumers of binding.ts shouldn't need to know
// which file these originally came from.
export type { ActivatorType, ActivatorMode, GameplayMode };

// ---------------------------------------------------------------------------
// Shift Layers
// ---------------------------------------------------------------------------

/** A reWASD shift layer — one of up to 11 layers that modify button behavior. */
export interface ShiftLayer {
  /** 0 = Main (default), 1–11 per reWASD config. */
  id: number;
  /** Human-readable name: "Main", "LB", "Y", "Menu", etc. */
  name: string;
  /** Which physical button activates this layer (undefined for Main). */
  triggerButton?: string;
  /** How the layer is activated. */
  triggerType?: 'hold' | 'toggle' | 'radialMenu';
  /** For sub-layers: ID of the parent layer they inherit from. */
  parentLayerId?: number;
  /** True only for the Main (id=0) layer. */
  isDefault: boolean;
  /** Mask indices blocked from inheriting into this layer (rare). */
  unheritableMasks?: number[];
}

// ---------------------------------------------------------------------------
// Macro Steps & Sequences
// ---------------------------------------------------------------------------

/**
 * A single resolved step within a reWASD macro output.
 *
 * Each step represents one atomic action: a key press/release, gamepad button,
 * pause, etc. Steps that resolve to SC actions have `resolvedAction` populated.
 */
export interface MacroStepResolved {
  /** What kind of output this step produces. */
  type: 'keyboard' | 'gamepad' | 'mouse' | 'pause' | 'rumble';
  /** Normalized key name for keyboard steps (e.g., "Insert", "F7"). */
  key?: string;
  /** Whether this is a press or release event. */
  action?: 'down' | 'up';
  /** Original DirectInput key code from the reWASD config (e.g., "DIK_INSERT"). */
  dikCode?: string;
  /** Duration in ms for pause steps. */
  durationMs?: number;
  /** Normalized gamepad button name for gamepad steps. */
  gamepadButton?: string;
  /** The SC game action this step resolves to, if any. */
  resolvedAction?: {
    actionName: string;
    displayName: string;
    actionMap: string;
    gameplayMode: GameplayMode;
  };
}

/**
 * A complete macro output sequence from a reWASD activator.
 *
 * Preserves full step ordering and timing — critical for multi-action macros
 * where a single button press triggers multiple SC actions in sequence.
 */
export interface MacroSequence {
  /** Ordered list of all macro steps. */
  steps: MacroStepResolved[];
  /** Total duration of the macro including pauses (ms). */
  totalDurationMs: number;
  /** True if this is a simple single-key remap (one down + one up, no pauses). */
  isSimple: boolean;
  /** Deduplicated list of keyboard keys that produce "down" events. */
  keyboardKeysOutput: string[];
  /** Deduplicated list of gamepad buttons that produce "down" events. */
  gamepadButtonsOutput: string[];
}

// ---------------------------------------------------------------------------
// Resolved Binding (core entity)
// ---------------------------------------------------------------------------

/**
 * How a binding was resolved — indicates which data sources contributed.
 *
 * - `rewasd+xml`: reWASD keyboard macro → SC XML keyboard binding (most common)
 * - `rewasd+xml-gamepad`: reWASD gamepad output → SC XML gamepad binding
 * - `rewasd+default`: reWASD macro → SC default profile fallback
 * - `rewasd-unresolved`: reWASD macro key found no matching SC binding
 * - `xml-gamepad`: Direct SC XML gamepad binding (no reWASD involvement)
 * - `xml-keyboard`: Direct SC XML keyboard binding (no reWASD involvement)
 */
export type BindingSource =
  | 'rewasd+xml'
  | 'rewasd+xml-gamepad'
  | 'rewasd+default'
  | 'rewasd-unresolved'
  | 'xml-gamepad'
  | 'xml-keyboard';

/**
 * The core entity: a fully resolved chain from physical controller input to
 * game action(s).
 *
 * Each ResolvedBinding represents one (button, layer, activator) combination
 * and all the SC actions it triggers through its macro sequence.
 */
export interface ResolvedBinding {
  /** Unique ID for this binding (e.g., "A-0-single"). */
  id: string;
  /** Physical controller button name: "A", "DpadUp", "RB", "P1", etc. */
  button: string;
  /** Which shift layer this binding belongs to. */
  layer: ShiftLayer;
  /** Activator configuration for this binding. */
  activator: {
    /** Press type required to trigger this binding. */
    type: ActivatorType;
    /** How the binding behaves once triggered. */
    mode: ActivatorMode;
    /** Delay before the action fires (ms). */
    delayMs?: number;
    /** How long to hold for a "long" press (ms). */
    longPressMs?: number;
    /** Window for detecting a "double" tap (ms). */
    doubleTapWindowMs?: number;
  };
  /** The full macro output sequence from reWASD. */
  macro: MacroSequence;
  /** All SC game actions triggered by this binding's macro. */
  actions: ResolvedAction[];
  /** How this binding was resolved (which data sources contributed). */
  source: BindingSource;
  /** French description from reWASD config (debug/secondary display). */
  description?: string;
}

/**
 * A single SC game action triggered by one step in a macro sequence.
 *
 * A ResolvedBinding can have multiple ResolvedActions when its macro
 * presses several keys that each map to different SC actions.
 */
export interface ResolvedAction {
  /** SC internal action name (e.g., "v_weapon_cycle_missile_fwd"). */
  name: string;
  /** Human-readable display name (e.g., "Cycle Missile Forward"). */
  displayName: string;
  /** SC action map this action belongs to (e.g., "spaceship_missiles"). */
  actionMap: string;
  /** Gameplay mode derived from the action map. */
  gameplayMode: GameplayMode;
  /** Which step in the macro sequence triggered this action. */
  macroStepIndex: number;
  /** Whether the action was resolved via keyboard or gamepad binding. */
  resolvedVia: 'keyboard' | 'gamepad';
  /** The specific key or button that matched (e.g., "kb1_insert", "gp1_back"). */
  matchedInput: string;
}

// ---------------------------------------------------------------------------
// Binding Index (query structure)
// ---------------------------------------------------------------------------

/** Aggregate statistics for a set of resolved bindings. */
export interface BindingStats {
  totalBindings: number;
  resolvedBindings: number;
  unresolvedBindings: number;
  multiActionBindings: number;
  layerCount: number;
  uniqueActionsTriggered: number;
  bindingsPerLayer: Map<number, number>;
}

/**
 * Pre-built index for O(1) lookups across all resolved bindings.
 *
 * Built once by the chain resolver, consumed by all views. Each map provides
 * a different access pattern so views never need to filter/scan the full list.
 */
export interface BindingIndex {
  /** All resolved bindings in stable order. */
  all: ResolvedBinding[];
  /** All shift layers in order (Main first). */
  layers: ShiftLayer[];
  /** Nested lookup: button → layerId → activatorType → binding. */
  byButtonLayerActivator: Map<string, Map<number, Map<ActivatorType, ResolvedBinding>>>;
  /** All bindings that trigger a given SC action (by action name). */
  byAction: Map<string, ResolvedBinding[]>;
  /** All bindings relevant to a gameplay mode. */
  byMode: Map<GameplayMode, ResolvedBinding[]>;
  /** All bindings in a given layer. */
  byLayer: Map<number, ResolvedBinding[]>;
  /** All bindings for a given physical button (across all layers). */
  byButton: Map<string, ResolvedBinding[]>;
  /** Aggregate statistics. */
  stats: BindingStats;
}
