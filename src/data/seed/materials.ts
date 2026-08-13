/**
 * Seed `Material` rows (Story 2.2, FR-32). Normalized from `Spec
 * Data.xlsx` via addendum.md §C, resolving the 4 documented gaps (AD-3
 * cost-on-ROH-only, dangling sub-recipes, formulation-% normalization,
 * APAC Pedigree wheat) plus authoring the 2 supplemented Hero Root
 * regions and the 4 supplemented Catalog-Breadth FERTs. See this
 * package's spec (`spec-2-2-...md`) Design Notes for the full derivation
 * and per-row provenance.
 *
 * `Ingredient Specs` has no Region column -- ROH regions below are
 * inferred from which recipe/plant consumes each ingredient (a stand-in
 * for the sheet's un-transcribed `Primary Supplier/Vendor` column, per
 * this spec's Boundaries), applied consistently per ingredient.
 */

import type {
  FertMaterial,
  Material,
  PackagingMaterial,
  PrintedMaterial,
  RawMaterial,
  RecipeMaterial,
} from '../catalog';

// ---------------------------------------------------------------------------
// FERT -- 7 Hero Roots + 5 Catalog-Breadth items = 12
// ---------------------------------------------------------------------------

const HERO_ROOT_FERTS: FertMaterial[] = [
  // Pedigree -- 3 real FG rows (MAT-100291/100295/100411), one shared US/EU
  // recipe + a distinct APAC recipe.
  {
    materialId: 'GBL-FG-PED-15K-US',
    name: 'Pedigree Adult Dry Chicken & Rice (15kg)',
    region: 'NA',
    segment: 'Petcare',
    status: 'Active (In Production)',
    materialType: 'FERT',
  },
  {
    materialId: 'GBL-FG-PED-15K-EU',
    name: 'Pedigree Adult Dry Chicken & Rice (15kg)',
    region: 'EU',
    segment: 'Petcare',
    status: 'Active (In Production)',
    materialType: 'FERT',
  },
  {
    materialId: 'GBL-FG-PED-15K-AP',
    name: 'Pedigree Adult Dry Chicken & Rice (15kg)',
    region: 'APAC',
    segment: 'Petcare',
    // Real Compliance & Launch Status per this spec's Boundaries (its DIR
    // is skipped -- "DIR Missing" -- matching this status).
    status: 'Pending Release (DIR Missing)',
    materialType: 'FERT',
  },
  // M&M's -- US real (MAT-200540); EU supplemented (no spreadsheet
  // backing at all -- new FG, reusing the real packaging + recipe).
  {
    materialId: 'GBL-FG-MMS-250G',
    name: "M&M's Milk Chocolate Sharing Pouch (250g)",
    region: 'NA',
    segment: 'Snacking',
    status: 'Active (In Production)',
    materialType: 'FERT',
  },
  {
    materialId: 'GBL-FG-MMS-250G-EU',
    name: "M&M's Milk Chocolate Sharing Pouch (250g)",
    region: 'EU',
    segment: 'Snacking',
    // Newly authored, no source row -- Draft signals it's not yet
    // spreadsheet-confirmed (honest gap, per Design Notes).
    status: 'Draft',
    materialType: 'FERT',
  },
  // Ben's Original -- EU real (MAT-300812); APAC supplemented, reusing
  // the real-but-previously-unused SPEC-FD-9985 packaging row (Draft) +
  // real GBL-PSPEC-BNS-250G print spec + real RCP-BNS-RICE-01 recipe.
  {
    materialId: 'GBL-FG-BNS-250G',
    name: "Ben's Original Express Long Grain Rice (250g)",
    region: 'EU',
    segment: 'Food',
    status: 'Active (In Production)',
    materialType: 'FERT',
  },
  {
    materialId: 'GBL-FG-BNS-250G-AP',
    name: "Ben's Original Express Long Grain Rice (250g)",
    region: 'APAC',
    segment: 'Food',
    // Matches the reused SPEC-FD-9985 packaging row's Draft status.
    status: 'Draft',
    materialType: 'FERT',
  },
];

