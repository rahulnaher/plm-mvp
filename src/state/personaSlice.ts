import type { StateCreator } from 'zustand';

/**
 * The 3 personas the Header's Role dropdown switches between. Persona-based
 * masking logic that reads/applies this value is out of scope for this
 * story (Epic 6) — this slice only stores the current selection.
 */
export type Persona = 'R&D Scientist' | 'General Associate' | 'Finance & Business';

export const PERSONA_OPTIONS: readonly Persona[] = [
  'R&D Scientist',
  'General Associate',
  'Finance & Business',
];

export interface PersonaSlice {
  persona: Persona;
  setPersona: (persona: Persona) => void;
}

export const createPersonaSlice: StateCreator<PersonaSlice> = (set) => ({
  persona: 'R&D Scientist',
  setPersona: (persona) => set({ persona }),
});
