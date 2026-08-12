<!-- bmad:context -->
<!-- Verified 2026-08-12 against working tree (repository initialized, no commits yet). Managed by bmad-project-context; edits inside this block are replaced on refresh. Keep anything you want preserved outside the markers. -->

## plm-mvp

React web app productionizing a Mars Global cPLM Reporting & Analytics MVP dashboard prototype (RFP response): a PLM Hub landing page plus 4 analytical reports (Specification Explorer, Top-Down Traceability, Bottom-Up Impact, Compare Specs) with role-based data masking. No code exists yet — greenfield. The full build brief, as-built spec, and finished design prototype live in `reference/Claude Code Handoff Package/`; read its `README.md` first.

## Policy

- Implement the 3-persona masking matrix (R&D Scientist / General Associate / Finance & Business) as client-side display masking — a core feature. Do NOT build server-side field-level RBAC or HC-zone data governance — synthetic data makes client-side sufficient.
- `reference/` is the complete source of truth for requirements — don't look for specs outside it.

## Where things are

- Build brief (tech stack, screens, logic, phased plan): `reference/Claude Code Handoff Package/Claude-Code-Project-Brief.md` — read before starting any screen work.
- As-built spec (screen behavior, masking rules, mock dataset, known gaps): `reference/Claude Code Handoff Package/Context-Brief-As-Built.html` — Section 8 is the mock dataset, Section 13 is known gaps.
- Visual/UX source of truth: `reference/Claude Code Handoff Package/Dashboard-Final-Design.html` — click through all 5 screens before building.
- Real SAP BOM schema (MAST, STKO, STPO, DRAW/DRAD): `reference/Requirement Docs/SAP Tables for MDG and PLM.xlsx` — model `bomExplosion`/`whereUsed` traversal on this structure, not the flat mock JSON.
- Real relational seed data (Packaging, Printing, Finished Goods, Recipe, Ingredient specs with harmonized IDs, formulation %, allergens): `reference/Requirement Docs/Spec Data.xlsx` — use as the mock-data seed.
- Other supporting requirement docs (discovery Q&A, RFP proposal): `reference/Requirement Docs/`.

## Running and verifying

- No build/test commands yet — TODO, fill in on first refresh once scaffolding lands (brief's Build Plan Phase 1).

## Conventions that differ from defaults

- Reuse the exact material IDs/values from the 40-item mock dataset (Context-Brief-As-Built.html Section 8, 3 hero BOM chains) rather than inventing new mock data — the recursive explosion/where-used logic must traverse real IDs from day one.

<!-- /bmad:context -->
