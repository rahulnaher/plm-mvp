import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { MaterialId } from '../../logic/types';

export interface RowActionMenuProps {
  materialId: MaterialId;
  onExplodeBom: (materialId: MaterialId) => void;
  onAnalyzeBlastRadius: (materialId: MaterialId) => void;
  onAddToCompare: (materialId: MaterialId) => void;
}

/**
 * Per-row ⋮ action menu (Story 2.4, FR-10): exactly 3 actions, always in
 * this order -- Explode BOM, Analyze Blast Radius, Add to Compare. Reuses
 * `QueryFilterDropdown.tsx:56-67`'s outside-click-ref open/close pattern
 * (never `FilterDropdown.tsx`'s Apply/Cancel-gated variant, since this
 * menu has no pending/applied distinction -- every click fires
 * immediately and closes the menu), extended with the full ARIA `menu`
 * keyboard contract its `role="menu"`/`role="menuitem"` markup implies:
 * focus moves into the first item on open, `ArrowUp`/`ArrowDown` cycle
 * (wrapping) between the 3 items, `Escape` closes and returns focus to
 * the trigger, and any activation (item click, Escape, outside
 * click/focus) closes the menu -- including focus moving to a different
 * row's trigger via keyboard, not just a `mousedown` elsewhere.
 */
export function RowActionMenu({ materialId, onExplodeBom, onAnalyzeBlastRadius, onAddToCompare }: RowActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const triggerId = `row-action-trigger-${materialId}`;
  const menuId = `row-action-menu-${materialId}`;

  const actions: { label: string; onSelect: (materialId: MaterialId) => void }[] = [
    { label: 'Explode BOM', onSelect: onExplodeBom },
    { label: 'Analyze Blast Radius', onSelect: onAnalyzeBlastRadius },
    { label: 'Add to Compare', onSelect: onAddToCompare },
  ];

  // Outside interaction closes the menu -- both a `mousedown` elsewhere AND
  // focus moving elsewhere (e.g. Tab, or activating a different row's ⋮
  // trigger via Enter/Space with no mouse involved at all), so a second
  // menu opening via keyboard always closes this one first.
  useEffect(() => {
    if (!isOpen) return;

    function handleOutsideInteraction(event: MouseEvent | FocusEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideInteraction);
    document.addEventListener('focusin', handleOutsideInteraction);
    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('focusin', handleOutsideInteraction);
    };
  }, [isOpen]);

  // Move focus into the menu (first item) whenever it opens.
  useEffect(() => {
    if (isOpen) {
      itemRefs.current[0]?.focus();
    }
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function handleAction(action: (materialId: MaterialId) => void) {
    action(materialId);
    closeMenu();
  }

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const items = itemRefs.current.filter((el): el is HTMLButtonElement => el !== null);
    if (items.length === 0) return;
    const currentIndex = items.findIndex((el) => el === document.activeElement);

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      items[(currentIndex + 1) % items.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      items[(currentIndex - 1 + items.length) % items.length]?.focus();
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={isOpen ? menuId : undefined}
        aria-label={`Actions for ${materialId}`}
        className="flex h-7 w-7 items-center justify-center rounded-md bg-transparent text-body hover:bg-sunken"
      >
        <span aria-hidden="true">&#8942;</span>
      </button>

      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          onKeyDown={handleMenuKeyDown}
          className="absolute top-[calc(100%+4px)] right-0 z-20 min-w-[190px] rounded-md border border-canvas-line bg-surface p-1.5 shadow-md"
        >
          {actions.map(({ label, onSelect }, index) => (
            <button
              key={label}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              type="button"
              role="menuitem"
              onClick={() => handleAction(onSelect)}
              className="block w-full rounded-sm px-3 py-1.5 text-left text-sm text-body hover:bg-sunken"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
