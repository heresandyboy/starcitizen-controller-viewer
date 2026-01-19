'use client';

import { useState, useMemo, useCallback } from 'react';
import type { UnifiedMapping, GameplayMode, ConfigState } from '@/lib/types/unified';
import { SearchBar } from './SearchBar';
import { MappingCard } from './MappingCard';

interface MappingBrowserProps {
  config: ConfigState;
}

type ViewMode = 'all' | 'by-mode' | 'by-modifier';

export function MappingBrowser({ config }: MappingBrowserProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('by-mode');
  const [selectedMode, setSelectedMode] = useState<GameplayMode | 'All'>('All');
  const [selectedModifier, setSelectedModifier] = useState<string | 'All' | 'None'>('All');
  const [searchResults, setSearchResults] = useState<UnifiedMapping[]>(config.mappings);
  const [compactView, setCompactView] = useState(false);

  // Filter mappings based on current selections
  const filteredMappings = useMemo(() => {
    let filtered = searchResults;

    if (selectedMode !== 'All') {
      filtered = filtered.filter(m => m.gameplayMode === selectedMode);
    }

    if (selectedModifier !== 'All') {
      if (selectedModifier === 'None') {
        filtered = filtered.filter(m => !m.modifier);
      } else {
        filtered = filtered.filter(m => m.modifier === selectedModifier);
      }
    }

    return filtered;
  }, [searchResults, selectedMode, selectedModifier]);

  // Group mappings by mode or modifier
  const groupedMappings = useMemo(() => {
    if (viewMode === 'all') {
      return { All: filteredMappings };
    }

    if (viewMode === 'by-mode') {
      const groups: Record<string, UnifiedMapping[]> = {};
      for (const mapping of filteredMappings) {
        const key = mapping.gameplayMode;
        if (!groups[key]) groups[key] = [];
        groups[key].push(mapping);
      }
      return groups;
    }

    // by-modifier
    const groups: Record<string, UnifiedMapping[]> = {};
    for (const mapping of filteredMappings) {
      const key = mapping.modifier ?? 'No Modifier';
      if (!groups[key]) groups[key] = [];
      groups[key].push(mapping);
    }
    return groups;
  }, [filteredMappings, viewMode]);

  const handleSearchResults = useCallback((results: UnifiedMapping[]) => {
    setSearchResults(results);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with file info */}
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-4">
          <span>reWASD: {config.rewasdFileName}</span>
          <span>XML: {config.xmlFileName}</span>
        </div>
        <span>{config.mappings.length} mappings</span>
      </div>

      {/* Search and controls */}
      <div className="space-y-4">
        <SearchBar
          mappings={config.mappings}
          onSearchResults={handleSearchResults}
          placeholder="Search by action, button, or description..."
        />

        <div className="flex flex-wrap items-center gap-4">
          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">View:</span>
            <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden">
              {(['all', 'by-mode', 'by-modifier'] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1.5 text-sm transition-colors ${
                    viewMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {mode === 'all' ? 'All' : mode === 'by-mode' ? 'By Mode' : 'By Modifier'}
                </button>
              ))}
            </div>
          </div>

          {/* Mode filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Mode:</span>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value as GameplayMode | 'All')}
              className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            >
              <option value="All">All Modes</option>
              {config.availableModes.map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </div>

          {/* Modifier filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Modifier:</span>
            <select
              value={selectedModifier}
              onChange={(e) => setSelectedModifier(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            >
              <option value="All">All</option>
              <option value="None">No Modifier</option>
              {config.availableModifiers.map((mod) => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
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
        Showing {filteredMappings.length} of {config.mappings.length} mappings
      </div>

      {/* Grouped mappings */}
      <div className="space-y-8">
        {Object.entries(groupedMappings).map(([groupName, mappings]) => (
          <div key={groupName}>
            {viewMode !== 'all' && (
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                {groupName}
                <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">
                  ({mappings.length})
                </span>
              </h2>
            )}
            <div className={compactView ? 'space-y-1' : 'grid gap-4 md:grid-cols-2'}>
              {mappings.map((mapping) => (
                <MappingCard
                  key={mapping.id}
                  mapping={mapping}
                  compact={compactView}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {filteredMappings.length === 0 && (
        <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
          <p className="text-lg">No mappings found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
