import { useMemo, useState } from 'react';
import { REGIONS, SEGMENTS, type Region, type Segment } from '../../data/hubKpiAggregate';
import { computeHubKpis, type HubKpis } from '../../logic/computeHubKpis';

export type PanelKey = 'segment' | 'region';

export interface HubFilterPanel<T extends string> {
  options: readonly T[];
  pending: ReadonlySet<T>;
  appliedCount: number;
  isOpen: boolean;
  applyDisabled: boolean;
  onOpen: () => void;
  onToggleOption: (option: T) => void;
  onApply: () => void;
  onCancel: () => void;
  onRequestClose: () => void;
}

export interface UseHubFiltersResult {
  segment: HubFilterPanel<Segment>;
  region: HubFilterPanel<Region>;
  kpis: HubKpis;
}

/**
 * Colocated Hub-screen state (custom hook, not a Zustand slice -- AD-5
 * reserves the store for cross-screen state; this is screen-local UI
 * state, matching `Sidebar.tsx`'s precedent).
 *
 * Segment and Region are two fully independent panels, each with its own
 * applied/pending selection (both default all-selected). A single
 * `openPanel` field enforces "only one dropdown open at a time" without
 * coupling the panels' selection state together. KPIs are derived from
 * applied selections only, via the pure `computeHubKpis`.
 */
export function useHubFilters(): UseHubFiltersResult {
  const [appliedSegments, setAppliedSegments] = useState<Set<Segment>>(() => new Set(SEGMENTS));
  const [pendingSegments, setPendingSegments] = useState<Set<Segment>>(() => new Set(SEGMENTS));
  const [appliedRegions, setAppliedRegions] = useState<Set<Region>>(() => new Set(REGIONS));
  const [pendingRegions, setPendingRegions] = useState<Set<Region>>(() => new Set(REGIONS));
  const [openPanel, setOpenPanel] = useState<PanelKey | null>(null);

  function toggleInSet<T>(pending: Set<T>, setPending: (next: Set<T>) => void, option: T) {
    const next = new Set(pending);
    if (next.has(option)) {
      next.delete(option);
    } else {
      next.add(option);
    }
    setPending(next);
  }

  const segment: HubFilterPanel<Segment> = {
    options: SEGMENTS,
    pending: pendingSegments,
    appliedCount: appliedSegments.size,
    isOpen: openPanel === 'segment',
    applyDisabled: pendingSegments.size === 0,
    onOpen: () => setOpenPanel('segment'),
    onToggleOption: (option) => toggleInSet(pendingSegments, setPendingSegments, option),
    onApply: () => {
      setAppliedSegments(new Set(pendingSegments));
      setOpenPanel(null);
    },
    onCancel: () => {
      setPendingSegments(new Set(appliedSegments));
      setOpenPanel(null);
    },
    onRequestClose: () => setOpenPanel((current) => (current === 'segment' ? null : current)),
  };

  const region: HubFilterPanel<Region> = {
    options: REGIONS,
    pending: pendingRegions,
    appliedCount: appliedRegions.size,
    isOpen: openPanel === 'region',
    applyDisabled: pendingRegions.size === 0,
    onOpen: () => setOpenPanel('region'),
    onToggleOption: (option) => toggleInSet(pendingRegions, setPendingRegions, option),
    onApply: () => {
      setAppliedRegions(new Set(pendingRegions));
      setOpenPanel(null);
    },
    onCancel: () => {
      setPendingRegions(new Set(appliedRegions));
      setOpenPanel(null);
    },
    onRequestClose: () => setOpenPanel((current) => (current === 'region' ? null : current)),
  };

  const kpis = useMemo(
    () => computeHubKpis(appliedSegments, appliedRegions),
    [appliedSegments, appliedRegions],
  );

  return { segment, region, kpis };
}
