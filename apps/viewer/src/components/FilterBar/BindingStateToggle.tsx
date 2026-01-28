'use client';

import React from 'react';
import type { BindingState } from '@/lib/types/filters';
import { BINDING_STATE_LABELS } from '@/lib/types/filters';

interface BindingStateToggleProps {
  value: BindingState;
  onChange: (state: BindingState) => void;
}

const STATES: BindingState[] = ['all', 'bound', 'unbound'];

export const BindingStateToggle = React.memo(function BindingStateToggle({
  value,
  onChange,
}: BindingStateToggleProps) {
  return (
    <div className="inline-flex gap-0.5 rounded-lg bg-surface-dim p-0.5">
      {STATES.map((state) => (
        <button
          key={state}
          type="button"
          onClick={() => onChange(state)}
          className={`rounded-md px-3 py-1.5 font-body text-sm font-medium transition-colors ${
            value === state
              ? 'bg-primary text-text'
              : 'text-text-secondary hover:text-text'
          }`}
        >
          {BINDING_STATE_LABELS[state]}
        </button>
      ))}
    </div>
  );
});
