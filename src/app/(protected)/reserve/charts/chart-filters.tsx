import React, { useState } from 'react';
import { cn } from '@/utils/tailwind';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/common/popover';
import { Tabs, TabsList, TabsTrigger } from '@/components/common/tab/anim-slider';
import { Typography } from '@/components/common/typography';
import { capitalizeFirstLetter } from '@/utils/string';
import { ChartType, TimePeriod } from '../types';

interface FilterPillProps {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export const FilterPill: React.FC<FilterPillProps> = ({ active, children, onClick }) => (
  <div
    className={cn(
      'px-4 py-1 rounded-3xl text-sm font-medium select-none transition cursor-pointer',
      active
        ? 'bg-[rgba(74,74,80,1)] text-white'
        : 'text-[rgba(121,121,121,1)] hover:bg-[rgba(51,51,54,1)]'
    )}
    onClick={onClick}
  >
    {children}
  </div>
);

interface ChartFiltersProps {
  chartType: ChartType;
  setChartType: (type: ChartType) => void;
  timePeriod: string;
  setTimePeriod: (period: TimePeriod) => void;
  isShowChartType?: boolean;
}

export const ChartFilters: React.FC<ChartFiltersProps> = ({
  chartType,
  setChartType,
  timePeriod,
  setTimePeriod,
  isShowChartType = true,
}) => {
  const timeOptions = [
    { title: '24 Hours', key: '24_hours' },
    { title: '7 Days', key: '7_days' },
    { title: '30 Days', key: '30_days' },
    { title: '90 Days', key: '90_days' },
    { title: 'All Time', key: 'all_time' },
  ];
  const [open, setOpen] = useState(false);

  const handleSelectTimePeriod = (option: TimePeriod) => {
    setTimePeriod(option);
    setOpen(false);
  };

  return (
    <div className="flex flex-wrap gap-3">
      {isShowChartType && (
        <Tabs
          value={chartType}
          onValueChange={value => setChartType(value as 'deposit' | 'borrow')}
        >
          <TabsList className="bg-[rgba(51,51,54,1)] p-1 border-0">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="borrow">Borrow</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="bg-[rgba(51,51,54,1)] flex items-center justify-center gap-1 text-[rgba(206,206,206,1)] min-w-[90px] !h-[35px] py-1 rounded-3xl cursor-pointer">
            <Typography variant="small">
              {capitalizeFirstLetter(
                timeOptions.find(option => option.key === timePeriod)?.title || '24 Hours'
              )}
            </Typography>
            <ChevronDown className="h-4 w-4" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[100px] p-2 bg-[rgba(40,40,44,1)] border-[rgba(73,73,76,1)]">
          <div className="flex flex-col space-y-1">
            {timeOptions.map(option => (
              <div
                key={option.key}
                className={cn(
                  'px-3 py-1.5 rounded text-sm cursor-pointer hover:bg-[rgba(51,51,54,1)]',
                  timePeriod === option.key ? 'text-primary' : 'text-[rgba(206,206,206,1)]'
                )}
                onClick={() => handleSelectTimePeriod(option.key as TimePeriod)}
              >
                <Typography variant="small">{capitalizeFirstLetter(option.title)}</Typography>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
