'use client';

import type { ControllerState, ControllerActions } from './useControllerState';

interface ControllerSvgProps {
  state: ControllerState;
  actions: ControllerActions;
}

/** Button layout positions within the SVG viewBox (0 0 600 400) */
const BUTTON_LAYOUT: Record<string, { x: number; y: number; w: number; h: number; r?: number; label: string }> = {
  // Face buttons (right cluster)
  A:     { x: 430, y: 185, w: 30, h: 30, r: 15, label: 'A' },
  B:     { x: 462, y: 155, w: 30, h: 30, r: 15, label: 'B' },
  X:     { x: 398, y: 155, w: 30, h: 30, r: 15, label: 'X' },
  Y:     { x: 430, y: 125, w: 30, h: 30, r: 15, label: 'Y' },

  // D-Pad (left cluster)
  DpadUp:    { x: 168, y: 140, w: 24, h: 24, label: '↑' },
  DpadDown:  { x: 168, y: 196, w: 24, h: 24, label: '↓' },
  DpadLeft:  { x: 140, y: 168, w: 24, h: 24, label: '←' },
  DpadRight: { x: 196, y: 168, w: 24, h: 24, label: '→' },

  // Bumpers
  LB: { x: 110, y: 52, w: 80, h: 28, label: 'LB' },
  RB: { x: 410, y: 52, w: 80, h: 28, label: 'RB' },

  // Triggers
  LT: { x: 120, y: 18, w: 60, h: 28, label: 'LT' },
  RT: { x: 420, y: 18, w: 60, h: 28, label: 'RT' },

  // Sticks
  LS: { x: 130, y: 98, w: 40, h: 40, r: 20, label: 'LS' },
  RS: { x: 370, y: 230, w: 40, h: 40, r: 20, label: 'RS' },

  // Special buttons
  Menu: { x: 325, y: 95, w: 30, h: 20, label: 'Menu' },
  View: { x: 245, y: 95, w: 30, h: 20, label: 'View' },
  Xbox: { x: 280, y: 65, w: 40, h: 25, r: 12, label: 'Xbox' },

  // Elite paddles (back)
  P1: { x: 155, y: 310, w: 40, h: 22, label: 'P1' },
  P2: { x: 405, y: 310, w: 40, h: 22, label: 'P2' },
  P3: { x: 195, y: 340, w: 40, h: 22, label: 'P3' },
  P4: { x: 365, y: 340, w: 40, h: 22, label: 'P4' },
};

export function ControllerSvg({ state, actions }: ControllerSvgProps) {
  return (
    <svg
      viewBox="0 0 600 400"
      className="w-full max-w-xl mx-auto"
      role="img"
      aria-label="Xbox Elite Controller"
    >
      {/* Controller body */}
      <ControllerBody />

      {/* Paddle label */}
      <text x="300" y="300" textAnchor="middle" className="fill-zinc-600 text-[10px]">
        Back Paddles
      </text>

      {/* Interactive buttons */}
      {Object.entries(BUTTON_LAYOUT).map(([button, layout]) => (
        <ControllerButton
          key={button}
          button={button}
          layout={layout}
          state={state}
          actions={actions}
        />
      ))}
    </svg>
  );
}

function ControllerBody() {
  return (
    <>
      {/* Main body */}
      <path
        d="M 120 90 C 120 70, 140 55, 190 55 L 410 55 C 460 55, 480 70, 480 90
           L 490 200 C 500 260, 460 290, 420 290 L 370 290
           C 340 290, 320 260, 300 260 C 280 260, 260 290, 230 290
           L 180 290 C 140 290, 100 260, 110 200 Z"
        className="fill-zinc-800 stroke-zinc-600"
        strokeWidth="2"
      />
      {/* Grip left */}
      <path
        d="M 110 200 L 100 260 C 90 300, 110 350, 150 370 C 180 380, 200 360, 200 340 L 180 290"
        className="fill-zinc-800 stroke-zinc-600"
        strokeWidth="2"
      />
      {/* Grip right */}
      <path
        d="M 490 200 L 500 260 C 510 300, 490 350, 450 370 C 420 380, 400 360, 400 340 L 420 290"
        className="fill-zinc-800 stroke-zinc-600"
        strokeWidth="2"
      />
    </>
  );
}

