import type { RecentView, RecentViewStatus } from '../../data/hubRecentViews';

export interface RecentViewsTableProps {
  views: RecentView[];
}

const statusMeta: Record<RecentViewStatus, { bg: string; fg: string }> = {
  Active: { bg: 'var(--color-teal-100)', fg: 'var(--color-teal-600)' },
  Draft: { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning-fg)' },
};

/**
 * Presentational Recent/Pinned Views table: 4 static rows (Global Spec ID
 * label, Type, Timestamp, Status badge). Row label and "View Full
 * Portfolio" render as inert `<span>`s, never `<a>` -- their destinations
 * are undefined per epics.md, matching `AlertsList.linkLabel`'s "no broken
 * links" precedent. `statusMeta` mirrors `AlertsList.tsx`'s `severityMeta`
 * pattern.
 *
 * Reference: decoded reference/Claude Code Handoff Package/Dashboard-Final-Design.html
 * markup (~L834-852).
 */
export function RecentViewsTable({ views }: RecentViewsTableProps) {
  return (
    <div className="mt-4.5 rounded-lg bg-surface p-5 shadow-sm">
      <div className="mb-3.5 flex items-baseline justify-between">
        <h3 className="font-display m-0 text-base font-bold text-strong">My Pinned &amp; Recent Views</h3>
        <span className="text-[0.8rem] font-semibold text-accent">View Full Portfolio</span>
      </div>

      <table data-testid="recent-views-table" className="w-full border-collapse">
        <thead>
          <tr>
            <th className="font-label border-b border-line py-0 pr-3 pb-2.5 text-left text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
              Global Spec ID
            </th>
            <th className="font-label border-b border-line py-0 pr-3 pb-2.5 text-left text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
              Type
            </th>
            <th className="font-label border-b border-line py-0 pr-3 pb-2.5 text-left text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
              Timestamp
            </th>
            <th className="font-label border-b border-line py-0 pb-2.5 text-left text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {views.map((view) => {
            const meta = statusMeta[view.status];
            return (
              <tr key={view.id}>
                <td className="border-b border-hairline py-2.5 pr-3 text-[0.83rem] text-body">
                  <span>{view.label}</span>
                </td>
                <td className="border-b border-hairline py-2.5 pr-3 text-[0.83rem] text-body">
                  {view.type}
                </td>
                <td className="border-b border-hairline py-2.5 pr-3 text-[0.83rem] text-muted">
                  {view.when}
                </td>
                <td className="border-b border-hairline py-2.5 text-[0.83rem]">
                  <span
                    className="rounded-pill px-2.5 py-1 text-[11px] font-bold"
                    style={{ background: meta.bg, color: meta.fg }}
                  >
                    {view.status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
