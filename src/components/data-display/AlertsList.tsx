import type { Alert, AlertSeverity } from '../../data/hubAlerts';

export interface AlertsListProps {
  alerts: Alert[];
}

const severityMeta: Record<AlertSeverity, { bg: string; fg: string; icon: string; label: string }> = {
  critical: { bg: 'var(--color-critical-bg)', fg: 'var(--color-critical-fg)', icon: '⚠️', label: 'Critical' },
  warning: { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning-fg)', icon: '⏱️', label: 'Warning' },
  info: { bg: 'var(--color-info-bg)', fg: 'var(--color-info-fg)', icon: 'ℹ️', label: 'Info' },
};

/**
 * Presentational alert cards. `alerts` is expected to already be filtered
 * (strictly by applied Segment, never Region -- see `computeHubAlerts`).
 * `linkLabel` renders as inert text, never a functional `href`, matching
 * the project's "no broken links" precedent (epic-1-context.md).
 *
 * Reference: decoded reference/Claude Code Handoff Package/Dashboard-Final-Design.html
 * `.alert-box` CSS (~L657), markup (~L780-797).
 */
export function AlertsList({ alerts }: AlertsListProps) {
  return (
    <div className="min-w-0 flex-[1.4] rounded-lg bg-surface p-5 shadow-sm">
      <h3 className="font-display m-0 mb-3.5 text-base font-bold text-strong">Actionable Alerts</h3>

      {alerts.length === 0 ? (
        <p className="text-sm text-muted">No alerts for the applied Segment selection.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {alerts.map((alert) => {
            const meta = severityMeta[alert.severity];
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-md p-3.5"
                style={{ background: meta.bg }}
              >
                <span aria-hidden="true" className="text-[1.1rem] leading-none">
                  {meta.icon}
                </span>
                <div>
                  <div className="text-sm font-bold" style={{ color: meta.fg }}>
                    <span className="sr-only">{meta.label}: </span>
                    {alert.title}
                  </div>
                  <div className="mt-0.5 text-[0.83rem] text-body">{alert.text}</div>
                  {alert.linkLabel && (
                    <span className="mt-1 block text-[0.8rem] font-semibold text-accent">
                      {alert.linkLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
