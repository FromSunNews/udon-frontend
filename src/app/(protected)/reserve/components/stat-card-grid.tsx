import { cn } from '@/utils/tailwind';
import React from 'react';

interface StatCardGridProps {
  columns?: number;
  gap?: string;
  children: React.ReactNode;
  className?: string;
  responsiveCols?: string; // e.g., "max-md:grid-cols-1"
}

export const StatCardGrid: React.FC<StatCardGridProps> = ({
  columns = 3,
  gap = 'gap-[18px]',
  className = '',
  children,
  responsiveCols = 'max-md:grid-cols-1',
}) => {
  // Build grid class string
  const gridCols = `grid-cols-${columns}`;
  return <div className={cn('grid', gridCols, gap, responsiveCols, className)}>{children}</div>;
};
