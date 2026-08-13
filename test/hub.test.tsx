import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Hub from '../src/screens/Hub';
import { AlertsList } from '../src/components/data-display/AlertsList';

function renderHub() {
  return render(
    <MemoryRouter>
      <Hub />
    </MemoryRouter>,
  );
}

describe('Hub', () => {
  it('default load: Segment and Region are both all-selected and applied, KPI strip shows full-portfolio sums', () => {
    renderHub();

    expect(screen.getByRole('button', { name: /Segment \(3\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Region \(3\)/ })).toBeInTheDocument();
    expect(screen.getByText('2,622')).toBeInTheDocument();
    expect(screen.getByText('2,239')).toBeInTheDocument();
    expect(screen.getByText('383')).toBeInTheDocument();
    expect(screen.getByText('Total Specs')).toBeInTheDocument();
    // The KPI card's own "Active" label -- disambiguated from the Recent
    // Views table's "Active" status badges (same text) via its unique class.
    expect(screen.getByText('Active', { selector: '.font-label' })).toBeInTheDocument();
    expect(screen.getByText('Phased Out')).toBeInTheDocument();
  });

  it('toggling a checkbox without Apply leaves the KPI strip and applied button count unchanged', async () => {
    const user = userEvent.setup();
    renderHub();

    await user.click(screen.getByRole('button', { name: /Segment \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Petcare' }));

    expect(screen.getByRole('button', { name: /Segment \(3\)/ })).toBeInTheDocument();
    expect(screen.getByText('2,622')).toBeInTheDocument();
  });

  it('Apply commits the pending Segment selection, closes the panel, and recomputes the KPI strip', async () => {
    const user = userEvent.setup();
    renderHub();

    await user.click(screen.getByRole('button', { name: /Segment \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Petcare' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByRole('button', { name: /Segment \(2\)/ })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Petcare' })).not.toBeInTheDocument();
    // Snacking + Food across all regions (NA/EU/APAC), Petcare excluded.
    expect(screen.getByText('1,736')).toBeInTheDocument();
  });

  it('Apply commits the pending Region selection, closes the panel, and recomputes the KPI strip', async () => {
    const user = userEvent.setup();
    renderHub();

    await user.click(screen.getByRole('button', { name: /Region \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'NA' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByRole('button', { name: /Region \(2\)/ })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'NA' })).not.toBeInTheDocument();
    // All segments across EU/APAC only, NA excluded.
    expect(screen.getByText('1,415')).toBeInTheDocument();
  });

  it('Cancel reverts only that panel pending selection to last-applied, leaving the other panel untouched', async () => {
    const user = userEvent.setup();
    renderHub();

    await user.click(screen.getByRole('button', { name: /Region \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'NA' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByRole('button', { name: /Region \(3\)/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Segment \(3\)/ })).toBeInTheDocument();
    expect(screen.getByText('2,622')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Region \(3\)/ }));
    expect(screen.getByRole('checkbox', { name: 'NA' })).toBeChecked();
  });

  it('opening the other panel closes the first with pending preserved as-is, without recomputing KPIs', async () => {
    const user = userEvent.setup();
    renderHub();

    await user.click(screen.getByRole('button', { name: /Segment \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Petcare' })); // pending edit, unapplied

    await user.click(screen.getByRole('button', { name: /Region \(3\)/ }));

    // Segment panel closed, Region panel open.
    expect(screen.queryByRole('checkbox', { name: 'Petcare' })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'NA' })).toBeInTheDocument();
    // KPI strip did not recompute -- Segment was never applied.
    expect(screen.getByText('2,622')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Segment \(3\)/ })).toBeInTheDocument();

    // Reopening Segment shows the preserved (still-unapplied) pending edit, not reset to applied.
    await user.click(screen.getByRole('button', { name: /Segment \(3\)/ }));
    expect(screen.getByRole('checkbox', { name: 'Petcare' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Snacking' })).toBeChecked();
  });

  it('clicking outside an open panel closes it, preserving pending unchanged', async () => {
    const user = userEvent.setup();
    renderHub();

    await user.click(screen.getByRole('button', { name: /Region \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'NA' }));

    await user.click(document.body);

    expect(screen.queryByRole('checkbox', { name: 'NA' })).not.toBeInTheDocument();
    expect(screen.getByText('2,622')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Region \(3\)/ }));
    expect(screen.getByRole('checkbox', { name: 'NA' })).not.toBeChecked();
  });

  it('disables Apply once every option in a panel pending selection is unchecked', async () => {
    const user = userEvent.setup();
    renderHub();

    await user.click(screen.getByRole('button', { name: /Segment \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Petcare' }));
    await user.click(screen.getByRole('checkbox', { name: 'Snacking' }));
    await user.click(screen.getByRole('checkbox', { name: 'Food' }));

    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
  });

  it('disables Apply once every option in the Region panel pending selection is unchecked', async () => {
    const user = userEvent.setup();
    renderHub();

    await user.click(screen.getByRole('button', { name: /Region \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'NA' }));
    await user.click(screen.getByRole('checkbox', { name: 'EU' }));
    await user.click(screen.getByRole('checkbox', { name: 'APAC' }));

    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
  });

  it('Alerts List default load shows all 4 alerts', () => {
    renderHub();

    expect(screen.getByText('Critical Data Missing')).toBeInTheDocument();
    expect(screen.getByText('Stale Workflows')).toBeInTheDocument();
    expect(screen.getByText('Sync Delay')).toBeInTheDocument();
    expect(screen.getByText('System Notification')).toBeInTheDocument();
  });

  it('toggling a Segment checkbox without Apply leaves the Alerts List unchanged', async () => {
    const user = userEvent.setup();
    renderHub();

    await user.click(screen.getByRole('button', { name: /Segment \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Snacking' }));

    // Pending edit only, never Applied -- all 4 alerts still show, including Snacking's.
    expect(screen.getByText('Critical Data Missing')).toBeInTheDocument();
    expect(screen.getByText('Stale Workflows')).toBeInTheDocument();
    expect(screen.getByText('Sync Delay')).toBeInTheDocument();
    expect(screen.getByText('System Notification')).toBeInTheDocument();
  });

  it('Segment Apply narrows the Alerts List to the applied segment only', async () => {
    const user = userEvent.setup();
    renderHub();

    await user.click(screen.getByRole('button', { name: /Segment \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Snacking' }));
    await user.click(screen.getByRole('checkbox', { name: 'Food' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    // Only Petcare's alerts (a1, a4) remain.
    expect(screen.getByText('Critical Data Missing')).toBeInTheDocument();
    expect(screen.getByText('System Notification')).toBeInTheDocument();
    expect(screen.queryByText('Stale Workflows')).not.toBeInTheDocument();
    expect(screen.queryByText('Sync Delay')).not.toBeInTheDocument();
  });

  it('Region-only Apply leaves the Alerts List unchanged (never filters by Region)', async () => {
    const user = userEvent.setup();
    renderHub();

    await user.click(screen.getByRole('button', { name: /Region \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'NA' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByRole('button', { name: /Region \(2\)/ })).toBeInTheDocument();
    expect(screen.getByText('Critical Data Missing')).toBeInTheDocument();
    expect(screen.getByText('Stale Workflows')).toBeInTheDocument();
    expect(screen.getByText('Sync Delay')).toBeInTheDocument();
    expect(screen.getByText('System Notification')).toBeInTheDocument();
  });

  it('AlertsList renders an empty state without crashing when given zero alerts', () => {
    render(<AlertsList alerts={[]} />);

    expect(screen.getByText(/no alerts/i)).toBeInTheDocument();
  });

  it('Portfolio Health Trend renders all 3 segments on default load', () => {
    renderHub();

    const trend = screen.getByTestId('portfolio-health-trend');
    expect(trend).toHaveTextContent('Petcare');
    expect(trend).toHaveTextContent('Snacking');
    expect(trend).toHaveTextContent('Food');
  });

  it('regression: Portfolio Health Trend never changes on any Segment and/or Region Apply', async () => {
    const user = userEvent.setup();
    renderHub();

    const before = screen.getByTestId('portfolio-health-trend').innerHTML;

    await user.click(screen.getByRole('button', { name: /Segment \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Petcare' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    await user.click(screen.getByRole('button', { name: /Region \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'NA' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    const after = screen.getByTestId('portfolio-health-trend').innerHTML;
    expect(after).toEqual(before);
  });

  it('renders exactly 4 Report Tiles linking to the Explorer/Traceability/Impact/Compare routes', () => {
    renderHub();

    const tiles = screen.getByTestId('report-tiles');
    const expected = [
      ['Specification Explorer', '/explorer'],
      ['Top-Down Traceability', '/traceability'],
      ['Bottom-Up Impact', '/impact'],
      ['Compare Specs', '/compare'],
    ] as const;

    for (const [name, href] of expected) {
      expect(within(tiles).getByRole('link', { name })).toHaveAttribute('href', href);
    }

    // Exactly 4 -- no 5th tile, scoped to the tiles container itself.
    expect(within(tiles).getAllByRole('link')).toHaveLength(4);
  });

  it('highlights the Traceability tile with the dark navy background, leaving the other 3 uniform', () => {
    renderHub();

    const tiles = screen.getByTestId('report-tiles');
    const traceabilityTile = within(tiles).getByRole('link', { name: 'Top-Down Traceability' });
    expect(traceabilityTile.className).toContain('bg-navy-800');

    for (const name of ['Specification Explorer', 'Bottom-Up Impact', 'Compare Specs']) {
      const tile = within(tiles).getByRole('link', { name });
      expect(tile.className).not.toContain('bg-navy-800');
      expect(tile.className).toContain('bg-surface');
    }
  });

  it('renders the Recent Views table with 4 inert rows (no functional href on labels or "View Full Portfolio")', () => {
    renderHub();

    const table = screen.getByTestId('recent-views-table');

    expect(screen.getByText('My Pinned & Recent Views')).toBeInTheDocument();
    expect(screen.getByText('GBL-FG-PED-15K-US — Pedigree Adult Dry (15kg)')).toBeInTheDocument();
    expect(screen.getByText('GBL-FG-MMS-US — M&M’s Sharing Pouch (US vs EU)')).toBeInTheDocument();
    expect(screen.getByText('GBL-ING-WHEAT-WHL-01 — Whole Grain Wheat')).toBeInTheDocument();
    expect(screen.getByText('GBL-FG-BOR-AP — Ben’s Original Express Rice (APAC)')).toBeInTheDocument();

    // header + 4 data rows, scoped to this table (no other table exists on Hub).
    expect(within(table).getAllByRole('row')).toHaveLength(5);

    // 3 rows are 'Active', 1 ('Ben's Original Express Rice', r4) is 'Draft'.
    expect(within(table).getAllByText('Active')).toHaveLength(3);
    expect(within(table).getAllByText('Draft')).toHaveLength(1);

    const viewFullPortfolio = screen.getByText('View Full Portfolio');
    expect(viewFullPortfolio.tagName).not.toBe('A');
    expect(viewFullPortfolio).not.toHaveAttribute('href');

    const label = screen.getByText('GBL-FG-PED-15K-US — Pedigree Adult Dry (15kg)');
    expect(label.tagName).not.toBe('A');
    expect(label).not.toHaveAttribute('href');

    expect(screen.queryAllByRole('link', { name: /GBL-/ })).toHaveLength(0);
  });

  it('regression: Report Tiles and the Recent Views table never change on any Segment and/or Region Apply', async () => {
    const user = userEvent.setup();
    renderHub();

    const tilesBefore = screen.getByTestId('report-tiles').innerHTML;
    const recentViewsBefore = screen.getByTestId('recent-views-table').innerHTML;

    await user.click(screen.getByRole('button', { name: /Segment \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'Petcare' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    await user.click(screen.getByRole('button', { name: /Region \(3\)/ }));
    await user.click(screen.getByRole('checkbox', { name: 'NA' }));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getByTestId('report-tiles').innerHTML).toEqual(tilesBefore);
    expect(screen.getByTestId('recent-views-table').innerHTML).toEqual(recentViewsBefore);
  });
});
