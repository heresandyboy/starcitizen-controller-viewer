'use client';

import { useState, useMemo, useCallback } from 'react';
import type { BindingIndex, ActivatorType, ResolvedBinding, GameplayMode } from '@/lib/types/binding';
import { LayerTabStrip } from './LayerTabStrip';
import { ButtonGroup } from './ButtonGroup';

interface LayerBrowserProps {
  bindingIndex: BindingIndex;
}

const ACTIVATOR_ORDER: ActivatorType[] = ['single', 'double', 'long', 'start', 'release'];

export function LayerBrowser({ bindingIndex }: LayerBrowserProps) {
  const [selectedLayerId, setSelectedLayerId] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [modeFilter, setModeFilter] = useState<GameplayMode | 'All'>('All');
  const [compactMode, setCompactMode] = useState(true);
  const [showRawKeys, setShowRawKeys] = useState(false);

  const selectedLayer = bindingIndex.layers.find(l => l.id === selectedLayerId) ?? bindingIndex.layers[0];

  // Available gameplay modes across all bindings
  const availableModes = useMemo(() => {
    const modes = new Set<GameplayMode>();
    for (const binding of bindingIndex.all) {
      for (const action of binding.actions) {
        modes.add(action.gameplayMode);
      }
    }
    return Array.from(modes).sort();
  }, [bindingIndex]);

  // Binding counts per layer (for tab badges)
  const bindingCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const layer of bindingIndex.layers) {
      counts.set(layer.id, bindingIndex.byLayer.get(layer.id)?.length ?? 0);
    }
    return counts;
  }, [bindingIndex]);

  // Get bindings for selected layer, grouped by button → activator
  const buttonGroups = useMemo(() => {
    const layerBindings = bindingIndex.byLayer.get(selectedLayerId) ?? [];

    // Apply filters
    let filtered = layerBindings;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(b =>
        b.button.toLowerCase().includes(query) ||
        b.actions.some(a =>
          a.displayName.toLowerCase().includes(query) ||
          a.name.toLowerCase().includes(query) ||
          a.actionMap.toLowerCase().includes(query)
        ) ||
        b.macro.keyboardKeysOutput.some(k => k.toLowerCase().includes(query)) ||
        b.macro.gamepadButtonsOutput.some(k => k.toLowerCase().includes(query))
      );
    }

    if (modeFilter !== 'All') {
      filtered = filtered.filter(b =>
        b.actions.some(a => a.gameplayMode === modeFilter)
      );
    }

    // Group by button → activator type
    const groups = new Map<string, Map<ActivatorType, ResolvedBinding>>();
    for (const binding of filtered) {
      if (!groups.has(binding.button)) {
        groups.set(binding.button, new Map());
      }
      groups.get(binding.button)!.set(binding.activator.type, binding);
    }

    // Sort buttons: common face buttons first, then alphabetical
    const BUTTON_ORDER = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'LS', 'RS',
      'DpadUp', 'DpadDown', 'DpadLeft', 'DpadRight', 'Menu', 'View', 'Start',
      'P1', 'P2', 'P3', 'P4'];

    const sortedButtons = Array.from(groups.keys()).sort((a, b) => {
      const ai = BUTTON_ORDER.indexOf(a);
      const bi = BUTTON_ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });

    return { groups, sortedButtons, totalFiltered: filtered.length, totalLayer: layerBindings.length };
  }, [bindingIndex, selectedLayerId, searchQuery, modeFilter]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  return (
    <div className="space-y-4">
      {/* Layer tabs */}
      <LayerTabStrip
        layers={bindingIndex.layers}
        selectedLayerId={selectedLayerId}
        onSelectLayer={setSelectedLayerId}
        bindingCounts={bindingCounts}
      />

      {/* Layer info */}
      {selectedLayer && selectedLayer.triggerButton && (
        <div className="text-xs text-zinc-500">
          Activated by holding <span className="text-zinc-300 font-medium">{selectedLayer.triggerButton}</span>
          {selectedLayer.triggerType && ` (${selectedLayer.triggerType})`}
          {selectedLayer.parentLayerId !== undefined && (
            <span className="ml-2 text-zinc-600">
              · inherits from {bindingIndex.layers.find(l => l.id === selectedLayer.parentLayerId)?.name ?? 'Main'}
            </span>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search buttons, actions, keys..."
            className="w-full px-4 py-2 pl-10 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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

        {/* Compact/Full toggle */}
        <div className="flex rounded-lg border border-zinc-700 overflow-hidden">
          <button
            onClick={() => setCompactMode(true)}
            className={`px-3 py-1.5 text-sm transition-colors ${
              compactMode
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            Compact
          </button>
          <button
            onClick={() => setCompactMode(false)}
            className={`px-3 py-1.5 text-sm transition-colors ${
              !compactMode
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
            }`}
          >
            Full
          </button>
        </div>

        {/* Raw keys toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showRawKeys}
            onChange={(e) => setShowRawKeys(e.target.checked)}
            className="rounded border-zinc-700"
          />
          <span className="text-sm text-zinc-400">DIK codes</span>
        </label>
      </div>

      {/* Results count */}
      <div className="text-sm text-zinc-500">
        {buttonGroups.totalFiltered === buttonGroups.totalLayer
          ? `${buttonGroups.sortedButtons.length} buttons · ${buttonGroups.totalLayer} bindings`
          : `Showing ${buttonGroups.totalFiltered} of ${buttonGroups.totalLayer} bindings across ${buttonGroups.sortedButtons.length} buttons`
        }
      </div>

      {/* Stats bar */}
      {selectedLayerId === 0 && !searchQuery && modeFilter === 'All' && (
        <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
          <span>{bindingIndex.stats.resolvedBindings} resolved</span>
          <span>·</span>
          <span className={bindingIndex.stats.unresolvedBindings > 0 ? 'text-amber-400' : ''}>
            {bindingIndex.stats.unresolvedBindings} unresolved
          </span>
          <span>·</span>
          <span>{bindingIndex.stats.multiActionBindings} multi-action</span>
          <span>·</span>
          <span>{bindingIndex.stats.uniqueActionsTriggered} unique SC actions</span>
        </div>
      )}

      {/* Button groups */}
      <div className="space-y-3">
        {buttonGroups.sortedButtons.map(button => (
          <ButtonGroup
            key={button}
            button={button}
            bindings={buttonGroups.groups.get(button)!}
            compactMode={compactMode}
            showRawKeys={showRawKeys}
          />
        ))}
      </div>

      {/* Empty state */}
      {buttonGroups.sortedButtons.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-lg">No bindings found</p>
          <p className="text-sm mt-1">
            {searchQuery || modeFilter !== 'All'
              ? 'Try adjusting your search or filters'
              : 'This layer has no bindings configured'
            }
          </p>
        </div>
      )}
    </div>
  );
}
