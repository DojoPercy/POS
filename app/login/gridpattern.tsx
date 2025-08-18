import { cn } from '@/lib/utils';
import React from 'react';

interface GridPatternProps {
  width?: number;
  height?: number;
  x?: string | number;
  y?: string | number;
  strokeDasharray?: string;
  dotSize?: number;
  className?: string;
  [key: string]: any;
}

export default function GridPattern({
  width = 16,
  height = 16,
  x = -1,
  y = -1,
  strokeDasharray = '4 2',
  dotSize = 1,
  className,
  ...props
}: GridPatternProps) {
  return (
    <svg
      aria-hidden='true'
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 dark:fill-gray-600/30 stroke-gray-400/30 dark:stroke-gray-600/30',
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id='grid-pattern'
          width={width}
          height={height}
          patternUnits='userSpaceOnUse'
          x={x}
          y={y}
        >
          <path d={`M${dotSize},0 L0,0 L0,${dotSize}`} fill='none' />
        </pattern>
      </defs>
      <rect
        width='100%'
        height='100%'
        strokeWidth={0}
        fill='url(#grid-pattern)'
      />
    </svg>
  );
}
