import { REGIONS, SEGMENTS, SPEC_COUNTS, type Region, type Segment } from '../data/hubKpiAggregate';

export interface HubKpis {
  total: number;
  active: number;
  phasedOut: number;
}

/**
 * Pure aggregation over `SPEC_COUNTS`: sums the cells at the cartesian
 * product of `appliedSegments` x `appliedRegions`. Empty inputs yield zeros.
 * React/Zustand-free (hexagonal core) -- reference: decoded
 * Dashboard-Final-Design.html `renderVals()` (~L1533-1546).
 */
export function computeHubKpis(
  appliedSegments: ReadonlySet<Segment>,
  appliedRegions: ReadonlySet<Region>,
): HubKpis {
  const segments = SEGMENTS.filter((segment) => appliedSegments.has(segment));
  const regions = REGIONS.filter((region) => appliedRegions.has(region));

  let total = 0;
  let active = 0;
  let phasedOut = 0;

  for (const segment of segments) {
    for (const region of regions) {
      const cell = SPEC_COUNTS[segment][region];
      total += cell.total;
      active += cell.active;
      phasedOut += cell.phasedOut;
    }
  }

  return { total, active, phasedOut };
}
