'use client';

import React, { useCallback } from 'react';
import type { InputType } from '@/lib/types/filters';
import { ALL_INPUT_TYPES, INPUT_TYPE_LABELS } from '@/lib/types/filters';

interface InputTypeTogglesProps {
  selected: Set<InputType>;
  onToggle: (type: InputType) => void;
  onSetAll: (enabled: boolean) => void;
}

const INPUT_TYPE_COLORS: Record<InputType, { active: string; }> = {
  keyboard: { active: 'bg-kbd-subtle text-kbd border-kbd/30' },
  mouse: { active: 'bg-mouse-subtle text-mouse border-mouse/30' },
  gamepad: { active: 'bg-gamepad-subtle text-gamepad border-gamepad/30' },
  joystick: { active: 'bg-joystick-subtle text-joystick border-joystick/30' },
};

export const InputTypeToggles = React.memo(function InputTypeToggles({
  selected,
  onToggle,
  onSetAll,
}: InputTypeTogglesProps) {
  const allSelected = selected.size === ALL_INPUT_TYPES.length;

  const handleAllClick = useCallback(() => {
    onSetAll(!allSelected);
  }, [onSetAll, allSelected]);

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={handleAllClick}
        className={`rounded-md border px-3 py-1.5 font-body text-sm font-medium transition-colors ${
          allSelected
            ? 'border-border-accent bg-primary-subtle text-primary-light'
            : 'border-border bg-surface text-text-muted'
        }`}
      >
        All
      </button>

      {ALL_INPUT_TYPES.map((type) => {
        const isActive = selected.has(type);
        const colors = INPUT_TYPE_COLORS[type];

        return (
          <button
            key={type}
            type="button"
            onClick={() => onToggle(type)}
            className={`rounded-md border px-3 py-1.5 font-body text-sm font-medium transition-colors ${
              isActive
                ? colors.active
                : 'border-border bg-surface text-text-muted'
            }`}
          >
            {INPUT_TYPE_LABELS[type]}
          </button>
        );
      })}
    </div>
  );
});
