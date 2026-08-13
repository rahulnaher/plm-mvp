import { describe, expect, it } from 'vitest';
import { REGIONS, SEGMENTS, SPEC_COUNTS } from '../src/data/hubKpiAggregate';
import { computeHubKpis } from '../src/logic/computeHubKpis';

describe('computeHubKpis', () => {
  it('sums a known subset (2 segments x 1 region)', () => {
    const result = computeHubKpis(new Set(['Petcare', 'Snacking']), new Set(['NA']));

    expect(result).toEqual({
      total: 412 + 530,
      active: 356 + 471,
      phasedOut: 56 + 59,
    });
  });

  it('returns exactly one cell for a single segment x single region', () => {
    const result = computeHubKpis(new Set(['Food']), new Set(['EU']));

    expect(result).toEqual(SPEC_COUNTS.Food.EU);
  });

  it('sums the full matrix when every segment and region is applied', () => {
    const result = computeHubKpis(new Set(SEGMENTS), new Set(REGIONS));

    expect(result).toEqual({
      total: 2622,
      active: 2239,
      phasedOut: 383,
    });
  });

  it('every SPEC_COUNTS cell satisfies total === active + phasedOut', () => {
    for (const segment of SEGMENTS) {
      for (const region of REGIONS) {
        const cell = SPEC_COUNTS[segment][region];
        expect(cell.total).toBe(cell.active + cell.phasedOut);
      }
    }
  });

  it('returns zeros for an empty segment set', () => {
    expect(computeHubKpis(new Set(), new Set(REGIONS))).toEqual({
      total: 0,
      active: 0,
      phasedOut: 0,
    });
  });

  it('returns zeros for an empty region set', () => {
    expect(computeHubKpis(new Set(SEGMENTS), new Set())).toEqual({
      total: 0,
      active: 0,
      phasedOut: 0,
    });
  });
});
