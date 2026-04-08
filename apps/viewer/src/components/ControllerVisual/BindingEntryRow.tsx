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

  // Use reWASD description if available, otherwise SC action display name
  const rewasdDesc = entry.binding.description;
  const primaryAction = actions[0];
  const actionName = rewasdDesc
    || (primaryAction ? primaryAction.displayName || primaryAction.name : 'Unresolved');

  const gameplayMode = primaryAction?.gameplayMode;

  // Show extra action count only when we don't have a human description
  const extraCount = rewasdDesc ? 0 : Math.max(0, actions.length - 1);

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
      <span className="truncate text-[10px] flex-1 min-w-0">
        {actionName}
        {extraCount > 0 && (
          <span className="text-zinc-500 ml-0.5">+{extraCount}</span>
        )}
      </span>

      {/* Activator type (if not single tap) */}
      {activatorDisplay && (
        <span className="text-[9px] text-zinc-500 shrink-0">
          {activatorDisplay}
        </span>
      )}

      {/* Gameplay mode */}
      {gameplayMode && gameplayMode !== 'Unknown' && (
        <span className={`text-[9px] shrink-0 ${MODE_DISPLAY[gameplayMode]?.color ?? 'text-zinc-500'}`}>
          {MODE_DISPLAY[gameplayMode]?.label ?? gameplayMode}
        </span>
      )}
    </div>
  );
}

/**
 * Star Citizen gameplay mode display names.
 * Short labels that SC players will recognize.
 * Reference image uses: FPS, TPS, EVA, MB, VT, IM, AM, SC, TB, R, M1
 */
export const MODE_DISPLAY: Record<string, { label: string; color: string }> = {
  General:   { label: 'General',        color: 'text-zinc-400' },
  Flight:    { label: 'Flight',         color: 'text-sky-400' },
  FPS:       { label: 'On Foot',        color: 'text-red-400' },
  EVA:       { label: 'EVA',            color: 'text-violet-400' },
  Vehicle:   { label: 'Ground Vehicle', color: 'text-orange-400' },
  Mining:    { label: 'Mining',         color: 'text-yellow-400' },
  Salvage:   { label: 'Salvage',        color: 'text-lime-400' },
  Scanning:  { label: 'Scanning',       color: 'text-cyan-400' },
  Turret:    { label: 'Turret',         color: 'text-rose-400' },
  Inventory: { label: 'Inventory',      color: 'text-emerald-400' },
  Mobiglass: { label: 'mobiGlas',       color: 'text-blue-400' },
  Camera:    { label: 'Camera',         color: 'text-indigo-400' },
  Social:    { label: 'Social',         color: 'text-pink-400' },
  Unknown:   { label: '',               color: 'text-zinc-500' },
};
