import { create } from 'zustand';
import { createPersonaSlice, type PersonaSlice } from './personaSlice';

/**
 * The single Zustand store for all shared cross-screen state (AD-5). Only
 * `personaSlice` exists as of this story; `explorerSlice` and
 * `drillTargetSlice` land in Epic 2. No screen/component may hold its own
 * `useState` for state that belongs in one of this store's slices.
 */
export type AppState = PersonaSlice;

export const useAppStore = create<AppState>()((...args) => ({
  ...createPersonaSlice(...args),
}));
