import { describe, expect, it } from 'vitest';
import type { Catalog } from '../../src/data/catalog';
import type { BomNode } from '../../src/logic/types';
import { BOM_HEADERS, BOM_ITEMS, MATERIALS, MATERIAL_BOM_LINKS } from '../../src/data/seed';
import { explodeBom } from '../../src/logic/bomExplosion';
import { SYNTHETIC_CATALOG, SYNTHETIC_ROOT_ID } from '../fixtures/synthetic-chain';

const REAL_CATALOG: Catalog = {
  materials: MATERIALS,
  materialBomLinks: MATERIAL_BOM_LINKS,
  bomHeaders: BOM_HEADERS,
  bomItems: BOM_ITEMS,
};

const HERO_ROOT_IDS = [
  'GBL-FG-PED-15K-US',
  'GBL-FG-PED-15K-EU',
  'GBL-FG-PED-15K-AP',
  'GBL-FG-MMS-250G',
  'GBL-FG-MMS-250G-EU',
  'GBL-FG-BNS-250G',
  'GBL-FG-BNS-250G-AP',
];

/** Finds a descendant by materialId anywhere in the tree (BFS) -- test
 * helper only, not part of the traversal engine. */
function findNode(root: BomNode, materialId: string): BomNode | undefined {
  if (root.materialId === materialId) {
    return root;
  }
  for (const child of root.children) {
    const found = findNode(child, materialId);
    if (found) {
      return found;
    }
  }
  return undefined;
}

describe('explodeBom -- Hero Roots (all 7)', () => {
  it('resolves ok for every one of the 7 Hero Roots via the same call, no per-root branch', () => {
    for (const rootId of HERO_ROOT_IDS) {
      const result = explodeBom(rootId, REAL_CATALOG);

      expect(result.status).toBe('ok');
    }
  });

  it('every Hero Root tree\'s own node has levelPct=100 and levelKg = its BomHeader.baseQuantityKg', () => {
    for (const rootId of HERO_ROOT_IDS) {
      const result = explodeBom(rootId, REAL_CATALOG);
      if (result.status !== 'ok') {
        throw new Error(`expected ok for ${rootId}`);
      }

      const header = BOM_HEADERS.find((h) => h.bomHeaderId === `BOM-${rootId}`);
      expect(header).toBeDefined();
      expect(result.tree.levelPct).toBe(100);
      expect(result.tree.levelKg).toBeCloseTo(header!.baseQuantityKg, 10);
    }
  });

  it('Pedigree US (baseQuantityKg=15): recipe node levelPct=96/levelKg=14.4 (spec worked example)', () => {
    const result = explodeBom('GBL-FG-PED-15K-US', REAL_CATALOG);
    if (result.status !== 'ok') {
      throw new Error('expected ok');
    }

    const recipe = findNode(result.tree, 'RCP-PED-CHICKEN-01');
    expect(recipe).toBeDefined();
    expect(recipe!.levelPct).toBe(96);
    expect(recipe!.levelKg).toBeCloseTo(14.4, 10);
    // NOTE: the frozen spec's I/O matrix states this node's cost as
    // "≈1.1326". Hand-computed bottom-up per the spec's own formula
    // (leaf=unitCostPerKg for ROH, non-leaf=Σ child.cost x child's local
    // formulationPct/100) against the actual seed data in
    // src/data/seed/{materials,boms}.ts gives 1.17975, confirmed
    // independently outside this test (see Spec Change Log in
    // spec-3-1-recursive-bom-explosion-engine.md). Asserting the
    // data-true value here, not the spec's approximate figure.
    expect(recipe!.cost).toBeCloseTo(1.17975, 10);
  });

  it('M&M\'s US (baseQuantityKg=0.25): recipe node levelPct=96/levelKg=0.24/cost=3.978625', () => {
    const result = explodeBom('GBL-FG-MMS-250G', REAL_CATALOG);
    if (result.status !== 'ok') {
      throw new Error('expected ok');
    }

    const recipe = findNode(result.tree, 'RCP-MMS-MILK-01');
    expect(recipe).toBeDefined();
    expect(recipe!.levelPct).toBe(96);
    expect(recipe!.levelKg).toBeCloseTo(0.24, 10);
    expect(recipe!.cost).toBeCloseTo(3.978625, 10);
  });

  it('Ben\'s Original EU (baseQuantityKg=0.25): recipe node levelPct=96/levelKg=0.24/cost=0.7282', () => {
    const result = explodeBom('GBL-FG-BNS-250G', REAL_CATALOG);
    if (result.status !== 'ok') {
      throw new Error('expected ok');
    }

    const recipe = findNode(result.tree, 'RCP-BNS-RICE-01');
    expect(recipe).toBeDefined();
    expect(recipe!.levelPct).toBe(96);
    expect(recipe!.levelKg).toBeCloseTo(0.24, 10);
    expect(recipe!.cost).toBeCloseTo(0.7282, 10);
  });
});

