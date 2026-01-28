'use client';

import React, { useCallback } from 'react';
import type { FilterState, FilterActions } from '@/lib/types/filters';
import { ALL_INPUT_TYPES, INPUT_TYPE_LABELS } from '@/lib/types/filters';

interface FilterPillsProps {
  filters: FilterState;
  actions: FilterActions;
}

function Pill({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary-subtle px-2 py-0.5 font-body text-xs text-primary-light">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-primary/20"
        aria-label={`Remove ${label} filter`}
      >
        <svg
          className="h-2.5 w-2.5"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </span>
  );
}

export const FilterPills = React.memo(function FilterPills({
  filters,
  actions,
}: FilterPillsProps) {
  const pills: React.ReactNode[] = [];

  // Search pill
  const hasSearch = filters.searchQuery.length > 0;
  const clearSearch = useCallback(
    () => actions.setSearchQuery(''),
    [actions],
  );
  if (hasSearch) {
    const truncated =
      filters.searchQuery.length > 20
        ? filters.searchQuery.slice(0, 20) + '...'
        : filters.searchQuery;
    pills.push(
      <Pill key="search" label={`"${truncated}"`} onRemove={clearSearch} />,
    );
  }

  // Input types pill
  const allInputTypesSelected = filters.inputTypes.size === ALL_INPUT_TYPES.length;
  const restoreAllInputTypes = useCallback(
    () => actions.setAllInputTypes(true),
    [actions],
  );
  if (!allInputTypesSelected && filters.inputTypes.size > 0) {
    const label = Array.from(filters.inputTypes)
      .map((t) => INPUT_TYPE_LABELS[t])
      .join(', ');
    pills.push(
      <Pill key="inputTypes" label={label} onRemove={restoreAllInputTypes} />,
    );
  }

  // Action maps pill
  const hasMaps = filters.actionMaps.size > 0;
  const clearMaps = useCallback(
    () => actions.clearAllActionMaps(),
    [actions],
  );
  if (hasMaps) {
    pills.push(
      <Pill
        key="actionMaps"
        label={`${filters.actionMaps.size} map${filters.actionMaps.size !== 1 ? 's' : ''}`}
        onRemove={clearMaps}
      />,
    );
  }

  // Binding state pill
  const hasBindingFilter = filters.bindingState !== 'all';
  const clearBindingState = useCallback(
    () => actions.setBindingState('all'),
    [actions],
  );
  if (hasBindingFilter) {
    const label =
      filters.bindingState === 'bound' ? 'Bound' : 'Unbound';
    pills.push(
      <Pill key="bindingState" label={label} onRemove={clearBindingState} />,
    );
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pills}
      {pills.length > 1 && (
        <button
          type="button"
          onClick={actions.clearAllFilters}
          className="font-body text-xs text-text-muted transition-colors hover:text-text"
        >
          Clear all
        </button>
      )}
    </div>
  );
});
