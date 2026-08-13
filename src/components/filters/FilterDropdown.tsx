import { useEffect, useRef } from 'react';

export interface FilterDropdownProps<T extends string> {
  label: string;
  options: readonly T[];
  /** Current pending (unapplied) selection -- checkbox state. */
  pending: ReadonlySet<T>;
  /** Size of the last-applied selection, shown on the trigger button. */
  appliedCount: number;
  isOpen: boolean;
  applyDisabled: boolean;
  onOpen: () => void;
  onToggleOption: (option: T) => void;
  onApply: () => void;
  onCancel: () => void;
  /** Panel closed by an outside click, without applying or cancelling. */
  onRequestClose: () => void;
}

/**
 * Generic checkbox-multiselect dropdown: a trigger button showing
 * `label (appliedCount)` that opens a panel of checkboxes gated behind
 * Apply/Cancel. Open/closed state and pending vs. applied selection are
 * fully owned by the caller (`useHubFilters`) -- this component only
 * renders that state and detects outside clicks.
 *
 * Markup/CSS reference: decoded reference/Claude Code Handoff
 * Package/Dashboard-Final-Design.html `.filter-dd-btn`/`.filter-dd-panel`/
 * `.dd-footer` (~L660-767).
 */
export function FilterDropdown<T extends string>({
  label,
  options,
  pending,
  appliedCount,
  isOpen,
  applyDisabled,
  onOpen,
  onToggleOption,
  onApply,
  onCancel,
  onRequestClose,
}: FilterDropdownProps<T>) {
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

  const panelId = `filter-dd-panel-${label.replace(/\s+/g, '-').toLowerCase()}`;

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
          className="absolute top-[calc(100%+6px)] left-0 z-20 min-w-[190px] rounded-md border border-canvas-line bg-surface p-3 shadow-md"
        >
          {options.map((option) => (
            <label key={option} className="flex items-center gap-2 px-1 py-1.5 text-sm text-body">
              <input
                type="checkbox"
                checked={pending.has(option)}
                onChange={() => onToggleOption(option)}
              />
              {option}
            </label>
          ))}
          <div className="mt-2 flex justify-end gap-2 border-t border-hairline pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-sm border border-canvas-line bg-surface px-3 py-1.5 text-xs font-semibold text-body"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onApply}
              disabled={applyDisabled}
              className="rounded-sm bg-accent px-3 py-1.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
