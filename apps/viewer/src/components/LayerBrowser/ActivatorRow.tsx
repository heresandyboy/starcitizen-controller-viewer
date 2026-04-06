'use client';

import { useState } from 'react';
import type { ResolvedBinding, ActivatorType, GameplayMode } from '@/lib/types/binding';
import { ActivatorBadge, MacroChainViz, GameplayModeBadge } from '@/components/shared';

interface ActivatorRowProps {
  binding: ResolvedBinding | undefined;
  activatorType: ActivatorType;
  showRawKeys: boolean;
  modeFilter?: GameplayMode | 'All';
}

const ACTIVATOR_LABELS: Record<ActivatorType, string> = {
  single: 'Tap',
  double: 'Double',
  long: 'Long',
  start: 'Press',
  release: 'Release',
};

export function ActivatorRow({ binding, activatorType, showRawKeys, modeFilter }: ActivatorRowProps) {
  const [expanded, setExpanded] = useState(false);

  // Empty slot
  if (!binding) {
    return (
      <div className="flex items-center gap-3 py-1.5 px-2 text-xs text-zinc-600">
        <span className="w-16 text-zinc-500">{ACTIVATOR_LABELS[activatorType]}</span>
        <span className="text-zinc-600">—</span>
      </div>
    );
  }

  // Filter actions by mode
  const filteredActions = modeFilter && modeFilter !== 'All'
    ? binding.actions.filter(a => a.gameplayMode === modeFilter)
    : binding.actions;

  // Hide row if no actions match the selected mode
  if (filteredActions.length === 0) return null;

  const isMultiAction = filteredActions.length > 1;
  const isUnresolved = binding.source === 'rewasd-unresolved';
  const isGamepad = binding.source === 'rewasd+xml-gamepad';
  const hasExpandableSteps = !binding.macro.isSimple && binding.macro.steps.length > 1;

  // Source color indicator
  const sourceColor = isUnresolved
    ? 'border-l-amber-500'
    : isGamepad
      ? 'border-l-purple-500'
      : isMultiAction
        ? 'border-l-blue-500'
        : 'border-l-emerald-500';

  // Gameplay modes for filtered actions
  const modes = [...new Set(filteredActions.map(a => a.gameplayMode))];

  return (
    <div className={`border-l-2 ${sourceColor} pl-2`}>
      <div
        className={`flex items-center gap-3 py-1.5 px-2 rounded-r ${
          hasExpandableSteps ? 'cursor-pointer hover:bg-zinc-800/50' : ''
        }`}
        onClick={hasExpandableSteps ? () => setExpanded(!expanded) : undefined}
      >
        {/* Activator type */}
        <div className="w-16 shrink-0">
          <ActivatorBadge type={activatorType} mode={binding.activator.mode} size="sm" />
          {/* Show label if ActivatorBadge returns null (single/onetime) */}
          {activatorType === 'single' && (!binding.activator.mode || binding.activator.mode === 'onetime') && (
            <span className="text-xs text-zinc-500">{ACTIVATOR_LABELS[activatorType]}</span>
          )}
        </div>

        {/* Macro chain (compact) */}
        <div className="flex-1 min-w-0">
          <MacroChainViz binding={binding} mode="compact" showRawKeys={showRawKeys} modeFilter={modeFilter} />
        </div>

        {/* Gameplay mode badges */}
        <div className="flex items-center gap-1 shrink-0">
          {modes.map(mode => (
            <GameplayModeBadge key={mode} mode={mode} size="sm" />
          ))}
        </div>

        {/* Expand indicator for multi-step macros */}
        {hasExpandableSteps && (
          <span className="text-zinc-500 text-xs shrink-0">
            {expanded ? '▾' : '▸'} {binding.macro.steps.filter(s => s.type !== 'rumble' && s.action !== 'up').length} steps
          </span>
        )}
      </div>

      {/* Expanded macro steps */}
      {expanded && hasExpandableSteps && (
        <div className="ml-18 py-2 px-2">
          <MacroChainViz binding={binding} mode="expanded" showRawKeys={showRawKeys} modeFilter={modeFilter} />
        </div>
      )}
    </div>
  );
}