const CATALOG_BREADTH_FERTS: FertMaterial[] = [
  // Whiskas -- real, spreadsheet-backed (MAT-100889): packaging
  // GBL-PKG-CAN-400 + print GBL-PSPEC-WHS-400G both real; its linked
  // recipe RCP-WHS-PATE-01 is referenced but undefined -- left
  // unresolved, matching the "no BOM modeled" Catalog-Breadth design.
  {
    materialId: 'GBL-FG-WHS-400G',
    name: 'Whiskas Pâté Poultry Selection Can (400g)',
    region: 'EU',
    segment: 'Petcare',
    status: 'Active (In Production)',
    materialType: 'FERT',
  },
  // Remaining 4 Catalog-Breadth FERTs -- no spreadsheet backing at all;
  // names/segments per prd.md Glossary. Flat FERT records only, no BOM
  // (Boundaries: "Never give ... a modeled BOM").
  {
    materialId: 'GBL-FG-DOVE-100G',
    name: 'Dove Silky Smooth Chocolate Bar (100g)',
    region: 'Global',
    segment: 'Snacking',
    status: 'Approved (Active)',
    materialType: 'FERT',
  },
  {
    materialId: 'GBL-FG-UBN-500G',
    name: "Uncle Ben's Original Long Grain Rice (500g)",
    region: 'Global',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'FERT',
  },
  {
    materialId: 'GBL-FG-CSR-85G',
    name: 'Cesar Classic Loaf in Sauce (85g)',
    region: 'Global',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'FERT',
  },
  {
    materialId: 'GBL-FG-SNK-50G',
    name: 'Snickers Chocolate Bar (50g)',
    region: 'Global',
    segment: 'Snacking',
    status: 'Approved (Active)',
    materialType: 'FERT',
  },
];

// ---------------------------------------------------------------------------
// REAL_SUB -- master recipes = 4
// ---------------------------------------------------------------------------

const MASTER_RECIPES: RecipeMaterial[] = [
  {
    materialId: 'RCP-PED-CHICKEN-01',
    name: 'Pedigree Adult Chicken Base Formula (US/EU)',
    region: 'Global',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'REAL_SUB',
    allergens: ['Wheat', 'Gluten'],
  },
  {
    materialId: 'RCP-PED-CHICKEN-02',
    name: 'Pedigree Adult Chicken Formula (APAC Regional)',
    region: 'APAC',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'REAL_SUB',
    // Gap #4: Whole Grain Wheat added to this recipe's formulation
    // (boms.ts), so its allergen profile is updated here to stay
    // consistent with the label (Boundaries).
    allergens: ['Soy', 'Corn', 'Wheat', 'Gluten'],
  },
  {
    materialId: 'RCP-MMS-MILK-01',
    name: "Milk Chocolate Core Formulation (M&M's)",
    region: 'Global',
    segment: 'Snacking',
    status: 'Approved (Active)',
    materialType: 'REAL_SUB',
    allergens: ['Milk', 'Soy', 'Peanut (Traces)'],
  },
  {
    materialId: 'RCP-BNS-RICE-01',
    name: "Ben's Original Parboiled Long Grain Formula",
    region: 'Global',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'REAL_SUB',
    allergens: ['Celery (Trace)'],
  },
];

// ---------------------------------------------------------------------------
// SUB_RCP -- sub-recipes = 4 (2 real, 2 gap-filled dangling references)
// ---------------------------------------------------------------------------

const SUB_RECIPES: RecipeMaterial[] = [
  {
    materialId: 'SUB-RCP-VIT-01',
    name: 'Global Canine Vitamin & Mineral Premix',
    region: 'Global',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'SUB_RCP',
    allergens: [],
  },
  {
    materialId: 'SUB-RCP-VIT-02',
    name: 'Regional Canine Vitamin Premix (APAC Variant)',
    region: 'APAC',
    segment: 'Petcare',
    status: 'Under Review (Formula Drift)',
    materialType: 'SUB_RCP',
    allergens: [],
  },
  // Gap #2: dangling sub-recipe references, authored with full plausible
  // formulations (boms.ts) rather than stub Materials only.
  {
    materialId: 'SUB-RCP-CHOC-MASS',
    name: 'Milk Chocolate Mass Base',
    region: 'Global',
    segment: 'Snacking',
    status: 'Approved (Active)',
    materialType: 'SUB_RCP',
    allergens: ['Milk', 'Soy'],
  },
  {
    materialId: 'SUB-RCP-SEASON-01',
    name: 'Oil & Seasoning Blend',
    region: 'Global',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'SUB_RCP',
    allergens: ['Celery (Trace)'],
  },
];

