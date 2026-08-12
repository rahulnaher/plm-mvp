import { SearchIcon } from '../icons/SearchIcon';
import { BellIcon } from '../icons/BellIcon';
import { RoleSwitch } from './RoleSwitch';

/** Fixed 64px Header: search stub, Role dropdown, notification-bell stub. */
export function Header() {
  return (
    <header
      className="flex shrink-0 items-center gap-4 border-b border-hairline bg-surface px-7"
      style={{ height: 'var(--header-height)' }}
    >
      <div className="flex max-w-[420px] flex-1 items-center gap-2 rounded-pill border border-canvas-line bg-sunken px-4 py-2">
        <SearchIcon className="text-muted" />
        <span className="text-sm text-muted">Global Spec Search (FERT, REAL_SUB, ROH)&hellip;</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <RoleSwitch />
        <BellIcon className="text-muted" aria-label="Notifications" />
      </div>
    </header>
  );
}
