'use client';

import type { ResolvedBinding } from '@/lib/types/binding';
import { LayerBadge, MacroChainViz } from '@/components/shared';
import { PlainEnglishInstruction } from './PlainEnglishInstruction';

interface TriggerPathProps {
  binding: ResolvedBinding;
  showChain: boolean;
}

export function TriggerPath({ binding, showChain }: TriggerPathProps) {
  return (
    <div className="flex items-center gap-2 py-1 flex-wrap">
      {/* Plain English instruction — the only thing that matters */}
      <PlainEnglishInstruction binding={binding} />

      {/* Layer badge (only for non-main layers, since the instruction already says "Hold LB") */}
      {!binding.layer.isDefault && (
        <LayerBadge layer={binding.layer} size="sm" />
      )}

      {/* Optional technical chain */}
      {showChain && (
        <div className="w-full mt-1 ml-2">
          <MacroChainViz binding={binding} mode="compact" showRawKeys={false} />
        </div>
      )}
    </div>
  );
}
