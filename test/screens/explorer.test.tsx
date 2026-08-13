import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import Explorer from '../../src/screens/Explorer';
import { useAppStore } from '../../src/state/store';
import { createDefaultExplorerFilters } from '../../src/state/explorerSlice';
import { STATUS_GROUPS } from '../../src/components/data-display/ResultsTable';
import { MATERIAL_STATUSES } from '../../src/data/catalog';

/** Renders the current router pathname so tests can assert `useNavigate`
 * calls without needing a real `<Routes>` table (Explorer itself is
 * unconditionally rendered, not route-matched, matching `hub.test.tsx`'s
 * plain `MemoryRouter` precedent). */
function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location-display">{location.pathname}</div>;
}

function renderExplorer() {
  return render(
    <MemoryRouter>
      <Explorer />
      <LocationDisplay />
    </MemoryRouter>,
  );
}

/** Opens `materialId`'s ⋮ row-action menu and clicks the named action. */
async function clickRowAction(user: ReturnType<typeof userEvent.setup>, materialId: string, actionName: string) {
  const row = document.querySelector(`[data-material-id="${materialId}"]`) as HTMLElement;
  await user.click(within(row).getByRole('button', { name: `Actions for ${materialId}` }));
  await user.click(screen.getByRole('menuitem', { name: actionName }));
}

function resultsTable() {
  return screen.getByTestId('results-table');
}

function dataRows() {
  // Row 0 is the header row -- every other row is a data/empty-state row.
  return within(resultsTable()).getAllByRole('row').slice(1);
}

beforeEach(() => {
  useAppStore.setState({
    pendingFilters: createDefaultExplorerFilters(),
    appliedFilters: createDefaultExplorerFilters(),
    selectedMaterialIds: new Set(),
    drillTarget: null,
  });
});

