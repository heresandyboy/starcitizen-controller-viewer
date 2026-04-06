'use client';

import type { ShiftLayer } from '@/lib/types/binding';

interface LayerBadgeProps {
  layer: ShiftLayer;
  size?: 'sm' | 'md';
  showTrigger?: boolean;
}

const LAYER_COLORS: Record<string, string> = {
  'Main': 'bg-blue-900/40 text-blue-300',
  'LB': 'bg-emerald-900/40 text-emerald-300',
  'Y': 'bg-amber-900/40 text-amber-300',
  'Menu': 'bg-purple-900/40 text-purple-300',
  'View': 'bg-red-900/40 text-red-300',
  'Start': 'bg-pink-900/40 text-pink-300',
  'LS': 'bg-cyan-900/40 text-cyan-300',
  'RS': 'bg-teal-900/40 text-teal-300',
  'RB': 'bg-lime-900/40 text-lime-300',
};

const SUB_LAYER_COLOR = 'bg-zinc-700 text-zinc-300';

function getLayerColor(layer: ShiftLayer): string {
  if (layer.parentLayerId !== undefined) return SUB_LAYER_COLOR;
  return LAYER_COLORS[layer.name] ?? 'bg-zinc-700 text-zinc-300';
}

export function LayerBadge({ layer, size = 'sm', showTrigger = false }: LayerBadgeProps) {
  const sizeClasses = size === 'sm'
    ? 'text-xs px-1.5 py-0.5'
    : 'text-sm px-2 py-1';

  const label = showTrigger && layer.triggerButton
    ? `${layer.triggerButton} · ${layer.name}`
    : layer.name;

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${getLayerColor(layer)} ${sizeClasses}`}
      title={layer.triggerButton ? `Hold ${layer.triggerButton}` : 'Main layer'}
    >
      {label}
    </span>
  );
}
