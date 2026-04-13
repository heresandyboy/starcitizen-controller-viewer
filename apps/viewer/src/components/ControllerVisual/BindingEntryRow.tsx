'use client';

import { useState } from 'react';
import type { BindingEntry } from './useControllerVisualData';
import { ACTIVATOR_LABELS, ACTIVATOR_MODE_LABELS } from './useControllerVisualData';
import { LayerBadge } from '@/components/shared/LayerBadge';
import type { ResolvedAction, MacroSequence } from '@/lib/types/binding';

interface BindingEntryRowProps {
  entry: BindingEntry;
  /** Mode-filtered actions to display (subset of entry.actions). */
  filteredActions?: ResolvedAction[];
  /** Highlight this row (search match) */
  highlighted?: boolean;
}

/**
 * Compact single-line binding display with click-to-expand.
 *
 * Collapsed: [LayerBadge] Action Name (+N) (activator) [mode badges]
 * Expanded:  Shows all actions, each with its own mode badge.
 */
export function BindingEntryRow({ entry, filteredActions, highlighted }: BindingEntryRowProps) {
  const { layer, activatorType, activatorMode } = entry;
  // Use filtered actions if provided (mode filtering), otherwise all actions
  const actions = filteredActions ?? entry.actions;
  const isMainLayer = layer.isDefault;
  const [expanded, setExpanded] = useState(false);

  // Activator inline text
  const activatorText = ACTIVATOR_LABELS[activatorType] || '';
  const modeText = ACTIVATOR_MODE_LABELS[activatorMode] || '';
  const activatorDisplay = [activatorText, modeText].filter(Boolean).join(' ');

  // Description fallback chain: custom > reWASD > SC action display name
  const customDesc = entry.binding.customDescription;
  const rewasdDesc = entry.binding.description;
  const primaryAction = actions[0];
  const actionName = customDesc
    || rewasdDesc
    || (primaryAction ? primaryAction.displayName || primaryAction.name : 'Unresolved');

  // Collect all unique gameplay modes (excluding Unknown)
  const uniqueModes = [...new Set(
    actions.map(a => a.gameplayMode).filter(m => m && m !== 'Unknown')
  )];
  const MAX_MODE_BADGES = 3;
  const visibleModes = uniqueModes.slice(0, MAX_MODE_BADGES);
  const extraModes = uniqueModes.length - MAX_MODE_BADGES;

  // Show extra action count only when we don't have a human description
  const hasHumanDesc = !!(customDesc || rewasdDesc);
  const extraCount = hasHumanDesc ? 0 : Math.max(0, actions.length - 1);
  const canExpand = actions.length > 1;

  // Show repeat indicator for turbo/loop macros
  const repeatCount = primaryAction?.repeatCount;
  const isTurbo = repeatCount !== undefined && repeatCount > 1;

  const baseClasses = `
    leading-tight min-w-0
    ${highlighted ? 'text-amber-200' : 'text-zinc-300'}
  `;

  return (
    <div className={baseClasses}>
      {/* Collapsed row — always visible */}
      <div
        className={`flex items-center gap-1 py-px ${canExpand ? 'cursor-pointer hover:text-zinc-100' : ''}`}
        onClick={canExpand ? () => setExpanded(!expanded) : undefined}
        title={`${actionName}${extraCount > 0 ? ` (+${extraCount} more actions)` : ''}${activatorDisplay ? ` [${activatorDisplay}]` : ''}${uniqueModes.length > 0 ? ` — ${uniqueModes.map(m => MODE_DISPLAY[m]?.label ?? m).join(', ')}` : ''}`}
      >
        {/* Layer badge (omit for Main layer) */}
        {!isMainLayer && (
          <LayerBadge layer={layer} size="sm" />
        )}

        {/* Expand indicator */}
        {canExpand && (
          <span className="text-[8px] text-zinc-500 shrink-0 w-2">
            {expanded ? '▼' : '▶'}
          </span>
        )}

        {/* Action name */}
        <span className="truncate text-[10px] flex-1 min-w-0">
          {actionName}
          {isTurbo && (
            <span className="text-amber-600 ml-0.5">×{repeatCount}</span>
          )}
          {!expanded && extraCount > 0 && (
            <span className="text-zinc-500 ml-0.5">+{extraCount}</span>
          )}
        </span>

        {/* Activator type (if not single tap) */}
        {activatorDisplay && (
          <span className="text-[9px] text-zinc-500 shrink-0">
            {activatorDisplay}
          </span>
        )}

        {/* Gameplay mode badges */}
        {!expanded && visibleModes.length > 0 && (
          <span className="flex items-center gap-0.5 shrink-0">
            {visibleModes.map(mode => {
              const display = MODE_DISPLAY[mode];
              const useShort = uniqueModes.length > 1;
              return (
                <span key={mode} className={`text-[9px] ${display?.color ?? 'text-zinc-500'}`}>
                  {useShort ? (display?.shortLabel ?? mode) : (display?.label ?? mode)}
                </span>
              );
            })}
            {extraModes > 0 && (
              <span className="text-[9px] text-zinc-500">+{extraModes}</span>
            )}
          </span>
        )}
      </div>

      {/* Expanded macro breakdown — actions grouped by key */}
      {expanded && (
        <MacroBreakdown actions={actions} macro={entry.binding.macro} />
      )}
    </div>
  );
}