describe('Explorer', () => {
  it('default load: all-selected applied filters render all 48 catalog materials', () => {
    renderExplorer();

    expect(dataRows()).toHaveLength(48);
    expect(screen.getByRole('button', { name: /Material Type \(6\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Region \(4\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Segment \(3\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Status \(12\)/ })).toBeInTheDocument();
  });

  it('checking a filter box without Execute Query leaves the table and trigger badge unchanged', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole('button', { name: /Status \(12\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Draft' }));

    // Pending edit only, never applied -- badge and table both untouched.
    expect(screen.getByRole('button', { name: /Status \(12\)/ })).toBeInTheDocument();
    expect(dataRows()).toHaveLength(48);
  });

  it('Execute Query with every Material Type box unchecked shows a real empty result, not "no filter"', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole('button', { name: /Material Type \(6\)/ }));
    for (const type of ['FERT', 'REAL_SUB', 'SUB_RCP', 'ROH', 'VERP', 'PRNT']) {
      await user.click(screen.getByRole('checkbox', { name: type }));
    }
    await user.click(screen.getByRole('button', { name: 'Execute Query' }));

    expect(screen.getByRole('button', { name: /Material Type \(0\)/ })).toBeInTheDocument();
    expect(screen.getByText('No materials match the applied filters.')).toBeInTheDocument();
    // The empty-state row itself, not a truly blank table.
    expect(dataRows()).toHaveLength(1);
  });

  it('combined filters: free text substring AND applied Region narrow to the matching row(s) only', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.type(screen.getByLabelText('Search by Material ID or Name'), 'wheat');

    await user.click(screen.getByRole('button', { name: /Region \(4\)/ }));
    for (const region of ['NA', 'APAC', 'Global']) {
      await user.click(screen.getByRole('checkbox', { name: region }));
    }

    await user.click(screen.getByRole('button', { name: 'Execute Query' }));

    const rows = dataRows();
    expect(rows).toHaveLength(1);
    expect(within(resultsTable()).getByText('GBL-ING-WHEAT-WHL-01')).toBeInTheDocument();
  });

  it('sorting: clicking Cost/Kg twice sorts ascending then descending, with "—" rows always last', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole('button', { name: /Cost\/Kg/ }));

    // Cell order: select, Material ID, Name, Type, Status, Region, Segment, Cost/Kg, Formulation % --
    // Cost/Kg is the 8th cell (index 7).
    const COST_PER_KG_CELL_INDEX = 7;

    let rows = dataRows();
    expect(rows[0]).toHaveAttribute('data-material-id', 'GBL-ING-SALT-01'); // cheapest ROH, $0.15/kg
    expect(within(rows[rows.length - 1]).getAllByRole('cell')[COST_PER_KG_CELL_INDEX]).toHaveTextContent('—');

    await user.click(screen.getByRole('button', { name: /Cost\/Kg/ }));

    rows = dataRows();
    expect(rows[0]).toHaveAttribute('data-material-id', 'GBL-ING-VIT-E-01'); // priciest ROH, $18.50/kg
    expect(within(rows[rows.length - 1]).getAllByRole('cell')[COST_PER_KG_CELL_INDEX]).toHaveTextContent('—');
  });

  it('every rendered row carries a stable data-material-id attribute', () => {
    renderExplorer();

    expect(document.querySelector('[data-material-id="GBL-FG-PED-15K-US"]')).toBeInTheDocument();
  });

  it('Cost/Kg renders raw unitCostPerKg for ROH rows only, "—" for all other types', () => {
    renderExplorer();

    const rohRow = document.querySelector('[data-material-id="GBL-ING-CHICK-MEAL-01"]');
    expect(rohRow).toHaveTextContent('$1.85');

    const fertRow = document.querySelector('[data-material-id="GBL-FG-PED-15K-US"]');
    expect(fertRow).toHaveTextContent('—');
  });

  it('Formulation % renders this material\'s own formulationPct from its first BOM_ITEMS appearance', () => {
    renderExplorer();

    // GBL-ING-CHICK-MEAL-01 is 38% of RCP-PED-CHICKEN-01 (its only appearance).
    const row = document.querySelector('[data-material-id="GBL-ING-CHICK-MEAL-01"]');
    expect(row).toHaveTextContent('38%');
  });

  it('Formulation % resolves the FIRST BOM_ITEMS appearance when a material is a component in more than one BOM', () => {
    renderExplorer();

    // GBL-ING-CORN-01 is a component of both RCP-PED-CHICKEN-01 (20%, earlier
    // in BOM_ITEMS) and RCP-PED-CHICKEN-02 (18.7%, later) -- the FIRST array
    // entry wins, never the later one.
    const cornRow = document.querySelector('[data-material-id="GBL-ING-CORN-01"]');
    expect(cornRow).toHaveTextContent('20%');
    expect(cornRow).not.toHaveTextContent('18.7%');

    // Same tie-break for GBL-ING-WHEAT-WHL-01: 28% (RCP-PED-CHICKEN-01,
    // earlier) wins over 15% (RCP-PED-CHICKEN-02, later).
    const wheatRow = document.querySelector('[data-material-id="GBL-ING-WHEAT-WHL-01"]');
    expect(wheatRow).toHaveTextContent('28%');
    expect(wheatRow).not.toHaveTextContent('15%');
  });

  it('selecting a row checkbox toggles it in the store\'s selectedMaterialIds', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole('checkbox', { name: 'Select GBL-FG-PED-15K-US' }));

    expect(useAppStore.getState().selectedMaterialIds.has('GBL-FG-PED-15K-US')).toBe(true);

    await user.click(screen.getByRole('checkbox', { name: 'Select GBL-FG-PED-15K-US' }));

    expect(useAppStore.getState().selectedMaterialIds.has('GBL-FG-PED-15K-US')).toBe(false);
  });

  it('regression: executeQuery never clears or prunes selectedMaterialIds, even for a row the new applied filters exclude', async () => {
    const user = userEvent.setup();
    renderExplorer();

    // Select a FERT row, then apply a filter that excludes FERT entirely.
    await user.click(screen.getByRole('checkbox', { name: 'Select GBL-FG-PED-15K-US' }));
    expect(useAppStore.getState().selectedMaterialIds.has('GBL-FG-PED-15K-US')).toBe(true);

    await user.click(screen.getByRole('button', { name: /Material Type \(6\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'FERT' }));
    await user.click(screen.getByRole('button', { name: 'Execute Query' }));

    // The FERT row is gone from the now-applied-filtered table...
    expect(document.querySelector('[data-material-id="GBL-FG-PED-15K-US"]')).not.toBeInTheDocument();
    // ...but selection is intentionally independent of the current filtered view.
    expect(useAppStore.getState().selectedMaterialIds.has('GBL-FG-PED-15K-US')).toBe(true);
  });

  it('⋮ row-action menu shows exactly 3 actions, in order: Explode BOM, Analyze Blast Radius, Add to Compare', async () => {
    const user = userEvent.setup();
    renderExplorer();

    const row = document.querySelector('[data-material-id="GBL-FG-PED-15K-US"]') as HTMLElement;
    await user.click(within(row).getByRole('button', { name: 'Actions for GBL-FG-PED-15K-US' }));

    const items = screen.getAllByRole('menuitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'Explode BOM',
      'Analyze Blast Radius',
      'Add to Compare',
    ]);
  });

  it('Explode BOM writes drillTargetSlice and navigates to /traceability', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await clickRowAction(user, 'GBL-FG-PED-15K-US', 'Explode BOM');

    expect(useAppStore.getState().drillTarget).toEqual({
      materialId: 'GBL-FG-PED-15K-US',
      source: 'explode-bom',
    });
    expect(screen.getByTestId('location-display')).toHaveTextContent('/traceability');
  });

  it('Analyze Blast Radius writes drillTargetSlice and navigates to /impact', async () => {
    const user = userEvent.setup();
    renderExplorer();

    const materials = document.querySelectorAll('[data-material-id]');
    const secondMaterialId = materials[1].getAttribute('data-material-id') as string;

    await clickRowAction(user, secondMaterialId, 'Analyze Blast Radius');

    expect(useAppStore.getState().drillTarget).toEqual({
      materialId: secondMaterialId,
      source: 'analyze-blast-radius',
    });
    expect(screen.getByTestId('location-display')).toHaveTextContent('/impact');
  });

  it('Add to Compare on an already-checked row is idempotent: selection unchanged, no navigation, drillTarget untouched', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await user.click(screen.getByRole('checkbox', { name: 'Select GBL-FG-PED-15K-US' }));
    expect(useAppStore.getState().selectedMaterialIds.has('GBL-FG-PED-15K-US')).toBe(true);

    await clickRowAction(user, 'GBL-FG-PED-15K-US', 'Add to Compare');

    expect(useAppStore.getState().selectedMaterialIds.has('GBL-FG-PED-15K-US')).toBe(true);
    expect(useAppStore.getState().selectedMaterialIds.size).toBe(1);
    expect(useAppStore.getState().drillTarget).toBeNull();
    // Exact match -- `toHaveTextContent('/')` is a substring match that
    // would also pass for an incorrect navigation to /traceability or
    // /impact (both contain "/"), so it wouldn't actually prove no
    // navigation happened.
    expect(screen.getByTestId('location-display').textContent).toBe('/');
  });

  it('Add to Compare on an unchecked row adds it to selectedMaterialIds', async () => {
    const user = userEvent.setup();
    renderExplorer();

    await clickRowAction(user, 'GBL-FG-PED-15K-US', 'Add to Compare');

    expect(useAppStore.getState().selectedMaterialIds.has('GBL-FG-PED-15K-US')).toBe(true);
  });

  it('floating Compare Selected CTA mounts exactly when selectedMaterialIds.size crosses 2, and unmounts back below 2', async () => {
    const user = userEvent.setup();
    renderExplorer();

    const materials = document.querySelectorAll('[data-material-id]');
    const [firstId, secondId] = Array.from(materials).map((el) => el.getAttribute('data-material-id') as string);

    expect(screen.queryByRole('button', { name: /Compare Selected/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: `Select ${firstId}` }));
    expect(screen.queryByRole('button', { name: /Compare Selected/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: `Select ${secondId}` }));
    expect(screen.getByRole('button', { name: 'Compare Selected (2)' })).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: `Select ${secondId}` }));
    expect(screen.queryByRole('button', { name: /Compare Selected/ })).not.toBeInTheDocument();
  });

  it('clicking the Compare Selected CTA navigates to /compare without altering selectedMaterialIds', async () => {
    const user = userEvent.setup();
    renderExplorer();

    const materials = document.querySelectorAll('[data-material-id]');
    const ids = Array.from(materials)
      .slice(0, 3)
      .map((el) => el.getAttribute('data-material-id') as string);

    for (const id of ids) {
      await user.click(screen.getByRole('checkbox', { name: `Select ${id}` }));
    }

    await user.click(screen.getByRole('button', { name: 'Compare Selected (3)' }));

    expect(screen.getByTestId('location-display')).toHaveTextContent('/compare');
    expect(useAppStore.getState().selectedMaterialIds.size).toBe(3);
    for (const id of ids) {
      expect(useAppStore.getState().selectedMaterialIds.has(id)).toBe(true);
    }
  });
});

describe('STATUS_GROUPS / MATERIAL_STATUSES sync guard', () => {
  it('STATUS_GROUPS is a set-equal partition of MATERIAL_STATUSES -- same 12 members, no gaps, no dupes', () => {
    const grouped = STATUS_GROUPS.flatMap((group) => group.statuses);

    // No dupes within the grouping itself.
    expect(new Set(grouped).size).toBe(grouped.length);
    // Set-equal to the canonical MATERIAL_STATUSES list -- catches drift in
    // either direction (a status added/renamed in catalog.ts but not
    // regrouped here, or vice versa) before it silently breaks the Status
    // filter.
    expect(new Set(grouped)).toEqual(new Set(MATERIAL_STATUSES));
    expect(grouped.length).toBe(MATERIAL_STATUSES.length);
  });
});
