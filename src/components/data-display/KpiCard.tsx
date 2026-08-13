export interface KpiCardProps {
  value: string | number;
  label: string;
  /** CSS color value (e.g. `var(--color-teal-600)`); defaults to the strong-text token. */
  valueColor?: string;
}

/**
 * Presentational KPI card: a large value over an uppercase label. Reused 3x
 * in the Hub's KPI strip. Reference: decoded reference/Claude Code Handoff
 * Package/Dashboard-Final-Design.html `.kpi-card`/`.kpi-val`/`.kpi-label`
 * (~L654-656).
 */
export function KpiCard({ value, label, valueColor }: KpiCardProps) {
  return (
    <div className="min-w-0 flex-1 rounded-lg bg-surface p-5 shadow-sm">
      <div
        className="font-display text-[2rem] leading-none font-extrabold text-strong"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </div>
      <div className="font-label mt-1.5 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
        {label}
      </div>
    </div>
  );
}
