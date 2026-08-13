import { describe, expect, it } from 'vitest';
import { ALERTS } from '../src/data/hubAlerts';
import { SEGMENTS } from '../src/data/hubKpiAggregate';
import { computeHubAlerts } from '../src/logic/computeHubAlerts';

describe('computeHubAlerts', () => {
  it('returns all alerts when every segment is applied', () => {
    expect(computeHubAlerts(new Set(SEGMENTS))).toEqual(ALERTS);
  });

  it('filters to a single applied segment', () => {
    const result = computeHubAlerts(new Set(['Petcare']));

    expect(result.map((alert) => alert.id).sort()).toEqual(['a1', 'a4']);
    expect(result.every((alert) => alert.segment === 'Petcare')).toBe(true);
  });

  it('filters to a subset of segments', () => {
    const result = computeHubAlerts(new Set(['Snacking', 'Food']));

    expect(result.map((alert) => alert.id).sort()).toEqual(['a2', 'a3']);
  });

  it('returns an empty array for an empty segment set', () => {
    expect(computeHubAlerts(new Set())).toEqual([]);
  });
});
