import { PERSONA_OPTIONS, type Persona } from '../../state/personaSlice';
import { useAppStore } from '../../state/store';

/**
 * Role `<select>` bound to `personaSlice`. Selecting a role only updates
 * store state — no screen reads or applies masking from it yet (Epic 6).
 */
export function RoleSwitch() {
  const persona = useAppStore((state) => state.persona);
  const setPersona = useAppStore((state) => state.setPersona);

  return (
    <label className="flex items-center gap-2">
      <span className="font-label text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
        Role
      </span>
      <select
        aria-label="Role"
        value={persona}
        onChange={(event) => setPersona(event.target.value as Persona)}
        className="rounded-pill border border-sky-200 bg-blue-50 px-3.5 py-1.5 font-label text-xs font-bold tracking-[0.04em] text-navy-800 uppercase"
      >
        {PERSONA_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
