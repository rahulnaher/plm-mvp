import { Link, useLocation } from 'react-router-dom';
import type { ComponentType, SVGProps } from 'react';
import { HubIcon } from '../icons/HubIcon';
import { ExplorerIcon } from '../icons/ExplorerIcon';
import { TraceabilityIcon } from '../icons/TraceabilityIcon';
import { ImpactIcon } from '../icons/ImpactIcon';
import { CompareIcon } from '../icons/CompareIcon';

interface NavEntry {
  label: string;
  to: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

// Order per reference design: PLM Hub, Specification Explorer, then the
// "Analysis" group (Traceability, Impact, Compare).
const primaryNav: NavEntry[] = [
  { label: 'PLM Hub', to: '/hub', Icon: HubIcon },
  { label: 'Specification Explorer', to: '/explorer', Icon: ExplorerIcon },
];

const analysisNav: NavEntry[] = [
  { label: 'Top-Down Traceability', to: '/traceability', Icon: TraceabilityIcon },
  { label: 'Bottom-Up Impact', to: '/impact', Icon: ImpactIcon },
  { label: 'Compare Specs', to: '/compare', Icon: CompareIcon },
];

function NavItem({ entry, isActive }: { entry: NavEntry; isActive: boolean }) {
  const { label, to, Icon } = entry;
  return (
    <Link
      to={to}
      aria-current={isActive ? 'page' : undefined}
      className={
        'flex items-center gap-3 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ' +
        (isActive ? 'bg-navy-800 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white')
      }
    >
      <Icon className="shrink-0" />
      {label}
    </Link>
  );
}

/** Fixed 236px Sidebar: logo, PLM Hub, Specification Explorer, Analysis group. */
export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside
      className="flex shrink-0 flex-col overflow-y-hidden bg-navy-900 px-3 py-5"
      style={{ width: 'var(--sidebar-width)' }}
    >
      <div className="flex items-center gap-2.5 px-2 pt-2 pb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-blue-600 font-display text-lg font-extrabold text-white">
          M
        </div>
        <div className="font-display text-base font-extrabold text-white">Mars PLM</div>
      </div>

      <nav aria-label="Primary" className="flex flex-col gap-1">
        {primaryNav.map((entry) => (
          <NavItem key={entry.to} entry={entry} isActive={pathname === entry.to} />
        ))}
      </nav>

      <div className="font-label pt-5 pr-4 pb-1.5 pl-4 text-[11px] font-semibold tracking-[0.1em] text-sky-400 uppercase">
        Analysis
      </div>

      <nav aria-label="Analysis" className="flex flex-col gap-1">
        {analysisNav.map((entry) => (
          <NavItem key={entry.to} entry={entry} isActive={pathname === entry.to} />
        ))}
      </nav>
    </aside>
  );
}