interface ControllerButtonProps {
  button: string;
  layout: { x: number; y: number; w: number; h: number; r?: number; label: string };
  state: ControllerState;
  actions: ControllerActions;
}

function ControllerButton({ button, layout, state, actions }: ControllerButtonProps) {
  const isSelected = state.selectedButton === button;
  const isHovered = state.hoveredButton === button;
  const primaryAction = actions.getPrimaryAction(button);
  const hasBindings = primaryAction !== null;
  const isLayerTrigger = actions.getLayerForTriggerButton(button) !== undefined;
  const isActiveLayerTrigger = state.activeLayer.triggerButton === button;

  // Determine button style
  let fillClass = 'fill-zinc-700';
  let strokeClass = 'stroke-zinc-500';
  let opacity = 0.6;

  if (isActiveLayerTrigger) {
    fillClass = 'fill-blue-700';
    strokeClass = 'stroke-blue-400';
    opacity = 1;
  } else if (hasBindings) {
    fillClass = 'fill-zinc-600';
    strokeClass = 'stroke-zinc-400';
    opacity = 1;
  }

  if (isSelected) {
    strokeClass = 'stroke-blue-400';
  }
  if (isHovered) {
    fillClass = hasBindings ? 'fill-zinc-500' : 'fill-zinc-600';
  }

  const handleClick = () => {
    // If this button triggers a layer, toggle it
    const layer = actions.getLayerForTriggerButton(button);
    if (layer) {
      actions.toggleLayer(layer.id);
    }
    // Always select the button for detail
    actions.selectButton(isSelected ? null : button);
  };

  const cx = layout.x + layout.w / 2;
  const cy = layout.y + layout.h / 2;

  return (
    <g
      className="cursor-pointer"
      onClick={handleClick}
      onMouseEnter={() => actions.hoverButton(button)}
      onMouseLeave={() => actions.hoverButton(null)}
      role="button"
      tabIndex={0}
      aria-label={`${button}${primaryAction ? `: ${primaryAction}` : ''}`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      {/* Button shape */}
      {layout.r ? (
        <circle
          cx={cx}
          cy={cy}
          r={layout.r}
          className={`${fillClass} ${strokeClass} transition-colors`}
          strokeWidth={isSelected ? 2.5 : 1.5}
          opacity={opacity}
        />
      ) : (
        <rect
          x={layout.x}
          y={layout.y}
          width={layout.w}
          height={layout.h}
          rx={4}
          className={`${fillClass} ${strokeClass} transition-colors`}
          strokeWidth={isSelected ? 2.5 : 1.5}
          opacity={opacity}
        />
      )}

      {/* Button label */}
      <text
        x={cx}
        y={cy + 1}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-zinc-200 text-[9px] font-semibold pointer-events-none select-none"
      >
        {layout.label}
      </text>

      {/* Action label (below/beside button) */}
      {primaryAction && (
        <text
          x={cx}
          y={layout.y + layout.h + 12}
          textAnchor="middle"
          className="fill-emerald-400 text-[7px] pointer-events-none select-none"
        >
          {primaryAction.length > 18 ? primaryAction.slice(0, 16) + '…' : primaryAction}
        </text>
      )}

      {/* Layer trigger indicator */}
      {isLayerTrigger && !isActiveLayerTrigger && (
        <circle
          cx={layout.x + layout.w - 2}
          cy={layout.y + 2}
          r={3}
          className="fill-amber-500 pointer-events-none"
        />
      )}
    </g>
  );
}
