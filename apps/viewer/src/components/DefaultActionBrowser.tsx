'use client';

import { useState, useMemo, useCallback } from 'react';
import type { SCDefaultAction } from '@/lib/types/defaultProfile';
import type { InputType } from '@/lib/types/filters';
import { defaultActions, SC_VERSION } from '@/lib/data/sc-4.5/defaultActions';
import { localization } from '@/lib/data/sc-4.5/localization';
import { useFilterState } from '@/lib/hooks/useFilterState';
import { filterActions, groupActionsByMap, getUniqueActionMaps } from '@/lib/filters/filterActions';
import { FilterBar } from './FilterBar';
import { CardView } from './CardView';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

type SortColumn = 'label' | 'keyboard' | 'mouse' | 'gamepad' | 'joystick';
type SortDirection = 'asc' | 'desc';
type SortState = { column: SortColumn; direction: SortDirection } | null;

function getBind(action: SCDefaultAction, col: SortColumn): string | null {
  switch (col) {
    case 'label': return resolveLabel(action.label);
    case 'keyboard': return action.keyboardBind;
    case 'mouse': return action.mouseBind;
    case 'gamepad': return action.gamepadBind;
    case 'joystick': return action.joystickBind;
  }
}

function sortActions(actions: SCDefaultAction[], sort: SortState): SCDefaultAction[] {
  if (!sort) return actions;
  const { column, direction } = sort;
  const mult = direction === 'asc' ? 1 : -1;

  return [...actions].sort((a, b) => {
    const aVal = getBind(a, column) ?? '';
    const bVal = getBind(b, column) ?? '';
    // Empty bindings sink to bottom regardless of direction
    if (!aVal && bVal) return 1;
    if (aVal && !bVal) return -1;
    return mult * aVal.localeCompare(bVal);
  });
}

// ---------------------------------------------------------------------------
// Bind badge color
// ---------------------------------------------------------------------------

const BIND_COLORS: Record<string, string> = {
  kbd: 'bg-kbd-subtle text-kbd',
  mouse: 'bg-mouse-subtle text-mouse',
  gamepad: 'bg-gamepad-subtle text-gamepad',
  joystick: 'bg-joystick-subtle text-joystick',
};

