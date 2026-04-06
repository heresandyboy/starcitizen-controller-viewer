'use client';

import type { ResolvedBinding } from '@/lib/types/binding';

interface PlainEnglishInstructionProps {
  binding: ResolvedBinding;
}

const ACTIVATOR_VERBS: Record<string, string> = {
  single: 'press',
  double: 'double-tap',
  long: 'hold',
  start: 'press and hold',
  release: 'release',
};

export function PlainEnglishInstruction({ binding }: PlainEnglishInstructionProps) {
  const layerPrefix = binding.layer.isDefault
    ? ''
    : `Hold ${binding.layer.triggerButton}, then `;
  const verb = ACTIVATOR_VERBS[binding.activator.type] ?? 'press';
  const instruction = `${layerPrefix}${verb} ${binding.button}`;

  return (
    <span className="text-sm text-zinc-300 font-medium">
      {instruction}
    </span>
  );
}