// ---------------------------------------------------------------------------
// ROH -- raw materials = 6 real + 12 gap-fill = 18. `unitCostPerKg`
// authored ONLY here (AD-3) -- synthetic, no cost column exists in
// `Spec Data.xlsx`.
// ---------------------------------------------------------------------------

const REAL_RAW_MATERIALS: RawMaterial[] = [
  {
    materialId: 'GBL-ING-CHICK-MEAL-01',
    name: 'Standard Poultry/Chicken Meal (65% Protein)',
    region: 'NA',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 1.85,
  },
  {
    materialId: 'GBL-ING-WHEAT-WHL-01',
    name: 'Whole Grain Wheat (Feed Grade)',
    region: 'EU',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 0.32,
  },
  {
    materialId: 'GBL-ING-RICE-BRKN-02',
    name: "Broken Rice (Brewer's Rice)",
    region: 'APAC',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 0.55,
  },
  {
    materialId: 'GBL-ING-ZINC-SULF-01',
    name: 'Zinc Sulfate Monohydrate (Feed Grade)',
    region: 'NA',
    segment: 'Petcare',
    status: 'Warning (Supplier Phase-Out)',
    materialType: 'ROH',
    unitCostPerKg: 4.2,
  },
  {
    materialId: 'GBL-ING-CHOC-MASS-01',
    name: 'Standard Milk Chocolate Crumb/Mass',
    region: 'NA',
    segment: 'Snacking',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 3.75,
  },
  {
    materialId: 'GBL-ING-RICE-PARB-01',
    name: 'Parboiled Long Grain White Rice',
    region: 'EU',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 0.68,
  },
];

// Gap-fill ROH -- one per ingredient named in a formulation string but
// without its own Ingredient Specs row (Boundaries: "no ingredient named
// in a formulation string is dropped or left unmodeled").
const GAP_FILL_RAW_MATERIALS: RawMaterial[] = [
  {
    materialId: 'GBL-ING-CORN-01',
    name: 'Feed Corn',
    region: 'NA',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 0.28,
  },
  {
    materialId: 'GBL-ING-FAT-01',
    name: 'Animal Fat (Rendered, Feed Grade)',
    region: 'NA',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 1.1,
  },
  {
    materialId: 'GBL-ING-POULTRY-BYPROD-01',
    name: 'Poultry By-Product Meal',
    region: 'APAC',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 0.95,
  },
  {
    materialId: 'GBL-ING-VIT-E-01',
    name: 'Vitamin E Supplement',
    region: 'EU',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 18.5,
  },
  {
    materialId: 'GBL-ING-CALCIUM-01',
    name: 'Calcium Carbonate (Feed Grade)',
    region: 'EU',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 2.4,
  },
  {
    materialId: 'GBL-ING-CARRIER-BASE-01',
    name: 'Premix Carrier Base',
    region: 'EU',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 1.75,
  },
  {
    materialId: 'GBL-ING-SUGAR-SHELL-01',
    name: 'Candy Sugar Shell Blend',
    region: 'NA',
    segment: 'Snacking',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 2.1,
  },
  {
    materialId: 'GBL-ING-COCOA-BUTTER-01',
    name: 'Cocoa Butter',
    region: 'NA',
    segment: 'Snacking',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 6.8,
  },
  {
    materialId: 'GBL-ING-CANE-SUGAR-01',
    name: 'Refined Cane Sugar',
    region: 'NA',
    segment: 'Snacking',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 0.85,
  },
  {
    materialId: 'GBL-ING-SALT-01',
    name: 'Refined Salt',
    region: 'EU',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 0.15,
  },
  {
    materialId: 'GBL-ING-ONION-PWD-01',
    name: 'Onion Powder',
    region: 'EU',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 3.2,
  },
  {
    materialId: 'GBL-ING-CELERY-EXT-01',
    name: 'Celery Extract',
    region: 'EU',
    segment: 'Food',
    status: 'Approved (Active)',
    materialType: 'ROH',
    unitCostPerKg: 5.5,
  },
];

// ---------------------------------------------------------------------------
// VERP -- packaging specs = 3 distinct Harmonized IDs (from 7 regional
// rows). One Material per harmonized ID (Boundaries); representative
// attributes prefer the mixed/messy-status regional row when variance
// exists.
// ---------------------------------------------------------------------------

