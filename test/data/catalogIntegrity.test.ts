import { describe, expect, it } from 'vitest';
import { BOM_HEADERS, BOM_ITEMS, MATERIAL_BOM_LINKS, MATERIALS, RELATIONSHIPS } from '../../src/data/seed';

const FORMULATION_TOLERANCE = 0.1;

describe('catalog integrity (Story 2.2)', () => {
  it('every BomItem.componentMaterialId resolves to a real Material -- no dangling FKs', () => {
    const materialIds = new Set(MATERIALS.map((m) => m.materialId));

    for (const item of BOM_ITEMS) {
      expect(materialIds.has(item.componentMaterialId)).toBe(true);
    }
  });

  it('every MaterialBomLink.bomHeaderId resolves to a real BomHeader -- no dangling FKs', () => {
    const headerIds = new Set(BOM_HEADERS.map((h) => h.bomHeaderId));

    for (const link of MATERIAL_BOM_LINKS) {
      expect(headerIds.has(link.bomHeaderId)).toBe(true);
    }
  });

  it('every MaterialBomLink.materialId resolves to a real Material -- no dangling FKs', () => {
    const materialIds = new Set(MATERIALS.map((m) => m.materialId));

    for (const link of MATERIAL_BOM_LINKS) {
      expect(materialIds.has(link.materialId)).toBe(true);
    }
  });

  it('every Relationship.materialId resolves to a real Material -- no dangling FKs', () => {
    const materialIds = new Set(MATERIALS.map((m) => m.materialId));

    for (const rel of RELATIONSHIPS) {
      expect(materialIds.has(rel.materialId)).toBe(true);
    }
  });

  it('every BomHeader\'s direct BomItems sum to 100% (+/-0.1)', () => {
    for (const header of BOM_HEADERS) {
      const total = BOM_ITEMS.filter((item) => item.bomHeaderId === header.bomHeaderId).reduce(
        (sum, item) => sum + item.formulationPct,
        0,
      );

      expect(Math.abs(total - 100)).toBeLessThanOrEqual(FORMULATION_TOLERANCE);
    }
  });

  it('RCP-PED-CHICKEN-02 (APAC Pedigree) contains a BomItem for GBL-ING-WHEAT-WHL-01 (gap #4)', () => {
    const wheatItem = BOM_ITEMS.find(
      (item) => item.bomHeaderId === 'BOM-RCP-PED-CHICKEN-02' && item.componentMaterialId === 'GBL-ING-WHEAT-WHL-01',
    );

    expect(wheatItem).toBeDefined();
  });

  it('every ROH Material has unitCostPerKg > 0 (AD-3: cost authored on ROH leaves only)', () => {
    const rawMaterials = MATERIALS.filter((m) => m.materialType === 'ROH');

    expect(rawMaterials.length).toBeGreaterThan(0);
    for (const material of rawMaterials) {
      expect(material.unitCostPerKg).toBeGreaterThan(0);
    }
  });

  it('reports the actual assembled catalog size -- not the stale 64-item figure', () => {
    // See spec-2-2-seed-data-assembly-64-item-catalog-gap-fill-authoring.md
    // Design Notes: full-fidelity parsing of Spec Data.xlsx's actual
    // formulation text (no line dropped to hit a target count) derives
    // 48 total Materials, not 64 -- the as-built prototype's stale
    // reverse-engineered figure. This assertion is the actual derived
    // count, not a re-assertion of 64.
    expect(MATERIALS.length).toBe(48);
  });

  it('never drops below 7 Hero Roots -- confirmed requirement (PRD Glossary, epics.md, sprint-status)', () => {
    const heroRootIds = [
      'GBL-FG-PED-15K-US',
      'GBL-FG-PED-15K-EU',
      'GBL-FG-PED-15K-AP',
      'GBL-FG-MMS-250G',
      'GBL-FG-MMS-250G-EU',
      'GBL-FG-BNS-250G',
      'GBL-FG-BNS-250G-AP',
    ];
    const materialIds = new Set(MATERIALS.map((m) => m.materialId));

    expect(heroRootIds.length).toBe(7);
    for (const id of heroRootIds) {
      expect(materialIds.has(id)).toBe(true);
    }
  });

  it('every Material.materialId is unique -- one record per Harmonized Global Spec ID', () => {
    const ids = MATERIALS.map((m) => m.materialId);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every BomHeader has at least one BomItem, and no BomItem references an unknown header', () => {
    const headerIds = new Set(BOM_HEADERS.map((h) => h.bomHeaderId));

    for (const item of BOM_ITEMS) {
      expect(headerIds.has(item.bomHeaderId)).toBe(true);
    }
    for (const header of BOM_HEADERS) {
      const hasItems = BOM_ITEMS.some((item) => item.bomHeaderId === header.bomHeaderId);
      expect(hasItems).toBe(true);
    }
  });

  it('every BomItem.bomItemId is unique', () => {
    const ids = BOM_ITEMS.map((item) => item.bomItemId);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every BomHeader.bomHeaderId is unique', () => {
    const ids = BOM_HEADERS.map((header) => header.bomHeaderId);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every Relationship.relationshipId is unique', () => {
    const ids = RELATIONSHIPS.map((rel) => rel.relationshipId);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every BomItem.formulationPct is > 0 and <= 100', () => {
    for (const item of BOM_ITEMS) {
      expect(item.formulationPct).toBeGreaterThan(0);
      expect(item.formulationPct).toBeLessThanOrEqual(100);
    }
  });

  it('DIR relationships are attached to exactly the 6 expected Hero Root FGs, skipping Pedigree APAC and M&M\'s EU', () => {
    const expectedDirMaterialIds = [
      'GBL-FG-PED-15K-US',
      'GBL-FG-PED-15K-EU',
      'GBL-FG-MMS-250G',
      'GBL-FG-BNS-250G',
      'GBL-FG-BNS-250G-AP',
      'GBL-FG-WHS-400G',
    ];
    const dirMaterialIds = RELATIONSHIPS.filter((r) => r.kind === 'DIR').map((r) => r.materialId);

    expect(new Set(dirMaterialIds)).toEqual(new Set(expectedDirMaterialIds));
    expect(dirMaterialIds).not.toContain('GBL-FG-PED-15K-AP');
    expect(dirMaterialIds).not.toContain('GBL-FG-MMS-250G-EU');
  });

  it('every one of the 7 Hero Root FGs has exactly one TRANSPORT_PI relationship', () => {
    const heroRootIds = [
      'GBL-FG-PED-15K-US',
      'GBL-FG-PED-15K-EU',
      'GBL-FG-PED-15K-AP',
      'GBL-FG-MMS-250G',
      'GBL-FG-MMS-250G-EU',
      'GBL-FG-BNS-250G',
      'GBL-FG-BNS-250G-AP',
    ];

    for (const id of heroRootIds) {
      const transportPiCount = RELATIONSHIPS.filter(
        (r) => r.materialId === id && r.kind === 'TRANSPORT_PI',
      ).length;

      expect(transportPiCount).toBe(1);
    }
  });

  it('no Catalog-Breadth FERT ever appears as a MaterialBomLink.materialId -- never a modeled BOM', () => {
    const catalogBreadthIds = [
      'GBL-FG-WHS-400G',
      'GBL-FG-DOVE-100G',
      'GBL-FG-UBN-500G',
      'GBL-FG-CSR-85G',
      'GBL-FG-SNK-50G',
    ];
    const linkedMaterialIds = new Set(MATERIAL_BOM_LINKS.map((link) => link.materialId));

    for (const id of catalogBreadthIds) {
      expect(linkedMaterialIds.has(id)).toBe(false);
    }
  });

  it('no materialId appears in more than one MaterialBomLink row', () => {
    const materialIds = MATERIAL_BOM_LINKS.map((link) => link.materialId);

    expect(new Set(materialIds).size).toBe(materialIds.length);
  });
});
