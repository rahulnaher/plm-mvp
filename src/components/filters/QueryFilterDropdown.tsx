import { useEffect, useRef } from 'react';

export interface QueryFilterDropdownGroup<T extends string> {
  label: string;
  options: readonly T[];
}

export interface QueryFilterDropdownProps<T extends string> {
  label: string;
  /** Flat option list -- ignored when `groups` is given. */
  options: readonly T[];
  /** Optional labeled clusters (e.g. Status's Active/In Progress/Needs
   * Attention/Phased Out groups) rendered as sub-headed sections instead
   * of one flat checkbox list. Presentational only -- the underlying
   * pending `Set` still stores individual option strings. */
  groups?: readonly QueryFilterDropdownGroup<T>[];
  /** Current pending (unapplied) selection -- checkbox state. */
  pending: ReadonlySet<T>;
  /** Size of the last-Execute-Query-applied selection, shown on the
   * trigger button -- deliberately NOT `pending.size`, so a checked box
   * never moves the badge before Execute Query is clicked. */
  appliedCount: number;
  isOpen: boolean;
  onOpen: () => void;
  onToggleOption: (option: T) => void;
  /** Panel closed by an outside click -- toggles here already mutated
   * pending state directly (no per-dropdown Apply/Cancel footer, unlike
   * `FilterDropdown`), so closing never reverts anything. */
  onRequestClose: () => void;
}

/**
 * Explorer's checkbox-multiselect popover: a trigger button showing
 * `label (appliedCount)` that opens a panel of checkboxes, optionally
 * clustered into labeled groups. Every checkbox toggle mutates pending
 * state immediately -- there is no Apply/Cancel footer here, because
 * Explorer commits every filter dimension at once via one "Execute Query"
 * button (FR-8), unlike Hub's `FilterDropdown` (one Apply/Cancel gate per
 * dimension). Reuses `FilterDropdown.tsx:44-57`'s outside-click-ref
 * pattern verbatim; `FilterDropdown.tsx` itself is left unmodified per
 * this story's Boundaries.
 */
export function QueryFilterDropdown<T extends string>({
  label,
  options,
  groups,
  pending,
  appliedCount,
  isOpen,
  onOpen,
  onToggleOption,
  onRequestClose,
}: QueryFilterDropdownProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onRequestClose();
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen, onRequestClose]);

  const panelId = `query-filter-panel-${label.replace(/\s+/g, '-').toLowerCase()}`;

  function renderOption(option: T) {
    return (
      <label key={option} className="flex items-center gap-2 px-1 py-1.5 text-sm text-body">
        <input type="checkbox" checked={pending.has(option)} onChange={() => onToggleOption(option)} />
        {option}
      </label>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={onOpen}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={isOpen ? panelId : undefined}
        className="flex items-center gap-2 rounded-md border border-canvas-line bg-surface px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-strong hover:border-accent"
      >
        {label} ({appliedCount}) <span aria-hidden="true">&#9662;</span>
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="group"
          aria-label={`${label} options`}
          className="absolute top-[calc(100%+6px)] left-0 z-20 max-h-[320px] min-w-[220px] overflow-y-auto rounded-md border border-canvas-line bg-surface p-3 shadow-md"
        >
          {groups ? (
            groups.map((group) => (
              <div key={group.label} className="mb-2 last:mb-0">
                <div className="font-label px-1 py-1 text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
                  {group.label}
                </div>
                {group.options.map(renderOption)}
              </div>
            ))
          ) : (
            options.map(renderOption)
          )}
        </div>
      )}
    </div>
  );
}
