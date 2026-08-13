import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Hub from '../src/screens/Hub';

function renderHub() {
  return render(<Hub />);
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
    expect(screen.getByText('Active')).toBeInTheDocument();
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
});
