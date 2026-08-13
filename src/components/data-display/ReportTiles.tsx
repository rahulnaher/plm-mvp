import { Link } from 'react-router-dom';
import type { ComponentType, SVGProps } from 'react';
import { ExplorerIcon } from '../icons/ExplorerIcon';
import { TraceabilityIcon } from '../icons/TraceabilityIcon';
import { ImpactIcon } from '../icons/ImpactIcon';
import { CompareIcon } from '../icons/CompareIcon';

interface Tile {
  label: string;
  to: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  highlight?: boolean;
}

// Order/labels/routes/icons match Sidebar.tsx's primaryNav + analysisNav
// entries verbatim (minus PLM Hub, which isn't a report tile). Traceability
// is flagged `highlight` to reproduce the reference design's emphasis on
// the hero recursive-traversal feature -- see Design Notes in the spec.
const TILES: Tile[] = [
  { label: 'Specification Explorer', to: '/explorer', Icon: ExplorerIcon },
  { label: 'Top-Down Traceability', to: '/traceability', Icon: TraceabilityIcon, highlight: true },
  { label: 'Bottom-Up Impact', to: '/impact', Icon: ImpactIcon },
  { label: 'Compare Specs', to: '/compare', Icon: CompareIcon },
];

/**
 * 4 Report Tiles -- real react-router `Link`s to the already-mounted
 * Explorer/Traceability/Impact/Compare placeholder routes. Presentational,
 * no props. The other 3 tiles render uniformly (white surface,
 * `--color-blue-50` icon badge, `--color-accent` icon) consistent with
 * `KpiCard`'s styling; Traceability gets a dark `--color-navy-800`
 * background with white text/icon (the same token `Sidebar.tsx` already
 * uses for its active-nav-item state -- no new CSS tokens).
 *
 * Reference: decoded reference/Claude Code Handoff Package/Dashboard-Final-Design.html
 * `.tile-card` CSS (~L658), markup (~L825-832).
 */
export function ReportTiles() {
  return (
    <div data-testid="report-tiles" className="mt-4.5 flex flex-wrap gap-4">
      {TILES.map(({ label, to, Icon, highlight }) => (
        <Link
          key={to}
          to={to}
          className={
            'min-w-[200px] flex-1 rounded-lg p-5 shadow-sm transition-shadow hover:shadow-md ' +
            (highlight ? 'bg-navy-800' : 'bg-surface')
          }
        >
          <div
            className={
              'mb-3.5 flex h-[38px] w-[38px] items-center justify-center rounded-md ' +
              (highlight ? 'bg-white/15 text-white' : 'bg-blue-50 text-accent')
            }
          >
            <Icon />
          </div>
          <div
            className={
              'font-display text-base font-extrabold ' + (highlight ? 'text-white' : 'text-strong')
            }
          >
            {label}
          </div>
        </Link>
      ))}
    </div>
  );
}
