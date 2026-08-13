import { type AriaAttributes, type ReactNode, useState } from 'react';
import type { BomItem, Material, MaterialStatus, MaterialType } from '../../data/catalog';
import type { MaterialId } from '../../logic/types';

export interface ResultsTableProps {
  /** Already applied-filtered rows (Explorer/index.tsx computes this from
   * `appliedFilters` -- this component only sorts and renders). */
  materials: Material[];
  /** `BOM_ITEMS`, used solely to look up each row's own Formulation % (its
   * first appearance as a `componentMaterialId`) -- see Design Notes. */
  bomItems: BomItem[];
  selectedMaterialIds: ReadonlySet<MaterialId>;
  onToggleRowSelection: (materialId: MaterialId) => void;
}

type SortDirection = 'asc' | 'desc';
type SortValue = string | number | undefined;

interface Column {
  key: string;
  header: string;
  sortable: boolean;
  /** Isolated raw-value computation per cell (Boundaries: "isolate each
   * cell's raw-value computation from JSX so a masking wrapper drops in
   * later without a table rewrite") -- also doubles as the sort key. */
  getSortValue?: (material: Material) => SortValue;
  render: (material: Material) => ReactNode;
}

const typeMeta: Record<MaterialType, { bg: string; fg: string }> = {
  FERT: { bg: 'var(--color-teal-100)', fg: 'var(--color-teal-600)' },
  REAL_SUB: { bg: 'var(--color-blue-100)', fg: 'var(--color-blue-600)' },
  SUB_RCP: { bg: 'var(--color-sky-200)', fg: 'var(--color-navy-800)' },
  ROH: { bg: 'var(--color-canvas-200)', fg: 'var(--color-ink-700)' },
  VERP: { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning-fg)' },
  PRNT: { bg: 'var(--color-ink-100)', fg: 'var(--color-ink-900)' },
};

/**
 * Clusters the 12 `MATERIAL_STATUSES` into 4 labeled groups for filter
 * usability and status-badge coloring (Boundaries: presentational only --
 * the filter/badge still key off the individual status string, no new
 * "status group" type). Exported so `Explorer/index.tsx` can reuse the
 * same grouping for the Status `QueryFilterDropdown`.
 */
// eslint-disable-next-line react-refresh/only-export-components -- shared constant, not a component; see doc comment above
export const STATUS_GROUPS: { label: string; statuses: readonly MaterialStatus[] }[] = [
  { label: 'Active', statuses: ['Approved (Active)', 'Active (In Production)', 'Synced'] },
  {
    label: 'In Progress',
    statuses: ['Draft', 'Pending Harmonization', 'Pending Regulatory', 'Pending Release (DIR Missing)'],
  },
  {
    label: 'Needs Attention',
    statuses: [
      'Out of Sync (Size Mismatch)',
      'Out of Sync (Trait Missing)',
      'Under Review (Formula Drift)',
      'Warning (Supplier Phase-Out)',
    ],
  },
  { label: 'Phased Out', statuses: ['Phased Out'] },
];

const statusGroupMeta: Record<string, { bg: string; fg: string }> = {
  Active: { bg: 'var(--color-teal-100)', fg: 'var(--color-teal-600)' },
  'In Progress': { bg: 'var(--color-warning-bg)', fg: 'var(--color-warning-fg)' },
  'Needs Attention': { bg: 'var(--color-critical-bg)', fg: 'var(--color-critical-fg)' },
  'Phased Out': { bg: 'var(--color-canvas-200)', fg: 'var(--color-muted)' },
};

function statusMetaFor(status: MaterialStatus): { bg: string; fg: string } {
  const group = STATUS_GROUPS.find((g) => (g.statuses as readonly string[]).includes(status));
  return group ? statusGroupMeta[group.label] : { bg: 'var(--color-canvas-200)', fg: 'var(--color-ink-700)' };
}

/** Cost/Kg raw-value lookup: `unitCostPerKg` exists on `ROH` rows only
 * (AD-3, type-enforced). */
function getCostPerKg(material: Material): number | undefined {
  return material.materialType === 'ROH' ? material.unitCostPerKg : undefined;
}

/** Formulation % raw-value lookup: this material's own `formulationPct`
 * where it FIRST appears as a `BomItem.componentMaterialId` -- a display
 * convenience for this table only (Design Notes), not written back to
 * `catalog.ts`. */
function getFormulationPct(material: Material, bomItems: BomItem[]): number | undefined {
  return bomItems.find((item) => item.componentMaterialId === material.materialId)?.formulationPct;
}

function formatMissing(value: number | undefined, format?: (v: number) => string): string {
  if (value === undefined) return '—';
  return format ? format(value) : String(value);
}

function badge(text: string, meta: { bg: string; fg: string }): ReactNode {
  return (
    <span className="rounded-pill px-2.5 py-1 text-[11px] font-bold" style={{ background: meta.bg, color: meta.fg }}>
      {text}
    </span>
  );
}

