import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../src/app/routes';
import { useAppStore } from '../src/state/store';
import { createDefaultExplorerFilters } from '../src/state/explorerSlice';

function renderApp(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppRoutes />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useAppStore.setState({ persona: 'R&D Scientist' });
});

describe('routing', () => {
  it('redirects / to /hub and highlights PLM Hub as active', () => {
    renderApp('/');

    expect(screen.getByRole('heading', { name: 'PLM Hub' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /PLM Hub/ })).toHaveAttribute('aria-current', 'page');
  });

  it('loading /traceability directly renders the Traceability placeholder with it marked active', () => {
    renderApp('/traceability');

    expect(screen.getByRole('heading', { name: 'Top-Down Traceability' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Top-Down Traceability/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'PLM Hub' })).not.toHaveAttribute('aria-current');
  });

  it('clicking a Sidebar nav item updates the URL, renders the matching screen, and highlights it active', async () => {
    const user = userEvent.setup();
    renderApp('/hub');

    // Scoped to the Sidebar's "Primary" nav landmark -- the Hub screen's own
    // Report Tiles also render a same-labeled "Specification Explorer" link.
    const primaryNav = screen.getByRole('navigation', { name: 'Primary' });
    await user.click(within(primaryNav).getByRole('link', { name: /Specification Explorer/ }));

    expect(screen.getByRole('heading', { name: 'Specification Explorer' })).toBeInTheDocument();
    expect(within(primaryNav).getByRole('link', { name: /Specification Explorer/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(primaryNav).getByRole('link', { name: 'PLM Hub' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('renders every screen route reachable from the Sidebar', async () => {
    const user = userEvent.setup();
    renderApp('/hub');

    for (const [name, heading] of [
      ['Bottom-Up Impact', 'Bottom-Up Impact'],
      ['Compare Specs', 'Compare Specs'],
    ] as const) {
      // Scoped to the Sidebar's "Analysis" nav landmark (always rendered) --
      // the Hub screen's own Report Tiles also render same-labeled links
      // while still on /hub, i.e. the first iteration of this loop.
      const analysisNav = screen.getByRole('navigation', { name: 'Analysis' });
      await user.click(within(analysisNav).getByRole('link', { name: new RegExp(name) }));
      expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
    }
  });

  it('falls back to /hub for an unknown route instead of a blank screen', () => {
    renderApp('/nonexistent');

    expect(screen.getByRole('heading', { name: 'PLM Hub' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'PLM Hub' })).toHaveAttribute('aria-current', 'page');
  });

  it('clicking the Explorer Report Tile from /hub navigates to /explorer without crashing', async () => {
    const user = userEvent.setup();
    renderApp('/hub');

    // Scoped to <main> (the routed screen content) -- the Sidebar also has
    // a same-labeled "Specification Explorer" nav link.
    const main = screen.getByRole('main');
    await user.click(within(main).getByRole('link', { name: 'Specification Explorer' }));

    expect(screen.getByRole('heading', { name: 'Specification Explorer' })).toBeInTheDocument();
  });
});

describe('Header stubs regression', () => {
  it('search bar and notification bell remain visual-only stubs on the Hub screen', () => {
    renderApp('/hub');

    expect(document.querySelector('input')).not.toBeInTheDocument();
    expect(screen.getByText(/Global Spec Search/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /notification/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /notification/i })).not.toBeInTheDocument();
  });
});

describe('role switch', () => {
  it('changing the Header Role dropdown updates personaSlice without changing the rendered screen', async () => {
    const user = userEvent.setup();
    renderApp('/hub');

    expect(useAppStore.getState().persona).toBe('R&D Scientist');

    await user.selectOptions(screen.getByLabelText('Role'), 'Finance & Business');

    expect(useAppStore.getState().persona).toBe('Finance & Business');
    expect(screen.getByRole('heading', { name: 'PLM Hub' })).toBeInTheDocument();
  });
});

describe('Explorer state persistence (FR-12)', () => {
  function primaryNav() {
    return screen.getByRole('navigation', { name: 'Primary' });
  }

  function resultsTable() {
    return screen.getByTestId('results-table');
  }

  /** Opens `materialId`'s ⋮ row-action menu and clicks the named action
   * (matches `test/screens/explorer.test.tsx`'s `clickRowAction` helper). */
  async function clickRowAction(
    user: ReturnType<typeof userEvent.setup>,
    materialId: string,
    actionName: string,
  ) {
    const row = document.querySelector(`[data-material-id="${materialId}"]`) as HTMLElement | null;
    if (!row) throw new Error(`No row found for material ${materialId}`);
    await user.click(within(row).getByRole('button', { name: `Actions for ${materialId}` }));
    await user.click(screen.getByRole('menuitem', { name: actionName }));
  }

  /** Explorer → Hub → Explorer via real Sidebar nav-link clicks -- a real
   * unmount/remount of the Explorer route (not `useAppStore.setState` or a
   * programmatic route push), per this spec's Boundaries. */
  async function navigateToHubAndBack(user: ReturnType<typeof userEvent.setup>) {
    await user.click(within(primaryNav()).getByRole('link', { name: /PLM Hub/ }));
    expect(screen.getByRole('heading', { name: 'PLM Hub' })).toBeInTheDocument();
    await user.click(within(primaryNav()).getByRole('link', { name: /Specification Explorer/ }));
    expect(screen.getByRole('heading', { name: 'Specification Explorer' })).toBeInTheDocument();
  }

  beforeEach(() => {
    useAppStore.setState({
      pendingFilters: createDefaultExplorerFilters(),
      appliedFilters: createDefaultExplorerFilters(),
      selectedMaterialIds: new Set(),
      drillTarget: null,
    });
  });

  it('pending filters survive Explorer → Hub → Explorer without an Execute Query', async () => {
    const user = userEvent.setup();
    renderApp('/explorer');

    await user.type(screen.getByLabelText('Search by Material ID or Name'), 'wheat');
    await user.click(screen.getByRole('button', { name: /Material Type \(6\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'ROH' }));

    await navigateToHubAndBack(user);

    expect(useAppStore.getState().pendingFilters.text).toBe('wheat');
    expect(useAppStore.getState().pendingFilters.materialTypes.has('ROH')).toBe(false);
    expect(screen.getByLabelText('Search by Material ID or Name')).toHaveValue('wheat');
    // Never committed -- appliedFilters is untouched, asserted directly
    // against the store (not just inferred from the trigger badge text).
    expect(useAppStore.getState().appliedFilters.materialTypes.size).toBe(6);
    expect(screen.getByRole('button', { name: /Material Type \(6\)/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Material Type \(6\)/ }));
    expect(screen.getByRole('checkbox', { name: 'ROH' })).not.toBeChecked();
  });

  it('applied filters survive Explorer → Hub → Explorer, with ResultsTable already narrowed on remount', async () => {
    const user = userEvent.setup();
    renderApp('/explorer');

    await user.click(screen.getByRole('button', { name: /Region \(4\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'EU' }));
    await user.click(screen.getByRole('checkbox', { name: 'APAC' }));
    await user.click(screen.getByRole('checkbox', { name: 'Global' }));
    await user.click(screen.getByRole('button', { name: 'Execute Query' }));

    expect(useAppStore.getState().appliedFilters.regions).toEqual(new Set(['NA']));
    const narrowedRowCount = within(resultsTable()).getAllByRole('row').length - 1;
    expect(narrowedRowCount).toBeGreaterThan(0);

    await navigateToHubAndBack(user);

    expect(useAppStore.getState().appliedFilters.regions).toEqual(new Set(['NA']));
    expect(screen.getByRole('button', { name: /Region \(1\)/ })).toBeInTheDocument();
    // No re-Execute needed -- the table is already narrowed on remount.
    expect(within(resultsTable()).getAllByRole('row').length - 1).toBe(narrowedRowCount);
  });

  it('row selection survives Explorer → Hub → Explorer: both checkboxes checked, CTA reads "Compare Selected (2)"', async () => {
    const user = userEvent.setup();
    renderApp('/explorer');

    await user.click(screen.getByRole('checkbox', { name: 'Select GBL-FG-PED-15K-US' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select GBL-FG-PED-15K-EU' }));

    await navigateToHubAndBack(user);

    expect(useAppStore.getState().selectedMaterialIds).toEqual(
      new Set(['GBL-FG-PED-15K-US', 'GBL-FG-PED-15K-EU']),
    );
    expect(screen.getByRole('checkbox', { name: 'Select GBL-FG-PED-15K-US' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select GBL-FG-PED-15K-EU' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Compare Selected (2)' })).toBeInTheDocument();
  });

  it('drill target survives navigating away to /traceability and back to /explorer via Sidebar', async () => {
    const user = userEvent.setup();
    renderApp('/explorer');

    await clickRowAction(user, 'GBL-FG-PED-15K-US', 'Explode BOM');

    expect(useAppStore.getState().drillTarget).toEqual({
      materialId: 'GBL-FG-PED-15K-US',
      source: 'explode-bom',
    });
    expect(screen.getByRole('heading', { name: 'Top-Down Traceability' })).toBeInTheDocument();

    await user.click(within(primaryNav()).getByRole('link', { name: /Specification Explorer/ }));

    expect(screen.getByRole('heading', { name: 'Specification Explorer' })).toBeInTheDocument();
    expect(useAppStore.getState().drillTarget).toEqual({
      materialId: 'GBL-FG-PED-15K-US',
      source: 'explode-bom',
    });
  });

  it('drill target survives navigating away to /impact and back to /explorer via Sidebar (analyze-blast-radius)', async () => {
    const user = userEvent.setup();
    renderApp('/explorer');

    await clickRowAction(user, 'GBL-FG-PED-15K-US', 'Analyze Blast Radius');

    expect(useAppStore.getState().drillTarget).toEqual({
      materialId: 'GBL-FG-PED-15K-US',
      source: 'analyze-blast-radius',
    });
    expect(screen.getByRole('heading', { name: 'Bottom-Up Impact' })).toBeInTheDocument();

    await user.click(within(primaryNav()).getByRole('link', { name: /Specification Explorer/ }));

    expect(screen.getByRole('heading', { name: 'Specification Explorer' })).toBeInTheDocument();
    expect(useAppStore.getState().drillTarget).toEqual({
      materialId: 'GBL-FG-PED-15K-US',
      source: 'analyze-blast-radius',
    });
  });

  it('combined: all 4 pieces of state survive one real Explorer unmount/remount together', async () => {
    const user = userEvent.setup();
    renderApp('/explorer');

    // Applied filter: narrow Region to NA only, Execute Query.
    await user.click(screen.getByRole('button', { name: /Region \(4\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'EU' }));
    await user.click(screen.getByRole('checkbox', { name: 'APAC' }));
    await user.click(screen.getByRole('checkbox', { name: 'Global' }));
    await user.click(screen.getByRole('button', { name: 'Execute Query' }));

    // Pending filter: uncommitted free text + Material Type toggle, no re-Execute.
    await user.type(screen.getByLabelText('Search by Material ID or Name'), 'pedigree');
    await user.click(screen.getByRole('button', { name: /Material Type \(6\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'ROH' }));

    // Row selection: 2 NA-region rows, still visible under the applied filter.
    await user.click(screen.getByRole('checkbox', { name: 'Select GBL-FG-PED-15K-US' }));
    await user.click(screen.getByRole('checkbox', { name: 'Select GBL-FG-MMS-250G' }));

    // Drill target: Explode BOM IS the "navigate away" leg of this round trip.
    await clickRowAction(user, 'GBL-FG-PED-15K-US', 'Explode BOM');
    expect(screen.getByRole('heading', { name: 'Top-Down Traceability' })).toBeInTheDocument();

    // Sidebar nav back to Explorer -- the "and back" leg, a real unmount/remount.
    await user.click(within(primaryNav()).getByRole('link', { name: /Specification Explorer/ }));
    expect(screen.getByRole('heading', { name: 'Specification Explorer' })).toBeInTheDocument();

    const state = useAppStore.getState();
    expect(state.pendingFilters.text).toBe('pedigree');
    expect(state.pendingFilters.materialTypes.has('ROH')).toBe(false);
    expect(state.appliedFilters.regions).toEqual(new Set(['NA']));
    expect(state.selectedMaterialIds).toEqual(new Set(['GBL-FG-PED-15K-US', 'GBL-FG-MMS-250G']));
    expect(state.drillTarget).toEqual({ materialId: 'GBL-FG-PED-15K-US', source: 'explode-bom' });

    expect(screen.getByLabelText('Search by Material ID or Name')).toHaveValue('pedigree');
    expect(screen.getByRole('checkbox', { name: 'Select GBL-FG-PED-15K-US' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Select GBL-FG-MMS-250G' })).toBeChecked();
    expect(screen.getByRole('button', { name: 'Compare Selected (2)' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Region \(1\)/ })).toBeInTheDocument();
  });
});
