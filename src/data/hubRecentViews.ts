/**
 * Illustrative Recent/Pinned Views dataset for the Hub's Recent Views table.
 * Row destinations are undefined per epics.md -- rendered as inert text by
 * `RecentViewsTable`, never a functional `href` (no-broken-links precedent,
 * same rationale as `hubAlerts.ts`'s `linkLabel`).
 *
 * React/Zustand-free (hexagonal boundary, lint-enforced via
 * `no-restricted-imports` in eslint.config.js).
 *
 * Source: decoded reference/Claude Code Handoff Package/Dashboard-Final-Design.html
 * `RECENT_VIEWS` (~L1206-1211).
 */

export type RecentViewType = 'Traceability' | 'Compare' | 'Impact' | 'Explorer';
export type RecentViewStatus = 'Active' | 'Draft';

export interface RecentView {
  id: string;
  type: RecentViewType;
  label: string;
  when: string;
  status: RecentViewStatus;
}

export const RECENT_VIEWS: RecentView[] = [
  {
    id: 'r1',
    type: 'Traceability',
    label: 'GBL-FG-PED-15K-US — Pedigree Adult Dry (15kg)',
    when: '8/10/2026',
    status: 'Active',
  },
  {
    id: 'r2',
    type: 'Compare',
    label: 'GBL-FG-MMS-US — M&M’s Sharing Pouch (US vs EU)',
    when: 'Yesterday',
    status: 'Active',
  },
  {
    id: 'r3',
    type: 'Impact',
    label: 'GBL-ING-WHEAT-WHL-01 — Whole Grain Wheat',
    when: '2 days ago',
    status: 'Active',
  },
  {
    id: 'r4',
    type: 'Explorer',
    label: 'GBL-FG-BOR-AP — Ben’s Original Express Rice (APAC)',
    when: '3 days ago',
    status: 'Draft',
  },
];