// ---------------------------------------------------------------------------
// Sort header icon
// ---------------------------------------------------------------------------

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection | null }) {
  if (!active || !direction) {
    return (
      <svg className="w-3 h-3 opacity-30" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 3l4 5H4l4-5zm0 10l-4-5h8l-4 5z" />
      </svg>
    );
  }
  return direction === 'asc' ? (
    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 3l5 6H3l5-6z" />
    </svg>
  ) : (
    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 13l-5-6h10l-5 6z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DefaultActionBrowser() {
  const { filters, actions, meta } = useFilterState();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortState>(null);

  const availableActionMaps = useMemo(
    () => getUniqueActionMaps(defaultActions),
    [],
  );

  const filtered = useMemo(
    () => filterActions(defaultActions, filters),
    [filters],
  );

  const grouped = useMemo(
    () => groupActionsByMap(filtered),
    [filtered],
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
    setCollapsedGroups(new Set(grouped.map(([name]) => name)));
  }, [grouped]);

  const expandAll = useCallback(() => {
    setCollapsedGroups(new Set());
  }, []);

  const handleSort = useCallback((col: SortColumn) => {
    setSort((prev) => {
      if (!prev || prev.column !== col) return { column: col, direction: 'asc' };
      if (prev.direction === 'asc') return { column: col, direction: 'desc' };
      return null; // third click clears
    });
  }, []);

  // Build visible columns array once
  const visibleCols = useMemo(() => {
    const cols: { key: SortColumn; label: string; type: string }[] = [];
    if (filters.inputTypes.has('keyboard')) cols.push({ key: 'keyboard', label: 'Keyboard', type: 'kbd' });
    if (filters.inputTypes.has('mouse')) cols.push({ key: 'mouse', label: 'Mouse', type: 'mouse' });
    if (filters.inputTypes.has('gamepad')) cols.push({ key: 'gamepad', label: 'Gamepad', type: 'gamepad' });
    if (filters.inputTypes.has('joystick')) cols.push({ key: 'joystick', label: 'Joystick', type: 'joystick' });
    return cols;
  }, [filters.inputTypes]);

  return (
    <div className="space-y-0">
      {/* Unified Filter Bar */}
      <FilterBar
        filters={filters}
        actions={actions}
        meta={meta}
        availableActionMaps={availableActionMaps}
      />

      {/* Header info */}
      <div className="flex items-center justify-between text-sm text-text-secondary px-1 pt-4 pb-2">
        <span className="font-display text-xs">Star Citizen {SC_VERSION} Default Bindings</span>
        <span className="text-xs">
          {filtered.length} of {defaultActions.length} actions &middot;{' '}
          {grouped.length} maps
        </span>
      </div>

      {/* View content */}
      {filters.activeView === 'card' ? (
        /* Card View */
        filtered.length > 0 ? (
          <CardView actions={filtered} inputTypes={filters.inputTypes} />
        ) : (
          <div className="text-center py-12 text-text-muted">
            <p className="text-lg">No actions found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        )
      ) : filters.activeView === 'controller' ? (
        /* Controller View placeholder */
        <div className="text-center py-16 text-text-muted">
          <p className="text-lg">Controller Visual View</p>
          <p className="text-sm mt-1">Coming soon — interactive controller diagram</p>
        </div>
      ) : (
        /* Table View (default) */
        <>
          {/* Collapse/Expand controls */}
          <div className="flex items-center gap-2 px-1 pb-3">
            <button
              onClick={collapseAll}
              className="text-xs text-text-muted hover:text-text transition-colors"
            >
              Collapse all
            </button>
            <span className="text-border">|</span>
            <button
              onClick={expandAll}
              className="text-xs text-text-muted hover:text-text transition-colors"
            >
              Expand all
            </button>
          </div>

          {/* Grouped action tables */}
          <div className="space-y-2">
            {grouped.map(([mapName, mapActions]) => {
              const isCollapsed = collapsedGroups.has(mapName);
              const sorted = sort ? sortActions(mapActions, sort) : mapActions;

              return (
                <div
                  key={mapName}
                  className="rounded-lg border border-border overflow-hidden"
                >
                  {/* Sticky group header */}
                  <button
                    onClick={() => toggleGroup(mapName)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-surface hover:bg-surface-hover transition-colors text-left sticky top-0 z-[5]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted w-4">
                        {isCollapsed ? '▶' : '▼'}
                      </span>
                      <span className="font-medium text-text">
                        {formatMapName(mapName)}
                      </span>
                      <span className="text-xs font-mono text-text-dim">
                        {mapName}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {mapActions.length} actions
                    </span>
                  </button>

                  {/* Content */}
                  {!isCollapsed && (
                    <>
                      {/* Desktop table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border bg-surface-dim text-xs text-text-muted uppercase tracking-wider">
                              <th className="text-left px-4 py-2 font-medium">
                                <button
                                  onClick={() => handleSort('label')}
                                  className="inline-flex items-center gap-1 hover:text-text transition-colors"
                                >
                                  Action
                                  <SortIcon
                                    active={sort?.column === 'label'}
                                    direction={sort?.column === 'label' ? sort.direction : null}
                                  />
                                </button>
                              </th>
                              {visibleCols.map((col) => (
                                <th key={col.key} className="text-left px-3 py-2 font-medium">
                                  <button
                                    onClick={() => handleSort(col.key)}
                                    className="inline-flex items-center gap-1 hover:text-text transition-colors"
                                  >
                                    {col.label}
                                    <SortIcon
                                      active={sort?.column === col.key}
                                      direction={sort?.column === col.key ? sort.direction : null}
                                    />
                                  </button>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border-subtle">
                            {sorted.map((action) => (
                              <tr
                                key={action.actionName}
                                className="hover:bg-surface-hover transition-colors"
                              >
                                <td className="px-4 py-2">
                                  <div>
                                    <span className="font-medium text-text">
                                      {resolveLabel(action.label)}
                                    </span>
                                    {action.description && (
                                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                                        {resolveLabel(action.description)}
                                      </p>
                                    )}
                                    <span className="text-[10px] font-mono text-text-dim">
                                      {action.actionName}
                                    </span>
                                  </div>
                                </td>
                                {visibleCols.map((col) => {
                                  const bind = getBind(action, col.key);
                                  return (
                                    <td key={col.key} className="px-3 py-2">
                                      {bind ? (
                                        <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-mono ${BIND_COLORS[col.type] ?? 'bg-surface-elevated text-text-secondary'}`}>
                                          {formatBind(bind)}
                                        </span>
                                      ) : (
                                        <span className="text-text-dim">&mdash;</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile card layout */}
                      <div className="md:hidden divide-y divide-border-subtle">
                        {sorted.map((action) => (
                          <div
                            key={action.actionName}
                            className="px-4 py-3 space-y-2"
                          >
                            <div>
                              <span className="font-medium text-text text-sm">
                                {resolveLabel(action.label)}
                              </span>
                              {action.description && (
                                <p className="text-xs text-text-secondary mt-0.5">
                                  {resolveLabel(action.description)}
                                </p>
                              )}
                              <span className="text-[10px] font-mono text-text-dim">
                                {action.actionName}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {visibleCols.map((col) => {
                                const bind = getBind(action, col.key);
                                if (!bind) return null;
                                return (
                                  <span
                                    key={col.key}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono ${BIND_COLORS[col.type]}`}
                                  >
                                    <span className="text-[10px] opacity-60 uppercase font-body">
                                      {col.label.slice(0, 3)}
                                    </span>
                                    {formatBind(bind)}
                                  </span>
                                );
                              })}
                              {visibleCols.every((col) => !getBind(action, col.key)) && (
                                <span className="text-xs text-text-dim">No bindings</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty state */}
          {grouped.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              <p className="text-lg">No actions found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