function buildColumns(bomItems: BomItem[]): Column[] {
  return [
    {
      key: 'materialId',
      header: 'Material ID',
      sortable: true,
      getSortValue: (m) => m.materialId,
      render: (m) => m.materialId,
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      getSortValue: (m) => m.name,
      render: (m) => m.name,
    },
    {
      key: 'materialType',
      header: 'Type',
      sortable: true,
      getSortValue: (m) => m.materialType,
      render: (m) => badge(m.materialType, typeMeta[m.materialType]),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      getSortValue: (m) => m.status,
      render: (m) => badge(m.status, statusMetaFor(m.status)),
    },
    {
      key: 'region',
      header: 'Region',
      sortable: true,
      getSortValue: (m) => m.region,
      render: (m) => m.region,
    },
    {
      key: 'segment',
      header: 'Segment',
      sortable: true,
      getSortValue: (m) => m.segment,
      render: (m) => m.segment,
    },
    {
      key: 'costPerKg',
      header: 'Cost/Kg',
      sortable: true,
      getSortValue: (m) => getCostPerKg(m),
      render: (m) => formatMissing(getCostPerKg(m), (v) => `$${v.toFixed(2)}`),
    },
    {
      key: 'formulationPct',
      header: 'Formulation %',
      sortable: true,
      getSortValue: (m) => getFormulationPct(m, bomItems),
      render: (m) => formatMissing(getFormulationPct(m, bomItems), (v) => `${v}%`),
    },
  ];
}

/** `undefined`/missing sort values always sort last, in EITHER direction
 * (I/O Matrix: `"—"` rows sort last on both the first ascending click
 * and the second descending click). */
function compareValues(a: SortValue, b: SortValue, direction: SortDirection): number {
  if (a === undefined && b === undefined) return 0;
  if (a === undefined) return 1;
  if (b === undefined) return -1;
  if (a < b) return direction === 'asc' ? -1 : 1;
  if (a > b) return direction === 'asc' ? 1 : -1;
  return 0;
}

/**
 * Sortable Results Table over the applied-filtered `materials` (Story
 * 2.3). Columns are an explicit `{key,header,render}[]` array, not
 * hardcoded `<td>`s, so Story 2.4 can prepend/append columns (e.g. the ⋮
 * row-action menu) without a rewrite. Sort order is local component state
 * (Boundaries: not a cross-screen concern, unlike the filters themselves).
 * Every row carries `data-material-id` (Story 2.4's row-action menu
 * attaches to it later). Reuses `RecentViewsTable.tsx:7-10,63-68`'s
 * status-badge/card-wrapper convention for the Type/Status badges.
 */
export function ResultsTable({ materials, bomItems, selectedMaterialIds, onToggleRowSelection }: ResultsTableProps) {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(null);
  const columns = buildColumns(bomItems);

  function handleHeaderClick(column: Column) {
    if (!column.sortable) return;
    setSort((current) => {
      if (!current || current.key !== column.key) return { key: column.key, direction: 'asc' };
      return { key: column.key, direction: current.direction === 'asc' ? 'desc' : 'asc' };
    });
  }

  const sortedMaterials = (() => {
    if (!sort) return materials;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.getSortValue) return materials;
    const getSortValue = column.getSortValue;
    return [...materials].sort((a, b) => compareValues(getSortValue(a), getSortValue(b), sort.direction));
  })();

  return (
    <div className="mt-4.5 rounded-lg bg-surface p-5 shadow-sm">
      <div className="overflow-x-auto">
        <table data-testid="results-table" className="w-full min-w-[900px] border-collapse">
          <thead>
            <tr>
              <th className="font-label border-b border-line py-0 pr-3 pb-2.5 text-left text-[11px] font-semibold tracking-[0.06em] text-muted uppercase">
                <span className="sr-only">Select</span>
              </th>
              {columns.map((column) => {
                const isSorted = sort?.key === column.key;
                const ariaSort: AriaAttributes['aria-sort'] = !column.sortable
                  ? undefined
                  : isSorted
                    ? sort?.direction === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none';
                return (
                  <th
                    key={column.key}
                    aria-sort={ariaSort}
                    className="font-label border-b border-line py-0 pr-3 pb-2.5 text-left text-[11px] font-semibold tracking-[0.06em] text-muted uppercase"
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleHeaderClick(column)}
                        className="font-label inline-flex items-center gap-1 bg-transparent p-0 text-[11px] font-semibold tracking-[0.06em] text-muted uppercase hover:text-strong"
                      >
                        {column.header}
                        {isSorted && (
                          <span aria-hidden="true">{sort?.direction === 'asc' ? '▲' : '▼'}</span>
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedMaterials.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-6 text-center text-sm text-muted">
                  No materials match the applied filters.
                </td>
              </tr>
            ) : (
              sortedMaterials.map((material) => (
                <tr key={material.materialId} data-material-id={material.materialId}>
                  <td className="border-b border-hairline py-2.5 pr-3 text-[0.83rem] text-body">
                    <input
                      type="checkbox"
                      aria-label={`Select ${material.materialId}`}
                      checked={selectedMaterialIds.has(material.materialId)}
                      onChange={() => onToggleRowSelection(material.materialId)}
                    />
                  </td>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="border-b border-hairline py-2.5 pr-3 text-[0.83rem] text-body"
                    >
                      {column.render(material)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
