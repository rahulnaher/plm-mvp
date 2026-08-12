import type { SVGProps } from 'react';

/** Tree icon — Top-Down Traceability nav item. Path data from Dashboard-Final-Design.html. */
export function TraceabilityIcon({ width = 18, height = 18, ...props }: SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="19" r="2.5" />
      <circle cx="19" cy="19" r="2.5" />
      <path d="M12 7.5V13M12 13L5 16.5M12 13l7 3.5" />
    </svg>
  );
}
