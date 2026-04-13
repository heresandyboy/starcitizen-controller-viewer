'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import type { BindingIndex } from '@/lib/types/binding';
import type { GameplayMode } from '@/lib/types/unified';
import { useControllerVisualData } from './useControllerVisualData';
import { SC_CONTEXT_GROUPS } from '@/lib/constants/scContextGroups';
import { ControllerCanvas } from './ControllerCanvas';
import { LayerBadge } from '@/components/shared/LayerBadge';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './panelPositions';
import { useGamepad } from '@/hooks/useGamepad';
import type { ButtonState } from '@/hooks/useGamepad';

interface ControllerVisualProps {
  bindingIndex: BindingIndex;
}

/**
 * "Reference Poster" controller view.
 *
 * Shows ALL buttons with ALL layer bindings visible simultaneously,
 * spatially arranged around a central Xbox Elite controller illustration.
 * Auto-fits to viewport with zoom/pan for detail.
 */
export function ControllerVisual({ bindingIndex }: ControllerVisualProps) {
  const data = useControllerVisualData(bindingIndex);
  const [highlightedButton, setHighlightedButton] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Physical gamepad input → highlight the pressed button
  const handleButtonDown = useCallback((button: ButtonState) => {
    setHighlightedButton(button.name);
  }, []);

  const handleButtonUp = useCallback(() => {
    setHighlightedButton(null);
  }, []);

  useGamepad({
    onButtonDown: handleButtonDown,
    onButtonUp: handleButtonUp,
    trackAxes: false,
  });

  return (
    <div className="space-y-1">
      {/* Compact toolbar — single row with all controls */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {/* Mode filter */}
        <select
          id="mode-filter"
          value={data.modeFilter}
          onChange={(e) => data.setModeFilter(e.target.value as GameplayMode | 'All')}
          className="px-2 py-1 text-xs rounded border border-zinc-700 bg-zinc-900 text-zinc-100"
          aria-label="Filter by gameplay mode"
        >
          <option value="All">All Modes</option>
          {Object.entries(SC_CONTEXT_GROUPS).map(([key, group]) => (
            <option key={key} value={key}>{group.label}</option>
          ))}
        </select>

        {/* Search */}
        <div className="flex items-center gap-1 flex-1 max-w-xs">
          <input
            id="poster-search"
            type="text"
            placeholder="Search actions..."
            value={data.searchQuery}
            onChange={(e) => data.setSearchQuery(e.target.value)}
            className="flex-1 px-2 py-1 text-xs rounded border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-600"
          />
          {data.searchQuery && (
            <button
              onClick={() => data.setSearchQuery('')}
              className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* Inline layer badges */}
        <div className="flex items-center gap-1 flex-wrap">
          {data.layers.map((layer) => (
            <LayerBadge key={layer.id} layer={layer} size="sm" />
          ))}
        </div>

        {/* Stats */}
        <div className="text-zinc-600 ml-auto whitespace-nowrap">
          {bindingIndex.stats.totalBindings} bindings · {data.layers.length} layers
        </div>
      </div>

      {/* Zoomable canvas — maximize vertical space */}
      <div
        ref={containerRef}
        data-poster-container
        className="relative rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden"
        style={{ height: 'calc(100vh - 170px)' }}
      >
        <TransformWrapper
          minScale={0.3}
          maxScale={2.5}
          initialScale={1}
          centerOnInit={false}
          limitToBounds={false}
          panning={{ velocityDisabled: true }}
          wheel={{ step: 0.04 }}
        >
          <AutoFitOnMount containerRef={containerRef} />
          <ZoomControls containerRef={containerRef} />
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
          >
            <ControllerCanvas
              panels={data.panels}
              modeFilter={data.modeFilter}
              searchQuery={data.searchQuery}
              highlightedButton={highlightedButton}
              onHoverButton={setHighlightedButton}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
}

/**
 * Calculates and applies fit-to-viewport scale on mount and resize only.
 * Uses refs to avoid re-triggering on unrelated re-renders.
 */
function AutoFitOnMount({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const { setTransform } = useControls();
  const setTransformRef = useRef(setTransform);
  const hasFittedRef = useRef(false);
  setTransformRef.current = setTransform;

  useEffect(() => {
    function fitToScreen(animate = false) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scaleX = rect.width / CANVAS_WIDTH;
      const scaleY = rect.height / CANVAS_HEIGHT;
      const scale = Math.min(scaleX, scaleY) * 0.95;
      const offsetX = (rect.width - CANVAS_WIDTH * scale) / 2;
      const offsetY = (rect.height - CANVAS_HEIGHT * scale) / 2;
      setTransformRef.current(offsetX, offsetY, scale, animate ? 200 : 0);
    }

    // Fit on initial mount only
    const timer = setTimeout(() => {
      fitToScreen(false);
      hasFittedRef.current = true;
    }, 50);

    // Re-fit on resize (only after initial fit)
    const el = containerRef.current;
    if (!el) return () => clearTimeout(timer);

    const ro = new ResizeObserver(() => {
      if (hasFittedRef.current) fitToScreen(false);
    });
    ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount — refs handle the rest

  return null;
}

/**
 * Zoom control overlay — positioned in top-right corner of the canvas container.
 */
function ZoomControls({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const { zoomIn, zoomOut, setTransform } = useControls();
  const controlsRef = useRef({ zoomIn, zoomOut, setTransform });
  controlsRef.current = { zoomIn, zoomOut, setTransform };

  const fitToScreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scaleX = rect.width / CANVAS_WIDTH;
    const scaleY = rect.height / CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY) * 0.95;
    const offsetX = (rect.width - CANVAS_WIDTH * scale) / 2;
    const offsetY = (rect.height - CANVAS_HEIGHT * scale) / 2;
    controlsRef.current.setTransform(offsetX, offsetY, scale, 200);
  }, [containerRef]);

  const resetTo100 = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offsetX = (rect.width - CANVAS_WIDTH) / 2;
    const offsetY = (rect.height - CANVAS_HEIGHT) / 2;
    controlsRef.current.setTransform(offsetX, offsetY, 1, 200);
  }, [containerRef]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '=' || e.key === '+') { e.preventDefault(); controlsRef.current.zoomIn(0.3); }
      if (e.key === '-') { e.preventDefault(); controlsRef.current.zoomOut(0.3); }
      if (e.key === '0') { e.preventDefault(); fitToScreen(); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fitToScreen]);

  return (
    <div className="absolute top-2 right-2 z-50 flex gap-1 bg-zinc-900/90 rounded-lg p-1 border border-zinc-700/60">
      <button
        onClick={() => zoomOut(0.3)}
        className="w-7 h-7 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-sm font-mono cursor-pointer"
        title="Zoom out (−)"
      >
        −
      </button>
      <button
        onClick={() => zoomIn(0.3)}
        className="w-7 h-7 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-sm font-mono cursor-pointer"
        title="Zoom in (+)"
      >
        +
      </button>
      <button
        onClick={fitToScreen}
        className="px-2 h-7 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-xs cursor-pointer"
        title="Fit to screen (0)"
      >
        Fit
      </button>
      <button
        onClick={resetTo100}
        className="px-2 h-7 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-xs cursor-pointer"
        title="100% zoom (1:1)"
      >
        1:1
      </button>
    </div>
  );
}
