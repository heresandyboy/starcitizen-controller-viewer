'use client';

import { useState, useMemo } from 'react';
import type { BindingIndex, ResolvedBinding, GameplayMode, ActivatorType } from '@/lib/types/binding';
import { CheatSheetRow } from './CheatSheetRow';
import { getSubcategory, getSubcategoryOrder } from './subcategories';

interface ModeCheatSheetProps {
  bindingIndex: BindingIndex;
}

const ACTIVATOR_PRIORITY: Record<ActivatorType, number> = {
  single: 0,
  double: 1,
  long: 2,
  start: 3,
  release: 4,
};

const BUTTON_ORDER = [
  'A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'LS', 'RS',
  'DpadUp', 'DpadDown', 'DpadLeft', 'DpadRight',
  'Menu', 'View', 'Start', 'Xbox',
  'P1', 'P2', 'P3', 'P4',
];

function buttonSortIndex(button: string): number {
  const idx = BUTTON_ORDER.indexOf(button);
  return idx !== -1 ? idx : 100;
}

interface CheatSheetEntry {
  binding: ResolvedBinding;
  actionDisplayName: string;
  subcategory: string;
}

export function ModeCheatSheet({ bindingIndex }: ModeCheatSheetProps) {
  // Available modes from the data
  const availableModes = useMemo(() => {
    const modes = new Set<GameplayMode>();
    for (const binding of bindingIndex.all) {
      for (const action of binding.actions) {
        modes.add(action.gameplayMode);
      }
    }
    return Array.from(modes).sort();
  }, [bindingIndex]);

  const [selectedMode, setSelectedMode] = useState<GameplayMode>(
    availableModes.includes('Flight') ? 'Flight' : availableModes[0] ?? 'Flight'
  );
  const [selectedLayerId, setSelectedLayerId] = useState<number | 'all'>(0);

  // Build cheat sheet entries for the selected mode
  const { entries, subcategoryNames } = useMemo(() => {
    const result: CheatSheetEntry[] = [];
    const seenBindingActions = new Set<string>(); // deduplicate

    for (const binding of bindingIndex.all) {
      // Filter by layer
      if (selectedLayerId !== 'all' && binding.layer.id !== selectedLayerId) continue;

      // For each action in this binding that belongs to the selected mode
      for (const action of binding.actions) {
        if (action.gameplayMode !== selectedMode) continue;

        // Deduplicate: same binding + same action
        const key = `${binding.id}:${action.name}`;
        if (seenBindingActions.has(key)) continue;
        seenBindingActions.add(key);

        result.push({
          binding,
          actionDisplayName: action.displayName,
          subcategory: getSubcategory(selectedMode, action.actionMap),
        });
      }
    }

    // Sort: by subcategory order, then button order, then activator
    const subOrder = getSubcategoryOrder(selectedMode);
    result.sort((a, b) => {
      const subA = subOrder.indexOf(a.subcategory);
      const subB = subOrder.indexOf(b.subcategory);
      const subIdxA = subA !== -1 ? subA : 99;
      const subIdxB = subB !== -1 ? subB : 99;
      if (subIdxA !== subIdxB) return subIdxA - subIdxB;

      const btnA = buttonSortIndex(a.binding.button);
      const btnB = buttonSortIndex(b.binding.button);
      if (btnA !== btnB) return btnA - btnB;

      return ACTIVATOR_PRIORITY[a.binding.activator.type] - ACTIVATOR_PRIORITY[b.binding.activator.type];
    });

    // Collect subcategory names in order
    const names: string[] = [];
    for (const entry of result) {
      if (!names.includes(entry.subcategory)) names.push(entry.subcategory);
    }

    return { entries: result, subcategoryNames: names };
  }, [bindingIndex, selectedMode, selectedLayerId]);

  // Group entries by subcategory
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, CheatSheetEntry[]>();
    for (const entry of entries) {
      const existing = groups.get(entry.subcategory) ?? [];
      existing.push(entry);
      groups.set(entry.subcategory, existing);
    }
    return groups;
  }, [entries]);

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex flex-wrap gap-1">
        {availableModes.map(mode => (
          <button
            key={mode}
            onClick={() => setSelectedMode(mode)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              selectedMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Layer filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400">Layer:</span>
        <select
          value={selectedLayerId}
          onChange={(e) => setSelectedLayerId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="px-3 py-1.5 text-sm rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100"
        >
          <option value="all">All Layers</option>
          {bindingIndex.layers.map(layer => (
            <option key={layer.id} value={layer.id}>{layer.name}</option>
          ))}
        </select>

        <span className="text-sm text-zinc-500 ml-auto">
          {entries.length} binding{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Cheat sheet content */}
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 overflow-hidden divide-y divide-zinc-800/50">
        {subcategoryNames.map(sub => {
          const group = groupedEntries.get(sub) ?? [];
          return (
            <div key={sub} className="py-2">
              {/* Subcategory header */}
              <div className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {sub}
              </div>

              {/* Rows */}
              <div className="px-1">
                {group.map(entry => (
                  <CheatSheetRow
                    key={`${entry.binding.id}:${entry.actionDisplayName}`}
                    binding={entry.binding}
                    actionDisplayName={entry.actionDisplayName}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <p className="text-lg">No bindings for {selectedMode} mode</p>
          <p className="text-sm mt-1">
            {selectedLayerId !== 'all'
              ? 'Try selecting "All Layers"'
              : 'No controller bindings map to actions in this mode'
            }
          </p>
        </div>
      )}
    </div>
  );
}
