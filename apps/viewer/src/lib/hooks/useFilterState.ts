/**
 * React hook for managing unified filter state.
 * Used by the FilterBar and consumed by all views.
 */

import { useState, useMemo, useCallback } from 'react';
import type {
  FilterState,
  FilterActions,
  FilterMeta,
  InputType,
  BindingState,
  ViewMode,
} from '../types/filters';
import { ALL_INPUT_TYPES } from '../types/filters';

const DEFAULT_INPUT_TYPES = new Set<InputType>(ALL_INPUT_TYPES);

export type UseFilterStateReturn = {
  filters: FilterState;
  actions: FilterActions;
  meta: FilterMeta;
};

export function useFilterState(): UseFilterStateReturn {
  const [searchQuery, setSearchQuery] = useState('');
  const [inputTypes, setInputTypes] = useState<Set<InputType>>(
    () => new Set(DEFAULT_INPUT_TYPES),
  );
  const [actionMaps, setActionMaps] = useState<Set<string>>(() => new Set());
  const [bindingState, setBindingState] = useState<BindingState>('all');
  const [activeView, setActiveView] = useState<ViewMode>('table');

  // --- Memoized state object ---
  const filters: FilterState = useMemo(
    () => ({
      searchQuery,
      inputTypes,
      actionMaps,
      bindingState,
      activeView,
    }),
    [searchQuery, inputTypes, actionMaps, bindingState, activeView],
  );

  // --- Actions ---
  const toggleInputType = useCallback((type: InputType) => {
    setInputTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        // Don't allow deselecting all — at least one must remain
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const setAllInputTypes = useCallback((enabled: boolean) => {
    setInputTypes(enabled ? new Set(ALL_INPUT_TYPES) : new Set(['keyboard']));
  }, []);

  const toggleActionMap = useCallback((mapName: string) => {
    setActionMaps((prev) => {
      const next = new Set(prev);
      if (next.has(mapName)) {
        next.delete(mapName);
      } else {
        next.add(mapName);
      }
      return next;
    });
  }, []);

  const selectAllActionMaps = useCallback(() => {
    setActionMaps(new Set());
  }, []);

  const clearAllActionMaps = useCallback(() => {
    setActionMaps(new Set());
  }, []);

  const selectActionMapsByCategory = useCallback(
    (_category: string, mapNames: string[]) => {
      setActionMaps((prev) => {
        const next = new Set(prev);
        for (const name of mapNames) {
          next.add(name);
        }
        return next;
      });
    },
    [],
  );

  const clearActionMapsByCategory = useCallback((mapNames: string[]) => {
    setActionMaps((prev) => {
      const next = new Set(prev);
      for (const name of mapNames) {
        next.delete(name);
      }
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setInputTypes(new Set(DEFAULT_INPUT_TYPES));
    setActionMaps(new Set());
    setBindingState('all');
  }, []);

  const actions: FilterActions = useMemo(
    () => ({
      setSearchQuery,
      toggleInputType,
      setAllInputTypes,
      toggleActionMap,
      selectAllActionMaps,
      clearAllActionMaps,
      selectActionMapsByCategory,
      clearActionMapsByCategory,
      setBindingState,
      setActiveView,
      clearAllFilters,
    }),
    [
      toggleInputType,
      setAllInputTypes,
      toggleActionMap,
      selectAllActionMaps,
      clearAllActionMaps,
      selectActionMapsByCategory,
      clearActionMapsByCategory,
      clearAllFilters,
    ],
  );

  // --- Meta ---
  const meta: FilterMeta = useMemo(() => {
    let count = 0;
    if (searchQuery.trim().length > 0) count++;
    if (inputTypes.size < ALL_INPUT_TYPES.length) count++;
    if (actionMaps.size > 0) count++;
    if (bindingState !== 'all') count++;

    return {
      hasActiveFilters: count > 0,
      activeFilterCount: count,
    };
  }, [searchQuery, inputTypes, actionMaps, bindingState]);

  return { filters, actions, meta };
}
