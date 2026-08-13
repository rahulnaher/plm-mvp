/**
 * Seed `Relationship` rows (Story 2.2, FR-32): one Transport Spec/PI per
 * Hero Root FG (7), plus a DIR only where a source row shows one
 * attached (6) -- per this spec's Boundaries. Pedigree APAC is skipped
 * (source row explicitly "DIR Missing", matching its `Pending Release
 * (DIR Missing)` FG status) and M&M's EU is skipped (no source row
 * exists to attach one to -- an honest gap, not fabricated).
 */

import type { Relationship } from '../catalog';

export const RELATIONSHIPS: Relationship[] = [
  // --- Transport Spec / PI -- one per Hero Root FG (7). Authored;
  // `Spec Data.xlsx` has no Transport Specs sheet.
  {
    relationshipId: 'REL-PED-US-TPI',
    materialId: 'GBL-FG-PED-15K-US',
    kind: 'TRANSPORT_PI',
    label: 'Transport Spec / PI -- Pedigree 15kg (US)',
  },
  {
    relationshipId: 'REL-PED-EU-TPI',
    materialId: 'GBL-FG-PED-15K-EU',
    kind: 'TRANSPORT_PI',
    label: 'Transport Spec / PI -- Pedigree 15kg (EU)',
  },
  {
    relationshipId: 'REL-PED-AP-TPI',
    materialId: 'GBL-FG-PED-15K-AP',
    kind: 'TRANSPORT_PI',
    label: 'Transport Spec / PI -- Pedigree 15kg (APAC)',
  },
  {
    relationshipId: 'REL-MMS-US-TPI',
    materialId: 'GBL-FG-MMS-250G',
    kind: 'TRANSPORT_PI',
    label: "Transport Spec / PI -- M&M's 250g (US)",
  },
  {
    relationshipId: 'REL-MMS-EU-TPI',
    materialId: 'GBL-FG-MMS-250G-EU',
    kind: 'TRANSPORT_PI',
    label: "Transport Spec / PI -- M&M's 250g (EU)",
  },
  {
    relationshipId: 'REL-BNS-EU-TPI',
    materialId: 'GBL-FG-BNS-250G',
    kind: 'TRANSPORT_PI',
    label: "Transport Spec / PI -- Ben's Original 250g (EU)",
  },
  {
    relationshipId: 'REL-BNS-AP-TPI',
    materialId: 'GBL-FG-BNS-250G-AP',
    kind: 'TRANSPORT_PI',
    label: "Transport Spec / PI -- Ben's Original 250g (APAC)",
  },

  // --- DIR -- only where a source row shows one attached (6). Pedigree
  // US and EU share DIR-9921; M&M's US and Ben's Original EU each show
  // DIR-4450 in their own source rows (a coincidental shared doc number
  // across two distinct materials, not a modeling error).
  {
    relationshipId: 'REL-PED-US-DIR',
    materialId: 'GBL-FG-PED-15K-US',
    kind: 'DIR',
    label: 'DIR-9921',
  },
  {
    relationshipId: 'REL-PED-EU-DIR',
    materialId: 'GBL-FG-PED-15K-EU',
    kind: 'DIR',
    label: 'DIR-9921',
  },
  {
    relationshipId: 'REL-MMS-US-DIR',
    materialId: 'GBL-FG-MMS-250G',
    kind: 'DIR',
    label: 'DIR-4450',
  },
  {
    relationshipId: 'REL-BNS-EU-DIR',
    materialId: 'GBL-FG-BNS-250G',
    kind: 'DIR',
    label: 'DIR-4450',
  },
  {
    relationshipId: 'REL-BNS-AP-DIR',
    materialId: 'GBL-FG-BNS-250G-AP',
    kind: 'DIR',
    label: 'DIR-4451',
  },
  {
    relationshipId: 'REL-WHS-DIR',
    materialId: 'GBL-FG-WHS-400G',
    kind: 'DIR',
    label: 'DIR-8810',
  },
];
