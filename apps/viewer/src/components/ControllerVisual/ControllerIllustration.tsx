'use client';

/**
 * Pure presentational SVG of the Xbox Elite controller.
 * Used as the central visual in the poster layout.
 * No click handlers — interaction is on the HTML binding panels.
 */

interface ControllerIllustrationProps {
  /** Button to highlight (from gamepad input or panel hover) */
  highlightedButton?: string | null;
  /** Width of the SVG container in px */
  width?: number;
}

/** Viewbox matches the original ControllerSvg coordinate system */
const VB = { w: 600, h: 400 };

/** Button marker positions (center point + radius in SVG coords) */
const BUTTON_MARKERS: Record<string, { cx: number; cy: number; r: number; label: string }> = {
  // Face buttons
  A:     { cx: 445, cy: 200, r: 15, label: 'A' },
  B:     { cx: 477, cy: 170, r: 15, label: 'B' },
  X:     { cx: 413, cy: 170, r: 15, label: 'X' },
  Y:     { cx: 445, cy: 140, r: 15, label: 'Y' },
  // D-pad
  DpadUp:    { cx: 180, cy: 152, r: 10, label: '↑' },
  DpadDown:  { cx: 180, cy: 208, r: 10, label: '↓' },
  DpadLeft:  { cx: 152, cy: 180, r: 10, label: '←' },
  DpadRight: { cx: 208, cy: 180, r: 10, label: '→' },
  // Bumpers
  LB: { cx: 150, cy: 66, r: 18, label: 'LB' },
  RB: { cx: 450, cy: 66, r: 18, label: 'RB' },
  // Triggers
  LT: { cx: 150, cy: 32, r: 16, label: 'LT' },
  RT: { cx: 450, cy: 32, r: 16, label: 'RT' },
  // Sticks (click)
  LS: { cx: 150, cy: 128, r: 20, label: 'LS' },
  RS: { cx: 390, cy: 260, r: 20, label: 'RS' },
  // Special
  Menu: { cx: 340, cy: 105, r: 10, label: '≡' },
  View: { cx: 260, cy: 105, r: 10, label: '⊞' },
  Xbox: { cx: 300, cy: 75, r: 13, label: '⊕' },
  // Paddles
  P1: { cx: 175, cy: 320, r: 12, label: 'P1' },
  P2: { cx: 425, cy: 320, r: 12, label: 'P2' },
  P3: { cx: 215, cy: 350, r: 12, label: 'P3' },
  P4: { cx: 385, cy: 350, r: 12, label: 'P4' },
};

