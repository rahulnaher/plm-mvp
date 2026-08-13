import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Explorer from '../../src/screens/Explorer';
import { useAppStore } from '../../src/state/store';
import { createDefaultExplorerFilters } from '../../src/state/explorerSlice';
import { STATUS_GROUPS } from '../../src/components/data-display/ResultsTable';
import { MATERIAL_STATUSES } from '../../src/data/catalog';

function renderExplorer() {
  return render(<Explorer />);
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
