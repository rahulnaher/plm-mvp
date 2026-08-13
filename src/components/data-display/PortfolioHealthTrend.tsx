import type { SegmentHealth } from '../../logic/computeSegmentHealth';

export interface PortfolioHealthTrendProps {
  data: SegmentHealth[];
}

/**
 * Presentational stacked-pill-bar rows -- inline CSS width-% divs, not
 * Recharts (Recharts stays an unused pinned dependency until a later story
 * needs real charting).
 *
 * DELIBERATELY NON-FILTER-REACTIVE: this component only ever renders
 * whatever `data` it's given -- its caller (`Hub/index.tsx`) must call
 * `computeSegmentHealth()` directly, with no arguments, never derive `data`
 * from filter state. `data-testid="portfolio-health-trend"` exists
 * specifically to target the "never changes on any Apply" regression test
 * in test/hub.test.tsx.
 *
 * Reference: decoded reference/Claude Code Handoff Package/Dashboard-Final-Design.html
 * markup (~L799-822).
 */
export function PortfolioHealthTrend({ data }: PortfolioHealthTrendProps) {
  return (
    <div
      data-testid="portfolio-health-trend"
      className="min-w-0 flex-1 rounded-lg bg-surface p-5 shadow-sm"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-display m-0 text-base font-bold text-strong">Portfolio Health Trend</h3>
        <span className="text-xs text-muted">Active vs Phased Out</span>
      </div>

      <div className="flex flex-col gap-4">
        {data.map((row) => (
          <div key={row.segment}>
            <div className="mb-1.5 flex justify-between text-sm">
              <span className="font-bold text-strong">{row.segment}</span>
              <span className="text-muted">{row.total.toLocaleString('en-US')} Specs</span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-pill bg-ink-100">
              <div
                className="h-full"
                style={{ width: `${row.activePct}%`, background: 'var(--color-teal-600)' }}
              />
              <div
                className="h-full"
                style={{ width: `${row.phasedPct}%`, background: 'var(--color-ink-300)' }}
              />
            </div>
            <div className="mt-1 flex gap-3 text-xs text-muted">
              <span>● {row.active.toLocaleString('en-US')} Active</span>
              <span>● {row.phasedOut.toLocaleString('en-US')} Phased Out</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
