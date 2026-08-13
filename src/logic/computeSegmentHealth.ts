import { REGIONS, SEGMENTS, SPEC_COUNTS, type Segment } from '../data/hubKpiAggregate';

export interface SegmentHealth {
  segment: Segment;
  total: number;
  active: number;
  phasedOut: number;
  activePct: number;
  phasedPct: number;
}

/**
 * DELIBERATELY NON-FILTER-REACTIVE, enforced structurally: this function
 * takes zero parameters, so there is no signature through which
 * `appliedSegments`/`appliedRegions` filter state could ever be threaded
 * in. Portfolio Health Trend always reflects the whole portfolio, summed
 * across all `REGIONS` per segment -- this is a deliberate, permanent
 * divergence from the rest of the Hub, not a bug (epic-1-context.md). See
 * the "Portfolio Health Trend never changes on any Apply" regression test
 * in test/hub.test.tsx before ever adding a parameter here.
 *
 * React/Zustand-free (hexagonal core) -- reference: decoded
 * Dashboard-Final-Design.html `renderVals()` `segmentHealth` derivation
 * (~L1561-1566).
 */
export function computeSegmentHealth(): SegmentHealth[] {
  return SEGMENTS.map((segment) => {
    let total = 0;
    let active = 0;
    let phasedOut = 0;

    for (const region of REGIONS) {
      const cell = SPEC_COUNTS[segment][region];
      total += cell.total;
      active += cell.active;
      phasedOut += cell.phasedOut;
    }

    const activePct = total === 0 ? 0 : Math.round((active / total) * 100);

    return { segment, total, active, phasedOut, activePct, phasedPct: 100 - activePct };
  });
}
