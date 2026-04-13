'use client';

import type { ButtonPanelData } from './useControllerVisualData';
import type { GameplayMode } from '@/lib/types/unified';
import {
  PANEL_POSITIONS,
  PANEL_WIDTH,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CONTROLLER_CENTER,
  CONTROLLER_WIDTH,
  CONTROLLER_HEIGHT,
} from './panelPositions';
import { ControllerIllustration, getButtonOrStickCanvasPosition } from './ControllerIllustration';
import { BindingPanel } from './BindingPanel';
import { useForceLayout } from './useForceLayout';

interface ControllerCanvasProps {
  panels: Map<string, ButtonPanelData>;
  modeFilter: GameplayMode | 'All';
  searchQuery: string;
  highlightedButton: string | null;
  onHoverButton: (button: string | null) => void;
}

export function ControllerCanvas({
  panels,
  modeFilter,
  searchQuery,
  highlightedButton,
  onHoverButton,
}: ControllerCanvasProps) {
  const ctrlLeft = CONTROLLER_CENTER.x - CONTROLLER_WIDTH / 2;
  const ctrlTop = CONTROLLER_CENTER.y - CONTROLLER_HEIGHT / 2;

  // Compute non-overlapping positions via d3-force simulation
  const computedPositions = useForceLayout(panels, modeFilter);

  return (
    <div
      className="relative"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      }}
    >
      {/* Leader lines SVG (above controller, below panels) */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ zIndex: 2 }}
      >
        {Array.from(panels.entries()).map(([button, panelData]) => {
          const computed = computedPositions.get(button);
          const pos = PANEL_POSITIONS[button];
          if (!computed || !pos || !panelData.hasBindings) return null;

          // Get button position on the controller
          const target = getButtonOrStickCanvasPosition(
            button, ctrlLeft, ctrlTop, CONTROLLER_WIDTH, CONTROLLER_HEIGHT
          );
          if (!target) return null;

          // Panel edge point — use computed position
          // Left-side panels: line connects from right edge; right-side panels: from left edge
          const panelCenterX = computed.x + computed.width / 2;
          const controllerCenterX = CONTROLLER_CENTER.x;
          const isLeftOfController = panelCenterX < controllerCenterX;
          const panelX = isLeftOfController ? computed.x + computed.width : computed.x;
          const panelY = computed.y + 14;

          const isHl = highlightedButton === button;

          // Bezier curve from panel edge to button
          const midX = (panelX + target.x) / 2;
          const d = `M ${panelX} ${panelY} C ${midX} ${panelY}, ${midX} ${target.y}, ${target.x} ${target.y}`;

          return (
            <g key={button}>
              <path
                d={d}
                fill="none"
                stroke={isHl ? '#fbbf24' : '#52525b'}
                strokeWidth={isHl ? 2 : 1}
                opacity={isHl ? 0.8 : 0.3}
              />
              {/* Dot at controller end */}
              <circle
                cx={target.x}
                cy={target.y}
                r={isHl ? 4 : 2.5}
                fill={isHl ? '#fbbf24' : '#71717a'}
                opacity={isHl ? 0.9 : 0.5}
              />
            </g>
          );
        })}
      </svg>

      {/* Controller illustration (centered, z-1 behind lines) */}
      <div
        className="absolute"
        style={{ left: ctrlLeft, top: ctrlTop, zIndex: 1 }}
      >
        <ControllerIllustration
          highlightedButton={highlightedButton}
          width={CONTROLLER_WIDTH}
        />
      </div>

      {/* Binding panels (z-3, above everything) — positioned by force layout */}
      {Array.from(panels.entries()).map(([button, panelData]) => {
        const computed = computedPositions.get(button);
        if (!computed) return null;
        return (
          <div key={button} style={{ zIndex: 3 }}>
            <BindingPanel
              panelData={panelData}
              computedPosition={computed}
              modeFilter={modeFilter}
              searchQuery={searchQuery}
              onHover={onHoverButton}
            />
          </div>
        );
      })}
    </div>
  );
}
