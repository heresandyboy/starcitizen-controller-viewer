'use client';

import type { ResolvedBinding } from '@/lib/types/binding';
import { getButtonDisplayName } from '@/lib/constants/gamepadButtons';

interface CheatSheetRowProps {
  binding: ResolvedBinding;
  actionDisplayName: string;
}

const ACTIVATOR_SHORT: Record<string, string> = {
  single: '',
  double: '(2x)',
  long: '(hold)',
  start: '(press)',
  release: '(release)',
};

export function CheatSheetRow({ binding, actionDisplayName }: CheatSheetRowProps) {
  const layerPrefix = binding.layer.isDefault
    ? ''
    : `[${binding.layer.triggerButton ? getButtonDisplayName(binding.layer.triggerButton) : binding.layer.name}] `;

  const activatorSuffix = ACTIVATOR_SHORT[binding.activator.type] ?? '';

  const turboLabel = binding.activator.mode === 'turbo' ? ' ⟳' : '';

  return (
    <div className="flex items-center gap-2 py-1 px-2 text-sm hover:bg-zinc-800/30 rounded">
      {/* Button + activator */}
      <span className="w-48 shrink-0 text-zinc-300 font-mono text-xs">
        {layerPrefix}{getButtonDisplayName(binding.button)} {activatorSuffix}{turboLabel}
      </span>

      {/* Arrow */}
      <span className="text-zinc-600 shrink-0">→</span>

      {/* Action name */}
      <span className="text-zinc-200 truncate">
        {actionDisplayName}
      </span>
    </div>
  );
}
