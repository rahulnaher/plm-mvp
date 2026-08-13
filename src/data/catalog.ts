/**
 * SAP `MAST -> STKO -> STPO`-mirrored, normalized catalog data model
 * (Architecture Spine "Data model"; addendum.md §B). Pure TS -- no
 * react/zustand imports (lint-enforced, eslint.config.js). Types only --
 * no seed rows (`data/seed/`, a later story) and no `explodeBom`/
 * `whereUsed`/etc (later stories).
 *
 * BOM parent->child is flat FK edges only: `Material` 1:N
 * `MaterialBomLink` N:1 `BomHeader` 1:N `BomItem`,
 * `BomItem.componentMaterialId` -> `Material`. No pre-nested tree here --
 * `BomNode` (`logic/types.ts`) is traversal *output* only.
 *
 * Deliberately does NOT reuse `hubKpiAggregate.ts`'s `Segment`/`Region` --
 * Epic 1's independent, deliberately-unreconciled Hub aggregate (FR-33).
 */

import type { MaterialId, RelationshipKind } from '../logic/types';

export const SEGMENTS = ['Petcare', 'Snacking', 'Food'] as const;
export type Segment = (typeof SEGMENTS)[number];

/** Adds `'Global'` to the Hub aggregate's `NA | EU | APAC` -- some catalog
 * items (e.g. a Steel Can packaging spec, Spec Data.xlsx) are
 * region-unscoped. */
export const REGIONS = ['NA', 'EU', 'APAC', 'Global'] as const;
export type Region = (typeof REGIONS)[number];

/** Loose union of values seen in `Spec Data.xlsx`'s Approval/Lifecycle
 * Status columns. Story 2.2 tightens this later. */
export const MATERIAL_STATUSES = [
  'Approved (Active)',
  'Pending Harmonization',
  'Draft',
  'Phased Out',
] as const;
export type MaterialStatus = (typeof MATERIAL_STATUSES)[number];

/** `FERT` (finished good), `REAL_SUB` (master recipe), `SUB_RCP`
 * (sub-recipe), `ROH` (raw material), `VERP` (packaging spec), `PRNT`
 * (printed spec). */
export const MATERIAL_TYPES = ['FERT', 'REAL_SUB', 'SUB_RCP', 'ROH', 'VERP', 'PRNT'] as const;
export type MaterialType = (typeof MATERIAL_TYPES)[number];

interface MaterialBase {
  materialId: MaterialId;
  name: string;
  region: Region;
  segment: Segment;
  status: MaterialStatus;
}

/** Finished good. */
export interface FertMaterial extends MaterialBase {
  materialType: 'FERT';
}

/** Master recipe (`REAL_SUB`) or sub-recipe (`SUB_RCP`). */
export interface RecipeMaterial extends MaterialBase {
  materialType: 'REAL_SUB' | 'SUB_RCP';
  allergens: string[];
}

/** Raw material/ingredient. `unitCostPerKg` exists ONLY on this variant
 * (AD-3, type-enforced -- see test/types/catalog.type-test.ts). */
export interface RawMaterial extends MaterialBase {
  materialType: 'ROH';
  unitCostPerKg: number;
}

/** Packaging spec. */
export interface PackagingMaterial extends MaterialBase {
  materialType: 'VERP';
}

/** Printed spec. */
export interface PrintedMaterial extends MaterialBase {
  materialType: 'PRNT';
}

/** Discriminated union keyed on `materialType`. */
export type Material =
  | FertMaterial
  | RecipeMaterial
  | RawMaterial
  | PackagingMaterial
  | PrintedMaterial;

/** `MAST`-mirrored join entity: resolves the M:N between a Material and
 * its BOM(s) -- one Material can have multiple BOM links, multiple links
 * can resolve to the same `BomHeader`. `materialId`/`bomHeaderId` ONLY --
 * no `alternativeBomId`; STLAL-style alternative-BOM selection is a
 * below-this-altitude detail, and multiple `MaterialBomLink` rows already
 * express "this Material has more than one BOM" without it. */
export interface MaterialBomLink {
  materialId: MaterialId;
  bomHeaderId: string;
}

/** `STKO`-mirrored BOM header. `baseQuantityKg` (STKO's `BMENG`) is the
 * root quantity Level (Kg) is computed from during traversal (AD-3) --
 * not itself a per-node level value. */
export interface BomHeader {
  bomHeaderId: string;
  baseQuantityKg: number;
}

/** `STPO`-mirrored BOM component item. `formulationPct` is the authored
 * declared % within this item's DIRECT parent only (AD-3 leaf input) --
 * distinct from `BomNode.levelPct` (`logic/types.ts`; computed
 * cumulative, traversal output, never on a catalog entity). Carries no
 * `levelPct`/`levelKg`/`cost`. */
export interface BomItem {
  bomItemId: string;
  bomHeaderId: string;
  componentMaterialId: MaterialId;
  formulationPct: number;
}

/** One entity, `kind`-discriminated (AD-6) -- never a DIR-only structure
 * plus a bolted-on Transport/PI structure. Covers Document Info Records
 * (FR-17) and Transport Specs / Pallet Instructions, rendered through the
 * same relationship-rendering code path. */
export interface Relationship {
  relationshipId: string;
  materialId: MaterialId;
  kind: RelationshipKind;
  label: string;
}
