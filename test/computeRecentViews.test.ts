import { describe, expect, it } from 'vitest';
import { RECENT_VIEWS } from '../src/data/hubRecentViews';
import { computeRecentViews } from '../src/logic/computeRecentViews';

describe('computeRecentViews', () => {
  it('has a zero-argument signature', () => {
    expect(computeRecentViews.length).toBe(0);
  });

  it('returns all 4 RECENT_VIEWS rows unchanged', () => {
    expect(computeRecentViews()).toEqual(RECENT_VIEWS);
    expect(computeRecentViews()).toHaveLength(4);
  });

  it('is deterministic across repeated calls with no arguments', () => {
    expect(computeRecentViews()).toEqual(computeRecentViews());
  });
});
