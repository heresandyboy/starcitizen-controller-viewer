'use client';

import type { ShiftLayer } from '@/lib/types/binding';
import { LayerBadge } from '@/components/shared/LayerBadge';

interface ControllerLegendProps {
  layers: ShiftLayer[];
}

/** Reference legend for the poster view: layer colors, activator types, mode abbreviations */
export function ControllerLegend({ layers }: ControllerLegendProps) {
  return (
    <div className="flex flex-wrap gap-6 text-xs text-zinc-400 bg-zinc-950/80 rounded-lg px-4 py-3 border border-zinc-800/60">
      {/* Layers */}
      <div>
        <div className="text-zinc-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
          Shift Layers
        </div>
        <div className="flex flex-wrap gap-1">
          {layers.map((layer) => (
            <LayerBadge key={layer.id} layer={layer} size="sm" />
          ))}
        </div>
      </div>

      {/* Activation types */}
      <div>
        <div className="text-zinc-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
          Activation
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          <span><span className="text-zinc-300">tap</span> = single press</span>
          <span><span className="text-zinc-300">2x</span> = double tap</span>
          <span><span className="text-zinc-300">hold</span> = long press</span>
          <span><span className="text-zinc-300">press</span> = press &amp; hold</span>
          <span><span className="text-zinc-300">rel</span> = on release</span>
        </div>
      </div>

      {/* Activator modes */}
      <div>
        <div className="text-zinc-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
          Modes
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          <span><span className="text-zinc-300">[H]</span> = hold active</span>
          <span><span className="text-zinc-300">[T]</span> = turbo/repeat</span>
          <span><span className="text-zinc-300">[~]</span> = toggle</span>
        </div>
      </div>

      {/* Gameplay mode colors */}
      <div>
        <div className="text-zinc-500 font-semibold mb-1 uppercase tracking-wider text-[10px]">
          Game Modes
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          <span className="text-sky-400">Flt</span>
          <span className="text-red-400">FPS</span>
          <span className="text-violet-400">EVA</span>
          <span className="text-orange-400">Veh</span>
          <span className="text-yellow-400">Min</span>
          <span className="text-cyan-400">Scn</span>
          <span className="text-lime-400">Sal</span>
          <span className="text-rose-400">Tur</span>
          <span className="text-blue-400">MB</span>
          <span className="text-zinc-400">Gen</span>
        </div>
      </div>
    </div>
  );
}
