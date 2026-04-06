'use client';

import type { ResolvedBinding, MacroStepResolved } from '@/lib/types/binding';

interface MacroChainVizProps {
  binding: ResolvedBinding;
  mode: 'compact' | 'expanded';
  showRawKeys?: boolean;
}

export function MacroChainViz({ binding, mode, showRawKeys = false }: MacroChainVizProps) {
  if (mode === 'compact' || binding.macro.isSimple) {
    return <CompactChain binding={binding} showRawKeys={showRawKeys} />;
  }
  return <ExpandedChain binding={binding} showRawKeys={showRawKeys} />;
}

function CompactChain({ binding, showRawKeys }: { binding: ResolvedBinding; showRawKeys: boolean }) {
  const keyLabel = binding.macro.keyboardKeysOutput.length > 0
    ? binding.macro.keyboardKeysOutput.join(' + ')
    : binding.macro.gamepadButtonsOutput.join(' + ');

  const actionLabel = binding.actions.length > 0
    ? binding.actions.map(a => a.displayName).join(' → ')
    : null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <ChainNode type="button" label={binding.button} />

      {keyLabel && (
        <>
          <ChainArrow />
          <ChainNode
            type={binding.macro.gamepadButtonsOutput.length > 0 ? 'gamepad' : 'key'}
            label={keyLabel}
            subtitle={showRawKeys ? binding.macro.steps.find(s => s.dikCode)?.dikCode : undefined}
          />
        </>
      )}

      <ChainArrow />

      {actionLabel ? (
        <ChainNode type="action" label={actionLabel} />
      ) : (
        <ChainNode type="unresolved" label={keyLabel || '?'} />
      )}
    </div>
  );
}

function ExpandedChain({ binding, showRawKeys }: { binding: ResolvedBinding; showRawKeys: boolean }) {
  const actionSteps = binding.macro.steps.filter(
    s => s.type !== 'rumble' && s.action !== 'up'
  );

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <ChainNode type="button" label={binding.button} />
        <ChainArrow />
        <span className="text-xs text-zinc-400">
          {actionSteps.length} step{actionSteps.length !== 1 ? 's' : ''}
          {binding.macro.totalDurationMs > 0 && ` · ${binding.macro.totalDurationMs}ms`}
        </span>
      </div>

      <div className="ml-4 border-l border-zinc-700 pl-3 space-y-1">
        {actionSteps.map((step, i) => (
          <StepRow key={i} step={step} index={i} showRawKeys={showRawKeys} />
        ))}
      </div>
    </div>
  );
}

function StepRow({ step, index, showRawKeys }: { step: MacroStepResolved; index: number; showRawKeys: boolean }) {
  if (step.type === 'pause') {
    return (
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span className="w-5 text-right text-zinc-600">{index + 1}.</span>
        <span>⏸ {step.durationMs}ms</span>
      </div>
    );
  }

  const keyLabel = step.type === 'keyboard'
    ? step.key ?? '?'
    : step.type === 'gamepad'
      ? step.gamepadButton ?? '?'
      : step.type;

  const isGamepad = step.type === 'gamepad';
  const resolved = step.resolvedAction;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-5 text-right text-zinc-600">{index + 1}.</span>
      <ChainNode
        type={isGamepad ? 'gamepad' : 'key'}
        label={keyLabel}
        subtitle={showRawKeys ? step.dikCode : undefined}
      />
      <ChainArrow />
      {resolved ? (
        <ChainNode type="action" label={resolved.displayName} />
      ) : (
        <ChainNode type="unresolved" label="?" />
      )}
    </div>
  );
}

// --- Primitives ---

type NodeType = 'button' | 'key' | 'gamepad' | 'action' | 'unresolved' | 'modifier';

const NODE_STYLES: Record<NodeType, string> = {
  button: 'bg-blue-900/40 text-blue-300',
  key: 'bg-zinc-700 text-zinc-200 font-mono',
  gamepad: 'bg-green-900/40 text-green-300',
  action: 'bg-emerald-900/40 text-emerald-300',
  unresolved: 'bg-amber-900/40 text-amber-300',
  modifier: 'bg-amber-900/40 text-amber-300',
};

function ChainNode({ type, label, subtitle }: { type: NodeType; label: string; subtitle?: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${NODE_STYLES[type]}`}
      title={subtitle}
    >
      {type === 'gamepad' && <span className="mr-1 opacity-60">🎮</span>}
      {type === 'unresolved' && <span className="mr-1">❓</span>}
      {label}
    </span>
  );
}

function ChainArrow() {
  return <span className="text-zinc-500 text-sm">→</span>;
}
