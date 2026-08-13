import { RECENT_VIEWS, type RecentView } from '../data/hubRecentViews';

/**
 * DELIBERATELY NON-FILTER-REACTIVE, enforced structurally: this function
 * takes zero parameters, so there is no signature through which
 * `appliedSegments`/`appliedRegions` filter state could ever be threaded
 * in. The reference itself never filters `RECENT_VIEWS` by anything, so
 * returning it as-is is reference-accurate, not just a simplification
 * (epic-1-context.md). Mirrors `computeSegmentHealth`'s zero-arg
 * non-reactivity pattern.
 *
 * React/Zustand-free (hexagonal core) -- reference: decoded
 * Dashboard-Final-Design.html `RECENT_VIEWS.map(...)` derivation (~L1211).
 */
export function computeRecentViews(): RecentView[] {
  return [...RECENT_VIEWS];
}
