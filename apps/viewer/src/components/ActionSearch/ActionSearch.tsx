'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { BindingIndex, ResolvedBinding, GameplayMode, ActivatorType } from '@/lib/types/binding';
import { ActionResultCard } from './ActionResultCard';

interface ActionSearchProps {
  bindingIndex: BindingIndex;
}

const ACTIVATOR_PRIORITY: Record<ActivatorType, number> = {
  single: 0,
  double: 1,
  long: 2,
  start: 3,
  release: 4,
};

interface ActionGroup {
  actionName: string;
  displayName: string;
  actionMap: string;
  gameplayMode: GameplayMode;
  bindings: ResolvedBinding[];
}

/** Simple fuzzy match: all query words must appear somewhere in the target. */
function fuzzyMatch(query: string, ...targets: string[]): boolean {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const combined = targets.join(' ').toLowerCase();
  return words.every(word => combined.includes(word));
}

/** Get bindings for an action, filtered to only those where the action belongs to the selected mode. */
function getBindingsForActionInMode(
  bindingIndex: BindingIndex,
  actionName: string,
  mode: GameplayMode | 'All'
): ResolvedBinding[] {
  const bindings = bindingIndex.byAction.get(actionName) ?? [];
  if (mode === 'All') return bindings;
  return bindings.filter(b =>
    b.actions.some(a => a.name === actionName && a.gameplayMode === mode)
  );
}

export function ActionSearch({ bindingIndex }: ActionSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<GameplayMode | 'All'>('Flight');
  const [showChain, setShowChain] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounce search input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(value), 200);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Available gameplay modes
  const availableModes = useMemo(() => {
    const modes = new Set<GameplayMode>();
    for (const binding of bindingIndex.all) {
      for (const action of binding.actions) {
        modes.add(action.gameplayMode);
      }
    }
    return Array.from(modes).sort();
  }, [bindingIndex]);

  // Build grouped results: action → all trigger paths
  const results = useMemo(() => {
    const query = debouncedQuery.trim();

    // Get the action pool based on mode filter
    let actionNames: string[];
    if (modeFilter !== 'All') {
      const modeBindings = bindingIndex.byMode.get(modeFilter) ?? [];
      const names = new Set<string>();
      for (const b of modeBindings) {
        for (const a of b.actions) {
          if (a.gameplayMode === modeFilter) names.add(a.name);
        }
      }
      actionNames = Array.from(names);
    } else {
      actionNames = Array.from(bindingIndex.byAction.keys());
    }

    // If no query and showing all, return everything grouped
    // If query provided, fuzzy filter
    const groups: ActionGroup[] = [];

    for (const actionName of actionNames) {
      const filteredBindings = getBindingsForActionInMode(bindingIndex, actionName, modeFilter);
      if (filteredBindings.length === 0) continue;

      // Get action metadata from first binding's matching action
      const firstAction = filteredBindings[0].actions.find(a => a.name === actionName);
      if (!firstAction) continue;

      const displayName = firstAction.displayName;
      const actionMap = firstAction.actionMap;
      const gameplayMode = firstAction.gameplayMode;

      // Apply search filter
      if (query && !fuzzyMatch(query, displayName, actionName, actionMap)) {
        continue;
      }

      // Sort bindings: Main layer first, then by activator simplicity
      const sorted = [...filteredBindings].sort((a, b) => {
        // Main layer first
        if (a.layer.isDefault !== b.layer.isDefault) return a.layer.isDefault ? -1 : 1;
        // Then by activator priority
        return ACTIVATOR_PRIORITY[a.activator.type] - ACTIVATOR_PRIORITY[b.activator.type];
      });

      groups.push({
        actionName,
        displayName,
        actionMap,
        gameplayMode,
        bindings: sorted,
      });
    }

    // Sort groups: exact matches first, then alphabetically by display name
    groups.sort((a, b) => {
      if (query) {
        const aExact = a.displayName.toLowerCase().includes(query.toLowerCase()) ? 0 : 1;
        const bExact = b.displayName.toLowerCase().includes(query.toLowerCase()) ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;
      }
      return a.displayName.localeCompare(b.displayName);
    });

    return groups;
  }, [bindingIndex, debouncedQuery, modeFilter]);

  const totalActions = bindingIndex.byAction.size;

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search input */}
        <div className="relative flex-1 min-w-[250px]">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search actions... e.g. &quot;missile&quot;, &quot;landing gear&quot;, &quot;fire weapon&quot;"
            className="w-full px-4 py-2.5 pl-10 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Mode filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Mode:</span>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as GameplayMode | 'All')}
            className="px-3 py-1.5 text-sm rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100"
          >
            <option value="All">All Modes</option>
            {availableModes.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>

        {/* Technical chain toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showChain}
            onChange={(e) => setShowChain(e.target.checked)}
            className="rounded border-zinc-700"
          />
          <span className="text-sm text-zinc-400">Show technical chain</span>
        </label>
      </div>

      {/* Results count */}
      <div className="text-sm text-zinc-500">
        {debouncedQuery.trim() || modeFilter !== 'All'
          ? `${results.length} of ${totalActions} actions`
          : `${totalActions} actions with controller bindings`
        }
      </div>

      {/* Results */}
      <div className="space-y-3">
        {results.map((group) => (
          <ActionResultCard
            key={group.actionName}
            actionName={group.actionName}
            displayName={group.displayName}
            actionMap={group.actionMap}
            gameplayMode={group.gameplayMode}
            bindings={group.bindings}
            showChain={showChain}
          />
        ))}
      </div>

      {/* Empty state */}
      {results.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-lg">No actions found</p>
          <p className="text-sm mt-1">
            {debouncedQuery.trim()
              ? `No actions match "${debouncedQuery.trim()}"`
              : 'No actions available for the selected mode'
            }
          </p>
        </div>
      )}
    </div>
  );
}
