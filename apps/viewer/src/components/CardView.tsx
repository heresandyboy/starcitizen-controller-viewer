'use client';

import { memo } from 'react';
import type { SCDefaultAction } from '@/lib/types/defaultProfile';
import type { InputType } from '@/lib/types/filters';
import { localization } from '@/lib/data/sc-4.5/localization';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveLabel(key: string | null): string {
  if (!key) return '';
  const lookupKey = key.startsWith('@') ? key.slice(1) : key;
  return localization[lookupKey] ?? lookupKey;
}

function formatMapName(mapName: string): string {
  return mapName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBind(bind: string): string {
  return bind
    .split('+')
    .map((part) => part.trim())
    .join(' + ');
}

// ---------------------------------------------------------------------------
// Binding badge config
// ---------------------------------------------------------------------------

const BIND_CONFIG: Record<
  InputType,
  { prefix: string; colors: string; bindKey: keyof SCDefaultAction }
> = {
  keyboard: { prefix: 'KBD', colors: 'bg-kbd-subtle text-kbd', bindKey: 'keyboardBind' },
  mouse: { prefix: 'MSE', colors: 'bg-mouse-subtle text-mouse', bindKey: 'mouseBind' },
  gamepad: { prefix: 'GP', colors: 'bg-gamepad-subtle text-gamepad', bindKey: 'gamepadBind' },
  joystick: { prefix: 'JOY', colors: 'bg-joystick-subtle text-joystick', bindKey: 'joystickBind' },
};

// ---------------------------------------------------------------------------
// ActionCard
// ---------------------------------------------------------------------------

type ActionCardProps = {
  action: SCDefaultAction;
  inputTypes: Set<InputType>;
};

const ActionCard = memo(function ActionCard({ action, inputTypes }: ActionCardProps) {
  const label = resolveLabel(action.label);
  const description = action.description ? resolveLabel(action.description) : null;

  // Collect visible bindings
  const visibleBindings: { type: InputType; bind: string }[] = [];
  for (const type of inputTypes) {
    const bind = action[BIND_CONFIG[type].bindKey] as string | null;
    if (bind) {
      visibleBindings.push({ type, bind });
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 hover:border-border-accent hover:shadow-glow-sm transition-all space-y-3">
      {/* Header: map badge + activation mode */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-block px-2 py-0.5 rounded-md text-xs font-medium bg-primary-subtle text-primary-light">
          {formatMapName(action.mapName)}
        </span>
        {action.activationMode && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-dim text-text-muted uppercase">
            {action.activationMode}
          </span>
        )}
      </div>

      {/* Label + description */}
      <div>
        <p className="font-medium text-text">{label}</p>
        {description && (
          <p className="text-sm text-text-secondary line-clamp-2 mt-0.5">
            {description}
          </p>
        )}
      </div>

      {/* Binding badges */}
      <div className="flex flex-wrap gap-1.5">
        {visibleBindings.length > 0 ? (
          visibleBindings.map(({ type, bind }) => {
            const cfg = BIND_CONFIG[type];
            return (
              <span
                key={type}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono ${cfg.colors}`}
              >
                <span className="text-[10px] opacity-60 uppercase font-body">
                  {cfg.prefix}
                </span>
                {formatBind(bind)}
              </span>
            );
          })
        ) : (
          <span className="text-text-dim text-xs">No bindings</span>
        )}
      </div>

      {/* Action name footer */}
      <p className="font-mono text-[10px] text-text-dim">{action.actionName}</p>
    </div>
  );
});

// ---------------------------------------------------------------------------
// CardView
// ---------------------------------------------------------------------------

type CardViewProps = {
  actions: SCDefaultAction[];
  inputTypes: Set<InputType>;
};

export function CardView({ actions, inputTypes }: CardViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {actions.map((action) => (
        <ActionCard
          key={action.actionName}
          action={action}
          inputTypes={inputTypes}
        />
      ))}
    </div>
  );
}
