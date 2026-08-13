/**
 * Compile-time-only proof of AD-3 ("`unitCostPerKg` exists ONLY on the
 * `ROH` variant -- present elsewhere, or absent on `ROH`, must be a `tsc`
 * compile error"). No runtime assertions -- this file has no
 * `describe`/`it` blocks and is not picked up by Vitest (its name doesn't
 * match `*.test.ts`); it is type-checked by `tsc -b` as part of
 * `npm run build`, which also validates that every `@ts-expect-error`
 * directive below is load-bearing (`tsc` flags an unused one if its next
 * line doesn't actually fail to compile).
 */

import type {
  FertMaterial,
  PackagingMaterial,
  PrintedMaterial,
  RawMaterial,
  RecipeMaterial,
} from '../../src/data/catalog';

// RawMaterial (materialType: 'ROH') requires unitCostPerKg.
// @ts-expect-error -- unitCostPerKg is required on the ROH variant (AD-3)
export const rawMaterialMissingCost: RawMaterial = {
  materialId: 'GBL-ING-TYPETEST-01',
  name: 'Type-Test Raw Material',
  region: 'NA',
  segment: 'Petcare',
  status: 'Approved (Active)',
  materialType: 'ROH',
};

// The 4 non-ROH variants must NOT carry unitCostPerKg (AD-3), checked
// individually so a fix to one variant that misses another still fails.

export const fertMaterialWithCost: FertMaterial = {
  materialId: 'GBL-FG-TYPETEST-01',
  name: 'Type-Test Fert Material',
  region: 'NA',
  segment: 'Petcare',
  status: 'Approved (Active)',
  materialType: 'FERT',
  // @ts-expect-error -- unitCostPerKg must not exist outside RawMaterial (AD-3)
  unitCostPerKg: 1.23,
};

export const recipeMaterialWithCost: RecipeMaterial = {
  materialId: 'RCP-TYPETEST-01',
  name: 'Type-Test Recipe Material',
  region: 'NA',
  segment: 'Petcare',
  status: 'Approved (Active)',
  materialType: 'REAL_SUB',
  allergens: [],
  // @ts-expect-error -- unitCostPerKg must not exist outside RawMaterial (AD-3)
  unitCostPerKg: 1.23,
};

export const packagingMaterialWithCost: PackagingMaterial = {
  materialId: 'GBL-PKG-TYPETEST-01',
  name: 'Type-Test Packaging Material',
  region: 'NA',
  segment: 'Petcare',
  status: 'Approved (Active)',
  materialType: 'VERP',
  // @ts-expect-error -- unitCostPerKg must not exist outside RawMaterial (AD-3)
  unitCostPerKg: 1.23,
};

export const printedMaterialWithCost: PrintedMaterial = {
  materialId: 'GBL-PSPEC-TYPETEST-01',
  name: 'Type-Test Printed Material',
  region: 'NA',
  segment: 'Petcare',
  status: 'Approved (Active)',
  materialType: 'PRNT',
  // @ts-expect-error -- unitCostPerKg must not exist outside RawMaterial (AD-3)
  unitCostPerKg: 1.23,
};
