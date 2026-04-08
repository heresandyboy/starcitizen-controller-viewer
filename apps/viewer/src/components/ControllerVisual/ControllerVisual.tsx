'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';
import type { BindingIndex } from '@/lib/types/binding';
import type { GameplayMode } from '@/lib/types/unified';
import { useControllerVisualData } from './useControllerVisualData';
import { ControllerCanvas } from './ControllerCanvas';
import { ControllerLegend } from './ControllerLegend';
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
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Mode filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="mode-filter" className="text-sm text-zinc-400">Mode:</label>
          <select
            id="mode-filter"
            value={data.modeFilter}
            onChange={(e) => data.setModeFilter(e.target.value as GameplayMode | 'All')}
            className="px-3 py-1.5 text-sm rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100"
          >
            <option value="All">All Modes</option>
            {data.modes.map((mode) => (
              <option key={mode} value={mode}>{mode}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <label htmlFor="poster-search" className="text-sm text-zinc-400">Search:</label>
          <input
            id="poster-search"
            type="text"
            placeholder="Filter actions..."
            value={data.searchQuery}
            onChange={(e) => data.setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-100 placeholder-zinc-600"
          />
          {data.searchQuery && (
            <button
              onClick={() => data.setSearchQuery('')}
              className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="text-xs text-zinc-600 ml-auto">
          {bindingIndex.stats.totalBindings} bindings across {data.layers.length} layers
        </div>
      </div>

      {/* Legend */}
      <ControllerLegend layers={data.layers} />

      {/* Zoomable canvas */}
      <div
        ref={containerRef}
        data-poster-container
        className="relative rounded-lg border border-zinc-800 bg-zinc-950 overflow-hidden"
        style={{ height: 'calc(100vh - 260px)' }}
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
 * Calculates and applies fit-to-viewport scale on mount and resize.
 */
function AutoFitOnMount({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const { setTransform } = useControls();

  const fitToScreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scaleX = rect.width / CANVAS_WIDTH;
    const scaleY = rect.height / CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY) * 0.95; // 5% margin
    const offsetX = (rect.width - CANVAS_WIDTH * scale) / 2;
    const offsetY = (rect.height - CANVAS_HEIGHT * scale) / 2;
    setTransform(offsetX, offsetY, scale, 0); // 0ms = instant
  }, [containerRef, setTransform]);

  useEffect(() => {
    // Fit on initial mount (small delay for layout to settle)
    const timer = setTimeout(fitToScreen, 50);

    // Re-fit on resize
    const el = containerRef.current;
    if (!el) return () => clearTimeout(timer);

    const ro = new ResizeObserver(() => fitToScreen());
    ro.observe(el);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, [containerRef, fitToScreen]);

  return null;
}

/**
 * Zoom control overlay — positioned in top-right corner of the canvas container.
 */
function ZoomControls({ containerRef }: { containerRef: React.RefObject<HTMLDivElement | null> }) {
  const { zoomIn, zoomOut, setTransform } = useControls();

  const fitToScreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const scaleX = rect.width / CANVAS_WIDTH;
    const scaleY = rect.height / CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY) * 0.95;
    const offsetX = (rect.width - CANVAS_WIDTH * scale) / 2;
    const offsetY = (rect.height - CANVAS_HEIGHT * scale) / 2;
    setTransform(offsetX, offsetY, scale, 200);
  }, [containerRef, setTransform]);

  const resetTo100 = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const offsetX = (rect.width - CANVAS_WIDTH) / 2;
    const offsetY = (rect.height - CANVAS_HEIGHT) / 2;
    setTransform(offsetX, offsetY, 1, 200);
  }, [containerRef, setTransform]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomIn(0.3); }
      if (e.key === '-') { e.preventDefault(); zoomOut(0.3); }
      if (e.key === '0') { e.preventDefault(); fitToScreen(); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [zoomIn, zoomOut, fitToScreen]);

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
