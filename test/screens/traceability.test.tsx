import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Traceability from '../../src/screens/Traceability';
import { useAppStore } from '../../src/state/store';
import type { Catalog } from '../../src/data/catalog';
import type { BomNode } from '../../src/logic/types';
import { BOM_HEADERS, BOM_ITEMS, MATERIALS, MATERIAL_BOM_LINKS } from '../../src/data/seed';
import { explodeBom } from '../../src/logic/bomExplosion';

const REAL_CATALOG: Catalog = {
  materials: MATERIALS,
  materialBomLinks: MATERIAL_BOM_LINKS,
  bomHeaders: BOM_HEADERS,
  bomItems: BOM_ITEMS,
};

function countNodes(node: BomNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0);
}

function expectedOkText(materialId: string): string {
  const result = explodeBom(materialId, REAL_CATALOG);
  if (result.status !== 'ok') {
    throw new Error(`expected ${materialId} to explode ok in this test fixture`);
  }
  const count = countNodes(result.tree);
  return `${result.tree.material.name} — ${count} node${count === 1 ? '' : 's'}`;
}

const HERO_ROOT_IDS = [
  'GBL-FG-PED-15K-US',
  'GBL-FG-PED-15K-EU',
  'GBL-FG-PED-15K-AP',
  'GBL-FG-MMS-250G',
  'GBL-FG-MMS-250G-EU',
  'GBL-FG-BNS-250G',
  'GBL-FG-BNS-250G-AP',
];

const CATALOG_BREADTH_IDS = [
  'GBL-FG-WHS-400G',
  'GBL-FG-DOVE-100G',
  'GBL-FG-UBN-500G',
  'GBL-FG-CSR-85G',
  'GBL-FG-SNK-50G',
];

function renderTraceability() {
  return render(
    <MemoryRouter>
      <Traceability />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useAppStore.setState({ drillTarget: null });
});

describe('Traceability', () => {
  it('fresh visit, no drill target: picker renders unselected, no explodeBom result shown', () => {
    renderTraceability();

    expect(screen.getByRole('button', { name: /Select a Root FERT/ })).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    // No tree/empty-state text of any kind is rendered.
    expect(screen.queryByText(/node/)).not.toBeInTheDocument();
    expect(screen.queryByText(/no bom modeled/i)).not.toBeInTheDocument();
  });

  it('fresh visit, drill target set: picker pre-selects it and an ok result renders automatically', () => {
    useAppStore.setState({ drillTarget: { materialId: 'GBL-FG-PED-15K-US', source: 'explode-bom' } });
    renderTraceability();

    expect(
      screen.getByRole('button', { name: /GBL-FG-PED-15K-US — Pedigree Adult Dry Chicken & Rice \(15kg\)/ }),
    ).toBeInTheDocument();
    expect(screen.getByText(expectedOkText('GBL-FG-PED-15K-US'))).toBeInTheDocument();
  });

  it('the picker option list contains all 12 catalog FERTs -- 7 Hero Roots + 5 Catalog-Breadth items', async () => {
    const user = userEvent.setup();
    renderTraceability();

    await user.click(screen.getByRole('button', { name: /Select a Root FERT/ }));

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(12);

    const listbox = screen.getByRole('listbox');
    for (const id of [...HERO_ROOT_IDS, ...CATALOG_BREADTH_IDS]) {
      expect(within(listbox).getByRole('option', { name: new RegExp(`^${id} —`) })).toBeInTheDocument();
    }
  });

  it('selecting a Hero Root renders {status: "ok"} as root name + node count', async () => {
    const user = userEvent.setup();
    renderTraceability();

    await user.click(screen.getByRole('button', { name: /Select a Root FERT/ }));
    await user.click(screen.getByRole('option', { name: new RegExp('GBL-FG-PED-15K-US') }));

    expect(screen.getByText(expectedOkText('GBL-FG-PED-15K-US'))).toBeInTheDocument();
    // Dropdown closes after selection.
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('selecting a Catalog-Breadth Item renders {status: "empty"} as clean empty-state text, never throws', async () => {
    const user = userEvent.setup();
    renderTraceability();

    await user.click(screen.getByRole('button', { name: /Select a Root FERT/ }));
    await user.click(screen.getByRole('option', { name: new RegExp('GBL-FG-WHS-400G') }));

    const emptyText = screen.getByText(/no bom modeled/i);
    expect(emptyText).toBeInTheDocument();
    expect(emptyText.className).toContain('text-muted');
    expect(emptyText.className).toContain('text-sm');
  });

  it('changing root after a result is showing clears the previous result before the new one renders', async () => {
    const user = userEvent.setup();
    renderTraceability();

    await user.click(screen.getByRole('button', { name: /Select a Root FERT/ }));
    await user.click(screen.getByRole('option', { name: new RegExp('GBL-FG-PED-15K-US') }));
    expect(screen.getByText(expectedOkText('GBL-FG-PED-15K-US'))).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /GBL-FG-PED-15K-US/ }));
    await user.click(screen.getByRole('option', { name: new RegExp('GBL-FG-WHS-400G') }));

    // The prior Hero Root's ok-state text is fully gone -- not left showing
    // alongside or underneath the new selection's empty-state text.
    expect(screen.queryByText(expectedOkText('GBL-FG-PED-15K-US'))).not.toBeInTheDocument();
    expect(screen.getByText(/no bom modeled/i)).toBeInTheDocument();
  });

  it('outside click closes the open panel', async () => {
    const user = userEvent.setup();
    renderTraceability();

    await user.click(screen.getByRole('button', { name: /Select a Root FERT/ }));
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    fireEvent.mouseDown(document.body);

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('a drillTarget pointing at a non-FERT material still shows a matching button label', () => {
    // e.g. written by Explorer's "Analyze Blast Radius" row action (source:
    // 'analyze-blast-radius'), which can target any material, then the user
    // navigates to Traceability separately via the sidebar.
    useAppStore.setState({
      drillTarget: { materialId: 'GBL-ING-CHICK-MEAL-01', source: 'analyze-blast-radius' },
    });
    renderTraceability();

    const material = MATERIALS.find((m) => m.materialId === 'GBL-ING-CHICK-MEAL-01')!;
    expect(
      screen.getByRole('button', { name: `GBL-ING-CHICK-MEAL-01 — ${material.name}` }),
    ).toBeInTheDocument();
  });
});
