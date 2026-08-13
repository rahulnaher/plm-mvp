import type { StateCreator } from 'zustand';
import type { DrillTarget } from '../logic/types';

/**
 * AD-5's pinned cross-screen drill-target slice (Story 2.4): which
 * material the ⋮ row-action menu's "Explode BOM" / "Analyze Blast Radius"
 * actions navigated to, and which action wrote it. A sibling slice to
 * `personaSlice`/`explorerSlice`, never folded into `explorerSlice` --
 * selection (`selectedMaterialIds`) and drill-target are two independent
 * concerns Epic 3/4 read separately. Default `null` -- no target until a
 * row action writes one.
 */
export interface DrillTargetSlice {
  drillTarget: DrillTarget;
  setDrillTarget: (target: DrillTarget) => void;
}

export const createDrillTargetSlice: StateCreator<DrillTargetSlice> = (set) => ({
  drillTarget: null,
  setDrillTarget: (target) => set({ drillTarget: target }),
});
