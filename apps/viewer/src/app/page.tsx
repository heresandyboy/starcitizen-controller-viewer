'use client';

import { useState } from 'react';
import type { GameActionState } from '@/lib/types/unified';
import { DefaultActionBrowser, GameActionUploader, GameActionBrowser } from '@/components';

export default function Home() {
  const [customState, setCustomState] = useState<GameActionState | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Star Citizen Controller Viewer
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              View and search your Star Citizen keybindings
            </p>
          </div>
          {!customState && (
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="text-sm px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {showUploader ? 'View Defaults' : 'Load Custom Config'}
            </button>
          )}
          {customState && (
            <button
              onClick={() => setCustomState(null)}
              className="text-sm px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4 text-center">
              Load Your Config Files
            </h2>
            <GameActionUploader onStateLoaded={(state) => { setCustomState(state); setShowUploader(false); }} />
          </div>
        ) : (
          <DefaultActionBrowser />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Star Citizen default bindings. Use &ldquo;Load Custom Config&rdquo; to overlay your own XML.
        </div>
      </footer>
    </div>
  );
}
