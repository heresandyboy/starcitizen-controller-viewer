'use client';

import Image from 'next/image';

/**
 * Xbox controller illustration using real SVG asset from e7d/gamepad-viewer (MIT).
 * Renders the controller image with labeled button positions overlaid.
 */

interface ControllerIllustrationProps {
  highlightedButton?: string | null;
  width?: number;
}

/**
 * Button label positions as percentages of the controller image.
 * Based on the xbox-one-base.svg which is 750x630.
 */
const BUTTON_LABELS: Record<string, { x: number; y: number; label: string; color?: string }> = {
  // Face buttons (circles in the SVG at known positions)
  A:  { x: 75.5, y: 52.3, label: 'A', color: '#22c55e' },
  B:  { x: 82.2, y: 44.0, label: 'B', color: '#ef4444' },
  X:  { x: 68.9, y: 44.0, label: 'X', color: '#3b82f6' },
  Y:  { x: 75.5, y: 36.0, label: 'Y', color: '#eab308' },
  // D-pad (center of the cross)
  DpadUp:    { x: 37.0, y: 60.5, label: '↑' },
  DpadDown:  { x: 37.0, y: 73.5, label: '↓' },
  DpadLeft:  { x: 32.2, y: 67.0, label: '←' },
  DpadRight: { x: 41.9, y: 67.0, label: '→' },
  // Sticks
  LS: { x: 24.7, y: 44.5, label: 'LS' },
  RS: { x: 63.1, y: 62.5, label: 'RS' },
  // Bumpers (shoulder area)
  LB: { x: 20.0, y: 25.0, label: 'LB' },
  RB: { x: 80.0, y: 25.0, label: 'RB' },
  // Triggers (top)
  LT: { x: 28.0, y: 8.0, label: 'LT' },
  RT: { x: 72.0, y: 8.0, label: 'RT' },
  // Special buttons
  Menu: { x: 57.5, y: 44.5, label: '≡' },
  View: { x: 42.9, y: 44.5, label: '⊞' },
  Xbox: { x: 50.0, y: 31.0, label: '⊕' },
  // Paddles (lower grips area)
  P1: { x: 22.0, y: 85.0, label: 'P1' },
  P2: { x: 78.0, y: 85.0, label: 'P2' },
  P3: { x: 28.0, y: 92.0, label: 'P3' },
  P4: { x: 72.0, y: 92.0, label: 'P4' },
};

export function ControllerIllustration({
  highlightedButton,
  width = 700,
}: ControllerIllustrationProps) {
  const height = Math.round(width * (630 / 750));

  return (
    <div className="relative" style={{ width, height }}>
      {/* Real controller SVG as background */}
      <Image
        src="/assets/xbox-one-base.svg"
        alt="Xbox Elite Controller"
        width={width}
        height={height}
        className="pointer-events-none select-none opacity-80"
        priority
      />

      {/* Button labels overlaid */}
      {Object.entries(BUTTON_LABELS).map(([button, pos]) => {
        const isHighlighted = highlightedButton === button;
        return (
          <div
            key={button}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span
              className={`
                text-[10px] font-bold px-1 py-0.5 rounded-sm
                ${isHighlighted
                  ? 'bg-amber-500/80 text-black scale-125'
                  : 'bg-black/60 text-zinc-300'}
                transition-all duration-150
              `}
              style={pos.color && !isHighlighted ? { color: pos.color } : undefined}
            >
              {pos.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Button positions in canvas coordinates (for leader lines).
 * Returns the absolute position of a button label within the canvas.
 */
export function getButtonCanvasPosition(
  button: string,
  controllerLeft: number,
  controllerTop: number,
  controllerWidth: number,
  controllerHeight: number
): { x: number; y: number } | null {
  const pos = BUTTON_LABELS[button];
  if (!pos) return null;
  return {
    x: controllerLeft + (pos.x / 100) * controllerWidth,
    y: controllerTop + (pos.y / 100) * controllerHeight,
  };
}

// Also export for stick directions — they map to the stick center
const STICK_DIRECTION_TARGETS: Record<string, string> = {
  LSUp: 'LS', LSDown: 'LS', LSLeft: 'LS', LSRight: 'LS',
  RSUp: 'RS', RSDown: 'RS', RSLeft: 'RS', RSRight: 'RS',
};

export function getButtonOrStickCanvasPosition(
  button: string,
  controllerLeft: number,
  controllerTop: number,
  controllerWidth: number,
  controllerHeight: number
): { x: number; y: number } | null {
  const directTarget = STICK_DIRECTION_TARGETS[button];
  const targetButton = directTarget ?? button;
  return getButtonCanvasPosition(targetButton, controllerLeft, controllerTop, controllerWidth, controllerHeight);
}
