import React from 'react';
import { cn } from '@/utils/tailwind';

interface APYBreakdownItemProps {
  label: string;
  value: string;
  isBorder?: boolean;
}

const APYBreakdownItem: React.FC<APYBreakdownItemProps> = ({ label, value, isBorder }) => (
  <div>
    <div className="flex items-center justify-between px-4 py-2 gap-4 border-b border-border">
      <span className="flex items-center gap-2">
        <span className="inline-block h-5 w-5 rounded-full bg-primary opacity-75" />
        <span className="text-sm text-gray-100">{label}</span>
      </span>
      <span className="font-semibold text-sm text-gray-300">{value}</span>
    </div>
    {isBorder && <div className="mt-1 h-[1px] w-full rounded-full bg-border" />}
  </div>
);

interface APYBreakdownListProps {
  items: Array<{ label: string; value: string }>;
  className?: string;
}

export const APYBreakdownList: React.FC<APYBreakdownListProps> = ({ items, className }) => (
  <div className={cn('flex flex-col gap-2 w-full bg-card border rounded-xl p-4 h-full', className)}>
    {items.map((item, i) => (
      <APYBreakdownItem
        key={i}
        label={item.label}
        value={item.value}
        isBorder={i !== items.length - 1}
      />
    ))}
  </div>
);
