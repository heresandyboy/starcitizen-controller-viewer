'use client';

import { useEffect, useRef, useState } from 'react';
import type { GameActionState, GameplayMode } from '@/lib/types/unified';
import { parseXmlToGameActions, parseRewasdJson, addRewasdTriggersToActions } from '@/lib/parsers';
import type { ConfigsResponse } from '@/app/api/configs/route';

interface ConfigSelectorProps {
  onStateLoaded: (state: GameActionState | null) => void;
}

export function ConfigSelector({ onStateLoaded }: ConfigSelectorProps) {
  const [xml, setXml] = useState<string[]>([]);
  const [rewasd, setRewasd] = useState<string[]>([]);
  const [selectedXml, setSelectedXml] = useState('');
  const [selectedRewasd, setSelectedRewasd] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track the last-loaded pair to avoid redundant fetches
  const loadedRef = useRef({ xml: '', rewasd: '' });

  // Fetch available config files on mount
  useEffect(() => {
    fetch('/api/configs')
      .then((r) => r.json() as Promise<ConfigsResponse>)
      .then((data) => {
        setXml(data.xml);
        setRewasd(data.rewasd);
        setSelectedXml(data.xml[0] ?? '');
        setSelectedRewasd(data.rewasd[0] ?? '');
      })
      .catch((err) => setError(`Could not list configs: ${err.message}`));
  }, []);

  // Load whenever selection changes (and we have an XML file)
  useEffect(() => {
    if (!selectedXml) return;
    if (loadedRef.current.xml === selectedXml && loadedRef.current.rewasd === selectedRewasd) return;

    const controller = new AbortController();
    loadedRef.current = { xml: selectedXml, rewasd: selectedRewasd };

    setIsLoading(true);
    setError(null);

    const fetches: [Promise<Response>, Promise<Response> | null] = [
      fetch(`/configs/${encodeURIComponent(selectedXml)}`, { signal: controller.signal }),
      selectedRewasd
        ? fetch(`/configs/${encodeURIComponent(selectedRewasd)}`, { signal: controller.signal })
        : null,
    ];

    Promise.all(fetches.filter(Boolean) as Promise<Response>[])
      .then(async (responses) => {
        const [xmlRes, rewasdRes] = responses;
        if (!xmlRes.ok) throw new Error(`Failed to load ${selectedXml}`);

        const xmlText = await xmlRes.text();
        const xmlResult = parseXmlToGameActions(xmlText);
        let actions = xmlResult.actions;

        if (rewasdRes) {
          if (!rewasdRes.ok) throw new Error(`Failed to load ${selectedRewasd}`);
          const rewasdText = await rewasdRes.text();
          const rewasdResult = parseRewasdJson(rewasdText);
          actions = addRewasdTriggersToActions(actions, rewasdResult);
        }

        const categorySet = new Set<GameplayMode>();
        for (const action of actions) categorySet.add(action.category);

        onStateLoaded({
          loaded: true,
          xmlFileName: selectedXml,
          rewasdFileName: selectedRewasd || undefined,
          actions,
          availableCategories: Array.from(categorySet).sort(),
        });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError(err.message);
        onStateLoaded(null);
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [selectedXml, selectedRewasd, onStateLoaded]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* XML selector */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-text-muted whitespace-nowrap">Layout</label>
        <select
          value={selectedXml}
          onChange={(e) => setSelectedXml(e.target.value)}
          disabled={isLoading || xml.length === 0}
          className="text-xs px-2 py-1 rounded-md border border-border bg-surface text-text
                     hover:border-primary/40 focus:outline-none focus:border-ring
                     disabled:opacity-50 disabled:cursor-not-allowed max-w-[200px]"
        >
          {xml.length === 0 && <option value="">No XML files found</option>}
          {xml.map((name) => (
            <option key={name} value={name}>{name.replace(/^layout_/, '').replace(/\.xml$/, '')}</option>
          ))}
        </select>
      </div>

      {/* reWASD selector */}
      <div className="flex items-center gap-1.5">
        <label className="text-xs text-text-muted whitespace-nowrap">reWASD</label>
        <select
          value={selectedRewasd}
          onChange={(e) => setSelectedRewasd(e.target.value)}
          disabled={isLoading || rewasd.length === 0}
          className="text-xs px-2 py-1 rounded-md border border-border bg-surface text-text
                     hover:border-primary/40 focus:outline-none focus:border-ring
                     disabled:opacity-50 disabled:cursor-not-allowed max-w-[200px]"
        >
          <option value="">(none)</option>
          {rewasd.map((name) => (
            <option key={name} value={name}>{name.replace(/\.rewasd$/, '')}</option>
          ))}
        </select>
      </div>

      {/* Status */}
      {isLoading && (
        <span className="text-xs text-text-muted animate-pulse">Loading…</span>
      )}
      {error && (
        <span className="text-xs text-error" title={error}>Load failed</span>
      )}
    </div>
  );
}
