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

  return (
    <div
      className="relative"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
      }}
    >
      {/* Leader lines SVG (behind everything) */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ zIndex: 1 }}
      >
        {Array.from(panels.entries()).map(([button, panelData]) => {
          const pos = PANEL_POSITIONS[button];
          if (!pos || !panelData.hasBindings) return null;

          // Get button position on the controller
          const target = getButtonOrStickCanvasPosition(
            button, ctrlLeft, ctrlTop, CONTROLLER_WIDTH, CONTROLLER_HEIGHT
          );
          if (!target) return null;

          // Panel edge point
          const panelX = pos.anchor === 'right' ? pos.x : pos.x + PANEL_WIDTH;
          const panelY = pos.y + 14;

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

      {/* Controller illustration (centered, z-2) */}
      <div
        className="absolute"
        style={{ left: ctrlLeft, top: ctrlTop, zIndex: 2 }}
      >
        <ControllerIllustration
          highlightedButton={highlightedButton}
          width={CONTROLLER_WIDTH}
        />
      </div>

      {/* Binding panels (z-3, above everything) */}
      {Array.from(panels.entries()).map(([button, panelData]) => {
        const position = PANEL_POSITIONS[button];
        if (!position) return null;
        return (
          <div key={button} style={{ zIndex: 3 }}>
            <BindingPanel
              panelData={panelData}
              position={position}
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
