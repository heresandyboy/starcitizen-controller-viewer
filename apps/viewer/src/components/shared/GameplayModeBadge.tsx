'use client';

import type { GameplayMode } from '@/lib/types/binding';

interface GameplayModeBadgeProps {
  mode: GameplayMode;
  size?: 'sm' | 'md';
}

const MODE_COLORS: Record<string, string> = {
  'Flight': 'bg-blue-900/40 text-blue-300',
  'On Foot': 'bg-green-900/40 text-green-300',
  'EVA': 'bg-cyan-900/40 text-cyan-300',
  'Vehicle': 'bg-amber-900/40 text-amber-300',
  'Mining': 'bg-orange-900/40 text-orange-300',
  'Salvage': 'bg-yellow-900/40 text-yellow-300',
  'Scanning': 'bg-indigo-900/40 text-indigo-300',
  'Turret': 'bg-red-900/40 text-red-300',
  'Spectator': 'bg-zinc-700 text-zinc-300',
  'General': 'bg-purple-900/40 text-purple-300',
  'Unknown': 'bg-zinc-700 text-zinc-400',
};

const DEFAULT_COLOR = 'bg-zinc-700 text-zinc-300';

export function GameplayModeBadge({ mode, size = 'sm' }: GameplayModeBadgeProps) {
  const sizeClasses = size === 'sm'
    ? 'text-xs px-1.5 py-0.5'
    : 'text-sm px-2 py-1';

  const color = MODE_COLORS[mode] ?? DEFAULT_COLOR;

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${color} ${sizeClasses}`}
      title={`Mode: ${mode}`}
    >
      {mode}
    </span>
  );
}
