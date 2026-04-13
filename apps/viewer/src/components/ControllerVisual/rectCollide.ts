/**
 * Custom forces for d3-force simulation.
 *
 * Rectangular collision, exclusion zone, and boundary forces
 * for positioning 36 binding panels without overlap.
 *
 * Uses O(n^2) pairwise checks — perfectly fine for 36 nodes.
 */

export interface RectNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  index: number;
}

/**
 * Rectangular collision force — prevents card-card overlap.
 * @param padding Extra spacing between rectangles (px).
 */
export function forceRectCollide(padding = 4) {
  let nodes: RectNode[] = [];
  let strength = 1.0;
  let iterations = 1;

  function force(alpha: number) {
    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];

          const ax1 = a.x - padding;
          const ay1 = a.y - padding;
          const ax2 = a.x + a.width + padding;
          const ay2 = a.y + a.height + padding;

          const bx1 = b.x - padding;
          const by1 = b.y - padding;
          const bx2 = b.x + b.width + padding;
          const by2 = b.y + b.height + padding;

          // Check overlap
          if (ax1 < bx2 && ax2 > bx1 && ay1 < by2 && ay2 > by1) {
            const overlapX = Math.min(ax2 - bx1, bx2 - ax1);
            const overlapY = Math.min(ay2 - by1, by2 - ay1);

            const factor = alpha * strength * 0.5;

            // Push along axis with smaller overlap (less disruptive)
            if (overlapX < overlapY) {
              const acx = a.x + a.width / 2;
              const bcx = b.x + b.width / 2;
              const dx = acx < bcx ? -overlapX : overlapX;
              a.vx += dx * factor;
              b.vx -= dx * factor;
            } else {
              const acy = a.y + a.height / 2;
              const bcy = b.y + b.height / 2;
              const dy = acy < bcy ? -overlapY : overlapY;
              a.vy += dy * factor;
              b.vy -= dy * factor;
            }
          }
        }
      }
    }
  }

  force.initialize = (_nodes: RectNode[]) => {
    nodes = _nodes;
  };

  force.strength = (s: number) => {
    strength = s;
    return force;
  };

  force.iterations = (n: number) => {
    iterations = n;
    return force;
  };

  return force;
}

/**
 * Force that pushes nodes out of a rectangular exclusion zone (the controller).
 */
export function forceExcludeRect(
  rect: { x: number; y: number; width: number; height: number },
  padding = 8,
) {
  let nodes: RectNode[] = [];
  const strength = 1.0;

  const rx = rect.x - padding;
  const ry = rect.y - padding;
  const rw = rect.width + padding * 2;
  const rh = rect.height + padding * 2;
  const rcx = rx + rw / 2;
  const rcy = ry + rh / 2;

  function force(alpha: number) {
    for (const node of nodes) {
      const nx2 = node.x + node.width;
      const ny2 = node.y + node.height;

      // Check if node overlaps the exclusion rect
      if (node.x < rx + rw && nx2 > rx && node.y < ry + rh && ny2 > ry) {
        const ncx = node.x + node.width / 2;
        const ncy = node.y + node.height / 2;

        const factor = alpha * strength;

        // Push horizontally based on which side of controller center
        if (ncx < rcx) {
          node.vx += (rx - nx2) * factor; // push left
        } else {
          node.vx += (rx + rw - node.x) * factor; // push right
        }

        // Gentle vertical push
        if (ncy < rcy) {
          node.vy += (ry - ny2) * factor * 0.3; // push up
        } else {
          node.vy += (ry + rh - node.y) * factor * 0.3; // push down
        }
      }
    }
  }

  force.initialize = (_nodes: RectNode[]) => {
    nodes = _nodes;
  };

  return force;
}

/**
 * Force that keeps nodes within canvas bounds.
 */
export function forceBoundary(
  canvasWidth: number,
  canvasHeight: number,
  margin = 0,
) {
  let nodes: RectNode[] = [];

  function force(alpha: number) {
    const pushStrength = alpha * 2.0;
    for (const node of nodes) {
      if (node.x < margin) {
        node.vx += (margin - node.x) * pushStrength;
      }
      if (node.y < margin) {
        node.vy += (margin - node.y) * pushStrength;
      }
      if (node.x + node.width > canvasWidth - margin) {
        node.vx -= (node.x + node.width - canvasWidth + margin) * pushStrength;
      }
      if (node.y + node.height > canvasHeight - margin) {
        node.vy -= (node.y + node.height - canvasHeight + margin) * pushStrength;
      }
    }
  }

  force.initialize = (_nodes: RectNode[]) => {
    nodes = _nodes;
  };

  return force;
}
