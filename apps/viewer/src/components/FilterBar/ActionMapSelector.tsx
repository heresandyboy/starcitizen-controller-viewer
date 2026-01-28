'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { getGameplayMode } from '@/lib/constants/scActions';
import type { GameplayMode } from '@/lib/types/unified';

interface ActionMapSelectorProps {
  availableMaps: string[];
  selectedMaps: Set<string>;
  onToggle: (mapName: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  onSelectCategory: (category: string, maps: string[]) => void;
  onClearCategory: (maps: string[]) => void;
}

interface CategoryGroup {
  category: GameplayMode;
  maps: string[];
}

function groupByCategory(maps: string[]): CategoryGroup[] {
  const groups = new Map<GameplayMode, string[]>();

  for (const map of maps) {
    const mode = getGameplayMode(map);
    const existing = groups.get(mode);
    if (existing) {
      existing.push(map);
    } else {
      groups.set(mode, [map]);
    }
  }

  return Array.from(groups.entries()).map(([category, maps]) => ({
    category,
    maps,
  }));
}

export function ActionMapSelector({
  availableMaps,
  selectedMaps,
  onToggle,
  onSelectAll,
  onClearAll,
  onSelectCategory,
  onClearCategory,
}: ActionMapSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(
    new Set(),
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const toggleCategory = useCallback((category: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  }, []);

  const filteredMaps = useMemo(() => {
    if (!search) return availableMaps;
    const lower = search.toLowerCase();
    return availableMaps.filter((m) => m.toLowerCase().includes(lower));
  }, [availableMaps, search]);

  const groups = useMemo(() => groupByCategory(filteredMaps), [filteredMaps]);

  const buttonLabel =
    selectedMaps.size === 0
      ? 'Action Maps'
      : `${selectedMaps.size} map${selectedMaps.size !== 1 ? 's' : ''}`;

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 font-body text-sm font-medium transition-colors ${
          selectedMaps.size > 0
            ? 'border-border-accent bg-primary-subtle text-primary-light'
            : 'border-border bg-surface text-text-secondary hover:text-text'
        }`}
      >
        {buttonLabel}
        <svg
          className={`h-3.5 w-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 z-20 mt-1 w-72 overflow-hidden rounded-lg border border-border bg-surface-elevated shadow-lg">
          {/* Top controls */}
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="font-body text-xs font-medium text-text-secondary">
              Action Maps
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSelectAll}
                className="font-body text-xs text-primary-light hover:text-text"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={onClearAll}
                className="font-body text-xs text-primary-light hover:text-text"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Search input */}
          <div className="border-b border-border px-3 py-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter maps..."
              className="focus-ring w-full rounded-md border border-border bg-surface px-2 py-1 font-body text-sm text-text placeholder:text-text-muted"
            />
          </div>

          {/* Scrollable map list */}
          <div className="max-h-64 overflow-y-auto">
            {groups.map(({ category, maps }) => {
              const isCollapsed = collapsedCategories.has(category);
              const selectedInCategory = maps.filter((m) =>
                selectedMaps.has(m),
              ).length;

              return (
                <div key={category}>
                  {/* Category header */}
                  <div className="flex items-center justify-between bg-surface-dim px-3 py-1.5">
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="flex items-center gap-1 font-body text-xs font-medium text-text-secondary"
                    >
                      <svg
                        className={`h-3 w-3 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M4 6l4 4 4-4" />
                      </svg>
                      {category}
                      <span className="text-text-dim">
                        ({selectedInCategory}/{maps.length})
                      </span>
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectCategory(category, maps)}
                        className="font-body text-xs text-primary-light hover:text-text"
                      >
                        select
                      </button>
                      <button
                        type="button"
                        onClick={() => onClearCategory(maps)}
                        className="font-body text-xs text-primary-light hover:text-text"
                      >
                        clear
                      </button>
                    </div>
                  </div>

                  {/* Map items */}
                  {!isCollapsed &&
                    maps.map((mapName) => {
                      const isSelected = selectedMaps.has(mapName);
                      return (
                        <button
                          key={mapName}
                          type="button"
                          onClick={() => onToggle(mapName)}
                          className="flex w-full items-center gap-2 px-4 py-1.5 text-left transition-colors hover:bg-surface-hover"
                        >
                          {/* Checkbox indicator */}
                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary text-text'
                                : 'border-border bg-surface'
                            }`}
                          >
                            {isSelected && (
                              <svg
                                className="h-3 w-3"
                                viewBox="0 0 16 16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M3.5 8.5l3 3 6-6" />
                              </svg>
                            )}
                          </span>
                          <span className="font-body text-sm text-text">
                            {mapName}
                          </span>
                        </button>
                      );
                    })}
                </div>
              );
            })}

            {groups.length === 0 && (
              <div className="px-3 py-4 text-center font-body text-sm text-text-muted">
                No maps match &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
