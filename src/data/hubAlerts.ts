/**
 * Illustrative Hub Alerts dataset. Filters strictly by applied Segment
 * (never Region) via `computeHubAlerts` -- see epic-1-context.md.
 *
 * React/Zustand-free (hexagonal boundary, lint-enforced via
 * `no-restricted-imports` in eslint.config.js).
 *
 * Source: decoded reference/Claude Code Handoff Package/Dashboard-Final-Design.html
 * `ALERTS` (~L1200-1205).
 */

import type { Segment } from './hubKpiAggregate';

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface Alert {
  id: string;
  severity: AlertSeverity;
  segment: Segment;
  title: string;
  text: string;
  /** Rendered as inert text, never a functional `href` (no-broken-links precedent). */
  linkLabel: string;
}

export const ALERTS: Alert[] = [
  {
    id: 'a1',
    severity: 'critical',
    segment: 'Petcare',
    title: 'Critical Data Missing',
    text: '1 Packaging Spec (VERP) in EU is missing a linked technical drawing (DIR).',
    linkLabel: 'Review EU VERP Specs',
  },
  {
    id: 'a2',
    severity: 'warning',
    segment: 'Snacking',
    title: 'Stale Workflows',
    text: '2 NA Master Recipes stuck in Draft status for over 30 days.',
    linkLabel: 'View Stale Workflows',
  },
  {
    id: 'a3',
    severity: 'warning',
    segment: 'Food',
    title: 'Sync Delay',
    text: 'Packaging spec PK-BOR-RICE-APAC-002 has not synced with SAP MDG since Aug 3.',
    linkLabel: 'View Sync Status',
  },
  {
    id: 'a4',
    severity: 'info',
    segment: 'Petcare',
    title: 'System Notification',
    text: 'PLM sync completed successfully. 124 records updated from SAP ECC.',
    linkLabel: '',
  },
];