const PACKAGING_MATERIALS: PackagingMaterial[] = [
  {
    // NA/EU Approved (Active), APAC Pending Harmonization -- the mixed
    // regional variance is the real signal (Boundaries), so that status
    // is the representative pick.
    materialId: 'GBL-PKG-15KG-01',
    name: '15kg Multi-wall Paper Bag',
    region: 'Global',
    segment: 'Petcare',
    status: 'Pending Harmonization',
    materialType: 'VERP',
  },
  {
    // NA/EU Approved (Active), APAC Draft -- same "prefer the messy
    // regional row" rationale.
    materialId: 'GBL-PKG-250G-FL',
    name: '250g Flexible Laminate Pouch',
    region: 'Global',
    segment: 'Food',
    status: 'Draft',
    materialType: 'VERP',
  },
  {
    materialId: 'GBL-PKG-CAN-400',
    name: 'Steel Can (400g)',
    region: 'Global',
    segment: 'Petcare',
    status: 'Approved (Active)',
    materialType: 'VERP',
  },
];

// ---------------------------------------------------------------------------
// PRNT -- printed specs = 6 real distinct Harmonized IDs (from 7 regional
// rows, GBL-PSPEC-BNS-250G merging 2 legacy rows) + 1 supplemented
// (M&M's EU) = 7.
// ---------------------------------------------------------------------------

const PRINTED_MATERIALS: PrintedMaterial[] = [
  {
    materialId: 'GBL-PSPEC-PED-15K-US',
    name: 'Pedigree / Adult Dry 15kg -- Print Spec (US)',
    region: 'NA',
    segment: 'Petcare',
    status: 'Synced',
    materialType: 'PRNT',
  },
  {
    materialId: 'GBL-PSPEC-PED-15K-EU',
    name: 'Pedigree / Adult Dry 15kg -- Print Spec (EU)',
    region: 'EU',
    segment: 'Petcare',
    status: 'Synced',
    materialType: 'PRNT',
  },
  {
    materialId: 'GBL-PSPEC-PED-15K-AP',
    name: 'Pedigree / Adult Dry 15kg -- Print Spec (APAC)',
    region: 'APAC',
    segment: 'Petcare',
    status: 'Out of Sync (Size Mismatch)',
    materialType: 'PRNT',
  },
  {
    materialId: 'GBL-PSPEC-MMS-250G',
    name: "M&M's / Sharing Pouch 250g -- Print Spec (US)",
    region: 'NA',
    segment: 'Snacking',
    status: 'Synced',
    materialType: 'PRNT',
  },
  {
    // Merges legacy PSPEC-FD-4401 (Synced) + PSPEC-FD-4409 (Out of Sync
    // (Trait Missing)) -- the messier status is the representative pick
    // (same rationale as the VERP merges above). Shared by BNS EU + BNS
    // APAC per its own harmonized ID.
    materialId: 'GBL-PSPEC-BNS-250G',
    name: "Ben's Original / Express 250g -- Print Spec",
    region: 'Global',
    segment: 'Food',
    status: 'Out of Sync (Trait Missing)',
    materialType: 'PRNT',
  },
  {
    materialId: 'GBL-PSPEC-WHS-400G',
    name: 'Whiskas / Pâté Can 400g -- Print Spec',
    region: 'NA',
    segment: 'Petcare',
    status: 'Synced',
    materialType: 'PRNT',
  },
  {
    // Supplemented -- no spreadsheet backing, authored alongside the new
    // M&M's EU FG.
    materialId: 'GBL-PSPEC-MMS-250G-EU',
    name: "M&M's / Sharing Pouch 250g -- Print Spec (EU)",
    region: 'EU',
    segment: 'Snacking',
    status: 'Draft',
    materialType: 'PRNT',
  },
];

/** Full seed `Material` set -- 12 FERT + 4 REAL_SUB + 4 SUB_RCP + 18 ROH
 * + 3 VERP + 7 PRNT = 48. See spec Design Notes for the derivation. */
export const MATERIALS: Material[] = [
  ...HERO_ROOT_FERTS,
  ...CATALOG_BREADTH_FERTS,
  ...MASTER_RECIPES,
  ...SUB_RECIPES,
  ...REAL_RAW_MATERIALS,
  ...GAP_FILL_RAW_MATERIALS,
  ...PACKAGING_MATERIALS,
  ...PRINTED_MATERIALS,
];
