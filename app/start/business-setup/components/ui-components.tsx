import type React from 'react';
import { cn } from '@/lib/utils';

// This file contains custom UI components specific to the business setup flow

export function ProgressDot({
  active,
  completed,
  className,
}: {
  active: boolean;
  completed: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'w-3 h-3 rounded-full transition-all duration-200',
        {
          'bg-primary': active,
          'bg-green-500': completed,
          'bg-gray-300 dark:bg-gray-600': !active && !completed,
        },
        className,
      )}
    />
  );
}

export function StepTitle({
  children,
  active,
  completed,
  className,
}: {
  children: React.ReactNode;
  active: boolean;
  completed: boolean;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        'text-sm font-medium transition-colors',
        {
          'text-primary': active,
          'text-green-500': completed,
          'text-gray-500 dark:text-gray-400': !active && !completed,
        },
        className,
      )}
    >
      {children}
    </h3>
  );
}
