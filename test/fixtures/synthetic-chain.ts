/**
 * Held-out synthetic BOM chain (Story 3.1, AD-1 guard). An 8th,
 * PRD-unnamed FERT->...->raw-material chain, entirely separate IDs from
 * `src/data/seed/*` (never mutates or reuses seed rows), built from the
 * same 4 entity shapes (`Material`/`MaterialBomLink`/`BomHeader`/
 * `BomItem`) `explodeBom` (`src/logic/bomExplosion.ts`) already walks.
 * `explodeBom` has zero knowledge of this fixture's IDs -- if the engine
 * were secretly branching on a real seed material's literal ID/name/
 * region/segment, this chain would either fail to resolve or compute
 * wrong Level %/Kg/cost. It doesn't, which is the proof (AD-1).
 *
 * Shape (4 levels, >=3 as required):
 *   SYN-FG-DEMO-500G (FERT, root)
 *   +- SYN-RCP-DEMO-01 (REAL_SUB, 90%)
 *   |    +- SYN-ING-BASE-01    (ROH, 70%)
 *   |    +- SYN-SUB-RCP-DEMO-01 (SUB_RCP, 30%)
 *   |         +- SYN-ING-ADDITIVE-01 (ROH, 60%)
 *   |         +- SYN-ING-ADDITIVE-02 (ROH, 40%)
 *   +- SYN-PKG-DEMO-01  (VERP, 7%, leaf)
 *   +- SYN-PSPEC-DEMO-01 (PRNT, 3%, leaf)
 *
 * Costs/percentages chosen to hand-compute to clean decimals -- see
 * `test/logic/bomExplosion.test.ts`'s AD-1 assertions for the worked
 * values.
 */

import type { BomHeader, BomItem, Catalog, Material, MaterialBomLink } from '../../src/data/catalog';

export const SYNTHETIC_ROOT_ID = 'SYN-FG-DEMO-500G';

const SYNTHETIC_MATERIALS: Material[] = [
  {
    materialId: SYNTHETIC_ROOT_ID,
    name: 'Synthetic Demo Finished Good (500g)',
    region: 'Global',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'FERT',
  },
  {
    materialId: 'SYN-RCP-DEMO-01',
    name: 'Synthetic Demo Master Recipe',
    region: 'Global',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'REAL_SUB',
    allergens: [],
  },
  {
    materialId: 'SYN-PKG-DEMO-01',
    name: 'Synthetic Demo Packaging Spec',
    region: 'Global',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'VERP',
  },
  {
    materialId: 'SYN-PSPEC-DEMO-01',
    name: 'Synthetic Demo Print Spec',
    region: 'Global',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'PRNT',
  },
  {
    materialId: 'SYN-ING-BASE-01',
    name: 'Synthetic Demo Base Ingredient',
    region: 'Global',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 2.0,
  },
  {
    materialId: 'SYN-SUB-RCP-DEMO-01',
    name: 'Synthetic Demo Sub-Recipe',
    region: 'Global',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'SUB_RCP',
    allergens: [],
  },
  {
    materialId: 'SYN-ING-ADDITIVE-01',
    name: 'Synthetic Demo Additive Ingredient 1',
    region: 'Global',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 5.0,
  },
  {
    materialId: 'SYN-ING-ADDITIVE-02',
    name: 'Synthetic Demo Additive Ingredient 2',
    region: 'Global',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 1.5,
  },
];

const SYNTHETIC_BOM_HEADERS: BomHeader[] = [
  { bomHeaderId: 'SYN-BOM-FG-DEMO', baseQuantityKg: 0.5 },
  { bomHeaderId: 'SYN-BOM-RCP-DEMO', baseQuantityKg: 200 },
  { bomHeaderId: 'SYN-BOM-SUB-DEMO', baseQuantityKg: 50 },
];

const SYNTHETIC_MATERIAL_BOM_LINKS: MaterialBomLink[] = [
  { materialId: SYNTHETIC_ROOT_ID, bomHeaderId: 'SYN-BOM-FG-DEMO' },
  { materialId: 'SYN-RCP-DEMO-01', bomHeaderId: 'SYN-BOM-RCP-DEMO' },
  { materialId: 'SYN-SUB-RCP-DEMO-01', bomHeaderId: 'SYN-BOM-SUB-DEMO' },
];

const SYNTHETIC_BOM_ITEMS: BomItem[] = [
  // Root -- recipe 90 / packaging 7 / print 3 = 100.
  {
    bomItemId: 'SYN-BI-FG-01',
    bomHeaderId: 'SYN-BOM-FG-DEMO',
    componentMaterialId: 'SYN-RCP-DEMO-01',
    formulationPct: 90,
  },
  {
    bomItemId: 'SYN-BI-FG-02',
    bomHeaderId: 'SYN-BOM-FG-DEMO',
    componentMaterialId: 'SYN-PKG-DEMO-01',
    formulationPct: 7,
  },
  {
    bomItemId: 'SYN-BI-FG-03',
    bomHeaderId: 'SYN-BOM-FG-DEMO',
    componentMaterialId: 'SYN-PSPEC-DEMO-01',
    formulationPct: 3,
  },
  // Recipe -- raw material 70 / sub-recipe 30 = 100.
  {
    bomItemId: 'SYN-BI-RCP-01',
    bomHeaderId: 'SYN-BOM-RCP-DEMO',
    componentMaterialId: 'SYN-ING-BASE-01',
    formulationPct: 70,
  },
  {
    bomItemId: 'SYN-BI-RCP-02',
    bomHeaderId: 'SYN-BOM-RCP-DEMO',
    componentMaterialId: 'SYN-SUB-RCP-DEMO-01',
    formulationPct: 30,
  },
  // Sub-recipe -- additive 1 60 / additive 2 40 = 100.
  {
    bomItemId: 'SYN-BI-SUB-01',
    bomHeaderId: 'SYN-BOM-SUB-DEMO',
    componentMaterialId: 'SYN-ING-ADDITIVE-01',
    formulationPct: 60,
  },
  {
    bomItemId: 'SYN-BI-SUB-02',
    bomHeaderId: 'SYN-BOM-SUB-DEMO',
    componentMaterialId: 'SYN-ING-ADDITIVE-02',
    formulationPct: 40,
  },
];

export const SYNTHETIC_CATALOG: Catalog = {
  materials: SYNTHETIC_MATERIALS,
  materialBomLinks: SYNTHETIC_MATERIAL_BOM_LINKS,
  bomHeaders: SYNTHETIC_BOM_HEADERS,
  bomItems: SYNTHETIC_BOM_ITEMS,
};
