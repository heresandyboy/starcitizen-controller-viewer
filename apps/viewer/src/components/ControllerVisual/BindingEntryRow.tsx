'use client';

import type { BindingEntry } from './useControllerVisualData';
import { ACTIVATOR_LABELS, ACTIVATOR_MODE_LABELS } from './useControllerVisualData';
import { LayerBadge } from '@/components/shared/LayerBadge';

interface BindingEntryRowProps {
  entry: BindingEntry;
  /** Dim this row (filtered out by search/mode) */
  dimmed?: boolean;
  /** Highlight this row (search match) */
  highlighted?: boolean;
}

/**
 * Compact single-line binding display.
 * Format: [LayerBadge] Action Name (activator) [mode suffix]
 *
 * - Main layer entries omit the layer badge (matching reference image convention)
 * - Single-tap activator is omitted (most common, saves space)
 * - Gameplay mode shown as small right-aligned text
 */
export function BindingEntryRow({ entry, dimmed, highlighted }: BindingEntryRowProps) {
  const { layer, activatorType, activatorMode, actions } = entry;
  const isMainLayer = layer.isDefault;

  // Activator inline text
  const activatorText = ACTIVATOR_LABELS[activatorType] || '';
  const modeText = ACTIVATOR_MODE_LABELS[activatorMode] || '';
  const activatorDisplay = [activatorText, modeText].filter(Boolean).join(' ');

  // Primary action (first, or "No action" if unresolved)
  const primaryAction = actions[0];
  const actionName = primaryAction
    ? primaryAction.displayName || primaryAction.name
    : 'No action resolved';

  const gameplayMode = primaryAction?.gameplayMode;

  // Additional actions count
  const extraCount = actions.length - 1;

  return (
    <div
      className={`
        flex items-center gap-1 py-px leading-tight min-w-0
        ${dimmed ? 'opacity-25' : ''}
        ${highlighted ? 'text-amber-200' : 'text-zinc-300'}
      `}
      title={`${actionName}${extraCount > 0 ? ` (+${extraCount} more)` : ''}${activatorDisplay ? ` [${activatorDisplay}]` : ''}`}
    >
      {/* Layer badge (omit for Main layer) */}
      {!isMainLayer && (
        <LayerBadge layer={layer} size="sm" />
      )}

      {/* Action name */}
      <span className="truncate text-[11px] flex-1 min-w-0">
        {actionName}
        {extraCount > 0 && (
          <span className="text-zinc-500 ml-0.5">+{extraCount}</span>
        )}
      </span>

      {/* Activator type (if not single tap) */}
      {activatorDisplay && (
        <span className="text-[10px] text-zinc-500 shrink-0">
          {activatorDisplay}
        </span>
      )}

      {/* Gameplay mode */}
      {gameplayMode && gameplayMode !== 'Unknown' && (
        <span className={`text-[10px] shrink-0 ${MODE_COLORS[gameplayMode] ?? 'text-zinc-500'}`}>
          {MODE_ABBREV[gameplayMode] ?? gameplayMode}
        </span>
      )}
    </div>
  );
}

/** Compact mode abbreviations matching the reference image */
const MODE_ABBREV: Record<string, string> = {
  General: 'Gen',
  Flight: 'Flt',
  FPS: 'FPS',
  EVA: 'EVA',
  Vehicle: 'Veh',
  Mining: 'Min',
  Salvage: 'Sal',
  Scanning: 'Scn',
  Turret: 'Tur',
  Inventory: 'Inv',
  Mobiglass: 'MB',
  Camera: 'Cam',
  Social: 'Soc',
  Unknown: '',
};

/** Color per gameplay mode for the inline text */
const MODE_COLORS: Record<string, string> = {
  General: 'text-zinc-400',
  Flight: 'text-sky-400',
  FPS: 'text-red-400',
  EVA: 'text-violet-400',
  Vehicle: 'text-orange-400',
  Mining: 'text-yellow-400',
  Salvage: 'text-lime-400',
  Scanning: 'text-cyan-400',
  Turret: 'text-rose-400',
  Inventory: 'text-emerald-400',
  Mobiglass: 'text-blue-400',
  Camera: 'text-indigo-400',
  Social: 'text-pink-400',
};
