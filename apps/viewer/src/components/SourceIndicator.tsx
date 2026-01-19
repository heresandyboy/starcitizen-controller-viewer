import type { MappingSource } from '@/lib/types/unified';

interface SourceIndicatorProps {
  source: MappingSource;
  size?: 'sm' | 'md';
}

const sourceConfig: Record<MappingSource, { label: string; color: string; description: string }> = {
  'xml-gamepad': {
    label: 'Gamepad',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    description: 'Direct gamepad binding in SC',
  },
  'xml-keyboard': {
    label: 'Keyboard',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    description: 'Keyboard binding in SC',
  },
  'rewasd': {
    label: 'reWASD',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    description: 'reWASD only (no SC action)',
  },
  'rewasd+xml': {
    label: 'Chain',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    description: 'reWASD → Keyboard → SC Action',
  },
};

export function SourceIndicator({ source, size = 'sm' }: SourceIndicatorProps) {
  const config = sourceConfig[source];

  const sizeClasses = size === 'sm'
    ? 'text-xs px-1.5 py-0.5'
    : 'text-sm px-2 py-1';

  return (
    <span
      className={`inline-flex items-center rounded font-medium ${config.color} ${sizeClasses}`}
      title={config.description}
    >
      {config.label}
    </span>
  );
}
