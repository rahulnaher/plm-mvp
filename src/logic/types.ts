/**
 * Domain core type contract (Architecture Spine, hexagonal "core"). Pure TS
 * -- no react/zustand imports (lint-enforced, eslint.config.js). Names
 * mirror the PRD Glossary verbatim (prd.md §3): `MaterialId`, `LevelPct`,
 * `LevelKg`, `Persona`, `HeroRoot`, `CatalogBreadthItem`, `TraversalResult`,
 * `ImpactPath`, `MaskedField<T>`, `RelationshipKind`. No synonyms.
 *
 * Types only -- no seed rows, no `explodeBom`/`whereUsed`/`maskRecord`/
 * `compareEngine` implementations. Those are later stories.
 */

import type { Material } from '../data/catalog';

/** Harmonized Global Spec ID -- the canonical cross-region material
 * identity. Never a regional Legacy ID. */
export type MaterialId = string;

/** The formulation percentage a component contributes at its position in
 * a composition tree -- traversal OUTPUT (AD-3), computed cumulative.
 * Never stored on a catalog entity; see `BomItem.formulationPct` in
 * `data/catalog.ts` for the authored leaf input this is computed from. */
export type LevelPct = number;

/** The absolute kg quantity a component contributes, computed from
 * Level % and the root's base quantity -- traversal OUTPUT (AD-3). Never
 * stored on a catalog entity. */
export type LevelKg = number;

/** The 3 roles governing field-level display masking (FR-29/30). */
export const PERSONAS = ['R&D Scientist', 'General Associate', 'Finance & Business'] as const;
export type Persona = (typeof PERSONAS)[number];

/** One of the 7 regional FERT items at the top of a Hero Chain. A
 * `MaterialId` alias, NOT a standalone `{ materialId; name }` interface --
 * consumers look up the full `Material` by ID when they need name/region
 * (e.g. to distinguish the 3 identically-named Pedigree regional Hero
 * Roots, addendum §C). */
export type HeroRoot = MaterialId;

/** One of the 5 standalone FERTs with no modeled BOM. Same `MaterialId`
 * -alias rationale as `HeroRoot`. */
export type CatalogBreadthItem = MaterialId;

/** The 3 origins that can write a `DrillTarget` (AD-5). `'explore-row'` is
 * NOT a member -- the exact string is `'explorer-row'`, reserved for a
 * future row-click/detail-panel story with no writer yet in this codebase.
 * `'explode-bom'`/`'analyze-blast-radius'` are the two writers Story 2.4's
 * ⋮ row-action menu uses. */
export const DRILL_TARGET_SOURCES = ['explorer-row', 'explode-bom', 'analyze-blast-radius'] as const;
export type DrillTargetSource = (typeof DRILL_TARGET_SOURCES)[number];

/** AD-5's pinned cross-screen drill-target shape: which material to open,
 * and which row action navigated there, so Epic 3/4 destination screens
 * can tailor their view without re-deriving the origin. `null` is the
 * default/no-target state -- never a partial `{ materialId }` alone. */
export type DrillTarget = { materialId: MaterialId; source: DrillTargetSource } | null;

/** Linked-relationship discriminator (AD-6): a Document Info Record, or a
 * Transport Spec / Pallet Instruction. `Relationship` (`data/catalog.ts`)
 * is one entity keyed on this, never two hardcoded structures. */
export const RELATIONSHIP_KINDS = ['DIR', 'TRANSPORT_PI'] as const;
export type RelationshipKind = (typeof RELATIONSHIP_KINDS)[number];

/** A masked view-model field (AD-2), produced by `logic/masking.ts`'s
 * `maskRecord`. Never the raw value -- `display` is always a renderable
 * string (the literal `"–"` when masked), `masked` flags whether the value
 * was suppressed for the current persona. `T` is a phantom type param
 * (documents the underlying field's raw type at each call site; the shape
 * itself deliberately never stores it) -- unused by design, not an
 * oversight.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- `T` is intentionally phantom, see doc comment above
export interface MaskedField<_T> {
  display: string;
  masked: boolean;
}

/** One node of `explodeBom`'s resolved tree -- traversal OUTPUT only
 * (AD-3, AD-4). Never a pre-nested field on `Material`/`BomItem` in
 * `data/catalog.ts`; the tree derives via `Material -> MaterialBomLink ->
 * BomHeader -> BomItem -> child Material` joins alone. Carries the full
 * `Material` it resolves to, plus this node's computed cumulative
 * Level %, Level (Kg), and cost. */
export interface BomNode {
  materialId: MaterialId;
  material: Material;
  levelPct: LevelPct;
  levelKg: LevelKg;
  cost: number;
  children: BomNode[];
}

/** `explodeBom`'s result (AD-4): a discriminated union, never an
 * exception or a nullable fallback. Every consumer renders off `status`
 * only -- no try/catch around a traversal call, no silent default tree. */
export type TraversalResult =
  | { status: 'ok'; tree: BomNode }
  | { status: 'empty'; reason: string };

/** One row of `whereUsed`'s bottom-up result: a single path from the
 * queried source material, up through a master recipe, to a finished
 * good, with this path's computed cumulative Level %, Level (Kg), and
 * cost (AD-3 -- computed by the traversal, never a separately
 * hand-authored value per FR-20). IDs only; consumers look up
 * region/name/etc. via the full `Material` (same rationale as
 * `HeroRoot`/`CatalogBreadthItem`). */
export interface ImpactPath {
  sourceMaterialId: MaterialId;
  masterRecipeId: MaterialId;
  finishedGoodId: MaterialId;
  levelPct: LevelPct;
  levelKg: LevelKg;
  cost: number;
}
