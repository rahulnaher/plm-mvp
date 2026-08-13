import { create } from 'zustand';
import { createPersonaSlice, type PersonaSlice } from './personaSlice';
import { createExplorerSlice, type ExplorerSlice } from './explorerSlice';

/**
 * The single Zustand store for all shared cross-screen state (AD-5).
 * `personaSlice` (Story 2.1) and `explorerSlice` (Story 2.3) exist so far;
 * `drillTargetSlice` lands later in Epic 2. No screen/component may hold
 * its own `useState` for state that belongs in one of this store's slices
 * (Explorer's column sort order is the one deliberate exception -- not a
 * cross-screen concern, stays local component state per that story's
 * Boundaries).
 */
export type AppState = PersonaSlice & ExplorerSlice;

export const useAppStore = create<AppState>()((...args) => ({
  ...createPersonaSlice(...args),
  ...createExplorerSlice(...args),
}));
