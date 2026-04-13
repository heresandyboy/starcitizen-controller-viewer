'use client';

import { useMemo, useState } from 'react';
import type {
  BindingIndex,
  ResolvedBinding,
  ResolvedAction,
  ShiftLayer,
} from '@/lib/types/binding';
import type { GameplayMode } from '@/lib/types/unified';
import { SC_CONTEXT_GROUPS, CONTEXT_GROUP_SETS, ALWAYS_ACTION_MAPS } from '@/lib/constants/scContextGroups';
import type { ActivatorType } from '@/lib/types/rewasd';
import { PANEL_BUTTONS } from './panelPositions';

// ── Types ──────────────────────────────────────────────────────────

export interface BindingEntry {
  layerId: number;
  layer: ShiftLayer;
  activatorType: ActivatorType;
  activatorMode: string;
  actions: ResolvedAction[];
  binding: ResolvedBinding;
}

export interface ButtonPanelData {
  button: string;
  displayName: string;
  entries: BindingEntry[];
  hasBindings: boolean;
}

export interface ControllerVisualData {
  /** Pre-built panel data for every button, keyed by button name */
  panels: Map<string, ButtonPanelData>;
  /** All shift layers in order */
  layers: ShiftLayer[];
  /** All gameplay modes present in data */
  modes: GameplayMode[];
  /** Filter state */
  modeFilter: GameplayMode | 'All';
  setModeFilter: (mode: GameplayMode | 'All') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

// ── Constants ──────────────────────────────────────────────────────

/** Activator sort order (most common first) */
const ACTIVATOR_ORDER: Record<string, number> = {
  single: 0,
  double: 1,
  long: 2,
  start: 3,
  release: 4,
};

/** Compact display labels for activator types */
export const ACTIVATOR_LABELS: Record<string, string> = {
  single: '',        // omit for tap (most common, save space)
  double: '2x',
  long: 'hold',
  start: 'press',
  release: 'rel',
};

/** Compact display labels for activator modes (non-default only) */
export const ACTIVATOR_MODE_LABELS: Record<string, string> = {
  onetime: '',
  hold_until_release: 'H',
  turbo: 'T',
  toggle: '~',
};

// ── Hook ───────────────────────────────────────────────────────────

export function useControllerVisualData(
  bindingIndex: BindingIndex
): ControllerVisualData {
  const [modeFilter, setModeFilter] = useState<GameplayMode | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const panels = useMemo(() => {
    const result = new Map<string, ButtonPanelData>();

    for (const button of PANEL_BUTTONS) {
      const bindings = bindingIndex.byButton.get(button);
      const entries: BindingEntry[] = [];

      if (bindings) {
        for (const binding of bindings) {
          // Skip bindings with no resolved actions (noise in poster view)
          if (binding.actions.length === 0) continue;
          entries.push({
            layerId: binding.layer.id,
            layer: binding.layer,
            activatorType: binding.activator.type,
            activatorMode: binding.activator.mode,
            actions: binding.actions,
            binding,
          });
        }

        // Sort: layer ID ascending, then activator priority
        entries.sort((a, b) => {
          if (a.layerId !== b.layerId) return a.layerId - b.layerId;
          return (ACTIVATOR_ORDER[a.activatorType] ?? 9)
            - (ACTIVATOR_ORDER[b.activatorType] ?? 9);
        });
      }

      // Get display name — use shorter names for the poster
      const displayName = getShortDisplayName(button);

      result.set(button, {
        button,
        displayName,
        entries,
        hasBindings: entries.length > 0,
      });
    }

    return result;
  }, [bindingIndex]);

  const layers = useMemo(() => bindingIndex.layers, [bindingIndex]);

  const modes = useMemo(() => {
    const modeSet = new Set<GameplayMode>();
    for (const binding of bindingIndex.all) {
      for (const action of binding.actions) {
        modeSet.add(action.gameplayMode);
      }
    }
    return Array.from(modeSet).sort();
  }, [bindingIndex]);

  return {
    panels,
    layers,
    modes,
    modeFilter,
    setModeFilter,
    searchQuery,
    setSearchQuery,
  };
}

// ── Helpers ────────────────────────────────────────────────────────

/** Short display names for poster panel headers */
function getShortDisplayName(button: string): string {
  const SHORT_NAMES: Record<string, string> = {
    A: 'A', B: 'B', X: 'X', Y: 'Y',
    LB: 'LB', RB: 'RB', LT: 'LT', RT: 'RT',
    LS: 'LS Click', RS: 'RS Click',
    View: 'View', Menu: 'Menu', Xbox: 'Xbox',
    P1: 'P1', P2: 'P2', P3: 'P3', P4: 'P4',
    DpadUp: 'D-Pad ↑', DpadDown: 'D-Pad ↓',
    DpadLeft: 'D-Pad ←', DpadRight: 'D-Pad →',
    LSUp: 'LS ↑', LSDown: 'LS ↓', LSLeft: 'LS ←', LSRight: 'LS →',
    RSUp: 'RS ↑', RSDown: 'RS ↓', RSLeft: 'RS ←', RSRight: 'RS →',
    // Analog axis virtual buttons
    LSX: 'LS X-Axis', LSY: 'LS Y-Axis',
    RSX: 'RS X-Axis', RSY: 'RS Y-Axis',
    LTAxis: 'LT Axis', RTAxis: 'RT Axis',
    'LT+RT': 'LT + RT',
  };
  return SHORT_NAMES[button] ?? button;
}

/**
 * Check if a binding entry matches the current search query.
 * Used by BindingPanel to determine dim/highlight state.
 */
export function entryMatchesSearch(
  entry: BindingEntry,
  query: string
): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return entry.actions.some(
    (a) =>
      a.displayName.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.actionMap.toLowerCase().includes(q)
  ) || entry.layer.name.toLowerCase().includes(q);
}

/**
 * Check if a binding entry matches the current mode filter.
 * Supports both individual gameplay modes and context group keys.
 */
export function entryMatchesMode(
  entry: BindingEntry,
  mode: GameplayMode | 'All'
): boolean {
  if (mode === 'All') return true;
  const groupMaps = CONTEXT_GROUP_SETS[mode];
  if (groupMaps) {
    return entry.actions.some((a) => groupMaps.has(a.actionMap) || ALWAYS_ACTION_MAPS.has(a.actionMap));
  }
  return entry.actions.some((a) => a.gameplayMode === mode);
}

/**
 * Filter an entry's actions to only those relevant to the selected mode.
 * "Always" actions (mobiGlas, seat_general, etc.) are included in every mode.
 * Returns the filtered action list, or all actions if mode is 'All'.
 */
export function filterActionsForMode(
  actions: ResolvedAction[],
  mode: GameplayMode | 'All'
): ResolvedAction[] {
  if (mode === 'All') return actions;

  const groupMaps = CONTEXT_GROUP_SETS[mode];
  if (groupMaps) {
    return actions.filter((a) => groupMaps.has(a.actionMap) || ALWAYS_ACTION_MAPS.has(a.actionMap));
  }
  // Individual mode: match by gameplayMode, plus always-group actions
  return actions.filter((a) => a.gameplayMode === mode || ALWAYS_ACTION_MAPS.has(a.actionMap));
}
