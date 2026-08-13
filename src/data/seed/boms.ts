/**
 * Seed BOM backbone (Story 2.2, FR-32): `MaterialBomLink` -> `BomHeader`
 * -> `BomItem`. One `BomHeader` per FG (its own packaging+print+recipe
 * composition) and per REAL_SUB/SUB_RCP (its own formulation) -- 7
 * FG-level + 4 recipe-level + 4 sub-recipe-level = 15 headers, each with
 * exactly one `MaterialBomLink` (no alternative-BOM branching authored
 * here). Every header's direct `BomItem`s sum to 100% (+/-0.1).
 *
 * FG-level composition % (Recipe 96 / Packaging 3 / Print 1) has no
 * source-spreadsheet equivalent -- `Spec Data.xlsx` links FG->packaging/
 * print/recipe by ID only, never a formulation %. Authored as a single
 * consistent plausible split across all 7 FG headers, distinct from the
 * recipe/sub-recipe %s below, which ARE parsed from Recipe Specs' free
 * text (addendum.md §C) and gap-fill/rebalanced per this spec's
 * Boundaries.
 */

import type { BomHeader, BomItem, MaterialBomLink } from '../catalog';

const FG_RECIPE_PCT = 96;
const FG_PACKAGING_PCT = 3;
const FG_PRINT_PCT = 1;

// ---------------------------------------------------------------------------
// BomHeader -- 15 total
// ---------------------------------------------------------------------------

export const BOM_HEADERS: BomHeader[] = [
  // FG-level (7) -- baseQuantityKg = the FG's real net weight.
  { bomHeaderId: 'BOM-GBL-FG-PED-15K-US', baseQuantityKg: 15 },
  { bomHeaderId: 'BOM-GBL-FG-PED-15K-EU', baseQuantityKg: 15 },
  { bomHeaderId: 'BOM-GBL-FG-PED-15K-AP', baseQuantityKg: 15 },
  { bomHeaderId: 'BOM-GBL-FG-MMS-250G', baseQuantityKg: 0.25 },
  { bomHeaderId: 'BOM-GBL-FG-MMS-250G-EU', baseQuantityKg: 0.25 },
  { bomHeaderId: 'BOM-GBL-FG-BNS-250G', baseQuantityKg: 0.25 },
  { bomHeaderId: 'BOM-GBL-FG-BNS-250G-AP', baseQuantityKg: 0.25 },

  // Recipe-level (4) -- baseQuantityKg = a plausible industrial batch
  // size (no source value for this).
  { bomHeaderId: 'BOM-RCP-PED-CHICKEN-01', baseQuantityKg: 1000 },
  { bomHeaderId: 'BOM-RCP-PED-CHICKEN-02', baseQuantityKg: 1000 },
  { bomHeaderId: 'BOM-RCP-MMS-MILK-01', baseQuantityKg: 1000 },
  { bomHeaderId: 'BOM-RCP-BNS-RICE-01', baseQuantityKg: 1000 },

  // Sub-recipe-level (4) -- smaller pre-mix batch size.
  { bomHeaderId: 'BOM-SUB-RCP-VIT-01', baseQuantityKg: 100 },
  { bomHeaderId: 'BOM-SUB-RCP-VIT-02', baseQuantityKg: 100 },
  { bomHeaderId: 'BOM-SUB-RCP-CHOC-MASS', baseQuantityKg: 100 },
  { bomHeaderId: 'BOM-SUB-RCP-SEASON-01', baseQuantityKg: 100 },
];

// ---------------------------------------------------------------------------
// MaterialBomLink -- 1:1 with BOM_HEADERS (every FERT/REAL_SUB/SUB_RCP
// here has exactly one own BOM; ROH/VERP/PRNT are leaves with no own
// composition, so no link).
// ---------------------------------------------------------------------------

export const MATERIAL_BOM_LINKS: MaterialBomLink[] = BOM_HEADERS.map((header) => ({
  materialId: header.bomHeaderId.replace(/^BOM-/, ''),
  bomHeaderId: header.bomHeaderId,
}));

