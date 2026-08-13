import { AlertsList } from '../../components/data-display/AlertsList';
import { KpiCard } from '../../components/data-display/KpiCard';
import { PortfolioHealthTrend } from '../../components/data-display/PortfolioHealthTrend';
import { FilterDropdown } from '../../components/filters/FilterDropdown';
import { computeSegmentHealth } from '../../logic/computeSegmentHealth';
import { useHubFilters } from './useHubFilters';

/**
 * PLM Hub: independent Segment/Region filter panels (each strictly gated
 * behind its own Apply/Cancel) driving a KPI strip and an Alerts List. KPI
 * and alert values are illustrative aggregates (`src/data/hubKpiAggregate.ts`
 * / `src/data/hubAlerts.ts`), not the Explorer catalog. Portfolio Health
 * Trend is composed via `computeSegmentHealth()` called directly here (zero
 * arguments, never from `useHubFilters` state) so it is structurally
 * incapable of reacting to any filter.
 */
export default function Hub() {
  const { segment, region, kpis, alerts } = useHubFilters();

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-strong">PLM Hub</h1>

      <div className="mt-4.5 mb-4.5 flex flex-wrap items-center gap-3">
        <FilterDropdown
          label="Segment"
          options={segment.options}
          pending={segment.pending}
          appliedCount={segment.appliedCount}
          isOpen={segment.isOpen}
          applyDisabled={segment.applyDisabled}
          onOpen={segment.onOpen}
          onToggleOption={segment.onToggleOption}
          onApply={segment.onApply}
          onCancel={segment.onCancel}
          onRequestClose={segment.onRequestClose}
        />
        <FilterDropdown
          label="Region"
          options={region.options}
          pending={region.pending}
          appliedCount={region.appliedCount}
          isOpen={region.isOpen}
          applyDisabled={region.applyDisabled}
          onOpen={region.onOpen}
          onToggleOption={region.onToggleOption}
          onApply={region.onApply}
          onCancel={region.onCancel}
          onRequestClose={region.onRequestClose}
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <KpiCard value={kpis.total.toLocaleString('en-US')} label="Total Specs" />
        <KpiCard
          value={kpis.active.toLocaleString('en-US')}
          label="Active"
          valueColor="var(--color-teal-600)"
        />
        <KpiCard
          value={kpis.phasedOut.toLocaleString('en-US')}
          label="Phased Out"
          valueColor="var(--color-muted)"
        />
      </div>

      <div className="mt-4.5 flex flex-wrap items-stretch gap-4">
        <AlertsList alerts={alerts} />
        <PortfolioHealthTrend data={computeSegmentHealth()} />
      </div>
    </div>
  );
}
