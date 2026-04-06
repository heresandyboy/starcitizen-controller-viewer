'use client';

import type { ActivatorType, ActivatorMode } from '@/lib/types/binding';

interface ActivatorBadgeProps {
  type: ActivatorType;
  mode?: ActivatorMode;
  size?: 'sm' | 'md';
}

const ACTIVATOR_CONFIG: Record<ActivatorType, { icon: string; label: string; color: string }> = {
  single: {
    icon: '⏎',
    label: 'Tap',
    color: 'bg-zinc-700 text-zinc-300',
  },
  double: {
    icon: '⏎⏎',
    label: 'Double',
    color: 'bg-amber-900/40 text-amber-300',
  },
  long: {
    icon: '⏳',
    label: 'Long',
    color: 'bg-orange-900/40 text-orange-300',
  },
  start: {
    icon: '↓',
    label: 'Press',
    color: 'bg-blue-900/40 text-blue-300',
  },
  release: {
    icon: '↑',
    label: 'Release',
    color: 'bg-purple-900/40 text-purple-300',
  },
};

const MODE_LABELS: Record<ActivatorMode, string> = {
  onetime: '',
  hold_until_release: 'hold',
  turbo: 'turbo',
  toggle: 'toggle',
};

export function ActivatorBadge({ type, mode, size = 'sm' }: ActivatorBadgeProps) {
  const config = ACTIVATOR_CONFIG[type] ?? ACTIVATOR_CONFIG.single;
  const modeLabel = mode ? MODE_LABELS[mode] : '';

  const sizeClasses = size === 'sm'
    ? 'text-xs px-1.5 py-0.5'
    : 'text-sm px-2 py-1';

  // Don't render a badge for the most common case (single tap, onetime)
  if (type === 'single' && (!mode || mode === 'onetime')) return null;

  const label = modeLabel
    ? `${config.icon} ${config.label} · ${modeLabel}`
    : `${config.icon} ${config.label}`;

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${config.color} ${sizeClasses}`}
      title={`Activator: ${config.label}${modeLabel ? ` (${modeLabel})` : ''}`}
    >
      {label}
    </span>
  );
}
