import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '../src/app/routes';
import { useAppStore } from '../src/state/store';

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
