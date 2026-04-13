'use client';

import { useMemo } from 'react';
import { forceSimulation, forceX, forceY } from 'd3-force';
import type { ButtonPanelData } from './useControllerVisualData';
import type { PanelPosition } from './panelPositions';
import {
  PANEL_POSITIONS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CONTROLLER_CENTER,
  CONTROLLER_WIDTH,
  CONTROLLER_HEIGHT,
  PANEL_WIDTH,
} from './panelPositions';
import { entryMatchesMode } from './useControllerVisualData';
import type { GameplayMode } from '@/lib/types/unified';
import { forceRectCollide, forceExcludeRect, forceBoundary } from './rectCollide';
import type { RectNode } from './rectCollide';

// ── Height estimation ────────────────────────────────────────────────

/** Header height in px */
const HEADER_H = 20;
/** Height per binding entry row */
const ROW_H = 18;
/** Padding (top+bottom) */
const PADDING_H = 8;
/** Collapsed panel height */
const COLLAPSED_H = 24;

/**
 * Estimate panel height from visible entry count.
 * No max-height cap — the force layout gives panels room to breathe.
 */
function estimatePanelHeight(visibleEntries: number): number {
  if (visibleEntries === 0) return COLLAPSED_H;
  return HEADER_H + visibleEntries * ROW_H + PADDING_H;
}

// ── Force layout hook ────────────────────────────────────────────────

export interface ComputedPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Run d3-force simulation to compute non-overlapping positions for all panels.
 *
 * Uses ideal positions from PANEL_POSITIONS as targets, then applies:
 * - Rectangular collision force (prevents card-card overlap)
 * - Exclusion zone force (keeps cards out of controller area)
 * - Boundary force (keeps cards inside canvas)
 * - X/Y positioning forces (pulls cards toward ideal positions)
 */
export function useForceLayout(
  panels: Map<string, ButtonPanelData>,
  modeFilter: GameplayMode | 'All',
): Map<string, ComputedPosition> {
  return useMemo(() => {
    const controllerRect = {
      x: CONTROLLER_CENTER.x - CONTROLLER_WIDTH / 2,
      y: CONTROLLER_CENTER.y - CONTROLLER_HEIGHT / 2,
      width: CONTROLLER_WIDTH,
      height: CONTROLLER_HEIGHT,
    };

    // Build nodes from panel data
    const nodeList: (RectNode & { button: string; idealX: number; idealY: number })[] = [];

    for (const [button, panelData] of panels) {
      const pos = PANEL_POSITIONS[button];
      if (!pos) continue;

      // Count visible entries for height estimation
      const visibleCount = modeFilter === 'All'
        ? panelData.entries.length
        : panelData.entries.filter(e => entryMatchesMode(e, modeFilter)).length;

      const h = estimatePanelHeight(visibleCount);

      // Convert anchor-based position to top-left
      const idealX = pos.anchor === 'right' ? pos.x - PANEL_WIDTH : pos.x;
      const idealY = pos.y;

      nodeList.push({
        x: idealX,
        y: idealY,
        vx: 0,
        vy: 0,
        width: PANEL_WIDTH,
        height: h,
        index: nodeList.length,
        button,
        idealX,
        idealY,
      });
    }

    if (nodeList.length === 0) return new Map();

    // Create simulation with custom forces
    const collideForce = forceRectCollide(8);
    collideForce.strength(1.5);
    collideForce.iterations(3);

    const sim = forceSimulation<typeof nodeList[number]>(nodeList)
      .force('rectCollide', collideForce)
      .force('excludeRect', forceExcludeRect(controllerRect, 16))
      .force('boundary', forceBoundary(CANVAS_WIDTH, CANVAS_HEIGHT, 4))
      .force('x', forceX<typeof nodeList[number]>((d) => d.idealX).strength(0.15))
      .force('y', forceY<typeof nodeList[number]>((d) => d.idealY).strength(0.15))
      .alphaDecay(0.015)
      .velocityDecay(0.35)
      .stop();

    // Run synchronously — ~80ms for 36 nodes with 3 collision iterations
    sim.tick(600);

    // Build output map
    const result = new Map<string, ComputedPosition>();
    for (const node of nodeList) {
      result.set(node.button, {
        x: Math.round(node.x),
        y: Math.round(node.y),
        width: node.width,
        height: node.height,
      });
    }

    return result;
  }, [panels, modeFilter]);
}
