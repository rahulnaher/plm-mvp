import { ALERTS, type Alert } from '../data/hubAlerts';
import type { Segment } from '../data/hubKpiAggregate';

/**
 * Pure segment-only filter over `ALERTS`. Region is intentionally not a
 * parameter here -- the Alerts List must filter strictly by applied Segment
 * and never react to Region changes (epic-1-context.md).
 * React/Zustand-free (hexagonal core) -- reference: decoded
 * Dashboard-Final-Design.html `renderVals()` alerts derivation (~L1557-1559).
 */
export function computeHubAlerts(appliedSegments: ReadonlySet<Segment>): Alert[] {
  return ALERTS.filter((alert) => appliedSegments.has(alert.segment));
}
