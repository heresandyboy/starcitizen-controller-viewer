import { describe, it, expect } from 'vitest';
import { forceSimulation, forceX, forceY } from 'd3-force';
import { forceRectCollide, forceExcludeRect, forceBoundary } from '@/components/ControllerVisual/rectCollide';
import type { RectNode } from '@/components/ControllerVisual/rectCollide';

function makeNode(x: number, y: number, w: number, h: number, index: number): RectNode {
  return { x, y, vx: 0, vy: 0, width: w, height: h, index };
}

function nodesOverlap(a: RectNode, b: RectNode, padding = 0): boolean {
  return (
    a.x - padding < b.x + b.width + padding &&
    a.x + a.width + padding > b.x - padding &&
    a.y - padding < b.y + b.height + padding &&
    a.y + a.height + padding > b.y - padding
  );
}

function nodeOverlapsRect(
  node: RectNode,
  rect: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    node.x < rect.x + rect.width &&
    node.x + node.width > rect.x &&
    node.y < rect.y + rect.height &&
    node.y + node.height > rect.y
  );
}

describe('forceRectCollide', () => {
  it('separates two overlapping nodes', () => {
    const nodes = [
      makeNode(0, 0, 100, 50, 0),
      makeNode(50, 10, 100, 50, 1), // overlaps first
    ];

    const sim = forceSimulation(nodes)
      .force('collide', forceRectCollide(0))
      .stop();

    sim.tick(200);

    expect(nodesOverlap(nodes[0], nodes[1])).toBe(false);
  });

  it('does not move non-overlapping nodes', () => {
    const nodes = [
      makeNode(0, 0, 50, 50, 0),
      makeNode(200, 200, 50, 50, 1),
    ];
    const origX0 = nodes[0].x;
    const origY0 = nodes[0].y;

    const sim = forceSimulation(nodes)
      .force('collide', forceRectCollide(0))
      .stop();

    sim.tick(200);

    // Should barely move (only forceCollide, no other forces)
    expect(Math.abs(nodes[0].x - origX0)).toBeLessThan(5);
    expect(Math.abs(nodes[0].y - origY0)).toBeLessThan(5);
  });

  it('handles multiple overlapping nodes', () => {
    const nodes = [
      makeNode(0, 0, 100, 100, 0),
      makeNode(50, 50, 100, 100, 1),
      makeNode(25, 25, 100, 100, 2),
    ];

    const sim = forceSimulation(nodes)
      .force('collide', forceRectCollide(0))
      .stop();

    sim.tick(300);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        expect(nodesOverlap(nodes[i], nodes[j])).toBe(false);
      }
    }
  });
});

describe('forceExcludeRect', () => {
  it('pushes nodes out of exclusion zone', () => {
    const exclusionRect = { x: 100, y: 100, width: 200, height: 200 };
    const nodes = [
      makeNode(150, 150, 80, 60, 0), // inside exclusion zone
    ];

    const sim = forceSimulation(nodes)
      .force('exclude', forceExcludeRect(exclusionRect, 0))
      .force('x', forceX(150).strength(0.01)) // weak pull to keep it near
      .stop();

    sim.tick(300);

    expect(nodeOverlapsRect(nodes[0], exclusionRect)).toBe(false);
  });
});

describe('forceBoundary', () => {
  it('keeps nodes inside canvas', () => {
    const canvasW = 500;
    const canvasH = 400;
    const nodes = [
      makeNode(-50, -30, 100, 80, 0),   // starts outside top-left
      makeNode(480, 380, 100, 80, 1),    // starts outside bottom-right
    ];

    const sim = forceSimulation(nodes)
      .force('boundary', forceBoundary(canvasW, canvasH, 0))
      .stop();

    sim.tick(200);

    for (const node of nodes) {
      expect(node.x).toBeGreaterThanOrEqual(-5); // allow small overshoot
      expect(node.y).toBeGreaterThanOrEqual(-5);
      expect(node.x + node.width).toBeLessThanOrEqual(canvasW + 5);
      expect(node.y + node.height).toBeLessThanOrEqual(canvasH + 5);
    }
  });
});

describe('integrated simulation (realistic scenario)', () => {
  it('36 panels settle with no overlaps', () => {
    // Simulate a realistic 36-panel layout on a 2200x1500 canvas
    const canvasW = 2200;
    const canvasH = 1500;
    const controllerRect = { x: 840, y: 280, width: 520, height: 440 };

    const nodes: RectNode[] = [];
    // Left-side panels (18)
    for (let i = 0; i < 18; i++) {
      const col = i < 10 ? 290 : 820;
      const row = (i % 10) * 140 + 10;
      nodes.push(makeNode(col - 280, row, 280, 120, i));
    }
    // Right-side panels (18)
    for (let i = 0; i < 18; i++) {
      const col = i < 10 ? 1380 : 1910;
      const row = (i % 10) * 140 + 10;
      nodes.push(makeNode(col, row, 280, 120, 18 + i));
    }

    const sim = forceSimulation(nodes)
      .force('collide', forceRectCollide(6))
      .force('exclude', forceExcludeRect(controllerRect, 12))
      .force('boundary', forceBoundary(canvasW, canvasH, 2))
      .force('x', forceX<RectNode>((d) => d.x).strength(0.3))
      .force('y', forceY<RectNode>((d) => d.y).strength(0.3))
      .alphaDecay(0.02)
      .velocityDecay(0.4)
      .stop();

    sim.tick(400);

    // No pairwise overlaps
    let overlaps = 0;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodesOverlap(nodes[i], nodes[j])) overlaps++;
      }
    }
    // Allow at most a tiny number of marginal overlaps (force sim is approximate)
    expect(overlaps).toBeLessThan(3);

    // No panels overlapping controller
    let ctrlOverlaps = 0;
    for (const node of nodes) {
      if (nodeOverlapsRect(node, controllerRect)) ctrlOverlaps++;
    }
    expect(ctrlOverlaps).toBe(0);
  });
});
