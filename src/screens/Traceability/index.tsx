import { useEffect, useRef, useState } from 'react';
import type { Catalog } from '../../data/catalog';
import { BOM_HEADERS, BOM_ITEMS, MATERIALS, MATERIAL_BOM_LINKS } from '../../data/seed';
import { explodeBom } from '../../logic/bomExplosion';
import type { BomNode, MaterialId, TraversalResult } from '../../logic/types';
import { useAppStore } from '../../state/store';

const CATALOG: Catalog = {
  materials: MATERIALS,
  materialBomLinks: MATERIAL_BOM_LINKS,
  bomHeaders: BOM_HEADERS,
  bomItems: BOM_ITEMS,
};

/** Every FERT in the catalog -- the picker's full, uncurated option list. */
const FERT_MATERIALS = MATERIALS.filter((m) => m.materialType === 'FERT');

/** Node count for the `'ok'`-state placeholder (root + every descendant),
 * a screen-local display concern only -- not part of `explodeBom`'s
 * output shape. */
function countNodes(node: BomNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

/**
 * Root FERT Picker over ALL catalog FERTs, wired directly to
 * `explodeBom`. Initial selection defaults to `drillTarget.materialId`
 * when one is set. Every selection -- initial or user-changed --
 * replaces the prior `TraversalResult` outright, so no stale
 * tree/empty-state from a previous root is ever visible. Rendering
 * branches on `TraversalResult.status` only -- `'ok'`/`'empty'` share
 * one path, never a material-id-based special case.
 *
 * Selected root + result are screen-local state -- no new zustand
 * slice; `drillTarget` is the only cross-screen state read here.
 */
export default function Traceability() {
  const drillTarget = useAppStore((s) => s.drillTarget);

  const [selectedMaterialId, setSelectedMaterialId] = useState<MaterialId | null>(
    () => drillTarget?.materialId ?? null,
  );
  const [result, setResult] = useState<TraversalResult | null>(() =>
    drillTarget ? explodeBom(drillTarget.materialId, CATALOG) : null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  function handleSelect(materialId: MaterialId) {
    setSelectedMaterialId(materialId);
    setResult(explodeBom(materialId, CATALOG));
    setIsOpen(false);
  }

  // Looked up against the full catalog, not just `FERT_MATERIALS` -- a
  // `drillTarget` written by a non-explode-bom source (e.g. blast-radius
  // analysis on a raw material) can point at a non-FERT id, and the
  // button label must still match whatever `result` is showing.
  const selectedMaterial = MATERIALS.find((m) => m.materialId === selectedMaterialId);
  const nodeCount = result?.status === 'ok' ? countNodes(result.tree) : 0;

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-strong">Top-Down Traceability</h1>

      <div ref={containerRef} className="relative mt-4.5">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={isOpen ? 'root-fert-picker-panel' : undefined}
          className="flex max-w-[420px] items-center gap-2 rounded-md border border-canvas-line bg-surface px-3.5 py-2 text-sm font-semibold text-strong hover:border-accent"
        >
          <span className="truncate">
            {selectedMaterial ? `${selectedMaterial.materialId} — ${selectedMaterial.name}` : 'Select a Root FERT…'}
          </span>
          <span aria-hidden="true" className="shrink-0">
            &#9662;
          </span>
        </button>

        {isOpen && (
          <div
            id="root-fert-picker-panel"
            role="listbox"
            aria-label="Root FERT"
            className="absolute top-[calc(100%+6px)] left-0 z-20 max-h-[320px] min-w-[340px] overflow-y-auto rounded-md border border-canvas-line bg-surface p-3 shadow-md"
          >
            {FERT_MATERIALS.map((material) => (
              <button
                key={material.materialId}
                type="button"
                role="option"
                aria-selected={material.materialId === selectedMaterialId}
                onClick={() => handleSelect(material.materialId)}
                className="block w-full rounded-sm px-2 py-1.5 text-left text-sm text-body hover:bg-sunken"
              >
                {material.materialId} — {material.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {result &&
        (result.status === 'ok' ? (
          <p className="mt-4.5 text-sm text-muted">
            {result.tree.material.name} — {nodeCount} node{nodeCount === 1 ? '' : 's'}
          </p>
        ) : (
          <p className="mt-4.5 text-sm text-muted">{result.reason}</p>
        ))}
    </div>
  );
}
