'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import type { SCDefaultAction } from '@/lib/types/defaultProfile';
import { defaultActions, SC_VERSION } from '@/lib/data/sc-4.5/defaultActions';
import { localization } from '@/lib/data/sc-4.5/localization';

function resolveLabel(key: string | null): string {
  if (!key) return '';
  const lookupKey = key.startsWith('@') ? key.slice(1) : key;
  return localization[lookupKey] ?? lookupKey;
}

function formatMapName(mapName: string): string {
  return mapName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBind(bind: string): string {
  return bind
    .split('+')
    .map((part) => part.trim())
    .join(' + ');
}

type GroupedActions = Record<string, SCDefaultAction[]>;

export function DefaultActionBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);

  const grouped = useMemo<GroupedActions>(() => {
    const groups: GroupedActions = {};
    for (const action of defaultActions) {
      if (!groups[action.mapName]) groups[action.mapName] = [];
      groups[action.mapName].push(action);
    }
    return groups;
  }, []);

  const filteredGroups = useMemo<GroupedActions>(() => {
    if (!searchQuery.trim()) return grouped;

    const query = searchQuery.toLowerCase();
    const result: GroupedActions = {};

    for (const [mapName, actions] of Object.entries(grouped)) {
      const filtered = actions.filter((action) => {
        const label = resolveLabel(action.label).toLowerCase();
        const desc = resolveLabel(action.description).toLowerCase();
        const name = action.actionName.toLowerCase();
        const map = mapName.toLowerCase();
        return (
          label.includes(query) ||
          desc.includes(query) ||
          name.includes(query) ||
          map.includes(query)
        );
      });
      if (filtered.length > 0) result[mapName] = filtered;
    }
    return result;
  }, [grouped, searchQuery]);

  const totalShown = useMemo(
    () => Object.values(filteredGroups).reduce((sum, arr) => sum + arr.length, 0),
    [filteredGroups],
  );

  const sortedMapNames = useMemo(
    () => Object.keys(filteredGroups).sort(),
    [filteredGroups],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value),
    [],
  );

  const toggleGroup = useCallback((mapName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(mapName)) next.delete(mapName);
      else next.add(mapName);
      return next;
    });
  }, []);

  const collapseAll = useCallback(() => {
    setCollapsedGroups(new Set(sortedMapNames));
  }, [sortedMapNames]);

  const expandAll = useCallback(() => {
    setCollapsedGroups(new Set());
  }, []);

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <span>Star Citizen {SC_VERSION} Default Bindings</span>
        <span>
          {totalShown} of {defaultActions.length} actions &middot;{' '}
          {sortedMapNames.length} action maps
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          ref={searchRef}
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search actions, bindings, action maps..."
          className="w-full px-4 py-2 pl-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Collapse/Expand controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={collapseAll}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          Collapse all
        </button>
        <span className="text-zinc-300 dark:text-zinc-600">|</span>
        <button
          onClick={expandAll}
          className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          Expand all
        </button>
      </div>

      {/* Grouped action tables */}
      <div className="space-y-2">
        {sortedMapNames.map((mapName) => {
          const actions = filteredGroups[mapName];
          const isCollapsed = collapsedGroups.has(mapName);

          return (
            <div
              key={mapName}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden"
            >
              {/* Group header */}
              <button
                onClick={() => toggleGroup(mapName)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 w-4">
                    {isCollapsed ? '▶' : '▼'}
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">
                    {formatMapName(mapName)}
                  </span>
                  <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500">
                    {mapName}
                  </span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {actions.length} actions
                </span>
              </button>

              {/* Action table */}
              {!isCollapsed && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        <th className="text-left px-4 py-2 font-medium">Action</th>
                        <th className="text-left px-3 py-2 font-medium">Keyboard</th>
                        <th className="text-left px-3 py-2 font-medium">Mouse</th>
                        <th className="text-left px-3 py-2 font-medium">Gamepad</th>
                        <th className="text-left px-3 py-2 font-medium">Joystick</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {actions.map((action) => (
                        <ActionRow key={action.actionName} action={action} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {sortedMapNames.length === 0 && (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          <p className="text-lg">No actions found</p>
          <p className="text-sm mt-1">Try adjusting your search</p>
        </div>
      )}
    </div>
  );
}

function ActionRow({ action }: { action: SCDefaultAction }) {
  const label = resolveLabel(action.label);
  const description = resolveLabel(action.description);

  return (
    <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
      <td className="px-4 py-2">
        <div>
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {label}
          </span>
          {description && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
              {description}
            </p>
          )}
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
            {action.actionName}
          </span>
        </div>
      </td>
      <BindCell bind={action.keyboardBind} />
      <BindCell bind={action.mouseBind} />
      <BindCell bind={action.gamepadBind} />
      <BindCell bind={action.joystickBind} />
    </tr>
  );
}

function BindCell({ bind }: { bind: string | null }) {
  if (!bind) {
    return (
      <td className="px-3 py-2 text-zinc-300 dark:text-zinc-700">&mdash;</td>
    );
  }

  return (
    <td className="px-3 py-2">
      <span className="inline-block px-1.5 py-0.5 rounded text-xs font-mono bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
        {formatBind(bind)}
      </span>
    </td>
  );
}
