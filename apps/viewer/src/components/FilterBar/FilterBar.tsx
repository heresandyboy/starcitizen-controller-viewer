'use client';

import React from 'react';
import type { FilterState, FilterActions, FilterMeta } from '@/lib/types/filters';
import { SearchInput } from './SearchInput';
import { InputTypeToggles } from './InputTypeToggles';
import { BindingStateToggle } from './BindingStateToggle';
import { ActionMapSelector } from './ActionMapSelector';
import { FilterPills } from './FilterPills';
import { ViewSwitcher } from './ViewSwitcher';

interface FilterBarProps {
  filters: FilterState;
  actions: FilterActions;
  meta: FilterMeta;
  availableActionMaps: string[];
}

export function FilterBar({
  filters,
  actions,
  meta,
  availableActionMaps,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm">
      {/* Row 1: Main controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search - takes remaining space */}
        <div className="min-w-48 flex-1">
          <SearchInput
            value={filters.searchQuery}
            onChange={actions.setSearchQuery}
          />
        </div>

        <InputTypeToggles
          selected={filters.inputTypes}
          onToggle={actions.toggleInputType}
          onSetAll={actions.setAllInputTypes}
        />

        <BindingStateToggle
          value={filters.bindingState}
          onChange={actions.setBindingState}
        />

        <ActionMapSelector
          availableMaps={availableActionMaps}
          selectedMaps={filters.actionMaps}
          onToggle={actions.toggleActionMap}
          onSelectAll={actions.selectAllActionMaps}
          onClearAll={actions.clearAllActionMaps}
          onSelectCategory={actions.selectActionMapsByCategory}
          onClearCategory={actions.clearActionMapsByCategory}
        />

        <ViewSwitcher
          value={filters.activeView}
          onChange={actions.setActiveView}
        />
      </div>

      {/* Row 2: Active filter pills */}
      {meta.hasActiveFilters && (
        <div className="mt-2">
          <FilterPills filters={filters} actions={actions} />
        </div>
      )}
    </div>
  );
}
