import type { SVGProps } from 'react';

/** Compare-arrows icon — Compare Specs nav item. Path data from Dashboard-Final-Design.html. */
export function CompareIcon({ width = 18, height = 18, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      {...props}
    >
      <path d="M8 3v14M8 17l-4-4M8 17l4-4M16 21V7M16 7l-4 4M16 7l4 4" />
    </svg>
  );
}
