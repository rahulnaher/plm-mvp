/**
 * Illustrative Hub KPI aggregate: a Segment x Region matrix of spec counts.
 * This is a separate, hand-authored dataset from the Explorer 64-item
 * catalog (which doesn't exist until Epic 2) -- FR-33's accepted
 * dataset/catalog inconsistency. Do not add reconciliation logic here.
 *
 * React/Zustand-free (hexagonal boundary, lint-enforced via
 * `no-restricted-imports` in eslint.config.js).
 *
 * Source: decoded reference/Claude Code Handoff Package/Dashboard-Final-Design.html
 * `SPEC_COUNTS` (~L1195). All 9 cells verified `total === active + phasedOut`.
 */

export const SEGMENTS = ['Petcare', 'Snacking', 'Food'] as const;
export type Segment = (typeof SEGMENTS)[number];

export const REGIONS = ['NA', 'EU', 'APAC'] as const;
export type Region = (typeof REGIONS)[number];

export interface SpecCountCell {
  total: number;
  active: number;
  phasedOut: number;
}

export const SPEC_COUNTS: Record<Segment, Record<Region, SpecCountCell>> = {
  Petcare: {
    NA: { total: 412, active: 356, phasedOut: 56 },
    EU: { total: 298, active: 247, phasedOut: 51 },
    APAC: { total: 176, active: 149, phasedOut: 27 },
  },
  Snacking: {
    NA: { total: 530, active: 471, phasedOut: 59 },
    EU: { total: 388, active: 330, phasedOut: 58 },
    APAC: { total: 241, active: 205, phasedOut: 36 },
  },
  Food: {
    NA: { total: 265, active: 224, phasedOut: 41 },
    EU: { total: 190, active: 158, phasedOut: 32 },
    APAC: { total: 122, active: 99, phasedOut: 23 },
  },
};