describe('explodeBom -- synthetic 8th chain (AD-1 guard)', () => {
  it('resolves ok and every node matches hand-computed values, zero code change', () => {
    const result = explodeBom(SYNTHETIC_ROOT_ID, SYNTHETIC_CATALOG);
    if (result.status !== 'ok') {
      throw new Error('expected ok');
    }

    const root = result.tree;
    expect(root.levelPct).toBe(100);
    expect(root.levelKg).toBeCloseTo(0.5, 10);
    expect(root.cost).toBeCloseTo(2.232, 10);
    expect(root.children).toHaveLength(3);

    expect(findNode(root, 'SYN-RCP-DEMO-01')).toBeDefined();
    const recipe = findNode(root, 'SYN-RCP-DEMO-01')!;
    expect(recipe.levelPct).toBeCloseTo(90, 10);
    expect(recipe.levelKg).toBeCloseTo(0.45, 10);
    expect(recipe.cost).toBeCloseTo(2.48, 10);

    expect(findNode(root, 'SYN-PKG-DEMO-01')).toBeDefined();
    const packaging = findNode(root, 'SYN-PKG-DEMO-01')!;
    expect(packaging.levelPct).toBeCloseTo(7, 10);
    expect(packaging.levelKg).toBeCloseTo(0.035, 10);
    expect(packaging.cost).toBe(0);
    expect(packaging.children).toHaveLength(0);

    expect(findNode(root, 'SYN-PSPEC-DEMO-01')).toBeDefined();
    const print = findNode(root, 'SYN-PSPEC-DEMO-01')!;
    expect(print.levelPct).toBeCloseTo(3, 10);
    expect(print.levelKg).toBeCloseTo(0.015, 10);
    expect(print.cost).toBe(0);
    expect(print.children).toHaveLength(0);

    expect(findNode(root, 'SYN-ING-BASE-01')).toBeDefined();
    const base = findNode(root, 'SYN-ING-BASE-01')!;
    expect(base.levelPct).toBeCloseTo(63, 10);
    expect(base.levelKg).toBeCloseTo(0.315, 10);
    expect(base.cost).toBe(2.0);
    expect(base.children).toHaveLength(0);

    expect(findNode(root, 'SYN-SUB-RCP-DEMO-01')).toBeDefined();
    const subRecipe = findNode(root, 'SYN-SUB-RCP-DEMO-01')!;
    expect(subRecipe.levelPct).toBeCloseTo(27, 10);
    expect(subRecipe.levelKg).toBeCloseTo(0.135, 10);
    expect(subRecipe.cost).toBeCloseTo(3.6, 10);

    expect(findNode(root, 'SYN-ING-ADDITIVE-01')).toBeDefined();
    const additive1 = findNode(root, 'SYN-ING-ADDITIVE-01')!;
    expect(additive1.levelPct).toBeCloseTo(16.2, 10);
    expect(additive1.levelKg).toBeCloseTo(0.081, 10);
    expect(additive1.cost).toBe(5.0);

    expect(findNode(root, 'SYN-ING-ADDITIVE-02')).toBeDefined();
    const additive2 = findNode(root, 'SYN-ING-ADDITIVE-02')!;
    expect(additive2.levelPct).toBeCloseTo(10.8, 10);
    expect(additive2.levelKg).toBeCloseTo(0.054, 10);
    expect(additive2.cost).toBe(1.5);
  });
});

