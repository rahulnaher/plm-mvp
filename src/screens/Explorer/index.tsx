import { useMemo, useState } from 'react';
import { MATERIAL_TYPES, REGIONS, SEGMENTS, type Material } from '../../data/catalog';
import { BOM_ITEMS, MATERIALS } from '../../data/seed';
import { QueryFilterDropdown } from '../../components/filters/QueryFilterDropdown';
import { ResultsTable, STATUS_GROUPS } from '../../components/data-display/ResultsTable';
import { useAppStore } from '../../state/store';
import type { ExplorerFilters } from '../../state/explorerSlice';

/** Applied-filter predicate: every dimension must match (AND across
 * dimensions), free text matches substring case-insensitive against
 * materialId + name (I/O Matrix "Combined filters"). An empty `Set` for
 * any dimension yields zero matches -- "Execute with dimension cleared" is
 * a real empty result, never treated as "no filter". */
function matchesFilters(material: Material, filters: ExplorerFilters): boolean {
  if (!filters.materialTypes.has(material.materialType)) return false;
  if (!filters.regions.has(material.region)) return false;
  if (!filters.segments.has(material.segment)) return false;
  if (!filters.statuses.has(material.status)) return false;

  const query = filters.text.trim().toLowerCase();
  if (query) {
    const haystack = `${material.materialId} ${material.name}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }

  return true;
}

/**
 * Specification Explorer (Story 2.3): a Query Builder toolbar (free text +
 * 4 checkbox filter dimensions, all pending-only until "Execute Query" is
 * clicked per FR-8) over a sortable `ResultsTable` rendering `MATERIALS`.
 * All query/selection state lives in `explorerSlice` (AD-5) -- this screen
 * only reads it and computes the applied-filtered row set.
 */
export default function Explorer() {
  const pendingFilters = useAppStore((s) => s.pendingFilters);
  const appliedFilters = useAppStore((s) => s.appliedFilters);
  const selectedMaterialIds = useAppStore((s) => s.selectedMaterialIds);
  const setPendingText = useAppStore((s) => s.setPendingText);
  const togglePendingType = useAppStore((s) => s.togglePendingType);
  const togglePendingRegion = useAppStore((s) => s.togglePendingRegion);
  const togglePendingSegment = useAppStore((s) => s.togglePendingSegment);
  const togglePendingStatus = useAppStore((s) => s.togglePendingStatus);
  const executeQuery = useAppStore((s) => s.executeQuery);
  const toggleRowSelection = useAppStore((s) => s.toggleRowSelection);

  const openPanel = usePanelState();

  const visibleMaterials = useMemo(
    () => MATERIALS.filter((material) => matchesFilters(material, appliedFilters)),
    [appliedFilters],
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-strong">Specification Explorer</h1>

      <div className="mt-4.5 flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={pendingFilters.text}
          onChange={(event) => setPendingText(event.target.value)}
          placeholder="Search by Material ID or Name…"
          aria-label="Search by Material ID or Name"
          className="min-w-[220px] flex-1 rounded-pill border border-canvas-line bg-sunken px-4 py-2 text-sm text-body"
        />

        <QueryFilterDropdown
          label="Material Type"
          options={MATERIAL_TYPES}
          pending={pendingFilters.materialTypes}
          appliedCount={appliedFilters.materialTypes.size}
          isOpen={openPanel.current === 'materialType'}
          onOpen={() => openPanel.open('materialType')}
          onToggleOption={togglePendingType}
          onRequestClose={() => openPanel.close('materialType')}
        />

        <QueryFilterDropdown
          label="Region"
          options={REGIONS}
          pending={pendingFilters.regions}
          appliedCount={appliedFilters.regions.size}
          isOpen={openPanel.current === 'region'}
          onOpen={() => openPanel.open('region')}
          onToggleOption={togglePendingRegion}
          onRequestClose={() => openPanel.close('region')}
        />

        <QueryFilterDropdown
          label="Segment"
          options={SEGMENTS}
          pending={pendingFilters.segments}
          appliedCount={appliedFilters.segments.size}
          isOpen={openPanel.current === 'segment'}
          onOpen={() => openPanel.open('segment')}
          onToggleOption={togglePendingSegment}
          onRequestClose={() => openPanel.close('segment')}
        />

        <QueryFilterDropdown
          label="Status"
          options={STATUS_GROUPS.flatMap((g) => g.statuses)}
          groups={STATUS_GROUPS.map((g) => ({ label: g.label, options: g.statuses }))}
          pending={pendingFilters.statuses}
          appliedCount={appliedFilters.statuses.size}
          isOpen={openPanel.current === 'status'}
          onOpen={() => openPanel.open('status')}
          onToggleOption={togglePendingStatus}
          onRequestClose={() => openPanel.close('status')}
        />

        <button
          type="button"
          onClick={executeQuery}
          className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent-strong"
        >
          Execute Query
        </button>
      </div>

      <ResultsTable
        materials={visibleMaterials}
        bomItems={BOM_ITEMS}
        selectedMaterialIds={selectedMaterialIds}
        onToggleRowSelection={toggleRowSelection}
      />
    </div>
  );
}

type PanelKey = 'materialType' | 'region' | 'segment' | 'status';

/** "Only one Query Builder dropdown open at a time" -- screen-local UI
 * state (matches `useHubFilters`'s `openPanel` precedent), not a store
 * concern since it's not shared across screens. */
function usePanelState() {
  const [current, setCurrent] = useState<PanelKey | null>(null);

  return {
    current,
    open: (key: PanelKey) => setCurrent(key),
    close: (key: PanelKey) => setCurrent((prev) => (prev === key ? null : prev)),
  };
}
