'use client';

import type { ButtonPanelData } from './useControllerVisualData';
import type { GameplayMode } from '@/lib/types/unified';
import {
  PANEL_POSITIONS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CONTROLLER_CENTER,
} from './panelPositions';
import { ControllerIllustration } from './ControllerIllustration';
import { BindingPanel } from './BindingPanel';

interface ControllerCanvasProps {
  panels: Map<string, ButtonPanelData>;
  modeFilter: GameplayMode | 'All';
  searchQuery: string;
  highlightedButton: string | null;
  onHoverButton: (button: string | null) => void;
}

/**
 * The main canvas that composites:
 * 1. Controller illustration SVG (centered)
 * 2. Binding panels (absolutely positioned HTML)
 *
 * Uses CSS `contain: layout paint` for performance (avoids layout
 * thrashing from 30+ absolutely positioned children).
 */
export function ControllerCanvas({
  panels,
  modeFilter,
  searchQuery,
  highlightedButton,
  onHoverButton,
}: ControllerCanvasProps) {
  // Controller SVG size and position
  const svgWidth = 500;
  const svgLeft = CONTROLLER_CENTER.x - svgWidth / 2;
  // Scale SVG height proportionally (viewbox is 600x400 → 500x333)
  const svgHeight = Math.round(svgWidth * (400 / 600));
  const svgTop = CONTROLLER_CENTER.y - svgHeight / 2;

  return (
    <div
      className="relative"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        contain: 'layout paint',
      }}
    >
      {/* Controller illustration (centered) */}
      <div
        className="absolute"
        style={{ left: svgLeft, top: svgTop }}
      >
        <ControllerIllustration
          highlightedButton={highlightedButton}
          width={svgWidth}
        />
      </div>

      {/* Binding panels */}
      {Array.from(panels.entries()).map(([button, panelData]) => {
        const position = PANEL_POSITIONS[button];
        if (!position) return null;
        return (
          <BindingPanel
            key={button}
            panelData={panelData}
            position={position}
            modeFilter={modeFilter}
            searchQuery={searchQuery}
            onHover={onHoverButton}
          />
        );
      })}
    </div>
  );
}
