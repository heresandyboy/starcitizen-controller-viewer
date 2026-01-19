import type { UnifiedMapping } from '@/lib/types/unified';
import { SourceIndicator } from './SourceIndicator';
import { ChainVisualization } from './ChainVisualization';

interface MappingCardProps {
  mapping: UnifiedMapping;
  compact?: boolean;
}

export function MappingCard({ mapping, compact = false }: MappingCardProps) {
  const buttonDisplay = mapping.modifier
    ? `${mapping.modifier} + ${mapping.controllerButton}`
    : mapping.controllerButton;

  if (compact) {
    return (
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {buttonDisplay}
          </span>
          <span className="text-zinc-400 dark:text-zinc-500">→</span>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">
            {mapping.gameActionReadable}
          </span>
        </div>
        <SourceIndicator source={mapping.source} />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
            {mapping.gameActionReadable}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
            {mapping.gameAction}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SourceIndicator source={mapping.source} />
          <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
            {mapping.gameplayMode}
          </span>
        </div>
      </div>

      {/* Chain visualization */}
      <div className="mt-4">
        <ChainVisualization mapping={mapping} />
      </div>

      {/* Activation info */}
      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span>
          Activation: <span className="font-medium">{mapping.activationType}</span>
        </span>
        {mapping.activationMode !== 'onetime' && (
          <span>
            Mode: <span className="font-medium">{mapping.activationMode}</span>
          </span>
        )}
      </div>

      {/* Description if available */}
      {mapping.description && (
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400 italic">
          "{mapping.description}"
        </p>
      )}
    </div>
  );
}
