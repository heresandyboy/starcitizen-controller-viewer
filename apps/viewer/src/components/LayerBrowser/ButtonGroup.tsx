'use client';

import type { ResolvedBinding, ActivatorType, GameplayMode } from '@/lib/types/binding';
import { ActivatorRow } from './ActivatorRow';

interface ButtonGroupProps {
  button: string;
  bindings: Map<ActivatorType, ResolvedBinding>;
  compactMode: boolean;
  showRawKeys: boolean;
  modeFilter?: GameplayMode | 'All';
}

const ACTIVATOR_ORDER: ActivatorType[] = ['single', 'double', 'long', 'start', 'release'];

export function ButtonGroup({ button, bindings, compactMode, showRawKeys, modeFilter }: ButtonGroupProps) {
  const rows = compactMode
    ? ACTIVATOR_ORDER.filter(type => bindings.has(type))
    : ACTIVATOR_ORDER;

  if (rows.length === 0) return null;

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 overflow-hidden">
      {/* Button header */}
      <div className="px-3 py-2 bg-zinc-800/50 border-b border-zinc-800">
        <span className="text-sm font-medium text-zinc-200">{button}</span>
        <span className="ml-2 text-xs text-zinc-500">
          {bindings.size} binding{bindings.size !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Activator rows */}
      <div className="divide-y divide-zinc-800/50">
        {rows.map(type => (
          <ActivatorRow
            key={type}
            binding={bindings.get(type)}
            activatorType={type}
            showRawKeys={showRawKeys}
            modeFilter={modeFilter}
          />
        ))}
      </div>
    </div>
  );
}
