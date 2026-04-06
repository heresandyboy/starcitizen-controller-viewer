'use client';

import { useMemo } from 'react';
import type { BindingIndex, GameplayMode } from '@/lib/types/binding';
import { useControllerState } from './useControllerState';
import { ControllerSvg } from './ControllerSvg';
import { ButtonDetailPanel } from './ButtonDetailPanel';

interface ControllerVisualProps {
  bindingIndex: BindingIndex;
}

export function ControllerVisual({ bindingIndex }: ControllerVisualProps) {
  const [state, actions] = useControllerState(bindingIndex);

  // Available modes
  const availableModes = useMemo(() => {
    const modes = new Set<GameplayMode>();
    for (const binding of bindingIndex.all) {
      for (const action of binding.actions) {
        modes.add(action.gameplayMode);
      }
    }
    return Array.from(modes).sort();
  }, [bindingIndex]);

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Active layer indicator */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Active Layer:</span>
          <span className="text-sm font-medium text-zinc-200">
            {state.activeLayer.name}
            {state.activeLayer.triggerButton && (
              <span className="text-zinc-500 ml-1">
                (hold {state.activeLayer.triggerButton})
              </span>
            )}
          </span>
          {state.activeLayerId !== 0 && (
            <button
              onClick={() => actions.setActiveLayer(0)}
              className="text-xs text-zinc-500 hover:text-zinc-300 underline"
            >
              Reset to Main
            </button>
          )}
        </div>

        {/* Mode filter */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-zinc-400">Mode:</span>
          <select
            value={state.modeFilter}
            onChange={(e) => actions.setModeFilter(e.target.value as GameplayMode | 'All')}
            className="px-3 py-1.5 text-sm rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100"
          >
            <option value="All">All Modes</option>
            {availableModes.map(mode => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Instruction */}
      <p className="text-xs text-zinc-500">
        Click a button to see its bindings. Click LB, Y, Menu, etc. to switch shift layers.
      </p>

      {/* Main layout: SVG + detail panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Controller SVG */}
        <div className="lg:col-span-3">
          <ControllerSvg state={state} actions={actions} />
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-2">
          {state.selectedButton ? (
            <ButtonDetailPanel
              button={state.selectedButton}
              bindingIndex={bindingIndex}
              modeFilter={state.modeFilter}
              onClose={() => actions.selectButton(null)}
            />
          ) : (
            <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 px-4 py-12 text-center text-zinc-500">
              <p className="text-sm">Click a button on the controller to see its bindings</p>
              <p className="text-xs mt-2 text-zinc-600">
                Buttons with bindings are brighter. Layer trigger buttons have an amber dot.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-800">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-zinc-600 border border-zinc-400 inline-block" /> Has bindings
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-zinc-700 border border-zinc-500 opacity-60 inline-block" /> No bindings
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-700 border border-blue-400 inline-block" /> Active layer trigger
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Layer trigger
        </span>
      </div>
    </div>
  );
}
