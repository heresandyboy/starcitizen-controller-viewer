'use client';

import { useState } from 'react';
import type { ConfigState } from '@/lib/types/unified';
import { ConfigUploader, MappingBrowser } from '@/components';

export default function Home() {
  const [config, setConfig] = useState<ConfigState>({
    loaded: false,
    mappings: [],
    availableModes: [],
    availableModifiers: [],
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
            View and search your reWASD + Star Citizen controller mappings
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {!config.loaded ? (
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4 text-center">
              Load Your Config Files
            </h2>
            <ConfigUploader onConfigLoaded={setConfig} />
          </div>
        ) : (
          <MappingBrowser config={config} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Drop your .rewasd and Star Citizen XML files to view mappings
        </div>
      </footer>
    </div>
  );
}