// ---------------------------------------------------------------------------
// BomItem -- direct components per header, formulationPct normalized
// from Recipe Specs' free-text composition column.
// ---------------------------------------------------------------------------

function fgItems(prefix: string, bomHeaderId: string, recipeId: string, pkgId: string, printId: string): BomItem[] {
  return [
    {
      bomItemId: `${prefix}-01`,
      bomHeaderId,
      componentMaterialId: recipeId,
      formulationPct: FG_RECIPE_PCT,
    },
    {
      bomItemId: `${prefix}-02`,
      bomHeaderId,
      componentMaterialId: pkgId,
      formulationPct: FG_PACKAGING_PCT,
    },
    {
      bomItemId: `${prefix}-03`,
      bomHeaderId,
      componentMaterialId: printId,
      formulationPct: FG_PRINT_PCT,
    },
  ];
}

export const BOM_ITEMS: BomItem[] = [
  // --- FG-level (7 headers x 3 items = 21) ---
  ...fgItems(
    'BI-PED-US',
    'BOM-GBL-FG-PED-15K-US',
    'RCP-PED-CHICKEN-01',
    'GBL-PKG-15KG-01',
    'GBL-PSPEC-PED-15K-US',
  ),
  ...fgItems(
    'BI-PED-EU',
    'BOM-GBL-FG-PED-15K-EU',
    'RCP-PED-CHICKEN-01',
    'GBL-PKG-15KG-01',
    'GBL-PSPEC-PED-15K-EU',
  ),
  ...fgItems(
    'BI-PED-AP',
    'BOM-GBL-FG-PED-15K-AP',
    'RCP-PED-CHICKEN-02',
    'GBL-PKG-15KG-01',
    'GBL-PSPEC-PED-15K-AP',
  ),
  ...fgItems(
    'BI-MMS-US',
    'BOM-GBL-FG-MMS-250G',
    'RCP-MMS-MILK-01',
    'GBL-PKG-250G-FL',
    'GBL-PSPEC-MMS-250G',
  ),
  ...fgItems(
    'BI-MMS-EU',
    'BOM-GBL-FG-MMS-250G-EU',
    'RCP-MMS-MILK-01',
    'GBL-PKG-250G-FL',
    'GBL-PSPEC-MMS-250G-EU',
  ),
  ...fgItems(
    'BI-BNS-EU',
    'BOM-GBL-FG-BNS-250G',
    'RCP-BNS-RICE-01',
    'GBL-PKG-250G-FL',
    'GBL-PSPEC-BNS-250G',
  ),
  ...fgItems(
    'BI-BNS-AP',
    'BOM-GBL-FG-BNS-250G-AP',
    'RCP-BNS-RICE-01',
    'GBL-PKG-250G-FL',
    'GBL-PSPEC-BNS-250G',
  ),

  // --- RCP-PED-CHICKEN-01 (Master Recipe, US/EU) -- Chicken Meal (38%),
  // Wheat (28%), Corn (20%), Fat (8%), Premix/SUB-RCP-VIT-01 (6%) = 100.
  {
    bomItemId: 'BI-PED-CHICKEN-01-01',
    bomHeaderId: 'BOM-RCP-PED-CHICKEN-01',
    componentMaterialId: 'GBL-ING-CHICK-MEAL-01',
    formulationPct: 38,
  },
  {
    bomItemId: 'BI-PED-CHICKEN-01-02',
    bomHeaderId: 'BOM-RCP-PED-CHICKEN-01',
    componentMaterialId: 'GBL-ING-WHEAT-WHL-01',
    formulationPct: 28,
  },
  {
    bomItemId: 'BI-PED-CHICKEN-01-03',
    bomHeaderId: 'BOM-RCP-PED-CHICKEN-01',
    componentMaterialId: 'GBL-ING-CORN-01',
    formulationPct: 20,
  },
  {
    bomItemId: 'BI-PED-CHICKEN-01-04',
    bomHeaderId: 'BOM-RCP-PED-CHICKEN-01',
    componentMaterialId: 'GBL-ING-FAT-01',
    formulationPct: 8,
  },
  {
    bomItemId: 'BI-PED-CHICKEN-01-05',
    bomHeaderId: 'BOM-RCP-PED-CHICKEN-01',
    componentMaterialId: 'SUB-RCP-VIT-01',
    formulationPct: 6,
  },

  // --- RCP-PED-CHICKEN-02 (Master Recipe, APAC) -- gap #4: source had
  // Poultry By-Product (35%), Rice (30%), Corn (22%), Fat (7%), Premix
  // (6%) = 100 with no wheat. Wheat added at 15% (the multi-region
  // blast-radius ingredient, FR-20) and the other 5 lines rebalanced
  // proportionally to the remaining 85% (each original % x 0.85), so the
  // header still sums to exactly 100.
  {
    bomItemId: 'BI-PED-CHICKEN-02-01',
    bomHeaderId: 'BOM-RCP-PED-CHICKEN-02',
    componentMaterialId: 'GBL-ING-POULTRY-BYPROD-01',
    formulationPct: 29.75,
  },
  {
    bomItemId: 'BI-PED-CHICKEN-02-02',
    bomHeaderId: 'BOM-RCP-PED-CHICKEN-02',
    componentMaterialId: 'GBL-ING-RICE-BRKN-02',
    formulationPct: 25.5,
  },
  {
    bomItemId: 'BI-PED-CHICKEN-02-03',
    bomHeaderId: 'BOM-RCP-PED-CHICKEN-02',
    componentMaterialId: 'GBL-ING-CORN-01',
    formulationPct: 18.7,
  },
  {
    bomItemId: 'BI-PED-CHICKEN-02-04',
    bomHeaderId: 'BOM-RCP-PED-CHICKEN-02',
    componentMaterialId: 'GBL-ING-FAT-01',
    formulationPct: 5.95,
  },
  {
    bomItemId: 'BI-PED-CHICKEN-02-05',
    bomHeaderId: 'BOM-RCP-PED-CHICKEN-02',
    componentMaterialId: 'SUB-RCP-VIT-02',
    formulationPct: 5.1,
  },
  {
    bomItemId: 'BI-PED-CHICKEN-02-06',
    bomHeaderId: 'BOM-RCP-PED-CHICKEN-02',
    componentMaterialId: 'GBL-ING-WHEAT-WHL-01',
    formulationPct: 15,
  },

  // --- RCP-MMS-MILK-01 -- Milk Chocolate Mass/SUB-RCP-CHOC-MASS (95%),
  // Sugar Shell Blend (5%) = 100.
  {
    bomItemId: 'BI-MMS-MILK-01-01',
    bomHeaderId: 'BOM-RCP-MMS-MILK-01',
    componentMaterialId: 'SUB-RCP-CHOC-MASS',
    formulationPct: 95,
  },
  {
    bomItemId: 'BI-MMS-MILK-01-02',
    bomHeaderId: 'BOM-RCP-MMS-MILK-01',
    componentMaterialId: 'GBL-ING-SUGAR-SHELL-01',
    formulationPct: 5,
  },

  // --- RCP-BNS-RICE-01 -- Parboiled Long Grain Rice (98%), Oil/Seasoning
  // Blend/SUB-RCP-SEASON-01 (2%) = 100.
  {
    bomItemId: 'BI-BNS-RICE-01-01',
    bomHeaderId: 'BOM-RCP-BNS-RICE-01',
    componentMaterialId: 'GBL-ING-RICE-PARB-01',
    formulationPct: 98,
  },
  {
    bomItemId: 'BI-BNS-RICE-01-02',
    bomHeaderId: 'BOM-RCP-BNS-RICE-01',
    componentMaterialId: 'SUB-RCP-SEASON-01',
    formulationPct: 2,
  },

  // --- SUB-RCP-VIT-01 -- Zinc (15%), Vitamin E (10%), Calcium (40%),
  // Carrier Base (35%) = 100.
  {
    bomItemId: 'BI-VIT-01-01',
    bomHeaderId: 'BOM-SUB-RCP-VIT-01',
    componentMaterialId: 'GBL-ING-ZINC-SULF-01',
    formulationPct: 15,
  },
  {
    bomItemId: 'BI-VIT-01-02',
    bomHeaderId: 'BOM-SUB-RCP-VIT-01',
    componentMaterialId: 'GBL-ING-VIT-E-01',
    formulationPct: 10,
  },
  {
    bomItemId: 'BI-VIT-01-03',
    bomHeaderId: 'BOM-SUB-RCP-VIT-01',
    componentMaterialId: 'GBL-ING-CALCIUM-01',
    formulationPct: 40,
  },
  {
    bomItemId: 'BI-VIT-01-04',
    bomHeaderId: 'BOM-SUB-RCP-VIT-01',
    componentMaterialId: 'GBL-ING-CARRIER-BASE-01',
    formulationPct: 35,
  },

  // --- SUB-RCP-VIT-02 -- Zinc (12%), Vitamin E (8%), Calcium (45%),
  // Carrier Base (35%) = 100.
  {
    bomItemId: 'BI-VIT-02-01',
    bomHeaderId: 'BOM-SUB-RCP-VIT-02',
    componentMaterialId: 'GBL-ING-ZINC-SULF-01',
    formulationPct: 12,
  },
  {
    bomItemId: 'BI-VIT-02-02',
    bomHeaderId: 'BOM-SUB-RCP-VIT-02',
    componentMaterialId: 'GBL-ING-VIT-E-01',
    formulationPct: 8,
  },
  {
    bomItemId: 'BI-VIT-02-03',
    bomHeaderId: 'BOM-SUB-RCP-VIT-02',
    componentMaterialId: 'GBL-ING-CALCIUM-01',
    formulationPct: 45,
  },
  {
    bomItemId: 'BI-VIT-02-04',
    bomHeaderId: 'BOM-SUB-RCP-VIT-02',
    componentMaterialId: 'GBL-ING-CARRIER-BASE-01',
    formulationPct: 35,
  },

  // --- SUB-RCP-CHOC-MASS (gap #2, authored) -- Standard Milk Chocolate
  // Crumb/Mass (60%), Cocoa Butter (25%), Refined Cane Sugar (15%) = 100.
  {
    bomItemId: 'BI-CHOC-MASS-01',
    bomHeaderId: 'BOM-SUB-RCP-CHOC-MASS',
    componentMaterialId: 'GBL-ING-CHOC-MASS-01',
    formulationPct: 60,
  },
  {
    bomItemId: 'BI-CHOC-MASS-02',
    bomHeaderId: 'BOM-SUB-RCP-CHOC-MASS',
    componentMaterialId: 'GBL-ING-COCOA-BUTTER-01',
    formulationPct: 25,
  },
  {
    bomItemId: 'BI-CHOC-MASS-03',
    bomHeaderId: 'BOM-SUB-RCP-CHOC-MASS',
    componentMaterialId: 'GBL-ING-CANE-SUGAR-01',
    formulationPct: 15,
  },

  // --- SUB-RCP-SEASON-01 (gap #2, authored) -- Salt (30%), Onion Powder
  // (35%), Celery Extract (35%) = 100. Celery Extract ties back to
  // RCP-BNS-RICE-01's "Celery (Trace)" allergen.
  {
    bomItemId: 'BI-SEASON-01-01',
    bomHeaderId: 'BOM-SUB-RCP-SEASON-01',
    componentMaterialId: 'GBL-ING-SALT-01',
    formulationPct: 30,
  },
  {
    bomItemId: 'BI-SEASON-01-02',
    bomHeaderId: 'BOM-SUB-RCP-SEASON-01',
    componentMaterialId: 'GBL-ING-ONION-PWD-01',
    formulationPct: 35,
  },
  {
    bomItemId: 'BI-SEASON-01-03',
    bomHeaderId: 'BOM-SUB-RCP-SEASON-01',
    componentMaterialId: 'GBL-ING-CELERY-EXT-01',
    formulationPct: 35,
  },
];
