'use client';

import type { ButtonPanelData } from './useControllerVisualData';
import type { PanelPosition } from './panelPositions';
import { PANEL_WIDTH } from './panelPositions';
import { BindingEntryRow } from './BindingEntryRow';
import {
  entryMatchesSearch,
  entryMatchesMode,
} from './useControllerVisualData';
import type { GameplayMode } from '@/lib/types/unified';

interface BindingPanelProps {
  panelData: ButtonPanelData;
  position: PanelPosition;
  modeFilter: GameplayMode | 'All';
  searchQuery: string;
  onHover?: (button: string | null) => void;
}

/**
 * A spatially positioned panel showing all bindings for one button
 * across all layers. Positioned absolutely within the canvas.
 */
export function BindingPanel({
  panelData,
  position,
  modeFilter,
  searchQuery,
  onHover,
}: BindingPanelProps) {
  const { displayName, entries, hasBindings } = panelData;

  // Determine which entries match filters
  const entryStates = entries.map((entry) => ({
    entry,
    matchesMode: entryMatchesMode(entry, modeFilter),
    matchesSearch: entryMatchesSearch(entry, searchQuery),
  }));

  const hasVisibleEntries = entryStates.some(
    (s) => s.matchesMode && s.matchesSearch
  );

  // Collapse panel if no entries or all filtered out
  const isCollapsed = !hasBindings || (searchQuery && !hasVisibleEntries) || (modeFilter !== 'All' && !hasVisibleEntries);

  return (
    <div
      className={`
        absolute rounded border
        ${isCollapsed
          ? 'bg-zinc-950/60 border-zinc-800/40'
          : 'bg-zinc-950/90 border-zinc-700/60'}
      `}
      style={{
        left: position.anchor === 'right'
          ? position.x - PANEL_WIDTH
          : position.x,
        top: position.y,
        width: PANEL_WIDTH,
      }}
      onMouseEnter={() => onHover?.(panelData.button)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Header */}
      <div
        className={`
          px-1.5 py-0.5 text-xs font-semibold border-b border-zinc-800/50
          ${hasBindings ? 'text-zinc-200' : 'text-zinc-600'}
          ${position.anchor === 'right' ? 'text-right' : 'text-left'}
        `}
      >
        {displayName}
        {!hasBindings && (
          <span className="text-zinc-600 font-normal ml-1">—</span>
        )}
      </div>

      {/* Binding entries */}
      {!isCollapsed && entries.length > 0 && (
        <div className="px-1.5 py-0.5 max-h-36 overflow-y-auto [scrollbar-width:thin]">
          {entryStates.map(({ entry, matchesMode, matchesSearch }, i) => (
            <BindingEntryRow
              key={entry.binding.id ?? i}
              entry={entry}
              dimmed={!matchesMode || !matchesSearch}
              highlighted={searchQuery.length > 0 && matchesSearch && matchesMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
