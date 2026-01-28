'use client';

import { useState } from 'react';
import type { GameActionState } from '@/lib/types/unified';
import { DefaultActionBrowser, GameActionUploader, GameActionBrowser } from '@/components';

export default function Home() {
  const [customState, setCustomState] = useState<GameActionState | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold font-display text-text">
              Star Citizen Controller Viewer
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              View and search your Star Citizen keybindings
            </p>
          </div>
          {!customState && (
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="text-sm px-3 py-1.5 rounded-md border border-border text-text-secondary hover:text-text hover:bg-surface-hover hover:border-primary/30 transition-colors focus-ring"
            >
              {showUploader ? 'View Defaults' : 'Load Custom Config'}
            </button>
          )}
          {customState && (
            <button
              onClick={() => setCustomState(null)}
              className="text-sm px-3 py-1.5 rounded-md border border-border text-text-secondary hover:text-text hover:bg-surface-hover hover:border-primary/30 transition-colors focus-ring"
            >
              Back to Defaults
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {customState ? (
          <GameActionBrowser state={customState} />
        ) : showUploader ? (
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-medium text-text mb-4 text-center">
              Load Your Config Files
            </h2>
            <GameActionUploader onStateLoaded={(state) => { setCustomState(state); setShowUploader(false); }} />
          </div>
        ) : (
          <DefaultActionBrowser />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-text-muted">
          Star Citizen default bindings. Use &ldquo;Load Custom Config&rdquo; to overlay your own XML.
        </div>
      </footer>
    </div>
  );
}