describe('explodeBom -- AD-3 leaf mutation guard', () => {
  it('leaf unitCostPerKg mutated: every ancestor\'s cost recomputes, levelPct/levelKg unchanged everywhere', () => {
    const before = explodeBom('GBL-FG-PED-15K-US', REAL_CATALOG);
    if (before.status !== 'ok') {
      throw new Error('expected ok');
    }

    const clonedCatalog: Catalog = structuredClone(REAL_CATALOG);
    const chickenMeal = clonedCatalog.materials.find((m) => m.materialId === 'GBL-ING-CHICK-MEAL-01');
    if (!chickenMeal || chickenMeal.materialType !== 'ROH') {
      throw new Error('expected GBL-ING-CHICK-MEAL-01 to be a ROH material in the cloned catalog');
    }
    chickenMeal.unitCostPerKg = 99;

    const after = explodeBom('GBL-FG-PED-15K-US', clonedCatalog);
    if (after.status !== 'ok') {
      throw new Error('expected ok');
    }

    // Ancestors of the mutated leaf -- cost recomputes.
    const beforeRecipe = findNode(before.tree, 'RCP-PED-CHICKEN-01')!;
    const afterRecipe = findNode(after.tree, 'RCP-PED-CHICKEN-01')!;
    expect(afterRecipe.cost).not.toBeCloseTo(beforeRecipe.cost, 5);
    expect(after.tree.cost).not.toBeCloseTo(before.tree.cost, 5);

    // A sibling subtree untouched by the mutation -- cost unchanged.
    const beforeVit = findNode(before.tree, 'SUB-RCP-VIT-01')!;
    const afterVit = findNode(after.tree, 'SUB-RCP-VIT-01')!;
    expect(afterVit.cost).toBeCloseTo(beforeVit.cost, 10);

    // levelPct/levelKg unchanged everywhere in the tree -- cost and level
    // roll up along different axes (AD-3).
    function assertLevelsUnchanged(a: BomNode, b: BomNode) {
      expect(b.levelPct).toBeCloseTo(a.levelPct, 10);
      expect(b.levelKg).toBeCloseTo(a.levelKg, 10);
      expect(b.children).toHaveLength(a.children.length);
      for (let i = 0; i < a.children.length; i++) {
        assertLevelsUnchanged(a.children[i], b.children[i]);
      }
    }
    assertLevelsUnchanged(before.tree, after.tree);
  });
});

describe('explodeBom -- AD-3 local formulationPct mutation guard', () => {
  it('BomItem.formulationPct mutated: mutated node+subtree levelPct/levelKg change, cost recomputes up to the root, root levelPct/levelKg invariant', () => {
    const before = explodeBom('GBL-FG-PED-15K-US', REAL_CATALOG);
    if (before.status !== 'ok') {
      throw new Error('expected ok');
    }

    const clonedCatalog: Catalog = structuredClone(REAL_CATALOG);
    const vitItem = clonedCatalog.bomItems.find(
      (item) => item.bomHeaderId === 'BOM-RCP-PED-CHICKEN-01' && item.componentMaterialId === 'SUB-RCP-VIT-01',
    );
    if (!vitItem) {
      throw new Error('expected to find the SUB-RCP-VIT-01 BomItem under BOM-RCP-PED-CHICKEN-01');
    }
    vitItem.formulationPct = 20; // was 6

    const after = explodeBom('GBL-FG-PED-15K-US', clonedCatalog);
    if (after.status !== 'ok') {
      throw new Error('expected ok');
    }

    // Root's own levelPct/levelKg invariant.
    expect(after.tree.levelPct).toBe(before.tree.levelPct);
    expect(after.tree.levelKg).toBeCloseTo(before.tree.levelKg, 10);

    // The recipe node's own levelPct/levelKg also unchanged -- it's the
    // mutated item's parent, not inside the mutated subtree itself.
    const beforeRecipe = findNode(before.tree, 'RCP-PED-CHICKEN-01')!;
    const afterRecipe = findNode(after.tree, 'RCP-PED-CHICKEN-01')!;
    expect(afterRecipe.levelPct).toBeCloseTo(beforeRecipe.levelPct, 10);
    expect(afterRecipe.levelKg).toBeCloseTo(beforeRecipe.levelKg, 10);

    // The mutated node + its subtree -- levelPct/levelKg change.
    const beforeVit = findNode(before.tree, 'SUB-RCP-VIT-01')!;
    const afterVit = findNode(after.tree, 'SUB-RCP-VIT-01')!;
    expect(afterVit.levelPct).toBeCloseTo(96 * (20 / 100), 10);
    expect(afterVit.levelPct).not.toBeCloseTo(beforeVit.levelPct, 5);
    expect(afterVit.levelKg).not.toBeCloseTo(beforeVit.levelKg, 5);

    const beforeZinc = findNode(before.tree, 'GBL-ING-ZINC-SULF-01')!;
    const afterZinc = findNode(after.tree, 'GBL-ING-ZINC-SULF-01')!;
    expect(afterZinc.levelPct).not.toBeCloseTo(beforeZinc.levelPct, 5);

    // Cost recomputes at every ancestor to the root.
    expect(afterRecipe.cost).not.toBeCloseTo(beforeRecipe.cost, 5);
    expect(after.tree.cost).not.toBeCloseTo(before.tree.cost, 5);

    // A sibling subtree (not an ancestor, not the mutated subtree) --
    // levelPct/levelKg/cost all unchanged.
    const beforeWheat = findNode(before.tree, 'GBL-ING-WHEAT-WHL-01')!;
    const afterWheat = findNode(after.tree, 'GBL-ING-WHEAT-WHL-01')!;
    expect(afterWheat.levelPct).toBeCloseTo(beforeWheat.levelPct, 10);
    expect(afterWheat.levelKg).toBeCloseTo(beforeWheat.levelKg, 10);
    expect(afterWheat.cost).toBeCloseTo(beforeWheat.cost, 10);
  });
});

