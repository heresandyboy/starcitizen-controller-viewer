'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { GameActionState, GameplayMode } from '@/lib/types/unified';
import type { BindingIndex } from '@/lib/types/binding';
import { DefaultActionBrowser, GameActionUploader, LayerBrowser, ActionSearch, ModeCheatSheet, ControllerVisual } from '@/components';
import {
  parseXmlToGameActions,
  parseRewasdJson,
  addRewasdTriggersToActions,
  parseStarCitizenXml,
  parseRewasdJsonV2,
  resolveBindingsV2,
  parseDefaultProfile,
} from '@/lib/parsers';
import { adaptGameActionsToSCDefaultActions } from '@/lib/adapters';
import { ConfigSelector } from '@/components/ConfigSelector';

const DEFAULT_XML = '/configs/layout_GCO-4-7-HOTAS.xml';
const DEFAULT_REWASD = '/configs/GCO 4.7 HOTAS.rewasd';
const DEFAULT_PROFILE_XML = '/configs/sc-4.7/defaultProfile.xml';

type ViewTab = 'actions' | 'layers' | 'search' | 'cheatsheet' | 'controller';

const VIEW_TAB_IDS: ViewTab[] = ['actions', 'layers', 'search', 'cheatsheet', 'controller'];

function isValidViewTab(value: string | null): value is ViewTab {
  return value !== null && VIEW_TAB_IDS.includes(value as ViewTab);
}

interface LoadedData {
  actionState: GameActionState;
  bindingIndex: BindingIndex | null;
}

async function loadDefaultConfigs(): Promise<LoadedData> {
  const [xmlRes, rewasdRes, defaultProfileRes] = await Promise.all([
    fetch(DEFAULT_XML),
    fetch(DEFAULT_REWASD),
    fetch(DEFAULT_PROFILE_XML),
  ]);

  if (!xmlRes.ok) throw new Error(`Failed to load XML: ${xmlRes.statusText}`);
  if (!rewasdRes.ok) throw new Error(`Failed to load reWASD: ${rewasdRes.statusText}`);

  const [xmlText, rewasdText] = await Promise.all([xmlRes.text(), rewasdRes.text()]);
  const defaultProfileText = defaultProfileRes.ok ? await defaultProfileRes.text() : '';

  // Parse SC defaults (fallback for keys not in custom XML)
  const scDefaults = defaultProfileText ? parseDefaultProfile(defaultProfileText) : [];

  // V1 pipeline (existing action browser)
  const xmlResult = parseXmlToGameActions(xmlText);
  const rewasdResult = parseRewasdJson(rewasdText);
  const actions = addRewasdTriggersToActions(xmlResult.actions, rewasdResult);

  const categorySet = new Set<GameplayMode>();
  for (const action of actions) categorySet.add(action.category);

  const actionState: GameActionState = {
    loaded: true,
    xmlFileName: 'layout_GCO-4-7-HOTAS.xml',
    rewasdFileName: 'GCO 4.7 HOTAS.rewasd',
    actions,
    availableCategories: Array.from(categorySet).sort(),
  };

  // V2 pipeline (layer browser + future views)
  let bindingIndex: BindingIndex | null = null;
  try {
    const xmlParsed = parseStarCitizenXml(xmlText);
    const rewasdV2 = parseRewasdJsonV2(rewasdText);
    bindingIndex = resolveBindingsV2(rewasdV2, xmlParsed, scDefaults);
  } catch (err) {
    console.error('V2 pipeline failed, Layer Browser unavailable:', err);
  }

  return { actionState, bindingIndex };
}

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [customState, setCustomState] = useState<GameActionState | null>(null);
  const [bindingIndex, setBindingIndex] = useState<BindingIndex | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [autoLoadError, setAutoLoadError] = useState<string | null>(null);

  // Initialize view from URL or default to 'actions'
  const viewParam = searchParams.get('view');
  const [activeView, setActiveViewState] = useState<ViewTab>(
    isValidViewTab(viewParam) ? viewParam : 'actions'
  );

  // Update URL when view changes
  const setActiveView = useCallback((view: ViewTab) => {
    setActiveViewState(view);
    const params = new URLSearchParams(searchParams.toString());
    if (view === 'actions') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '/', { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    loadDefaultConfigs()
      .then(({ actionState, bindingIndex: bi }) => {
        setCustomState(actionState);
        setBindingIndex(bi);
      })
      .catch((err) => setAutoLoadError(err instanceof Error ? err.message : String(err)));
  }, []);

  // Keyboard shortcuts: 1-5 switch views, Escape clears, / focuses search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture when typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      // Number keys 1-5 switch views
      if (e.key >= '1' && e.key <= '5') {
        const index = parseInt(e.key) - 1;
        const tab = VIEW_TABS[index];
        if (tab?.available) {
          e.preventDefault();
          setActiveView(tab.id);
        }
        return;
      }

      // / focuses search input
      if (e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('input[type="text"]');
        searchInput?.focus();
        return;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveView]);

  const VIEW_TABS: { id: ViewTab; label: string; available: boolean; shortcut: string }[] = [
    { id: 'actions', label: 'Actions', available: true, shortcut: '1' },
    { id: 'layers', label: 'Layer Browser', available: bindingIndex !== null, shortcut: '2' },
    { id: 'search', label: 'Action Search', available: bindingIndex !== null, shortcut: '3' },
    { id: 'cheatsheet', label: 'Cheat Sheet', available: bindingIndex !== null, shortcut: '4' },
    { id: 'controller', label: 'Controller', available: bindingIndex !== null, shortcut: '5' },
  ];

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

      {/* View switcher tabs */}
      <nav className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => tab.available && setActiveView(tab.id)}
                disabled={!tab.available}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeView === tab.id
                    ? 'border-blue-500 text-text'
                    : tab.available
                      ? 'border-transparent text-text-secondary hover:text-text hover:border-border'
                      : 'border-transparent text-text-muted cursor-not-allowed'
                }`}
                title={`${tab.label} (${tab.shortcut})`}
              >
                {tab.label}
                <span className="ml-1.5 text-xs opacity-40 hidden sm:inline">{tab.shortcut}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className={`mx-auto px-4 py-8 ${activeView === 'controller' ? 'max-w-full' : 'max-w-6xl'}`}>
        {activeView === 'actions' && (
          <>
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
          </>
        )}

        {activeView === 'layers' && bindingIndex && (
          <LayerBrowser bindingIndex={bindingIndex} />
        )}

        {activeView === 'search' && bindingIndex && (
          <ActionSearch bindingIndex={bindingIndex} />
        )}

        {activeView === 'cheatsheet' && bindingIndex && (
          <ModeCheatSheet bindingIndex={bindingIndex} />
        )}

        {activeView === 'controller' && bindingIndex && (
          <ControllerVisual bindingIndex={bindingIndex} />
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
