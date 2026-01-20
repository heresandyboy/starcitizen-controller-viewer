'use client';

import { useState, useMemo, useCallback } from 'react';
import type { GameAction, GameActionState, GameplayMode } from '@/lib/types/unified';
import { GameActionCard } from './GameActionCard';

interface GameActionBrowserProps {
  state: GameActionState;
}

type ViewMode = 'all' | 'by-category';
type InputFilter = 'all' | 'keyboard' | 'mouse' | 'gamepad' | 'rewasd';

export function GameActionBrowser({ state }: GameActionBrowserProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('by-category');
  const [selectedCategory, setSelectedCategory] = useState<GameplayMode | 'All'>('All');
  const [inputFilter, setInputFilter] = useState<InputFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [compactView, setCompactView] = useState(false);

  // Filter actions based on current selections
  const filteredActions = useMemo(() => {
    let filtered = state.actions;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(action =>
        action.displayName.toLowerCase().includes(query) ||
        action.name.toLowerCase().includes(query) ||
        action.actionMap.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    // Filter by input type
    if (inputFilter !== 'all') {
      filtered = filtered.filter(action => {
        switch (inputFilter) {
          case 'keyboard':
            return action.bindings.keyboard && action.bindings.keyboard.length > 0;
          case 'mouse':
            return action.bindings.mouse && action.bindings.mouse.length > 0;
          case 'gamepad':
            return action.bindings.gamepad && action.bindings.gamepad.length > 0;
          case 'rewasd':
            return action.rewasdTriggers && action.rewasdTriggers.length > 0;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [state.actions, searchQuery, selectedCategory, inputFilter]);

  // Group actions by category
  const groupedActions = useMemo(() => {
    if (viewMode === 'all') {
      return { All: filteredActions };
    }

    const groups: Record<string, GameAction[]> = {};
    for (const action of filteredActions) {
      const key = action.category;
      if (!groups[key]) groups[key] = [];
      groups[key].push(action);
    }

    // Sort groups by name
    const sortedGroups: Record<string, GameAction[]> = {};
    for (const key of Object.keys(groups).sort()) {
      sortedGroups[key] = groups[key];
    }
    return sortedGroups;
  }, [filteredActions, viewMode]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const hasRewasd = state.rewasdFileName !== undefined;

  return (
    <div className="space-y-6">
      {/* Header with file info */}
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-4">
          <span>SC XML: {state.xmlFileName}</span>
          {hasRewasd && <span>reWASD: {state.rewasdFileName}</span>}
        </div>
        <span>{state.actions.length} actions</span>
      </div>

      {/* Search and controls */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search actions..."
            className="w-full px-4 py-2 pl-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">View:</span>
            <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden">
              {(['all', 'by-category'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {mode === 'all' ? 'All' : 'By Category'}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as GameplayMode | 'All')}
              className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            >
              <option value="All">All Categories</option>
              {state.availableCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Input type filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Input:</span>
            <select
              value={inputFilter}
              onChange={(e) => setInputFilter(e.target.value as InputFilter)}
              className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            >
              <option value="all">All Inputs</option>
              <option value="keyboard">Keyboard</option>
              <option value="mouse">Mouse</option>
              <option value="gamepad">Gamepad</option>
              {hasRewasd && <option value="rewasd">reWASD</option>}
            </select>
          </div>

          {/* Compact view toggle */}
          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={compactView}
              onChange={(e) => setCompactView(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Compact</span>
          </label>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        Showing {filteredActions.length} of {state.actions.length} actions
      </div>

      {/* Grouped actions */}
      <div className="space-y-8">
        {Object.entries(groupedActions).map(([groupName, actions]) => (
          <div key={groupName}>
            {viewMode !== 'all' && (
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                {groupName}
                <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                  ({actions.length})
                </span>
              </h2>
            )}
            <div className={compactView ? 'space-y-1' : 'grid gap-4 md:grid-cols-2'}>
              {actions.map((action) => (
                <GameActionCard
                  key={`${action.actionMap}-${action.name}`}
                  action={action}
                  compact={compactView}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredActions.length === 0 && (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          <p className="text-lg">No actions found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