/**
 * Star Citizen gameplay mode display names.
 * Short labels that SC players will recognize.
 */
export const MODE_DISPLAY: Record<string, { label: string; shortLabel: string; color: string }> = {
  General:   { label: 'General',        shortLabel: 'Gen',  color: 'text-zinc-400' },
  Flight:    { label: 'Flight',         shortLabel: 'Fly',  color: 'text-sky-400' },
  FPS:       { label: 'On Foot',        shortLabel: 'FPS',  color: 'text-red-400' },
  EVA:       { label: 'EVA',            shortLabel: 'EVA',  color: 'text-violet-400' },
  Vehicle:   { label: 'Ground Vehicle', shortLabel: 'Veh',  color: 'text-orange-400' },
  Mining:    { label: 'Mining',         shortLabel: 'Min',  color: 'text-yellow-400' },
  Salvage:   { label: 'Salvage',        shortLabel: 'Sal',  color: 'text-lime-400' },
  Scanning:  { label: 'Scanning',       shortLabel: 'Scn',  color: 'text-cyan-400' },
  Turret:    { label: 'Turret',         shortLabel: 'Tur',  color: 'text-rose-400' },
  Inventory: { label: 'Inventory',      shortLabel: 'Inv',  color: 'text-emerald-400' },
  Mobiglass: { label: 'mobiGlas',       shortLabel: 'mG',   color: 'text-blue-400' },
  Camera:    { label: 'Camera',         shortLabel: 'Cam',  color: 'text-indigo-400' },
  Social:    { label: 'Social',         shortLabel: 'Soc',  color: 'text-pink-400' },
  Unknown:   { label: '',               shortLabel: '',     color: 'text-zinc-500' },
};

/**
 * Format a matched input key name for display.
 * e.g., "kb1_insert" → "Insert", "gp1_shoulderl" → "LB (gamepad)"
 */
function formatInputKey(matchedInput: string): string {
  if (matchedInput.startsWith('kb1_')) {
    return matchedInput.slice(4)
      .replace(/^dik_/i, '')
      .replace(/_/g, ' ')
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  if (matchedInput.startsWith('gp1_')) {
    const btn = matchedInput.slice(4);
    const GAMEPAD_NAMES: Record<string, string> = {
      thumbl: 'LS Click', thumbr: 'RS Click',
      shoulderl: 'LB', shoulderr: 'RB',
      triggerl: 'LT', triggerr: 'RT',
      a: 'A', b: 'B', x: 'X', y: 'Y',
      dpad_up: 'DPad Up', dpad_down: 'DPad Down',
      dpad_left: 'DPad Left', dpad_right: 'DPad Right',
      back: 'View', start: 'Menu',
    };
    return GAMEPAD_NAMES[btn] ?? btn;
  }
  return matchedInput;
}

/**
 * Macro breakdown — groups actions by the key that triggered them.
 * Shows: Macro sends: Key1 + Key2
 *        ├ Key1 → Action [Mode]
 *        └ Key2 → Action [Mode]
 */
function MacroBreakdown({ actions, macro }: { actions: ResolvedAction[]; macro: MacroSequence }) {
  // Group actions by matchedInput
  const byKey = new Map<string, ResolvedAction[]>();
  for (const action of actions) {
    const key = action.matchedInput || 'unknown';
    const list = byKey.get(key) ?? [];
    list.push(action);
    byKey.set(key, list);
  }

  const keyEntries = [...byKey.entries()];
  const keysSummary = macro.keyboardKeysOutput.length > 0 || macro.gamepadButtonsOutput.length > 0
    ? [...macro.keyboardKeysOutput, ...macro.gamepadButtonsOutput].join(' + ')
    : null;

  return (
    <div className="pl-2 border-l border-zinc-700/40 ml-1 mb-0.5">
      {/* Macro keys summary */}
      {keysSummary && (
        <div className="text-[8px] text-zinc-500 py-px">
          Macro: {keysSummary}
        </div>
      )}

      {/* Per-key action groups */}
      {keyEntries.map(([inputKey, keyActions], ki) => {
        const isLast = ki === keyEntries.length - 1;
        const prefix = isLast ? '└' : '├';

        return (
          <div key={inputKey} className="py-px">
            <div className="text-[9px] text-zinc-500">
              {prefix} <span className="text-zinc-300">{formatInputKey(inputKey)}</span>
            </div>
            {keyActions.map((action, ai) => {
              const mode = MODE_DISPLAY[action.gameplayMode];
              const turbo = action.repeatCount !== undefined && action.repeatCount > 1;
              return (
                <div key={`${action.actionMap}::${action.name}::${ai}`} className="flex items-center gap-1 pl-4 py-px">
                  <span className="text-[8px] text-zinc-600 shrink-0">→</span>
                  <span className="truncate text-[9px] flex-1 min-w-0 text-zinc-400">
                    {action.displayName || action.name}
                    {turbo && (
                      <span className="text-amber-600 ml-0.5">×{action.repeatCount}</span>
                    )}
                  </span>
                  {mode && action.gameplayMode !== 'Unknown' && (
                    <span className={`text-[8px] shrink-0 ${mode.color}`}>
                      {mode.shortLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
