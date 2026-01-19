import type { UnifiedMapping } from '@/lib/types/unified';

interface ChainVisualizationProps {
  mapping: UnifiedMapping;
}

export function ChainVisualization({ mapping }: ChainVisualizationProps) {
  const hasModifier = !!mapping.modifier;
  const hasKeyboard = mapping.keyboardKeys && mapping.keyboardKeys.length > 0;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Controller input */}
      <div className="flex items-center gap-1">
        {hasModifier && (
          <>
            <ChainNode type="modifier" label={mapping.modifier!} />
            <span className="text-zinc-400 dark:text-zinc-500 text-sm">+</span>
          </>
        )}
        <ChainNode type="button" label={mapping.controllerButton} />
      </div>

      {/* Arrow to keyboard (if applicable) */}
      {hasKeyboard && (
        <>
          <ChainArrow label="reWASD" />
          <div className="flex items-center gap-1">
            {mapping.keyboardKeys!.map((key, i) => (
              <span key={i}>
                {i > 0 && <span className="text-zinc-400 dark:text-zinc-500 text-sm mx-1">+</span>}
                <ChainNode type="key" label={key} />
              </span>
            ))}
          </div>
        </>
      )}

      {/* Arrow to action */}
      <ChainArrow label={hasKeyboard ? 'SC' : 'direct'} />

      {/* Game action */}
      <ChainNode type="action" label={mapping.gameActionReadable} />
    </div>
  );
}

interface ChainNodeProps {
  type: 'modifier' | 'button' | 'key' | 'action';
  label: string;
}

function ChainNode({ type, label }: ChainNodeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-1 rounded text-sm font-medium';

  const typeClasses: Record<ChainNodeProps['type'], string> = {
    modifier: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    button: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    key: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200 font-mono',
    action: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  };

  return (
    <span className={`${baseClasses} ${typeClasses[type]}`}>
      {label}
    </span>
  );
}

interface ChainArrowProps {
  label: string;
}

function ChainArrow({ label }: ChainArrowProps) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-zinc-400 dark:text-zinc-500 text-lg">→</span>
      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 -mt-1">{label}</span>
    </div>
  );
}
