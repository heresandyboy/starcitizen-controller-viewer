'use client';

import { useState } from 'react';
import type { GameActionState } from '@/lib/types/unified';
import { GameActionUploader, GameActionBrowser } from '@/components';

export default function Home() {
  const [state, setState] = useState<GameActionState>({
    loaded: false,
    actions: [],
    availableCategories: [],
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            Star Citizen Controller Viewer
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            View and search your Star Citizen keybindings
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!state.loaded ? (
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4 text-center">
              Load Your Config Files
            </h2>
            <GameActionUploader onStateLoaded={setState} />
          </div>
        ) : (
          <GameActionBrowser state={state} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Drop your Star Citizen XML to view bindings. Optionally add reWASD config for controller overlay.
        </div>
      </footer>
    </div>
  );
}
