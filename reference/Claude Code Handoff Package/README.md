# Handoff: Mars Global cPLM Reporting & Analytics MVP Dashboard

## Overview
A 5-screen interactive dashboard prototype (PLM Hub landing page + Specification Explorer, Top-Down Traceability, Bottom-Up Impact, and Compare Specs reports) built for a Mars Global RFP response, demonstrating a cross-segment (Petcare/Snacking/Food) PLM reporting solution with role-based data masking.

## About the design files
The HTML file in this bundle is a **design reference prototype**, not production code to copy directly. It was built in Claude Design as a client-facing demo. The task for development is to **recreate this design in a real React codebase** using the target environment's established component patterns and libraries (see `Claude-Code-Project-Brief.md` for specifics) — not to embed or lightly wrap the HTML file itself.

## Fidelity
**High-fidelity.** Colors, typography, spacing, layout, and interactions in `Dashboard-Final-Design.html` are final and should be matched closely. The one exception: the color palette is a deliberate override of the bound Mars Petcare design system's default red/cream theme, replaced with a blue enterprise palette by explicit client request — carry the blue palette forward, not the DS default.

## Files in this bundle

| File | What it is |
|---|---|
| `Dashboard-Final-Design.html` | The finished, self-contained dashboard prototype — all 5 screens, all interactions, live. Open directly in any browser. This is the visual + UX source of truth. |
| `Context-Brief-As-Built.html` | The as-built specification: what each screen does, how persona masking works, the synthetic data model, what's stubbed vs. fully interactive, and known gaps for the developer. Read this alongside the HTML. |
| `Claude-Code-Project-Brief.md` | The build brief for Claude Code (or any developer): tech stack, screens & behaviors, the real logic to implement (recursive BOM explosion, where-used traversal, masking, cross-type compare, state persistence), data shape, project structure, acceptance criteria, and a phased build plan. |

## How to use this handoff
1. Open `Dashboard-Final-Design.html` in a browser and click through all 5 screens, the 3 persona options, and a few filter/drill-down interactions to understand the intended behavior firsthand.
2. Read `Context-Brief-As-Built.html` for the full as-built spec and the list of open gaps.
3. Hand `Claude-Code-Project-Brief.md` to the developer (or Claude Code) as the build brief — it references the other two files directly.

## Known gaps flagged for resolution before development
See `Context-Brief-As-Built.html` Section 13 in full. Highlights:
- The header search bar and notification bell are visual-only stubs, not wired to anything.
- Persona-based masking is a client-side display rule in the prototype — production needs real server-side field-level authorization.
- Only the 3 hero product chains (7 regional roots total) have modeled BOM data; other catalog items correctly show an empty state in Traceability/Impact rather than being fully explodable.
- The Hub's KPI strip counts are independent illustrative numbers, not aggregated from the 40-item detailed mock catalog — needs one consistent data model in production.

## Assets
No external image/icon assets — all icons are inline SVG, all styling is inline CSS using the Mars Petcare design-system's spacing/type/radius tokens with an overridden blue color palette (see brief for exact hex values).
