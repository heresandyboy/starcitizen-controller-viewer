'use client';

import type { ButtonPanelData } from './useControllerVisualData';
import type { ComputedPosition } from './useForceLayout';
import { BindingEntryRow } from './BindingEntryRow';
import {
  entryMatchesSearch,
  filterActionsForMode,
} from './useControllerVisualData';
import type { GameplayMode } from '@/lib/types/unified';

interface BindingPanelProps {
  panelData: ButtonPanelData;
  computedPosition: ComputedPosition;
  modeFilter: GameplayMode | 'All';
  searchQuery: string;
  onHover?: (button: string | null) => void;
}

/**
 * A spatially positioned panel showing all bindings for one button
 * across all layers. Positioned by force layout within the canvas.
 *
 * Mode filtering: shows only actions relevant to the selected mode
 * within each entry. Entries with zero matching actions are hidden.
 * "Always" actions (mobiGlas, etc.) persist in every mode.
 */
export function BindingPanel({
  panelData,
  computedPosition,
  modeFilter,
  searchQuery,
  onHover,
}: BindingPanelProps) {
  const { displayName, entries, hasBindings } = panelData;

  // Filter actions per entry for the selected mode, then check search
  const visibleEntries = entries
    .map((entry) => {
      const filteredActions = filterActionsForMode(entry.actions, modeFilter);
      const matchesSearch = entryMatchesSearch(entry, searchQuery);
      return { entry, filteredActions, matchesSearch };
    })
    .filter(({ filteredActions, matchesSearch }) =>
      filteredActions.length > 0 && matchesSearch
    );

  // Collapse panel if no entries or all filtered out
  const isCollapsed = !hasBindings || visibleEntries.length === 0;

  return (
    <div
      className={`
        absolute rounded border
        ${isCollapsed
          ? 'bg-zinc-950/60 border-zinc-800/40'
          : 'bg-zinc-950/90 border-zinc-700/60'}
      `}
      style={{
        left: computedPosition.x,
        top: computedPosition.y,
        width: computedPosition.width,
      }}
      onMouseEnter={() => onHover?.(panelData.button)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Header */}
      <div
        className={`
          px-1.5 py-0.5 text-xs font-semibold border-b border-zinc-800/50
          ${hasBindings && !isCollapsed ? 'text-zinc-200' : 'text-zinc-600'}
        `}
      >
        {displayName}
        {isCollapsed && hasBindings && (
          <span className="text-zinc-600 font-normal ml-1">—</span>
        )}
        {!hasBindings && (
          <span className="text-zinc-600 font-normal ml-1">—</span>
        )}
      </div>

      {/* Binding entries — filtered to mode-relevant actions only */}
      {!isCollapsed && (
        <div className="px-1.5 py-0.5 overflow-y-auto [scrollbar-width:thin]">
          {visibleEntries.map(({ entry, filteredActions }, i) => (
            <BindingEntryRow
              key={entry.binding.id ?? i}
              entry={entry}
              filteredActions={filteredActions}
              highlighted={searchQuery.length > 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
