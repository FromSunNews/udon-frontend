'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Typography } from '../typography';

const CountUpLib = dynamic(() => import('react-countup'), {
  ssr: false,
});

interface CountUpProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  decimals?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  color?: any;
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variant?: any;
  abbreviate?: boolean;
}

// Helper function to format numbers with K, M, B abbreviations
const formatWithAbbreviation = (num: number, decimals: number = 2): string => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(decimals) + 'B';
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(decimals) + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(decimals) + 'K';
  }
  // For numbers less than 1000, ensure decimal places are preserved
  return num.toFixed(decimals);
};

export default function CountUp({
  value,
  suffix = '',
  prefix = '',
  duration = 1,
  decimals = 2,
  color,
  className = '',
  variant = 'default',
  abbreviate = true,
}: CountUpProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Typography variant={variant} color={color} className={className}>
        {prefix}
        {abbreviate ? formatWithAbbreviation(value, decimals) : value.toFixed(decimals)}
        {suffix}
      </Typography>
    );
  }

  return (
    <Typography variant={variant} color={color} className={className}>
      <CountUpLib
        end={value}
        duration={duration}
        decimals={decimals}
        formattingFn={(n: number) => {
          let formattedNumber;

          if (abbreviate) {
            formattedNumber = formatWithAbbreviation(n, decimals);
          } else {
            formattedNumber = n.toLocaleString(undefined, {
              minimumFractionDigits: decimals,
              maximumFractionDigits: decimals + 2,
            });
          }

          return `${prefix}${formattedNumber}${suffix}`;
        }}
      />
    </Typography>
  );
}