describe('explodeBom -- cyclic BOM guard', () => {
  it('returns {status: "empty"} and does not throw/hang when a BOM chain cycles back to an ancestor material', () => {
    // CYC-A -> CYC-B -> CYC-C -> CYC-A (cycles back to the root, its own
    // ancestor). A minimal, self-contained, ad hoc cyclic catalog --
    // deliberately not the AD-1/AD-3 fixture, which is hand-verified
    // acyclic.
    const cyclicCatalog: Catalog = {
      materials: [
        {
          materialId: 'CYC-A',
          name: 'Cyclic Test Root',
          region: 'Global',
          segment: 'Food',
          status: 'Approved (Active)',
          materialType: 'FERT',
        },
        {
          materialId: 'CYC-B',
          name: 'Cyclic Test Recipe',
          region: 'Global',
          segment: 'Food',
          status: 'Approved (Active)',
          materialType: 'REAL_SUB',
          allergens: [],
        },
        {
          materialId: 'CYC-C',
          name: 'Cyclic Test Sub-Recipe',
          region: 'Global',
          segment: 'Food',
          status: 'Approved (Active)',
          materialType: 'SUB_RCP',
          allergens: [],
        },
      ],
      materialBomLinks: [
        { materialId: 'CYC-A', bomHeaderId: 'CYC-BOM-A' },
        { materialId: 'CYC-B', bomHeaderId: 'CYC-BOM-B' },
        { materialId: 'CYC-C', bomHeaderId: 'CYC-BOM-C' },
      ],
      bomHeaders: [
        { bomHeaderId: 'CYC-BOM-A', baseQuantityKg: 1 },
        { bomHeaderId: 'CYC-BOM-B', baseQuantityKg: 1 },
        { bomHeaderId: 'CYC-BOM-C', baseQuantityKg: 1 },
      ],
      bomItems: [
        { bomItemId: 'CYC-BI-A', bomHeaderId: 'CYC-BOM-A', componentMaterialId: 'CYC-B', formulationPct: 100 },
        { bomItemId: 'CYC-BI-B', bomHeaderId: 'CYC-BOM-B', componentMaterialId: 'CYC-C', formulationPct: 100 },
        // Cycles back to CYC-A, the root -- CYC-A is its own ancestor here.
        { bomItemId: 'CYC-BI-C', bomHeaderId: 'CYC-BOM-C', componentMaterialId: 'CYC-A', formulationPct: 100 },
      ],
    };

    expect(() => explodeBom('CYC-A', cyclicCatalog)).not.toThrow();

    const result = explodeBom('CYC-A', cyclicCatalog);
    expect(result.status).toBe('empty');
    if (result.status === 'empty') {
      expect(typeof result.reason).toBe('string');
      expect(result.reason.length).toBeGreaterThan(0);
    }
  });
});

describe('explodeBom -- no-BOM / unknown id', () => {
  it('returns {status: "empty"} for a real Material with no modeled BOM (Catalog-Breadth FERT), never throws', () => {
    expect(() => explodeBom('GBL-FG-WHS-400G', REAL_CATALOG)).not.toThrow();

    const result = explodeBom('GBL-FG-WHS-400G', REAL_CATALOG);
    expect(result.status).toBe('empty');
    if (result.status === 'empty') {
      expect(typeof result.reason).toBe('string');
      expect(result.reason.length).toBeGreaterThan(0);
    }
  });

  it('returns {status: "empty"} for an unknown id, never throws', () => {
    expect(() => explodeBom('NOT-A-REAL-ID', REAL_CATALOG)).not.toThrow();

    const result = explodeBom('NOT-A-REAL-ID', REAL_CATALOG);
    expect(result.status).toBe('empty');
    if (result.status === 'empty') {
      expect(typeof result.reason).toBe('string');
      expect(result.reason.length).toBeGreaterThan(0);
    }
  });
});
