import type { StateCreator } from 'zustand';
import type { MaterialId } from '../logic/types';
import {
  MATERIAL_STATUSES,
  MATERIAL_TYPES,
  REGIONS,
  SEGMENTS,
  type MaterialStatus,
  type MaterialType,
  type Region,
  type Segment,
} from '../data/catalog';

/**
 * The Explorer Query Builder's filter shape (Story 2.3, FR-8): free text
 * plus the 4 checkbox dimensions, each stored as a `Set` (never an array --
 * cheap `.has()` membership checks for both the checkbox UI and the
 * `ResultsTable` filter predicate). `pendingFilters`/`appliedFilters` are
 * two independent instances of this same shape -- never a single filter
 * object with a "dirty" flag -- so `executeQuery` can commit one to the
 * other in a single atomic `set()` call (Boundaries: one Execute Query
 * gate, never per-checkbox auto-apply).
 */
export interface ExplorerFilters {
  text: string;
  materialTypes: Set<MaterialType>;
  regions: Set<Region>;
  segments: Set<Segment>;
  statuses: Set<MaterialStatus>;
}

/** Default filters: every dimension all-selected, empty free text -- the
 * "all 48 catalog materials appear as rows" default-load acceptance
 * criterion. */
function createDefaultFilters(): ExplorerFilters {
  return {
    text: '',
    materialTypes: new Set(MATERIAL_TYPES),
    regions: new Set(REGIONS),
    segments: new Set(SEGMENTS),
    statuses: new Set(MATERIAL_STATUSES),
  };
}

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export interface ExplorerSlice {
  pendingFilters: ExplorerFilters;
  appliedFilters: ExplorerFilters;
  /** Row-selection state (per-row select checkbox). Story 2.4's floating
   * "Compare Selected" CTA reads this later -- out of scope here. */
  selectedMaterialIds: Set<MaterialId>;
  setPendingText: (text: string) => void;
  togglePendingType: (type: MaterialType) => void;
  togglePendingRegion: (region: Region) => void;
  togglePendingSegment: (segment: Segment) => void;
  togglePendingStatus: (status: MaterialStatus) => void;
  /** Commits every pending filter to applied in one call (FR-8) -- the
   * single "Execute Query" gate. */
  executeQuery: () => void;
  toggleRowSelection: (materialId: MaterialId) => void;
  /** Idempotent add for the ⋮ menu's "Add to Compare" action (Story 2.4,
   * FR-10) -- deliberately separate from `toggleRowSelection` so clicking
   * it on an already-checked row never deselects it (the row checkbox is
   * the only writer allowed to remove a row from this set). */
  addRowToSelection: (materialId: MaterialId) => void;
}

export const createExplorerSlice: StateCreator<ExplorerSlice> = (set, get) => ({
  pendingFilters: createDefaultFilters(),
  appliedFilters: createDefaultFilters(),
  selectedMaterialIds: new Set(),

  setPendingText: (text) =>
    set((state) => ({ pendingFilters: { ...state.pendingFilters, text } })),

  togglePendingType: (type) =>
    set((state) => ({
      pendingFilters: {
        ...state.pendingFilters,
        materialTypes: toggleInSet(state.pendingFilters.materialTypes, type),
      },
    })),

  togglePendingRegion: (region) =>
    set((state) => ({
      pendingFilters: {
        ...state.pendingFilters,
        regions: toggleInSet(state.pendingFilters.regions, region),
      },
    })),

  togglePendingSegment: (segment) =>
    set((state) => ({
      pendingFilters: {
        ...state.pendingFilters,
        segments: toggleInSet(state.pendingFilters.segments, segment),
      },
    })),

  togglePendingStatus: (status) =>
    set((state) => ({
      pendingFilters: {
        ...state.pendingFilters,
        statuses: toggleInSet(state.pendingFilters.statuses, status),
      },
    })),

  executeQuery: () =>
    set((state) => ({
      appliedFilters: {
        text: state.pendingFilters.text,
        materialTypes: new Set(state.pendingFilters.materialTypes),
        regions: new Set(state.pendingFilters.regions),
        segments: new Set(state.pendingFilters.segments),
        statuses: new Set(state.pendingFilters.statuses),
      },
    })),

  toggleRowSelection: (materialId) =>
    set((state) => ({
      selectedMaterialIds: toggleInSet(state.selectedMaterialIds, materialId),
    })),

  addRowToSelection: (materialId) => {
    // True no-op when already selected -- skip `set` entirely so this
    // never replaces the store's state object / notifies subscribers for
    // a call that changes nothing (unlike `toggleRowSelection`, which
    // always legitimately changes the set).
    if (get().selectedMaterialIds.has(materialId)) return;
    set((state) => ({ selectedMaterialIds: new Set(state.selectedMaterialIds).add(materialId) }));
  },
});

/** Exposed for `test/screens/explorer.test.tsx` to reset store state
 * between tests (matching `app.test.tsx`'s `useAppStore.setState({ persona
 * ... })` reset precedent) without duplicating the default-filter shape. */
export { createDefaultFilters as createDefaultExplorerFilters };