export function ControllerIllustration({
  highlightedButton,
  width = 500,
}: ControllerIllustrationProps) {
  return (
    <svg
      viewBox={`0 0 ${VB.w} ${VB.h}`}
      width={width}
      className="pointer-events-none select-none"
      role="img"
      aria-label="Xbox Elite Controller"
    >
      {/* Controller body */}
      <ControllerBody />

      {/* Stick direction indicators */}
      <StickDirections cx={150} cy={128} color="#ef4444" label="LS" highlighted={highlightedButton} prefix="LS" />
      <StickDirections cx={390} cy={260} color="#a1a1aa" label="RS" highlighted={highlightedButton} prefix="RS" />

      {/* D-pad cross */}
      <DpadIcon cx={180} cy={180} highlighted={highlightedButton} />

      {/* Button markers */}
      {Object.entries(BUTTON_MARKERS).map(([button, m]) => (
        <ButtonMarker
          key={button}
          {...m}
          isHighlighted={highlightedButton === button}
          isFaceButton={['A', 'B', 'X', 'Y'].includes(button)}
          button={button}
        />
      ))}

      {/* Paddle label */}
      <text x={300} y={300} textAnchor="middle" className="fill-zinc-600 text-[9px]">
        Back Paddles
      </text>
    </svg>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function ControllerBody() {
  return (
    <>
      <path
        d="M 120 90 C 120 70, 140 55, 190 55 L 410 55 C 460 55, 480 70, 480 90
           L 490 200 C 500 260, 460 290, 420 290 L 370 290
           C 340 290, 320 260, 300 260 C 280 260, 260 290, 230 290
           L 180 290 C 140 290, 100 260, 110 200 Z"
        className="fill-zinc-800 stroke-zinc-600"
        strokeWidth="2"
      />
      <path
        d="M 110 200 L 100 260 C 90 300, 110 350, 150 370 C 180 380, 200 360, 200 340 L 180 290"
        className="fill-zinc-800 stroke-zinc-600"
        strokeWidth="2"
      />
      <path
        d="M 490 200 L 500 260 C 510 300, 490 350, 450 370 C 420 380, 400 360, 400 340 L 420 290"
        className="fill-zinc-800 stroke-zinc-600"
        strokeWidth="2"
      />
    </>
  );
}

/** Stick direction indicator with 4 arrows */
function StickDirections({
  cx, cy, color, label, highlighted, prefix,
}: {
  cx: number; cy: number; color: string; label: string;
  highlighted?: string | null; prefix: string;
}) {
  const arrowLen = 22;
  const dirs = [
    { dir: 'Up', dx: 0, dy: -arrowLen },
    { dir: 'Down', dx: 0, dy: arrowLen },
    { dir: 'Left', dx: -arrowLen, dy: 0 },
    { dir: 'Right', dx: arrowLen, dy: 0 },
  ];

  return (
    <g>
      {/* Center circle */}
      <circle cx={cx} cy={cy} r={16} fill="none" stroke={color} strokeWidth="2" opacity={0.7} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central"
        className="text-[8px] font-bold" fill={color}>
        {label}
      </text>
      {/* Direction arrows */}
      {dirs.map(({ dir, dx, dy }) => {
        const isHl = highlighted === `${prefix}${dir}`;
        return (
          <line
            key={dir}
            x1={cx + dx * 0.6}
            y1={cy + dy * 0.6}
            x2={cx + dx}
            y2={cy + dy}
            stroke={isHl ? '#fbbf24' : color}
            strokeWidth={isHl ? 3 : 1.5}
            opacity={isHl ? 1 : 0.5}
            markerEnd="none"
          />
        );
      })}
      {/* Arrowheads */}
      {dirs.map(({ dir, dx, dy }) => {
        const isHl = highlighted === `${prefix}${dir}`;
        const ex = cx + dx;
        const ey = cy + dy;
        const size = 4;
        // Simple triangle arrowhead
        const angle = Math.atan2(dy, dx);
        const p1x = ex - size * Math.cos(angle - 0.5);
        const p1y = ey - size * Math.sin(angle - 0.5);
        const p2x = ex - size * Math.cos(angle + 0.5);
        const p2y = ey - size * Math.sin(angle + 0.5);
        return (
          <polygon
            key={`${dir}-arrow`}
            points={`${ex},${ey} ${p1x},${p1y} ${p2x},${p2y}`}
            fill={isHl ? '#fbbf24' : color}
            opacity={isHl ? 1 : 0.5}
          />
        );
      })}
    </g>
  );
}

/** D-pad cross icon */
function DpadIcon({ cx, cy, highlighted }: { cx: number; cy: number; highlighted?: string | null }) {
  const s = 14; // half-size of each arm
  const w = 8;  // width of each arm
  const dirs: Array<{ name: string; path: string }> = [
    { name: 'DpadUp', path: `M ${cx - w / 2} ${cy - w / 2} V ${cy - s} H ${cx + w / 2} V ${cy - w / 2} Z` },
    { name: 'DpadDown', path: `M ${cx - w / 2} ${cy + w / 2} V ${cy + s} H ${cx + w / 2} V ${cy + w / 2} Z` },
    { name: 'DpadLeft', path: `M ${cx - w / 2} ${cy - w / 2} H ${cx - s} V ${cy + w / 2} H ${cx - w / 2} Z` },
    { name: 'DpadRight', path: `M ${cx + w / 2} ${cy - w / 2} H ${cx + s} V ${cy + w / 2} H ${cx + w / 2} Z` },
  ];
  return (
    <g>
      {/* Center square */}
      <rect x={cx - w / 2} y={cy - w / 2} width={w} height={w}
        className="fill-zinc-700 stroke-zinc-500" strokeWidth="1" />
      {/* Arms */}
      {dirs.map(({ name, path }) => (
        <path key={name} d={path}
          fill={highlighted === name ? '#fbbf24' : '#52525b'}
          stroke={highlighted === name ? '#fbbf24' : '#71717a'}
          strokeWidth="1"
          opacity={highlighted === name ? 1 : 0.8}
        />
      ))}
    </g>
  );
}

/** Single button marker circle */
function ButtonMarker({
  cx, cy, r, label, isHighlighted, isFaceButton, button,
}: {
  cx: number; cy: number; r: number; label: string;
  isHighlighted: boolean; isFaceButton: boolean; button: string;
}) {
  // Xbox face button colors
  const faceColors: Record<string, string> = {
    A: '#22c55e', B: '#ef4444', X: '#3b82f6', Y: '#eab308',
  };
  const baseColor = isFaceButton ? faceColors[button] : '#71717a';
  const hlColor = '#fbbf24';

  return (
    <g>
      <circle
        cx={cx} cy={cy} r={r}
        fill={isHighlighted ? hlColor + '33' : baseColor + '22'}
        stroke={isHighlighted ? hlColor : baseColor}
        strokeWidth={isHighlighted ? 2.5 : 1.5}
      />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central"
        className="text-[8px] font-semibold pointer-events-none"
        fill={isHighlighted ? hlColor : '#d4d4d8'}
      >
        {label}
      </text>
    </g>
  );
}

/** Export button marker positions for leader line targeting */
export const BUTTON_SVG_POSITIONS = BUTTON_MARKERS;
