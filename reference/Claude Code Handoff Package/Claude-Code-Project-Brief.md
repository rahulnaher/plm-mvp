# Mars Global cPLM Reporting & Analytics MVP — Claude Code Project Brief

## 1. Goal & summary

Build a working React web app that reproduces and productionizes the interactive dashboard prototype in `Dashboard-Final-Design.html`. The app is Mars Global's MVP response to an RFP for a cross-segment (Petcare / Snacking / Food) PLM reporting suite: a landing hub plus four analytical reports covering ingredient-to-finished-good traceability, impact analysis, cross-type comparison, and spec search — all with role-based data masking. This is a **design reference**, not production code to copy directly: recreate the structure, styling, and interactions in a real React codebase using proper component architecture, not by embedding the HTML.

## 2. Tech stack

- **Framework:** React (per the solution deck, chosen over native Power BI specifically to render non-parent-child BOM hierarchies without visual/licensing constraints, and to hit sub-30-second load SLAs without per-user licensing costs).
- **Component patterns to match:**
  - Segmented multiselect dropdown filters with independent Apply/Cancel (Hub's Segment/Region filters, Explorer's Query Builder checkboxes) — a Popover + checkbox-list pattern (Radix Popover, or shadcn/ui's multiselect-combobox pattern, works well).
  - A ToggleGroup/segmented-control pattern is an acceptable alternative to the dropdown filters if the team prefers instant-apply toggles over the explicit Apply step (see Section 8, open question).
  - Data tables with sortable/expandable rows: build the Traceability composition table as a proper recursive/flattened tree component, not a flat table — see Section 4.
  - Badge/pill components for status (Active/Draft/Phased Out) and material type tags.
  - A slide-in / drawer panel for the Traceability node-detail view.
- **Styling:** Mars Petcare design-system tokens (colors, type, spacing, radius) — see the bundled DS token files referenced in the design HTML's `<head>`. Note: the shipped prototype overrides the DS's default red/cream palette with a blue enterprise theme by explicit client request (navy `#0B2A4A` / `#0B2745`, active blue `#1E6FD9`, cool cream `#F4F7FB`) — carry that override forward; do not revert to DS red.
- **Charts:** the Health Trend bars are simple horizontal stacked bars — Recharts (or any lightweight chart lib) is sufficient; no complex charting library is required for this MVP.

## 3. Screens & behaviours (as built — see Context-Brief-As-Built.html Section 4 for full detail)

1. **PLM Hub** — segment/region filters (dropdown multiselect + Apply) drive 5 KPI cards; alerts list filters by segment; per-segment Active-vs-Phased-Out bars (unfiltered, whole-portfolio view); 4 report tiles link to the other screens; recent/pinned views table.
2. **Specification Explorer** — Query Builder (free text + type/region/segment/status checkboxes) behind an Execute Query action; results table with row checkboxes, masked cost/formulation columns, and a per-row action menu (Explode BOM → Traceability, Analyze Blast Radius → Impact, Add to Compare); a floating "Compare Selected" CTA appears once 2+ rows are checked.
3. **Top-Down Traceability** — root FERT picker; 4 KPI tiles; an expand/collapse composition table (indented by depth, with Level % and Level Kg columns); clicking a row opens a slide-in detail panel.
4. **Bottom-Up Impact** — source-material picker (any non-FERT node); 3 KPI tiles; a Detailed Impact Paths table (region, site, master recipe, finished good, level %, level kg, masked cost).
5. **Compare Specs** — operates on the selection carried over from Explorer; 4 tabs (Attributes, BOM Composition, Packaging Data, Printed Spec Data); Highlight Differences toggle hides rows/cards where all targets match.

## 4. Logic to implement (the real engineering work)

- **Recursive top-down BOM explosion (Traceability).** Given a root spec ID, recursively expand its full BOM tree (FG → packaging/print + master recipe → raw materials/sub-recipes → nested raw materials), computing Level % and Level (Kg) at each depth from the recipe's declared formulation percentages. The prototype hand-authors this tree per hero product; production must derive it from actual PLM/MDG BOM tables (recursive parent→child material relationships), because — per the discovery Q&A — this recursive logic does **not** exist yet in Mars' current data lake and is explicitly in the vendor's build scope.
- **Recursive bottom-up where-used / impact trace (Impact).** Given a source material ID, walk *up* the BOM graph to find every recipe and finished good (across every region/plant) that consumes it, at any depth, and surface the % and kg contribution at each level plus a computed cost dependency. Must handle a single raw material shared across multiple regional variants (the prototype's Whole Grain Wheat example spans 3 Pedigree regions) and return all of them.
- **Persona-based data masking (full matrix).**

  | Persona | Cost / Kg | Formulation % & Allergens |
  |---|---|---|
  | R&D Scientist | Visible | Visible |
  | General Associate | Masked | Masked |
  | Finance & Business | Visible | Masked |

  Apply consistently across Explorer, Traceability, Impact, and Compare. In the prototype this is a client-side display mask on a single shared dataset — **production must implement this as real server-side field-level authorization**, not just UI hiding, since HC-zone data governance is a hard RFP requirement.
- **Explorer state persistence across navigation.** Query Builder filter selections (both pending and applied), the results-table row selection (used by Compare), and the last-clicked spec ID (used to default the Traceability root / Impact source picker) must all survive navigating away to Traceability/Impact/Compare and back — implement via a shared app-level store (Context, Redux, Zustand, etc.), not component-local state that unmounts.
- **Compare across multiple material types.** Attribute rows (Status, Region, Segment, Type, Plant, Cost/Kg, Formulation %, Allergens) always render for every selected target regardless of type. BOM Composition, Packaging Data, and Printed Spec Data are additional per-target panels that populate only when that target actually has that kind of data (a VERP shows packaging fields; a FERT/REAL_SUB shows a BOM summary; otherwise the panel stays empty/hidden for that target) — this is a shared-fields-plus-type-specific-sections model, not a fixed column set.
- **Live segment/region toggles on the Hub.** Selecting a segment/region combination recomputes the 5 KPI cards and the alerts list from the underlying spec-count dataset; the Portfolio Health Trend chart intentionally stays unfiltered (whole-portfolio context).

## 5. Data layer

Use mock/synthetic data — real PLM/MDG data lives inside Mars' High Confidential Databricks zone and is explicitly out of scope for this prototype; the production app will eventually read from the vendor-built Silver/Gold/semantic layers described in the solution architecture, but should run on mock data for now.

Shape the mock data as three hero explosion chains (ingredient → sub-recipe → recipe → packaging → printed/artwork → DIR → finished good), one per segment, each 15–20 line items:

- **Petcare:** Pedigree Adult Dry Chicken & Rice (15kg) — 3 regional finished-good variants (US/EU/APAC), 1 master recipe, 1 vitamin/mineral sub-recipe, raw materials (chicken meal, wheat, vitamin/mineral components), packaging + printed spec per region.
- **Snacking:** M&M's Milk Chocolate Sharing Pouch (250g) — 2 regional variants (US/EU), 1 master recipe, 2 sub-recipes (candy shell, chocolate coating), raw materials (cocoa mass, milk powder, sugar), packaging + print per region.
- **Food:** Ben's Original Express Rice (250g) — 2 regional variants (EU/APAC), 1 master recipe, 1 seasoning sub-recipe, raw materials (jasmine rice, spice blend), packaging + print per region.

Plus a handful of standalone finished goods (no modeled BOM) purely to give Explorer/Hub/Compare more breadth — these should correctly show an empty/no-data state in Traceability and Impact, not an error. See `Context-Brief-As-Built.html` Section 8 for the exact 40-item mock dataset used in the prototype (material IDs, types, regions, costs, formulation %) — reuse those IDs and values directly so the explosion/where-used logic has real data to traverse from day one.

Note a data-scale inconsistency to resolve: the Hub's KPI strip shows portfolio-wide counts (hundreds of specs per segment/region) as independent illustrative numbers, not aggregated from the 40-item detailed catalog. Decide whether production needs one consistent dataset or an explicit "sample vs. full portfolio" distinction.

## 6. Layout constraint

Every screen must fit in a single viewport frame with no horizontal scroll; only the main content area (below a fixed header and beside a fixed sidebar) scrolls vertically. Match the density of the reference design (compact KPI cards, tight table row padding) rather than adding whitespace that forces scrolling.

## 7. Proposed project structure

```
src/
  app/                 # routing, top-level layout (Sidebar + Header + content outlet)
  components/
    layout/            # Sidebar, Header, RoleSwitch
    filters/           # MultiSelectDropdown (Segment/Region, Query Builder checkboxes)
    data-display/      # KpiCard, Badge, HealthBar, DataTable
    tree/              # BomTreeTable (recursive, expand/collapse)
    detail-panel/      # SlideInDetailPanel
  screens/
    Hub/
    Explorer/
    Traceability/
    Impact/
    Compare/
  state/               # shared app store: persona, explorer filters/selection, drill-target
  data/                # mock dataset, BOM tree builders, masking matrix
  logic/
    bomExplosion.ts     # recursive top-down traversal
    whereUsed.ts         # recursive bottom-up traversal
    masking.ts            # persona → field visibility rules
    compareEngine.ts        # shared-field + type-specific comparison builder
```

## 8. Acceptance criteria (per screen)

- **Hub:** changing Segment/Region selections and clicking Apply updates all 5 KPI cards and the alerts list without a page reload; Cancel reverts to the previously applied selection.
- **Explorer:** Execute Query only re-filters results when clicked (not on every checkbox click); checking 2+ rows surfaces a working Compare CTA; every row's action menu correctly routes to Traceability/Impact with that row's ID pre-selected, and "Add to Compare" adds it to the persisted selection without navigating away.
- **Traceability:** selecting a different root spec resets the tree; expand/collapse works per node; every row is clickable and opens the correct detail panel; KPI counts match the actual node counts in the full (uncollapsed) tree.
- **Impact:** selecting a source material that exists in multiple regional trees returns one row per region/finished-good it affects, with correct level %/kg/cost math.
- **Compare:** requires 2+ selected specs (else shows the prompt back to Explorer); Highlight Differences correctly hides only rows/cards where every target's value matches; BOM/Packaging/Printed tabs only populate for targets where that data type applies.
- **Persona switch:** changing persona in the header immediately re-masks cost/formulation fields across whichever screen is currently open, per the matrix in Section 4.

## 9. Build plan (phased, one runnable checkpoint per phase)

1. **Nav shell + Hub** — Sidebar, Header with Role switch, Hub with live filters and KPI strip. *Checkpoint: Hub is fully interactive standalone.*
2. **Explorer** — Query Builder, results table, row actions, Compare selection, persisted filter/selection state. *Checkpoint: can filter, select rows, and see selection survive a screen switch (even before Compare exists).*
3. **Traceability** — recursive BOM explosion engine + tree table + detail panel, wired to Explorer's "Explode BOM" action and drill-target persistence. *Checkpoint: full explosion works for all 7 hero roots.*
4. **Impact** — recursive where-used engine + impact table, wired to "Analyze Blast Radius". *Checkpoint: multi-region blast radius works for shared raw materials.*
5. **Compare** — comparison engine (shared fields + type-specific sections), tabs, Highlight Differences. *Checkpoint: works for same-type and cross-type selections.*
6. **Polish** — persona masking matrix applied consistently across all screens; empty/no-data states for non-hero specs in Traceability/Impact; responsive density pass to guarantee no-scroll layout at target resolution.

## Open gaps flagged for resolution before/during development

See `Context-Brief-As-Built.html` Section 13 for the full list. The two most consequential for architecture decisions:

1. **RBAC is currently display-only** in the prototype — production needs server-side field-level authorization, which has real implications for API design (masked fields likely shouldn't even be returned to unauthorized roles, not just hidden client-side).
2. **BOM/where-used logic must be built from real PLM/MDG data**, not hand-authored trees — confirm the actual BOM table schema and parent-child relationship model in SAP PLM/MDG before finalizing the `logic/bomExplosion.ts` and `logic/whereUsed.ts` data contracts, since the recursive traversal design needs to match real foreign-key structure, not the flat mock JSON shape used here.
