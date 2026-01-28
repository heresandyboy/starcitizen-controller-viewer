'use client';

import React from 'react';
import type { ViewMode } from '@/lib/types/filters';
import { VIEW_MODE_LABELS } from '@/lib/types/filters';

interface ViewSwitcherProps {
  value: ViewMode;
  onChange: (view: ViewMode) => void;
}

const VIEW_ICONS: Record<ViewMode, React.ReactNode> = {
  table: (
    <svg
      className="h-4 w-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Grid / table icon */}
      <rect x="2" y="2" width="5" height="5" rx="0.5" />
      <rect x="9" y="2" width="5" height="5" rx="0.5" />
      <rect x="2" y="9" width="5" height="5" rx="0.5" />
      <rect x="9" y="9" width="5" height="5" rx="0.5" />
    </svg>
  ),
  card: (
    <svg
      className="h-4 w-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Cards icon - stacked rectangles */}
      <rect x="1" y="3" width="6" height="10" rx="1" />
      <rect x="9" y="3" width="6" height="10" rx="1" />
    </svg>
  ),
  controller: (
    <svg
      className="h-4 w-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Gamepad icon */}
      <path d="M2.5 5.5a2 2 0 012-2h7a2 2 0 012 2v3a4 4 0 01-4 4h-3a4 4 0 01-4-4v-3z" />
      <circle cx="5.5" cy="7" r="0.75" fill="currentColor" />
      <circle cx="10.5" cy="7" r="0.75" fill="currentColor" />
    </svg>
  ),
};

const VIEW_MODES: ViewMode[] = ['table', 'card', 'controller'];

export const ViewSwitcher = React.memo(function ViewSwitcher({
  value,
  onChange,
}: ViewSwitcherProps) {
  return (
    <div className="inline-flex gap-0.5 rounded-lg bg-surface-dim p-0.5">
      {VIEW_MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          title={VIEW_MODE_LABELS[mode]}
          className={`rounded-md p-1.5 transition-colors ${
            value === mode
              ? 'bg-primary text-text'
              : 'text-text-muted hover:text-text-secondary'
          }`}
        >
          {VIEW_ICONS[mode]}
        </button>
      ))}
    </div>
  );
});
