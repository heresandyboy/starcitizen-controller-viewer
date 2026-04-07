'use client';

import { useState, useCallback } from 'react';
import type { BindingIndex } from '@/lib/types/binding';
import type { GameplayMode } from '@/lib/types/unified';
import { useControllerVisualData } from './useControllerVisualData';
import { ControllerCanvas } from './ControllerCanvas';
import { ControllerLegend } from './ControllerLegend';
import { useGamepad } from '@/hooks/useGamepad';
import type { ButtonState } from '@/hooks/useGamepad';

interface ControllerVisualProps {
  bindingIndex: BindingIndex;
}

/**
 * "Reference Poster" controller view.
 *
 * Shows ALL buttons with ALL layer bindings visible simultaneously,
 * spatially arranged around a central Xbox Elite controller illustration.
 * Scrollable canvas with mode filter and search.
 */
export function ControllerVisual({ bindingIndex }: ControllerVisualProps) {
  const data = useControllerVisualData(bindingIndex);
  const [highlightedButton, setHighlightedButton] = useState<string | null>(null);

  // Physical gamepad input → highlight the pressed button
  const handleButtonDown = useCallback((button: ButtonState) => {
    setHighlightedButton(button.name);
  }, []);

  const handleButtonUp = useCallback(() => {
    setHighlightedButton(null);
  }, []);

  useGamepad({
    onButtonDown: handleButtonDown,
    onButtonUp: handleButtonUp,
    trackAxes: false,
  });

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Mode filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="mode-filter" className="text-sm text-zinc-400">Mode:</label>
          <select
            id="mode-filter"
            value={data.modeFilter}
            onChange={(e) => data.setModeFilter(e.target.value as GameplayMode | 'All')}
            className="px-3 py-1.5 text-sm rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100"
          >
            <option value="All">All Modes</option>
            {data.modes.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <label htmlFor="poster-search" className="text-sm text-zinc-400">Search:</label>
          <input
            id="poster-search"
            type="text"
            placeholder="Filter actions..."
            value={data.searchQuery}
            onChange={(e) => data.setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-600"
          />
          {data.searchQuery && (
            <button
              onClick={() => data.setSearchQuery('')}
              className="text-xs text-zinc-500 hover:text-zinc-300"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="text-xs text-zinc-600 ml-auto">
          {bindingIndex.stats.totalBindings} bindings across {data.layers.length} layers
        </div>
      </div>

      {/* Legend */}
      <ControllerLegend layers={data.layers} />

      {/* Scrollable canvas */}
      <div
        className="overflow-auto rounded-lg border border-zinc-800 bg-zinc-950"
        style={{ maxHeight: 'calc(100vh - 280px)' }}
      >
        <ControllerCanvas
          panels={data.panels}
          modeFilter={data.modeFilter}
          searchQuery={data.searchQuery}
          highlightedButton={highlightedButton}
          onHoverButton={setHighlightedButton}
        />
      </div>
    </div>
  );
}
