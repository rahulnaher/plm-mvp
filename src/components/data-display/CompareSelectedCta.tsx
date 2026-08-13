export interface CompareSelectedCtaProps {
  selectedCount: number;
  onCompareSelected: () => void;
}

/**
 * Floating "Compare Selected" CTA (Story 2.4, FR-11): mounts once 2+ rows
 * are checked in `explorerSlice.selectedMaterialIds`, unmounts below that
 * threshold. `Explorer/index.tsx` owns the `selectedCount >= 2` gate and
 * only renders this component when true -- this component itself never
 * reads the store, so it stays presentational/pure like `ReportTiles`.
 * Clicking navigates to `/compare` (via the `onCompareSelected` callback,
 * owned by the caller) without mutating `selectedMaterialIds`.
 */
export function CompareSelectedCta({ selectedCount, onCompareSelected }: CompareSelectedCtaProps) {
  return (
    <div className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
      <button
        type="button"
        onClick={onCompareSelected}
        className="rounded-pill bg-accent px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-accent-strong"
      >
        Compare Selected ({selectedCount})
      </button>
    </div>
  );
}
