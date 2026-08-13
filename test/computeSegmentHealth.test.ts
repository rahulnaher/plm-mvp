import { describe, expect, it } from 'vitest';
import { SEGMENTS } from '../src/data/hubKpiAggregate';
import { computeSegmentHealth } from '../src/logic/computeSegmentHealth';

describe('computeSegmentHealth', () => {
  it('has a zero-argument signature', () => {
    expect(computeSegmentHealth.length).toBe(0);
  });

  it('returns one row per segment, each satisfying total === active + phasedOut', () => {
    const result = computeSegmentHealth();

    expect(result).toHaveLength(SEGMENTS.length);
    for (const row of result) {
      expect(row.total).toBe(row.active + row.phasedOut);
      expect(row.activePct + row.phasedPct).toBe(100);
    }
  });

  it('sums SPEC_COUNTS across all regions for a known segment (Petcare)', () => {
    const result = computeSegmentHealth();
    const petcare = result.find((row) => row.segment === 'Petcare');

    expect(petcare).toEqual({
      segment: 'Petcare',
      total: 886,
      active: 752,
      phasedOut: 134,
      activePct: 85,
      phasedPct: 15,
    });
  });

  it('is deterministic across repeated calls with no arguments', () => {
    expect(computeSegmentHealth()).toEqual(computeSegmentHealth());
  });
});
