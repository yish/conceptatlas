import type { ConceptLink, ConceptNode } from '../types/conceptMap';

export const NODE_WIDTH = 210;
export const NODE_HEIGHT = 86;

/**
 * Places a newly created concept near its connected neighbors, or in a tidy grid slot.
 */
export function placeConceptNearRelated(
  existingConcepts: ConceptNode[],
  relatedIds: string[]
): { x: number; y: number } {
  const placed = existingConcepts.filter((c) => c.placed);
  if (placed.length === 0) {
    return { x: 420, y: 220 };
  }

  const relatedNodes = placed.filter((c) => relatedIds.includes(c.id));
  const anchor =
    relatedNodes.length > 0
      ? {
          x: relatedNodes.reduce((sum, n) => sum + n.x, 0) / relatedNodes.length,
          y: relatedNodes.reduce((sum, n) => sum + n.y, 0) / relatedNodes.length,
        }
      : {
          x: placed.reduce((sum, n) => sum + n.x, 0) / placed.length,
          y: placed.reduce((sum, n) => sum + n.y, 0) / placed.length,
        };

  // Search spiral candidates around anchor to avoid overlaps
  const stepRadii = [250, 310, 380, 460];
  const angles = [0, Math.PI / 3, (2 * Math.PI) / 3, Math.PI, (4 * Math.PI) / 3, (5 * Math.PI) / 3, Math.PI / 6, (5 * Math.PI) / 6];

  for (const r of stepRadii) {
    for (const theta of angles) {
      const cx = Math.max(80, Math.round(anchor.x + Math.cos(theta) * r));
      const cy = Math.max(80, Math.round(anchor.y + Math.sin(theta) * (r * 0.72)));
      const overlaps = placed.some(
        (n) => Math.abs(n.x - cx) < NODE_WIDTH + 36 && Math.abs(n.y - cy) < NODE_HEIGHT + 36
      );
      if (!overlaps) {
        return { x: cx, y: cy };
      }
    }
  }

  const maxY = Math.max(...placed.map((n) => n.y));
  return { x: 160 + ((placed.length * 240) % 720), y: maxY + 150 };
}

/**
 * Clean force-directed + hierarchical topological layout for all concepts.
 */
export function autoArrangeLayout(
  concepts: ConceptNode[],
  links: ConceptLink[]
): ConceptNode[] {
  if (concepts.length === 0) return concepts;

  // Compute in-degree for root hierarchy seeding
  const inDegree = new Map<string, number>();
  const outDegree = new Map<string, number>();
  for (const c of concepts) {
    inDegree.set(c.id, 0);
    outDegree.set(c.id, 0);
  }
  for (const l of links) {
    inDegree.set(l.targetId, (inDegree.get(l.targetId) ?? 0) + 1);
    outDegree.set(l.sourceId, (outDegree.get(l.sourceId) ?? 0) + 1);
  }

  // Sort by net centrality so root-like concepts sit higher/central
  const sorted = [...concepts].sort((a, b) => {
    const scoreA = (outDegree.get(a.id) ?? 0) - (inDegree.get(a.id) ?? 0);
    const scoreB = (outDegree.get(b.id) ?? 0) - (inDegree.get(b.id) ?? 0);
    return scoreB - scoreA;
  });

  const cols = Math.max(2, Math.ceil(Math.sqrt(sorted.length)));
  const positions = new Map<string, { x: number; y: number }>();

  sorted.forEach((c, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    positions.set(c.id, {
      x: 160 + col * 280 + (row % 2 === 1 ? 70 : 0),
      y: 110 + row * 190,
    });
  });

  // Run lightweight spring-repulsion simulation for 90 iterations
  for (let iter = 0; iter < 90; iter++) {
    const forces = new Map<string, { fx: number; fy: number }>();
    for (const c of concepts) {
      forces.set(c.id, { fx: 0, fy: 0 });
    }

    // Repulsion between every pair
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const a = concepts[i];
        const b = concepts[j];
        const pa = positions.get(a.id)!;
        const pb = positions.get(b.id)!;
        let dx = pb.x - pa.x;
        let dy = pb.y - pa.y;
        const distSq = dx * dx + dy * dy + 1;
        const dist = Math.sqrt(distSq);
        const minDist = 270;
        if (dist < minDist * 1.6) {
          const repulse = (minDist * minDist) / distSq;
          const fx = (dx / dist) * repulse * 18;
          const fy = (dy / dist) * repulse * 14;
          forces.get(a.id)!.fx -= fx;
          forces.get(a.id)!.fy -= fy;
          forces.get(b.id)!.fx += fx;
          forces.get(b.id)!.fy += fy;
        }
      }
    }

    // Spring attraction along links
    for (const l of links) {
      const pa = positions.get(l.sourceId);
      const pb = positions.get(l.targetId);
      if (!pa || !pb) continue;
      const dx = pb.x - pa.x;
      const dy = pb.y - pa.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const ideal = 260;
      const pull = (dist - ideal) * 0.08;
      const fx = (dx / dist) * pull;
      const fy = (dy / dist) * pull;
      forces.get(l.sourceId)!.fx += fx;
      forces.get(l.sourceId)!.fy += fy;
      forces.get(l.targetId)!.fx -= fx;
      forces.get(l.targetId)!.fy -= fy;
    }

    // Apply clamped step
    for (const c of concepts) {
      const p = positions.get(c.id)!;
      const f = forces.get(c.id)!;
      p.x += Math.max(-24, Math.min(24, f.fx));
      p.y += Math.max(-24, Math.min(24, f.fy));
    }
  }

  // Normalize top-left margin to (100, 90)
  const allPos = Array.from(positions.values());
  const minX = Math.min(...allPos.map((p) => p.x));
  const minY = Math.min(...allPos.map((p) => p.y));

  return concepts.map((c) => {
    const p = positions.get(c.id)!;
    return {
      ...c,
      x: Math.round(p.x - minX + 100),
      y: Math.round(p.y - minY + 90),
      placed: true,
    };
  });
}
