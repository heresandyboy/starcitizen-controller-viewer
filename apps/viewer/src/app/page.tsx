'use client';

import { useState } from 'react';
import type { GameActionState } from '@/lib/types/unified';
import { DefaultActionBrowser, GameActionBrowser } from '@/components';
import { ConfigSelector } from '@/components/ConfigSelector';

export default function Home() {
  const [customState, setCustomState] = useState<GameActionState | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold font-display text-text">
              Star Citizen Controller Viewer
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              View and search your Star Citizen keybindings
            </p>
          </div>
          <ConfigSelector onStateLoaded={setCustomState} />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {customState ? (
          <GameActionBrowser state={customState} />
        ) : (
          <DefaultActionBrowser />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-text-muted">
          Star Citizen default bindings. Select your config files above to view your custom layout.
        </div>
      </footer>
    </div>
  );
}
