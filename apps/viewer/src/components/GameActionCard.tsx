'use client';

import type { GameAction, KeyboardBinding, MouseBinding, DirectGamepadBinding, RewasdTrigger } from '@/lib/types/unified';

interface GameActionCardProps {
  action: GameAction;
  compact?: boolean;
}

export function GameActionCard({ action, compact = false }: GameActionCardProps) {
  const hasKeyboard = action.bindings.keyboard && action.bindings.keyboard.length > 0;
  const hasMouse = action.bindings.mouse && action.bindings.mouse.length > 0;
  const hasGamepad = action.bindings.gamepad && action.bindings.gamepad.length > 0;
  const hasRewasd = action.rewasdTriggers && action.rewasdTriggers.length > 0;

  if (compact) {
    return (
      <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
        <div className="flex items-center gap-3">
          <span className="font-medium text-zinc-900 dark:text-zinc-100">
            {action.displayName}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            {action.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasKeyboard && <InputTypeBadge type="keyboard" />}
          {hasMouse && <InputTypeBadge type="mouse" />}
          {hasGamepad && <InputTypeBadge type="gamepad" />}
          {hasRewasd && <InputTypeBadge type="rewasd" />}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
            {action.displayName}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-mono">
            {action.name}
          </p>
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
          {action.category}
        </span>
      </div>

      {/* Bindings */}
      <div className="mt-4 space-y-3">
        {hasKeyboard && (
          <BindingSection
            label="Keyboard"
            icon="⌨️"
            bindings={action.bindings.keyboard!.map(formatKeyboardBinding)}
          />
        )}
        {hasMouse && (
          <BindingSection
            label="Mouse"
            icon="🖱️"
            bindings={action.bindings.mouse!.map(formatMouseBinding)}
          />
        )}
        {hasGamepad && (
          <BindingSection
            label="Gamepad"
            icon="🎮"
            bindings={action.bindings.gamepad!.map(formatGamepadBinding)}
          />
        )}
      </div>

      {/* reWASD Triggers (optional overlay) */}
      {hasRewasd && (
        <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700">
          <RewasdSection triggers={action.rewasdTriggers!} />
        </div>
      )}
    </div>
  );
}

// Helper components

interface InputTypeBadgeProps {
  type: 'keyboard' | 'mouse' | 'gamepad' | 'rewasd';
}

function InputTypeBadge({ type }: InputTypeBadgeProps) {
  const config = {
    keyboard: { icon: '⌨️', label: 'KB', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    mouse: { icon: '🖱️', label: 'M', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
    gamepad: { icon: '🎮', label: 'GP', className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
    rewasd: { icon: '🔄', label: 'rW', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  };

  const { icon, label, className } = config[type];

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium ${className}`}>
      <span className="text-[10px]">{icon}</span>
      <span>{label}</span>
    </span>
  );
}

interface BindingSectionProps {
  label: string;
  icon: string;
  bindings: string[];
}

function BindingSection({ label, icon, bindings }: BindingSectionProps) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm w-20 text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
        <span>{icon}</span>
        <span>{label}</span>
      </span>
      <div className="flex flex-wrap gap-1.5">
        {bindings.map((binding, i) => (
          <span
            key={i}
            className="inline-flex items-center px-2 py-0.5 rounded text-sm font-mono bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
          >
            {binding}
          </span>
        ))}
      </div>
    </div>
  );
}

interface RewasdSectionProps {
  triggers: RewasdTrigger[];
}

function RewasdSection({ triggers }: RewasdSectionProps) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
          reWASD Triggers
        </span>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          (controller → keyboard)
        </span>
      </div>
      <div className="space-y-1.5">
        {triggers.map((trigger, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-sm"
          >
            <span className="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-medium">
              {trigger.modifier ? `${trigger.modifier} + ${trigger.controllerButton}` : trigger.controllerButton}
            </span>
            <span className="text-zinc-400 dark:text-zinc-500">→</span>
            <span className="font-mono text-zinc-600 dark:text-zinc-400">
              {trigger.outputKeys.join(' + ')}
            </span>
            {trigger.activationType !== 'single' && (
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                ({trigger.activationType})
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Formatting helpers

function formatKeyboardBinding(binding: KeyboardBinding): string {
  if (binding.modifier) {
    return `${binding.modifier} + ${binding.key}`;
  }
  return binding.key;
}

function formatMouseBinding(binding: MouseBinding): string {
  if (binding.modifier) {
    return `${binding.modifier} + ${binding.input}`;
  }
  return binding.input;
}

function formatGamepadBinding(binding: DirectGamepadBinding): string {
  let result = binding.input;
  if (binding.modifier) {
    result = `${binding.modifier} + ${result}`;
  }
  if (binding.activationMode && binding.activationMode !== 'press') {
    result += ` (${binding.activationMode})`;
  }
  return result;
}
