'use client';

import type { ResolvedBinding, GameplayMode } from '@/lib/types/binding';
import { GameplayModeBadge } from '@/components/shared';
import { TriggerPath } from './TriggerPath';

interface ActionResultCardProps {
  actionName: string;
  displayName: string;
  actionMap: string;
  gameplayMode: GameplayMode;
  bindings: ResolvedBinding[];
  showChain: boolean;
}

export function ActionResultCard({
  actionName,
  displayName,
  actionMap,
  gameplayMode,
  bindings,
  showChain,
}: ActionResultCardProps) {
  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 overflow-hidden">
      {/* Action header */}
      <div className="px-4 py-3 border-b border-zinc-800/50 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-zinc-200 truncate">{displayName}</h3>
          <p className="text-xs text-zinc-500 mt-0.5 truncate">{actionMap}</p>
        </div>
        <GameplayModeBadge mode={gameplayMode} size="sm" />
      </div>

      {/* Trigger paths — simple list of how to trigger this action */}
      <div className="px-4 py-2 space-y-1">
        {bindings.map((binding) => (
          <TriggerPath key={binding.id} binding={binding} showChain={showChain} />
        ))}
      </div>
    </div>
  );
}
