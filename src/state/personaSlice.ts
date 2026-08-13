import type { StateCreator } from 'zustand';
import type { Persona } from '../logic/types';
import { PERSONAS as PERSONA_OPTIONS } from '../logic/types';

/**
 * The 3 personas the Header's Role dropdown switches between, re-exported
 * from `logic/types.ts`'s canonical `Persona`/`PERSONAS` (Story 2.1) so
 * this slice never drifts from the domain core's definition.
 * Persona-based masking logic that reads/applies this value is out of
 * scope for this story (Epic 6) — this slice only stores the current
 * selection.
 */
export type { Persona };
export { PERSONA_OPTIONS };

export interface PersonaSlice {
  persona: Persona;
  setPersona: (persona: Persona) => void;
}

export const createPersonaSlice: StateCreator<PersonaSlice> = (set) => ({
  persona: 'R&D Scientist',
  setPersona: (persona) => set({ persona }),
});
