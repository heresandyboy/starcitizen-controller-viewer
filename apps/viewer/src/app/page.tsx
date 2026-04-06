'use client';

import { useEffect, useState } from 'react';
import type { GameActionState, GameplayMode } from '@/lib/types/unified';
import { DefaultActionBrowser, GameActionUploader } from '@/components';
import { parseXmlToGameActions, parseRewasdJson, addRewasdTriggersToActions } from '@/lib/parsers';
import { adaptGameActionsToSCDefaultActions } from '@/lib/adapters';
import { ConfigSelector } from '@/components/ConfigSelector';

const DEFAULT_XML = '/configs/layout_GCO-4-7-HOTAS.xml';
const DEFAULT_REWASD = '/configs/GCO 4.7 HOTAS.rewasd';

async function loadDefaultConfigs(): Promise<GameActionState> {
  const [xmlRes, rewasdRes] = await Promise.all([
    fetch(DEFAULT_XML),
    fetch(DEFAULT_REWASD),
  ]);

  if (!xmlRes.ok) throw new Error(`Failed to load XML: ${xmlRes.statusText}`);
  if (!rewasdRes.ok) throw new Error(`Failed to load reWASD: ${rewasdRes.statusText}`);

  const [xmlText, rewasdText] = await Promise.all([xmlRes.text(), rewasdRes.text()]);

  const xmlResult = parseXmlToGameActions(xmlText);
  const rewasdResult = parseRewasdJson(rewasdText);
  const actions = addRewasdTriggersToActions(xmlResult.actions, rewasdResult);

  const categorySet = new Set<GameplayMode>();
  for (const action of actions) categorySet.add(action.category);

  return {
    loaded: true,
    xmlFileName: 'layout_GCO-4-7-HOTAS.xml',
    rewasdFileName: 'GCO 4.7 HOTAS.rewasd',
    actions,
    availableCategories: Array.from(categorySet).sort(),
  };
}

export default function Home() {
  const [customState, setCustomState] = useState<GameActionState | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [autoLoadError, setAutoLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadDefaultConfigs()
      .then(setCustomState)
      .catch((err) => setAutoLoadError(err instanceof Error ? err.message : String(err)));
  }, []);

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
          <div className="flex items-center gap-3">
            <ConfigSelector onStateLoaded={setCustomState} />
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
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {customState ? (
          <DefaultActionBrowser
            actions={adaptGameActionsToSCDefaultActions(customState.actions)}
            title={customState.xmlFileName}
          />
        ) : showUploader ? (
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-medium text-text mb-4 text-center">
              Load Your Config Files
            </h2>
            <GameActionUploader onStateLoaded={(state) => { setCustomState(state); setShowUploader(false); }} />
          </div>
        ) : (
          <>
            {autoLoadError && (
              <div className="mb-4 p-3 rounded-lg bg-error-subtle text-error text-sm">
                Could not auto-load default configs: {autoLoadError}
              </div>
            )}
            <DefaultActionBrowser />
          </>
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
