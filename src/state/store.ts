import { create } from 'zustand';
import { createPersonaSlice, type PersonaSlice } from './personaSlice';
import { createExplorerSlice, type ExplorerSlice } from './explorerSlice';
import { createDrillTargetSlice, type DrillTargetSlice } from './drillTargetSlice';

/**
 * The single Zustand store for all shared cross-screen state (AD-5).
 * `personaSlice` (Story 2.1), `explorerSlice` (Story 2.3), and
 * `drillTargetSlice` (Story 2.4) exist so far. No screen/component may
 * hold its own `useState` for state that belongs in one of this store's
 * slices (Explorer's column sort order is the one deliberate exception --
 * not a cross-screen concern, stays local component state per that
 * story's Boundaries).
 */
export type AppState = PersonaSlice & ExplorerSlice & DrillTargetSlice;

export const useAppStore = create<AppState>()((...args) => ({
  ...createPersonaSlice(...args),
  ...createExplorerSlice(...args),
  ...createDrillTargetSlice(...args),
}));
