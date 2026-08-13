/**
 * Recursive BOM explosion engine (Story 3.1). One generic
 * `explodeBom(materialId, catalog)`, walking `Material` ->
 * `MaterialBomLink` -> `BomHeader` -> `BomItem` -> child `Material` in a
 * single post-order recursive pass, computing Level %, Level (Kg), and
 * Cost/Kg per node. Zero conditionals on a material's literal ID, name,
 * region, ID prefix, or segment (AD-1) -- the only branches are on
 * presence/absence of a `MaterialBomLink` row and the `Material` union's
 * `materialType` tag. Pure TS -- no react/zustand imports (lint-enforced,
 * eslint.config.js).
 *
 * Level %/Kg and Cost/Kg roll up along *different* axes in the same pass
 * (AD-3): Level %/Kg is cumulative from the root (product of every
 * `formulationPct` root-to-node); Cost/Kg is a local weighted-average
 * rollup, bottom-up (a change anywhere recomputes cost at every ancestor,
 * but never changes levelPct/Kg outside the mutated subtree). See this
 * package's spec Design Notes.
 */

import type { BomHeader, Catalog, Material, MaterialBomLink } from '../data/catalog';
import type { BomNode, MaterialId, TraversalResult } from './types';

/** Private, module-internal sentinel -- thrown by `buildNode` when the
 * active recursion path revisits a materialId already on it (a cyclic
 * BOM reference). Never escapes this module: `explodeBom` catches this
 * exact type and converts it to `{status:'empty', reason}`, so the
 * "never throws" invariant still holds at the public API. Deliberately
 * NOT swallowed into a fake leaf inside `buildNode` -- truncating the
 * cyclic branch would silently under-report composition/cost, which
 * runs counter to this project's anti-fabrication principle; an honest
 * whole-call failure is required instead. */
class BomCycleError {
  readonly materialId: MaterialId;

  constructor(materialId: MaterialId) {
    this.materialId = materialId;
  }
}

function findLink(materialId: MaterialId, catalog: Catalog): MaterialBomLink | undefined {
  return catalog.materialBomLinks.find((link) => link.materialId === materialId);
}

function findHeader(bomHeaderId: string, catalog: Catalog): BomHeader | undefined {
  return catalog.bomHeaders.find((header) => header.bomHeaderId === bomHeaderId);
}

/** Leaf cost input: `unitCostPerKg` exists ONLY on the `ROH` variant
 * (AD-3, type-enforced -- see test/types/catalog.type-test.ts). The only
 * branch in this module driven by `materialType` rather than
 * link/header presence. */
function leafCost(material: Material): number {
  return material.materialType === 'ROH' ? material.unitCostPerKg : 0;
}

/** Private post-order recursive helper. `levelPct` is this node's
 * cumulative Level % (already resolved by the caller from the parent's
 * cumulative levelPct x this item's own local `formulationPct`);
 * `rootBaseQuantityKg` is fixed for the whole walk -- `BomHeader
 * .baseQuantityKg` of a non-root node is never read for level math (see
 * spec Design Notes). Cost is computed bottom-up in the same call: a leaf
 * (no own `MaterialBomLink`, or a link with no resolvable `BomHeader`)
 * costs `leafCost(material)`; a non-leaf costs the sum of each child's
 * cost weighted by that child's own local `formulationPct`.
 *
 * `ancestorPath` is the set of materialIds on the active recursion path
 * (root through this node's direct parent) -- guards against a cyclic
 * BOM reference (e.g. a sub-recipe whose chain eventually lists an
 * ancestor material as a component), which would otherwise recurse
 * forever and crash with an unhandled stack-overflow RangeError. Throws
 * `BomCycleError` (caught only by `explodeBom`) rather than recursing. */
function buildNode(
  material: Material,
  catalog: Catalog,
  rootBaseQuantityKg: number,
  levelPct: number,
  ancestorPath: ReadonlySet<MaterialId>,
): BomNode {
  if (ancestorPath.has(material.materialId)) {
    throw new BomCycleError(material.materialId);
  }
  const pathWithSelf = new Set(ancestorPath);
  pathWithSelf.add(material.materialId);

  const levelKg = (levelPct / 100) * rootBaseQuantityKg;

  const link = findLink(material.materialId, catalog);
  const header = link ? findHeader(link.bomHeaderId, catalog) : undefined;

  if (!header) {
    return {
      materialId: material.materialId,
      material,
      levelPct,
      levelKg,
      cost: leafCost(material),
      children: [],
    };
  }

  const items = catalog.bomItems.filter((item) => item.bomHeaderId === header.bomHeaderId);

  const children: BomNode[] = [];
  let cost = 0;

  for (const item of items) {
    const childMaterial = catalog.materials.find((m) => m.materialId === item.componentMaterialId);
    if (!childMaterial) {
      continue;
    }

    const childLevelPct = levelPct * (item.formulationPct / 100);
    const childNode = buildNode(childMaterial, catalog, rootBaseQuantityKg, childLevelPct, pathWithSelf);

    children.push(childNode);
    cost += childNode.cost * (item.formulationPct / 100);
  }

  return {
    materialId: material.materialId,
    material,
    levelPct,
    levelKg,
    cost,
    children,
  };
}

/**
 * Explodes `materialId`'s BOM into a resolved `BomNode` tree (AD-1/AD-3/
 * AD-4). Returns `{status:'empty', reason}` -- never throws -- when the
 * material doesn't exist in `catalog`, when it has no own
 * `MaterialBomLink`/resolvable `BomHeader` (no BOM modeled for it, e.g. a
 * Catalog-Breadth FERT, or an unknown ID), or when its BOM chain cycles
 * back to an ancestor material (an honest whole-call failure, not a
 * truncated/partial tree -- see `BomCycleError` above). Root `levelPct`
 * is always 100; root `levelKg` is `BomHeader.baseQuantityKg` of the
 * root's own BOM.
 */
export function explodeBom(materialId: MaterialId, catalog: Catalog): TraversalResult {
  const material = catalog.materials.find((m) => m.materialId === materialId);
  if (!material) {
    return { status: 'empty', reason: `No Material found for id "${materialId}"` };
  }

  const link = findLink(materialId, catalog);
  if (!link) {
    return { status: 'empty', reason: `Material "${materialId}" has no MaterialBomLink -- no BOM modeled` };
  }

  const header = findHeader(link.bomHeaderId, catalog);
  if (!header) {
    return {
      status: 'empty',
      reason: `MaterialBomLink for "${materialId}" references unknown BomHeader "${link.bomHeaderId}"`,
    };
  }

  try {
    const tree = buildNode(material, catalog, header.baseQuantityKg, 100, new Set());
    return { status: 'ok', tree };
  } catch (err) {
    if (err instanceof BomCycleError) {
      return {
        status: 'empty',
        reason: `Cyclic BOM reference detected: material "${err.materialId}" appears as its own ancestor`,
      };
    }
    throw err;
  }
}
