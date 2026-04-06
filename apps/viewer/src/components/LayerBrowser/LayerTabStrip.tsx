'use client';

import type { ShiftLayer } from '@/lib/types/binding';

interface LayerTabStripProps {
  layers: ShiftLayer[];
  selectedLayerId: number;
  onSelectLayer: (id: number) => void;
  bindingCounts: Map<number, number>;
}

const TAB_COLORS: Record<string, { active: string; inactive: string }> = {
  'Main': { active: 'bg-blue-600 text-white', inactive: 'text-blue-300 hover:bg-blue-900/30' },
  'LB': { active: 'bg-emerald-600 text-white', inactive: 'text-emerald-300 hover:bg-emerald-900/30' },
  'Y': { active: 'bg-amber-600 text-white', inactive: 'text-amber-300 hover:bg-amber-900/30' },
  'Menu': { active: 'bg-purple-600 text-white', inactive: 'text-purple-300 hover:bg-purple-900/30' },
  'View': { active: 'bg-red-600 text-white', inactive: 'text-red-300 hover:bg-red-900/30' },
  'Start': { active: 'bg-pink-600 text-white', inactive: 'text-pink-300 hover:bg-pink-900/30' },
  'LS': { active: 'bg-cyan-600 text-white', inactive: 'text-cyan-300 hover:bg-cyan-900/30' },
  'RS': { active: 'bg-teal-600 text-white', inactive: 'text-teal-300 hover:bg-teal-900/30' },
  'RB': { active: 'bg-lime-600 text-white', inactive: 'text-lime-300 hover:bg-lime-900/30' },
};

const DEFAULT_TAB = { active: 'bg-zinc-600 text-white', inactive: 'text-zinc-300 hover:bg-zinc-700' };

function getTabColor(layer: ShiftLayer) {
  if (layer.parentLayerId !== undefined) return DEFAULT_TAB;
  return TAB_COLORS[layer.name] ?? DEFAULT_TAB;
}

export function LayerTabStrip({ layers, selectedLayerId, onSelectLayer, bindingCounts }: LayerTabStripProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {layers.map((layer) => {
        const isActive = layer.id === selectedLayerId;
        const colors = getTabColor(layer);
        const count = bindingCounts.get(layer.id) ?? 0;

        return (
          <button
            key={layer.id}
            onClick={() => onSelectLayer(layer.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              isActive ? colors.active : colors.inactive
            }`}
            title={layer.triggerButton ? `Hold ${layer.triggerButton}` : 'Main layer (no trigger)'}
          >
            {layer.name}
            {count > 0 && (
              <span className={`ml-1.5 text-xs ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
