'use client';

import { useMemo } from 'react';
import type { BindingIndex, ActivatorType, ResolvedBinding, GameplayMode } from '@/lib/types/binding';
import { LayerBadge, ActivatorBadge, GameplayModeBadge } from '@/components/shared';
import { getButtonDisplayName } from '@/lib/constants/gamepadButtons';
import { CONTEXT_GROUP_SETS } from '@/lib/constants/scContextGroups';

interface ButtonDetailPanelProps {
  button: string;
  bindingIndex: BindingIndex;
  modeFilter: GameplayMode | 'All';
  onClose: () => void;
}

const ACTIVATOR_ORDER: ActivatorType[] = ['single', 'double', 'long', 'start', 'release'];

const ACTIVATOR_LABELS: Record<ActivatorType, string> = {
  single: 'Tap',
  double: 'Double-tap',
  long: 'Hold',
  start: 'Press & hold',
  release: 'Release',
};

export function ButtonDetailPanel({ button, bindingIndex, modeFilter, onClose }: ButtonDetailPanelProps) {
  // Get all bindings for this button across all layers, filtered by mode
  const layerBindings = useMemo(() => {
    const result: { layerId: number; bindings: Map<ActivatorType, ResolvedBinding> }[] = [];

    const buttonMap = bindingIndex.byButtonLayerActivator.get(button);
    if (!buttonMap) return result;

    for (const layer of bindingIndex.layers) {
      const activatorMap = buttonMap.get(layer.id);
      if (!activatorMap || activatorMap.size === 0) continue;

      // If mode filter is active, check if any activator has actions in this mode/context
      if (modeFilter !== 'All') {
        let hasMatchingActions = false;
        const groupMaps = CONTEXT_GROUP_SETS[modeFilter] ?? null;

        for (const binding of activatorMap.values()) {
          if (groupMaps) {
            if (binding.actions.some(a => groupMaps.has(a.actionMap))) {
              hasMatchingActions = true;
              break;
            }
          } else if (binding.actions.some(a => a.gameplayMode === modeFilter)) {
            hasMatchingActions = true;
            break;
          }
        }
        if (!hasMatchingActions) continue;
      }

      result.push({ layerId: layer.id, bindings: activatorMap });
    }

    return result;
  }, [button, bindingIndex, modeFilter]);

  return (
    <div className="border border-zinc-700 rounded-lg bg-zinc-900 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-200">
          {getButtonDisplayName(button)}
          {modeFilter !== 'All' && (
            <span className="text-zinc-500 font-normal"> — {modeFilter} Mode</span>
          )}
        </h3>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 text-sm"
          aria-label="Close detail panel"
        >
          ✕
        </button>
      </div>

      {/* Layer sections */}
      <div className="divide-y divide-zinc-800/50">
        {layerBindings.map(({ layerId, bindings }) => {
          const layer = bindingIndex.layers.find(l => l.id === layerId)!;
          return (
            <div key={layerId} className="px-4 py-3">
              {/* Layer header */}
              <div className="flex items-center gap-2 mb-2">
                <LayerBadge layer={layer} size="sm" />
                {layer.triggerButton && (
                  <span className="text-xs text-zinc-500">
                    Hold {getButtonDisplayName(layer.triggerButton)}
                  </span>
                )}
              </div>

              {/* Activator rows */}
              <div className="space-y-1">
                {ACTIVATOR_ORDER.map(activatorType => {
                  const binding = bindings.get(activatorType);
                  if (!binding) return null;

                  // Filter actions by mode or context group
                  let actions = binding.actions;
                  if (modeFilter !== 'All') {
                    const maps = CONTEXT_GROUP_SETS[modeFilter];
                    if (maps) {
                      actions = binding.actions.filter(a => maps.has(a.actionMap));
                    } else {
                      actions = binding.actions.filter(a => a.gameplayMode === modeFilter);
                    }
                  }

                  // Hide row if no actions match the mode
                  if (actions.length === 0) return null;

                  // Deduplicate action names
                  const uniqueActions: string[] = [];
                  for (const a of actions) {
                    if (!uniqueActions.includes(a.displayName)) {
                      uniqueActions.push(a.displayName);
                    }
                  }

                  return (
                    <div key={activatorType} className="flex items-center gap-2 py-1 text-sm">
                      <span className="w-24 shrink-0 text-xs text-zinc-500">
                        {ACTIVATOR_LABELS[activatorType]}
                      </span>

                      <ActivatorBadge type={activatorType} mode={binding.activator.mode} size="sm" />

                      <span className="text-zinc-200 truncate flex-1">
                        {uniqueActions.join(' + ')}
                      </span>

                      {/* Only show mode badges in All mode */}
                      {modeFilter === 'All' && (
                        <div className="flex gap-1 shrink-0">
                          {[...new Set(actions.map(a => a.gameplayMode))].map(mode => (
                            <GameplayModeBadge key={mode} mode={mode} size="sm" />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {layerBindings.length === 0 && (
        <div className="px-4 py-6 text-center text-zinc-500 text-sm">
          No {modeFilter !== 'All' ? `${modeFilter} ` : ''}bindings for {getButtonDisplayName(button)}
        </div>
      )}
    </div>
  );
}
