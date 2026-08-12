import type { SVGProps } from 'react';

/** Arrow-up icon — Bottom-Up Impact nav item. Path data from Dashboard-Final-Design.html. */
export function ImpactIcon({ width = 18, height = 18, ...props }: SVGProps<SVGSVGElement>) {
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
      <path d="M12 19V5M12 5l-6 6M12 5l6 6" />
    </svg>
  );
}
